import { NextRequest, NextResponse } from "next/server"
import { after } from "next/server"
import { getSupabase } from "@/lib/supabase"

async function sendTelegramMessage(botToken: string, chatId: number, text: string) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  })
  return res.json()
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Check if flow is currently being executed (database-based lock via status + timestamp)
// If status is "in_progress" and updated_at is less than 60 seconds ago, consider it locked
function isFlowLocked(state: { status: string; updated_at: string } | null): boolean {
  if (!state) return false
  if (state.status !== "in_progress") return false
  const updatedAt = new Date(state.updated_at).getTime()
  const now = Date.now()
  // If updated less than 60 seconds ago, it's still running
  return now - updatedAt < 60_000
}

export async function POST(req: NextRequest) {
  // Parse everything we need BEFORE returning the response
  const supabase = getSupabase()

  const { searchParams } = new URL(req.url)
  const botToken = searchParams.get("token")
  if (!botToken) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 })
  }

  const update = await req.json()
  const updateId = update?.update_id
  const message = update?.message
  if (!message) {
    return NextResponse.json({ ok: true })
  }

  const chatId = message.chat.id
  const telegramUserId = message.from?.id || chatId
  const messageText = (message.text || "").trim()
  const isStart = messageText === "/start" || messageText.startsWith("/start ")
  const fromData = message.from || {}

  // Respond to Telegram IMMEDIATELY with 200 to prevent retries
  // Then process the flow in background using after()
  after(async () => {
    try {
      await processWebhook({
        supabase,
        botToken,
        updateId,
        chatId,
        telegramUserId,
        messageText,
        isStart,
        fromData,
      })
    } catch (err) {
      console.error("webhook background processing error:", err)
    }
  })

  // Return 200 immediately so Telegram does NOT retry
  return NextResponse.json({ ok: true })
}

async function processWebhook({
  supabase,
  botToken,
  updateId,
  chatId,
  telegramUserId,
  messageText,
  isStart,
  fromData,
}: {
  supabase: ReturnType<typeof getSupabase>
  botToken: string
  updateId: number | undefined
  chatId: number
  telegramUserId: number
  messageText: string
  isStart: boolean
  fromData: Record<string, string>
}) {
  // 1. Database-based deduplication using update_id
  // We store processed update_ids in user_flow_state metadata or check via a simple approach:
  // For /start commands, we use the flow state lock. For other messages, we check state status.

  // 2. Buscar bot pelo token
  const { data: bots, error: botError } = await supabase
    .from("bots")
    .select("id, token, status")
    .eq("token", botToken)

  if (botError) return

  const bot = bots?.[0]
  if (!bot || bot.status !== "active") return

  // 3. Salvar/atualizar o usuario
  const { data: existingUsers } = await supabase
    .from("bot_users")
    .select("id")
    .eq("bot_id", bot.id)
    .eq("telegram_user_id", telegramUserId)

  if (existingUsers && existingUsers.length > 0) {
    await supabase
      .from("bot_users")
      .update({
        first_name: fromData.first_name || null,
        last_name: fromData.last_name || null,
        username: fromData.username || null,
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("bot_id", bot.id)
      .eq("telegram_user_id", telegramUserId)
  } else {
    await supabase
      .from("bot_users")
      .insert({
        bot_id: bot.id,
        telegram_user_id: telegramUserId,
        chat_id: chatId,
        first_name: fromData.first_name || null,
        last_name: fromData.last_name || null,
        username: fromData.username || null,
        funnel_step: 1,
        is_subscriber: false,
        last_activity: new Date().toISOString(),
      })
  }

  // 4. Buscar fluxo ativo
  const { data: flows } = await supabase
    .from("flows")
    .select("id, name")
    .eq("bot_id", bot.id)
    .eq("status", "ativo")
    .order("created_at", { ascending: true })

  if (!flows || flows.length === 0) return

  const targetFlow = flows[0]

  // 5. Buscar nodes do fluxo
  const { data: nodes } = await supabase
    .from("flow_nodes")
    .select("id, type, label, config, position")
    .eq("flow_id", targetFlow.id)
    .order("position", { ascending: true })

  if (!nodes || nodes.length === 0) return

  // 6. Buscar estado do usuario neste fluxo
  const { data: stateRows } = await supabase
    .from("user_flow_state")
    .select("*")
    .eq("bot_id", bot.id)
    .eq("flow_id", targetFlow.id)
    .eq("telegram_user_id", telegramUserId)

  const existingState = stateRows?.[0] || null

  // 7. Se /start => resetar estado e executar do zero
  if (isStart) {
    // DATABASE-BASED LOCK: If flow is already in_progress (recently updated), skip
    if (isFlowLocked(existingState)) {
      return
    }

    if (existingState) {
      await supabase
        .from("user_flow_state")
        .update({
          current_node_position: 0,
          status: "in_progress",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingState.id)
    } else {
      await supabase.from("user_flow_state").insert({
        bot_id: bot.id,
        flow_id: targetFlow.id,
        telegram_user_id: telegramUserId,
        chat_id: chatId,
        current_node_position: 0,
        status: "in_progress",
      })
    }

    await executeNodes(botToken, chatId, nodes, 0, bot.id, targetFlow.id, telegramUserId)
    return
  }

  // 8. Se NAO e /start
  if (!existingState || existingState.status === "completed") {
    return
  }

  // If flow is in_progress (e.g. during a delay), ignore new messages
  if (existingState.status === "in_progress") {
    return
  }

  if (existingState.status === "waiting_response") {
    // Check lock to prevent double processing
    if (isFlowLocked(existingState)) {
      return
    }

    // Mark as in_progress immediately to lock
    await supabase
      .from("user_flow_state")
      .update({
        status: "in_progress",
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingState.id)

    const nextPos = existingState.current_node_position + 1
    await executeNodes(botToken, chatId, nodes, nextPos, bot.id, targetFlow.id, telegramUserId)
  }
}

// Executa nodes a partir de uma posicao
async function executeNodes(
  botToken: string,
  chatId: number,
  nodes: Array<{ id: string; type: string; label: string; config: Record<string, string>; position: number }>,
  startPosition: number,
  botId: string,
  flowId: string,
  telegramUserId: number
) {
  const supabase = getSupabase()
  const remainingNodes = nodes.filter((n) => n.position >= startPosition)

  for (const node of remainingNodes) {
    // Update current position and keep refreshing the lock timestamp
    await supabase
      .from("user_flow_state")
      .update({
        current_node_position: node.position,
        status: "in_progress",
        updated_at: new Date().toISOString(),
      })
      .eq("bot_id", botId)
      .eq("flow_id", flowId)
      .eq("telegram_user_id", telegramUserId)

    switch (node.type) {
      case "trigger":
        break

      case "message": {
        const text = node.config?.text || node.label || "Mensagem"
        await sendTelegramMessage(botToken, chatId, text)
        await updateFunnelStep(botId, telegramUserId, 2)
        break
      }

      case "delay": {
        const seconds = Math.min(parseInt(node.config?.seconds || "5", 10), 55)
        await sleep(seconds * 1000)
        // Refresh lock after delay so it doesn't expire
        await supabase
          .from("user_flow_state")
          .update({ updated_at: new Date().toISOString() })
          .eq("bot_id", botId)
          .eq("flow_id", flowId)
          .eq("telegram_user_id", telegramUserId)
        break
      }

      case "condition": {
        await supabase
          .from("user_flow_state")
          .update({
            current_node_position: node.position,
            status: "waiting_response",
            updated_at: new Date().toISOString(),
          })
          .eq("bot_id", botId)
          .eq("flow_id", flowId)
          .eq("telegram_user_id", telegramUserId)

        if (node.config?.text) {
          await sendTelegramMessage(botToken, chatId, node.config.text)
        }
        return // Para aqui e espera resposta
      }

      case "payment": {
        const amount = node.config?.amount || "0"
        const description = node.config?.description || "Pagamento"
        await sendTelegramMessage(botToken, chatId, `${description}\nValor: R$ ${amount}`)
        await updateFunnelStep(botId, telegramUserId, 3)
        break
      }

      case "action": {
        const actionText = node.config?.text || node.config?.action_name || node.label
        await sendTelegramMessage(botToken, chatId, `${actionText}`)
        await updateFunnelStep(botId, telegramUserId, 4)
        break
      }
    }
  }

  // Fluxo concluido - marcar como completed
  await supabase
    .from("user_flow_state")
    .update({
      current_node_position: nodes[nodes.length - 1].position,
      status: "completed",
      updated_at: new Date().toISOString(),
    })
    .eq("bot_id", botId)
    .eq("flow_id", flowId)
    .eq("telegram_user_id", telegramUserId)
}

// Atualiza etapa no funil (so avanca, nunca retrocede)
async function updateFunnelStep(botId: string, telegramUserId: number, newStep: number) {
  const supabase = getSupabase()
  const { data: users } = await supabase
    .from("bot_users")
    .select("funnel_step")
    .eq("bot_id", botId)
    .eq("telegram_user_id", telegramUserId)

  const user = users?.[0]
  if (user && newStep > user.funnel_step) {
    const updatePayload: Record<string, unknown> = {
      funnel_step: newStep,
      updated_at: new Date().toISOString(),
    }
    if (newStep >= 4) {
      updatePayload.is_subscriber = true
      updatePayload.subscription_start = new Date().toISOString()
      updatePayload.subscription_end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      updatePayload.subscription_plan = "Mensal"
    }
    await supabase
      .from("bot_users")
      .update(updatePayload)
      .eq("bot_id", botId)
      .eq("telegram_user_id", telegramUserId)
  }
}

export async function GET() {
  return NextResponse.json({ status: "Telegram webhook is active" })
}

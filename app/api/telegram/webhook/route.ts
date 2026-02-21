import { NextRequest, NextResponse } from "next/server"
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

// Deduplicate Telegram updates using update_id
const processedUpdates = new Map<number, number>()
const MAX_PROCESSED_CACHE = 1000

function isUpdateAlreadyProcessed(updateId: number): boolean {
  if (processedUpdates.has(updateId)) {
    return true
  }
  // Clean old entries if cache is too large
  if (processedUpdates.size > MAX_PROCESSED_CACHE) {
    const entries = Array.from(processedUpdates.entries())
    entries.sort((a, b) => a[1] - b[1])
    const toRemove = entries.slice(0, MAX_PROCESSED_CACHE / 2)
    for (const [key] of toRemove) {
      processedUpdates.delete(key)
    }
  }
  processedUpdates.set(updateId, Date.now())
  return false
}

// Track which users currently have a flow executing to prevent concurrent runs
const executingFlows = new Set<string>()

export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  try {
    const { searchParams } = new URL(req.url)
    const botToken = searchParams.get("token")
    if (!botToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 })
    }

    const update = await req.json()

    // Deduplicate: Telegram may resend the same update if we respond slowly
    const updateId = update?.update_id
    if (updateId && isUpdateAlreadyProcessed(updateId)) {
      return NextResponse.json({ ok: true })
    }

    const message = update?.message
    if (!message) {
      return NextResponse.json({ ok: true })
    }

    const chatId = message.chat.id
    const telegramUserId = message.from?.id || chatId
    const messageText = (message.text || "").trim()
    const isStart = messageText === "/start" || messageText.startsWith("/start ")
    const fromData = message.from || {}

    // 1. Buscar bot pelo token
    const { data: bots, error: botError } = await supabase
      .from("bots")
      .select("id, token, status")
      .eq("token", botToken)

    if (botError) {
      return NextResponse.json({ ok: true })
    }

    const bot = bots?.[0]
    if (!bot || bot.status !== "active") {
      return NextResponse.json({ ok: true })
    }

    // 2. Salvar/atualizar o usuario via UPSERT
    // Only update activity fields for existing users, don't reset funnel_step
    const { data: existingUsers } = await supabase
      .from("bot_users")
      .select("id")
      .eq("bot_id", bot.id)
      .eq("telegram_user_id", telegramUserId)

    if (existingUsers && existingUsers.length > 0) {
      // User already exists - only update activity, not funnel data
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
      // New user - insert with defaults
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

    // 3. Buscar fluxo ativo
    const { data: flows, error: flowError } = await supabase
      .from("flows")
      .select("id, name")
      .eq("bot_id", bot.id)
      .eq("status", "ativo")
      .order("created_at", { ascending: true })

    if (flowError || !flows || flows.length === 0) {
      return NextResponse.json({ ok: true })
    }

    const targetFlow = flows[0]

    // 4. Buscar nodes do fluxo
    const { data: nodes, error: nodesError } = await supabase
      .from("flow_nodes")
      .select("id, type, label, config, position")
      .eq("flow_id", targetFlow.id)
      .order("position", { ascending: true })

    if (nodesError || !nodes || nodes.length === 0) {
      return NextResponse.json({ ok: true })
    }

    // 5. Buscar estado do usuario neste fluxo
    const { data: stateRows } = await supabase
      .from("user_flow_state")
      .select("*")
      .eq("bot_id", bot.id)
      .eq("flow_id", targetFlow.id)
      .eq("telegram_user_id", telegramUserId)

    const existingState = stateRows?.[0] || null

    // Prevent concurrent flow execution for the same user
    const executionKey = `${bot.id}-${targetFlow.id}-${telegramUserId}`

    // 6. Se /start => resetar estado e executar do zero
    if (isStart) {
      // If flow is already executing for this user, ignore
      if (executingFlows.has(executionKey)) {
        return NextResponse.json({ ok: true })
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

      // Mark as executing, execute, then clean up
      executingFlows.add(executionKey)
      try {
        await executeNodes(botToken, chatId, nodes, 0, bot.id, targetFlow.id, telegramUserId)
      } finally {
        executingFlows.delete(executionKey)
      }
      return NextResponse.json({ ok: true })
    }

    // 7. Se NAO e /start
    if (!existingState || existingState.status === "completed") {
      return NextResponse.json({ ok: true })
    }

    // If flow is already executing for this user (e.g. during a delay), ignore
    if (existingState.status === "in_progress" && executingFlows.has(executionKey)) {
      return NextResponse.json({ ok: true })
    }

    if (existingState.status === "waiting_response") {
      if (executingFlows.has(executionKey)) {
        return NextResponse.json({ ok: true })
      }

      const nextPos = existingState.current_node_position + 1
      executingFlows.add(executionKey)
      try {
        await executeNodes(botToken, chatId, nodes, nextPos, bot.id, targetFlow.id, telegramUserId)
      } finally {
        executingFlows.delete(executionKey)
      }
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("webhook: FATAL error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
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
    // Update current position in DB so we track progress
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
        const seconds = Math.min(parseInt(node.config?.seconds || "5", 10), 30)
        await sleep(seconds * 1000)
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

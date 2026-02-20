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

export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  console.log("[v0] WEBHOOK V3 HIT - bot_users version")
  try {
    const { searchParams } = new URL(req.url)
    const botToken = searchParams.get("token")
    if (!botToken) {
      console.log("[v0] webhook: missing token param")
      return NextResponse.json({ error: "Missing token" }, { status: 400 })
    }

    const update = await req.json()
    const message = update?.message
    if (!message) {
      console.log("[v0] webhook: no message in update")
      return NextResponse.json({ ok: true })
    }

    const chatId = message.chat.id
    const telegramUserId = message.from?.id || chatId
    const messageText = (message.text || "").trim()
    const isStart = messageText === "/start"
    const fromData = message.from || {}

    console.log("[v0] webhook: received message from user", telegramUserId, "text:", messageText)

    // 1. Buscar bot pelo token
    const { data: bots, error: botError } = await supabase
      .from("bots")
      .select("id, token, status")
      .eq("token", botToken)

    if (botError) {
      console.log("[v0] webhook: error fetching bot:", JSON.stringify(botError))
      return NextResponse.json({ ok: true })
    }

    const bot = bots?.[0]
    if (!bot) {
      console.log("[v0] webhook: no bot found for token:", botToken.substring(0, 10) + "...")
      return NextResponse.json({ ok: true })
    }
    if (bot.status !== "active") {
      console.log("[v0] webhook: bot is inactive:", bot.id)
      return NextResponse.json({ ok: true })
    }

    console.log("[v0] webhook: bot found:", bot.id)

    // 2. SEMPRE salvar/atualizar o usuario (independente de ter fluxo ou nao)
    const { data: existingUsers, error: existUserError } = await supabase
      .from("bot_users")
      .select("id, funnel_step")
      .eq("bot_id", bot.id)
      .eq("telegram_user_id", telegramUserId)

    if (existUserError) {
      console.log("[v0] webhook: error checking existing user:", JSON.stringify(existUserError))
    }

    const existingUser = existingUsers?.[0]

    if (existingUser) {
      // Atualizar atividade (NAO resetar funnel_step)
      const { error: upErr } = await supabase
        .from("bot_users")
        .update({
          first_name: fromData.first_name || null,
          last_name: fromData.last_name || null,
          username: fromData.username || null,
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingUser.id)
      
      if (upErr) console.log("[v0] webhook: error updating user:", JSON.stringify(upErr))
      else console.log("[v0] webhook: updated existing user:", existingUser.id)
    } else {
      // Novo usuario - inserir
      const { data: newUser, error: insErr } = await supabase
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
        .select()

      if (insErr) console.log("[v0] webhook: error inserting user:", JSON.stringify(insErr))
      else console.log("[v0] webhook: inserted new user:", JSON.stringify(newUser))
    }

    // 3. Buscar fluxo ativo
    const { data: flows, error: flowError } = await supabase
      .from("flows")
      .select("id, name")
      .eq("bot_id", bot.id)
      .eq("status", "ativo")
      .order("created_at", { ascending: true })

    if (flowError) {
      console.log("[v0] webhook: error fetching flows:", JSON.stringify(flowError))
      return NextResponse.json({ ok: true })
    }

    if (!flows || flows.length === 0) {
      console.log("[v0] webhook: no active flows for bot:", bot.id)
      return NextResponse.json({ ok: true })
    }

    const targetFlow = flows[0]
    console.log("[v0] webhook: using flow:", targetFlow.id, targetFlow.name)

    // 4. Buscar nodes do fluxo
    const { data: nodes, error: nodesError } = await supabase
      .from("flow_nodes")
      .select("id, type, label, config, position")
      .eq("flow_id", targetFlow.id)
      .order("position", { ascending: true })

    if (nodesError) {
      console.log("[v0] webhook: error fetching nodes:", JSON.stringify(nodesError))
      return NextResponse.json({ ok: true })
    }

    if (!nodes || nodes.length === 0) {
      console.log("[v0] webhook: no nodes in flow:", targetFlow.id)
      return NextResponse.json({ ok: true })
    }

    console.log("[v0] webhook: found", nodes.length, "nodes")

    // 5. Buscar estado do usuario neste fluxo (usando array, nao single)
    const { data: stateRows, error: stateError } = await supabase
      .from("user_flow_state")
      .select("*")
      .eq("bot_id", bot.id)
      .eq("flow_id", targetFlow.id)
      .eq("telegram_user_id", telegramUserId)

    if (stateError) {
      console.log("[v0] webhook: error fetching state:", JSON.stringify(stateError))
    }

    const existingState = stateRows?.[0] || null
    console.log("[v0] webhook: existing state:", existingState ? existingState.status : "none")

    // 6. Se /start => resetar estado e executar do zero
    if (isStart) {
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

      console.log("[v0] webhook: executing flow from start")
      await executeNodes(botToken, chatId, nodes, 0, bot.id, targetFlow.id, telegramUserId)
      return NextResponse.json({ ok: true })
    }

    // 7. Se NAO e /start
    if (!existingState || existingState.status === "completed") {
      console.log("[v0] webhook: ignoring - flow completed or no state")
      return NextResponse.json({ ok: true })
    }

    if (existingState.status === "waiting_response") {
      const nextPos = existingState.current_node_position + 1
      console.log("[v0] webhook: continuing from position", nextPos)
      await executeNodes(botToken, chatId, nodes, nextPos, bot.id, targetFlow.id, telegramUserId)
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[v0] webhook: FATAL error:", err)
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
    console.log("[v0] webhook: executing node:", node.type, node.label, "pos:", node.position)

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

  // Fluxo concluido
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

  console.log("[v0] webhook: flow completed for user", telegramUserId)
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

    console.log("[v0] webhook: funnel step updated to", newStep)
  }
}

export async function GET() {
  return NextResponse.json({ status: "Telegram webhook is active" })
}

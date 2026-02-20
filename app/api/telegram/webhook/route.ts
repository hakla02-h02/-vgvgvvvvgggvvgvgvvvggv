import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  "https://dbtpnafcqfcllgoxdhxs.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRidHBuYWZjcWZjbGxnb3hkaHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0Nzg3MTQsImV4cCI6MjA4NzA1NDcxNH0.0MF5a1uAuxeHIVGNglWYbFHYRIECNVEVZN1MLH4Z26A"
)

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

// Cria ou atualiza o usuario na tabela bot_users
async function upsertBotUser(
  botId: string,
  telegramUserId: number,
  chatId: number,
  from: { first_name?: string; last_name?: string; username?: string }
) {
  const { data: existing } = await supabase
    .from("bot_users")
    .select("id")
    .eq("bot_id", botId)
    .eq("telegram_user_id", telegramUserId)
    .single()

  if (existing) {
    // Atualizar ultima atividade e dados do telegram
    await supabase
      .from("bot_users")
      .update({
        first_name: from.first_name || null,
        last_name: from.last_name || null,
        username: from.username || null,
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
  } else {
    // Criar novo usuario com funnel_step 1 (iniciou bot)
    await supabase.from("bot_users").insert({
      bot_id: botId,
      telegram_user_id: telegramUserId,
      chat_id: chatId,
      first_name: from.first_name || null,
      last_name: from.last_name || null,
      username: from.username || null,
      funnel_step: 1,
      is_subscriber: false,
    })
  }
}

// Atualiza a etapa no funil do usuario (so avanca, nunca retrocede)
async function updateFunnelStep(botId: string, telegramUserId: number, newStep: number) {
  const { data: user } = await supabase
    .from("bot_users")
    .select("funnel_step")
    .eq("bot_id", botId)
    .eq("telegram_user_id", telegramUserId)
    .single()

  if (user && newStep > user.funnel_step) {
    await supabase
      .from("bot_users")
      .update({
        funnel_step: newStep,
        updated_at: new Date().toISOString(),
        // Se chegou na etapa 4, marcar como assinante
        ...(newStep >= 4
          ? {
              is_subscriber: true,
              subscription_start: new Date().toISOString(),
              // Assinatura de 30 dias por padrao
              subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              subscription_plan: "Mensal",
            }
          : {}),
      })
      .eq("bot_id", botId)
      .eq("telegram_user_id", telegramUserId)
  }
}

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const botToken = searchParams.get("token")
    if (!botToken) return NextResponse.json({ error: "Missing token" }, { status: 400 })

    const update = await req.json()
    const message = update?.message
    if (!message) return NextResponse.json({ ok: true })

    const chatId = message.chat.id
    const telegramUserId = message.from?.id || chatId
    const messageText = message.text || ""
    const isStart = messageText === "/start"
    const fromData = message.from || {}

    // Buscar bot pelo token
    const { data: bot } = await supabase
      .from("bots")
      .select("id, token, status")
      .eq("token", botToken)
      .single()

    if (!bot || bot.status !== "active") return NextResponse.json({ ok: true })

    // Sempre registrar/atualizar o usuario
    await upsertBotUser(bot.id, telegramUserId, chatId, fromData)

    // Buscar fluxo ativo
    const { data: flows } = await supabase
      .from("flows")
      .select("id, name")
      .eq("bot_id", bot.id)
      .eq("status", "ativo")
      .order("created_at", { ascending: true })

    if (!flows || flows.length === 0) return NextResponse.json({ ok: true })
    const targetFlow = flows[0]

    // Buscar nodes do fluxo ordenados por posicao
    const { data: nodes } = await supabase
      .from("flow_nodes")
      .select("id, type, label, config, position")
      .eq("flow_id", targetFlow.id)
      .order("position", { ascending: true })

    if (!nodes || nodes.length === 0) return NextResponse.json({ ok: true })

    // Buscar estado atual do usuario neste fluxo
    const { data: existingState } = await supabase
      .from("user_flow_state")
      .select("*")
      .eq("bot_id", bot.id)
      .eq("flow_id", targetFlow.id)
      .eq("telegram_user_id", telegramUserId)
      .single()

    // Se usuario mandou /start, resetar o estado e executar do zero
    if (isStart) {
      if (existingState) {
        await supabase
          .from("user_flow_state")
          .update({ current_node_position: 0, status: "in_progress", updated_at: new Date().toISOString() })
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

      // Executar todos os nodes do fluxo a partir do inicio
      await executeNodes(botToken, chatId, nodes, 0, bot.id, targetFlow.id, telegramUserId)
      return NextResponse.json({ ok: true })
    }

    // Se NAO e /start:
    if (!existingState || existingState.status === "completed") {
      return NextResponse.json({ ok: true })
    }

    // Se esta esperando resposta (condition node), processar a resposta
    if (existingState.status === "waiting_response") {
      const nextPosition = existingState.current_node_position + 1
      await executeNodes(botToken, chatId, nodes, nextPosition, bot.id, targetFlow.id, telegramUserId)
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[webhook] Error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

// Executa nodes a partir de uma posicao especifica
async function executeNodes(
  botToken: string,
  chatId: number,
  nodes: Array<{ id: string; type: string; label: string; config: Record<string, string>; position: number }>,
  startPosition: number,
  botId: string,
  flowId: string,
  telegramUserId: number
) {
  const remainingNodes = nodes.filter((n) => n.position >= startPosition)

  for (const node of remainingNodes) {
    switch (node.type) {
      case "trigger":
        // Gatilho e apenas o ponto de entrada -- funnel step 1 (ja feito no upsert)
        break

      case "message": {
        const text = node.config?.text || node.label || "Mensagem"
        await sendTelegramMessage(botToken, chatId, text)
        // Recebeu mensagem = funnel step 2
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
        return
      }

      case "payment": {
        const amount = node.config?.amount || "0"
        const description = node.config?.description || "Pagamento"
        await sendTelegramMessage(botToken, chatId, `${description}\nValor: R$ ${amount}`)
        // Chegou ao pagamento = funnel step 3
        await updateFunnelStep(botId, telegramUserId, 3)
        break
      }

      case "action": {
        const actionText = node.config?.text || node.config?.action_name || node.label
        await sendTelegramMessage(botToken, chatId, `${actionText}`)
        // Acao final = funnel step 4 (assinante)
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
}

export async function GET() {
  return NextResponse.json({ status: "Telegram webhook is active" })
}

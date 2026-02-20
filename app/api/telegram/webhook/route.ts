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

    // Buscar bot pelo token
    const { data: bot } = await supabase
      .from("bots")
      .select("id, token, status")
      .eq("token", botToken)
      .single()

    if (!bot || bot.status !== "active") return NextResponse.json({ ok: true })

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
        await supabase
          .from("user_flow_state")
          .insert({
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
    // Se nao tem estado ou ja completou, ignorar (nao repetir fluxo)
    if (!existingState || existingState.status === "completed") {
      return NextResponse.json({ ok: true })
    }

    // Se esta esperando resposta (condition node), processar a resposta
    if (existingState.status === "waiting_response") {
      const nextPosition = existingState.current_node_position + 1
      await executeNodes(botToken, chatId, nodes, nextPosition, bot.id, targetFlow.id, telegramUserId)
      return NextResponse.json({ ok: true })
    }

    // Qualquer outro caso, ignorar
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
  // Filtrar apenas nodes a partir da posicao atual
  const remainingNodes = nodes.filter((n) => n.position >= startPosition)

  for (const node of remainingNodes) {
    switch (node.type) {
      case "trigger":
        // Gatilho e apenas o ponto de entrada, pular
        break

      case "message": {
        const text = node.config?.text || node.label || "Mensagem"
        await sendTelegramMessage(botToken, chatId, text)
        break
      }

      case "delay": {
        const seconds = Math.min(parseInt(node.config?.seconds || "5", 10), 30)
        await sleep(seconds * 1000)
        break
      }

      case "condition": {
        // Pausar aqui e esperar resposta do usuario
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

        // Enviar mensagem da condicao se tiver
        if (node.config?.text) {
          await sendTelegramMessage(botToken, chatId, node.config.text)
        }
        // PARAR a execucao aqui - proximo node so executa quando usuario responder
        return
      }

      case "payment": {
        const amount = node.config?.amount || "0"
        const description = node.config?.description || "Pagamento"
        await sendTelegramMessage(botToken, chatId, `${description}\nValor: R$ ${amount}`)
        break
      }

      case "action": {
        const actionText = node.config?.text || node.config?.action_name || node.label
        await sendTelegramMessage(botToken, chatId, `${actionText}`)
        break
      }
    }
  }

  // Se chegou aqui, o fluxo foi concluido
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

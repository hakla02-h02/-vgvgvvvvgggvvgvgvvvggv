import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Server-side supabase client (uses same anon key but no auth session)
const supabase = createClient(
  "https://dbtpnafcqfcllgoxdhxs.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRidHBuYWZjcWZjbGxnb3hkaHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0Nzg3MTQsImV4cCI6MjA4NzA1NDcxNH0.0MF5a1uAuxeHIVGNglWYbFHYRIECNVEVZN1MLH4Z26A"
)

// Telegram API helper
async function sendTelegramMessage(botToken: string, chatId: number, text: string) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  })
  const data = await res.json()
  if (!data.ok) {
    console.error("[webhook] Telegram sendMessage failed:", data)
  }
  return data
}

// Sleep helper for delay nodes
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Execute flow nodes sequentially
async function executeFlow(
  botToken: string,
  chatId: number,
  telegramUserId: number,
  flowId: string,
  nodes: Array<{
    id: string
    type: string
    label: string
    config: Record<string, string>
    position: number
  }>
) {
  for (const node of nodes) {
    try {
      switch (node.type) {
        case "trigger":
          // Trigger is just the entry point, nothing to execute
          break

        case "message": {
          const text = node.config?.text || node.label || "Mensagem"
          await sendTelegramMessage(botToken, chatId, text)
          break
        }

        case "delay": {
          const seconds = parseInt(node.config?.seconds || "5", 10)
          // Cap delay at 30 seconds for webhook (Vercel has execution time limits)
          const cappedSeconds = Math.min(seconds, 30)
          await sleep(cappedSeconds * 1000)
          break
        }

        case "condition": {
          // For now, conditions are logged but always continue
          // Future: implement actual condition checking
          console.log(`[webhook] Condition node: ${node.label}`)
          break
        }

        case "payment": {
          // Send a payment notification message
          const amount = node.config?.amount || "0"
          const description = node.config?.description || "Pagamento"
          await sendTelegramMessage(
            botToken,
            chatId,
            `${description}\nValor: R$ ${amount}\n\n(Sistema de pagamento em desenvolvimento)`
          )
          break
        }

        case "action": {
          const actionName = node.config?.action_name || node.label
          // Log the action - future: implement group add, etc.
          console.log(`[webhook] Action executed: ${actionName}`)
          await sendTelegramMessage(
            botToken,
            chatId,
            `Acao executada: ${actionName}`
          )
          break
        }

        default:
          console.log(`[webhook] Unknown node type: ${node.type}`)
      }
    } catch (err) {
      console.error(`[webhook] Error executing node ${node.id}:`, err)
    }
  }
}

// ---- Webhook handler ----
// URL format: POST /api/telegram/webhook?token=BOT_TOKEN
// Telegram sends updates to this endpoint

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const botToken = searchParams.get("token")

    if (!botToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 })
    }

    // Parse Telegram update
    const update = await req.json()
    const message = update?.message
    if (!message) {
      // Could be an edited message, callback query, etc. - ignore for now
      return NextResponse.json({ ok: true })
    }

    const chatId = message.chat.id
    const telegramUserId = message.from?.id || chatId
    const messageText = message.text || ""
    const isStart = messageText === "/start"

    // Look up the bot by token
    const { data: bot, error: botError } = await supabase
      .from("bots")
      .select("id, token, status, group_name, group_id, group_link")
      .eq("token", botToken)
      .single()

    if (botError || !bot) {
      console.error("[webhook] Bot not found for token:", botToken?.slice(0, 10) + "...")
      return NextResponse.json({ error: "Bot not found" }, { status: 404 })
    }

    if (bot.status !== "active") {
      return NextResponse.json({ ok: true, message: "Bot is inactive" })
    }

    // Find active flows for this bot
    const { data: flows, error: flowsError } = await supabase
      .from("flows")
      .select("id, name, status")
      .eq("bot_id", bot.id)
      .eq("status", "ativo")
      .order("created_at", { ascending: true })

    if (flowsError || !flows || flows.length === 0) {
      console.log("[webhook] No active flows for bot:", bot.id)
      return NextResponse.json({ ok: true, message: "No active flows" })
    }

    // For /start command, execute the first active flow
    // For other messages, also execute first flow (can be expanded later)
    const targetFlow = flows[0]

    // Get flow nodes ordered by position
    const { data: nodes, error: nodesError } = await supabase
      .from("flow_nodes")
      .select("id, type, label, config, position")
      .eq("flow_id", targetFlow.id)
      .order("position", { ascending: true })

    if (nodesError || !nodes || nodes.length === 0) {
      console.log("[webhook] No nodes in flow:", targetFlow.id)
      return NextResponse.json({ ok: true, message: "No nodes in flow" })
    }

    // Log the webhook
    await supabase.from("webhook_log").insert({
      bot_id: bot.id,
      chat_id: chatId,
      telegram_user_id: telegramUserId,
      message_text: messageText,
      flow_id: targetFlow.id,
      status: "processed",
    })

    // Execute flow nodes
    await executeFlow(
      botToken,
      chatId,
      telegramUserId,
      targetFlow.id,
      nodes as Array<{
        id: string
        type: string
        label: string
        config: Record<string, string>
        position: number
      }>
    )

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[webhook] Error processing update:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

// Health check
export async function GET() {
  return NextResponse.json({ status: "Telegram webhook is active" })
}

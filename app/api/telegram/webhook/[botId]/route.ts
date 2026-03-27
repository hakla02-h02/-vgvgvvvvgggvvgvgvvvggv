import { NextRequest } from "next/server"
import { getSupabase } from "@/lib/supabase"

// ---------------------------------------------------------------------------
// Telegram helpers
// ---------------------------------------------------------------------------

async function sendTelegramMessage(
  botToken: string,
  chatId: number,
  text: string,
  replyMarkup?: object,
) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`
  const body: Record<string, unknown> = { chat_id: chatId, text, parse_mode: "HTML" }
  if (replyMarkup) body.reply_markup = replyMarkup
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

async function sendTelegramPhoto(
  botToken: string,
  chatId: number,
  photoUrl: string,
  caption?: string,
) {
  const url = `https://api.telegram.org/bot${botToken}/sendPhoto`
  const body: Record<string, unknown> = {
    chat_id: chatId,
    photo: photoUrl,
    parse_mode: "HTML",
  }
  if (caption) body.caption = caption
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

async function sendTelegramVideo(
  botToken: string,
  chatId: number,
  videoUrl: string,
  caption?: string,
) {
  const url = `https://api.telegram.org/bot${botToken}/sendVideo`
  const body: Record<string, unknown> = {
    chat_id: chatId,
    video: videoUrl,
    parse_mode: "HTML",
  }
  if (caption) body.caption = caption
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

// ---------------------------------------------------------------------------
// Process message in background (non-blocking)
// ---------------------------------------------------------------------------

async function processUpdate(botId: string, update: Record<string, unknown>) {
  const supabase = getSupabase()

  try {
    // 1. Get bot from database
    const { data: bot, error: botError } = await supabase
      .from("bots")
      .select("*")
      .like("token", `${botId}:%`)
      .single()

    if (botError || !bot) {
      console.error("[webhook] Bot not found:", botId)
      return
    }

    const botUuid = bot.id
    const botToken = bot.token
    if (!botToken) return

    // 2. Extract message data
    const message = update.message || (update.callback_query as Record<string, unknown>)?.message
    if (!message || typeof message !== "object") return

    const msg = message as Record<string, unknown>
    const chat = msg.chat as Record<string, unknown>
    const from = (msg.from || (update.callback_query as Record<string, unknown>)?.from) as Record<string, unknown>
    
    const chatId = chat?.id as number
    const text = (msg.text as string) || ""
    const telegramUserId = from?.id

    if (!chatId) return

    // 3. Check if /start command
    const isStart = text.toLowerCase().startsWith("/start")

    // 4. Get or create lead
    if (telegramUserId && isStart) {
      const { data: existingLead } = await supabase
        .from("leads")
        .select("id")
        .eq("bot_id", botUuid)
        .eq("telegram_id", String(telegramUserId))
        .single()

      if (!existingLead) {
        await supabase.from("leads").insert({
          bot_id: botUuid,
          telegram_id: String(telegramUserId),
          chat_id: String(chatId),
          first_name: (from.first_name as string) || "",
          last_name: (from.last_name as string) || "",
          username: (from.username as string) || "",
          status: "active",
          source: "telegram"
        })
      }
    }

    // 5. Process /start - execute welcome flow
    if (isStart) {
      // Find flow for this bot
      let startFlow = null

      // Strategy 1: Primary active flow
      const { data: primaryFlow } = await supabase
        .from("flows")
        .select("*")
        .eq("bot_id", botUuid)
        .eq("is_primary", true)
        .eq("status", "ativo")
        .single()

      if (primaryFlow) {
        startFlow = primaryFlow
      } else {
        // Strategy 2: Any active flow
        const { data: anyFlow } = await supabase
          .from("flows")
          .select("*")
          .eq("bot_id", botUuid)
          .eq("status", "ativo")
          .order("created_at", { ascending: true })
          .limit(1)
          .single()

        if (anyFlow) {
          startFlow = anyFlow
        } else {
          // Strategy 3: Any flow
          const { data: fallbackFlow } = await supabase
            .from("flows")
            .select("*")
            .eq("bot_id", botUuid)
            .order("created_at", { ascending: true })
            .limit(1)
            .single()

          startFlow = fallbackFlow
        }
      }

      if (startFlow) {
        // Get flow nodes
        const { data: nodes } = await supabase
          .from("flow_nodes")
          .select("*")
          .eq("flow_id", startFlow.id)
          .order("position", { ascending: true })

        if (nodes && nodes.length > 0) {
          for (const node of nodes) {
            await executeNode(botToken, chatId, node)
            await new Promise(resolve => setTimeout(resolve, 300))
          }
        } else {
          await sendTelegramMessage(botToken, chatId, `Ola! Bem-vindo ao ${bot.name || "bot"}.`)
        }
      } else {
        await sendTelegramMessage(botToken, chatId, `Ola! Bem-vindo ao ${bot.name || "bot"}.`)
      }
    }
  } catch (error) {
    console.error("[webhook] Error processing:", error)
  }
}

// ---------------------------------------------------------------------------
// Execute a flow node
// ---------------------------------------------------------------------------

async function executeNode(botToken: string, chatId: number, node: Record<string, unknown>) {
  const nodeType = node.type as string
  const config = (node.config as Record<string, unknown>) || {}
  const subVariant = (config.subVariant as string) || ""

  switch (nodeType) {
    case "trigger":
      break

    case "text":
    case "message": {
      const text = (config.text as string) || (config.content as string) || ""
      const mediaUrl = (config.media_url as string) || ""
      const mediaType = (config.media_type as string) || ""
      
      let buttons: Array<{ text: string; url: string }> = []
      const buttonsRaw = config.buttons
      if (buttonsRaw) {
        try {
          buttons = typeof buttonsRaw === "string" ? JSON.parse(buttonsRaw) : (Array.isArray(buttonsRaw) ? buttonsRaw : [])
        } catch { buttons = [] }
      }

      let replyMarkup = undefined
      if (buttons.length > 0) {
        const validButtons = buttons.filter(b => b.text && b.url)
        if (validButtons.length > 0) {
          replyMarkup = { inline_keyboard: validButtons.map(b => [{ text: b.text, url: b.url }]) }
        }
      }

      if (mediaUrl && mediaType && mediaType !== "none") {
        if (mediaType === "photo") {
          await sendTelegramPhoto(botToken, chatId, mediaUrl, text || undefined)
          return
        } else if (mediaType === "video") {
          await sendTelegramVideo(botToken, chatId, mediaUrl, text || undefined)
          return
        }
      }

      if (text) {
        await sendTelegramMessage(botToken, chatId, text, replyMarkup)
      }
      break
    }

    case "image": {
      const imageUrl = (config.url as string) || (config.media_url as string) || ""
      const caption = (config.caption as string) || (config.text as string) || ""
      if (imageUrl) await sendTelegramPhoto(botToken, chatId, imageUrl, caption || undefined)
      break
    }

    case "video": {
      const videoUrl = (config.url as string) || (config.media_url as string) || ""
      const videoCaption = (config.caption as string) || (config.text as string) || ""
      if (videoUrl) await sendTelegramVideo(botToken, chatId, videoUrl, videoCaption || undefined)
      break
    }

    case "delay": {
      const seconds = parseInt(String(config.seconds)) || 1
      await new Promise(resolve => setTimeout(resolve, seconds * 1000))
      break
    }

    case "action": {
      if (subVariant === "add_group") {
        const groupLink = config.action_name as string
        if (groupLink) {
          await sendTelegramMessage(botToken, chatId, `Entre no grupo:`, {
            inline_keyboard: [[{ text: "Entrar no Grupo", url: groupLink }]]
          })
        }
      }
      break
    }

    case "payment": {
      const paymentButtonsRaw = config.payment_buttons as string
      if (paymentButtonsRaw) {
        try {
          const paymentButtons = JSON.parse(paymentButtonsRaw)
          if (paymentButtons.length > 0) {
            const firstBtn = paymentButtons[0]
            await sendTelegramMessage(botToken, chatId, `${firstBtn.text}\nValor: R$ ${firstBtn.amount}`, {
              inline_keyboard: [[{ text: `Pagar R$ ${firstBtn.amount}`, callback_data: `pay_${firstBtn.id}` }]]
            })
          }
        } catch { /* ignore */ }
      }
      break
    }
  }
}

// ---------------------------------------------------------------------------
// POST /api/telegram/webhook/[botId]
// RESPONDE IMEDIATAMENTE - Processa em background
// ---------------------------------------------------------------------------

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  const { botId } = await params

  // Parse body ANTES de responder
  let update: Record<string, unknown> = {}
  try {
    update = await req.json()
  } catch {
    return new Response("ok")
  }

  // Processar em background (NAO bloqueia resposta)
  processUpdate(botId, update).catch(console.error)

  // RESPONDER IMEDIATAMENTE
  return new Response("ok")
}

// ---------------------------------------------------------------------------
// GET - For webhook verification
// ---------------------------------------------------------------------------

export async function GET() {
  return new Response("Webhook active")
}

import { NextRequest, NextResponse } from "next/server"
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
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return res.json()
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
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return res.json()
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
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return res.json()
}

// ---------------------------------------------------------------------------
// POST /api/telegram/webhook/[botId]
// Receives messages from Telegram for a specific bot
// ---------------------------------------------------------------------------

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  const { botId } = await params
  const supabase = getSupabase()

  try {
    const update = await req.json()
    console.log("[webhook] Received update for bot:", botId, JSON.stringify(update).slice(0, 500))

    // 1. Get bot from database - botId is the Telegram numeric ID (e.g., 8339469623)
    // The token format is: "8339469623:AAxxxxxxx" so we search by token starting with botId
    const { data: bot, error: botError } = await supabase
      .from("bots")
      .select("*")
      .like("token", `${botId}:%`)
      .single()

    if (botError || !bot) {
      console.error("[webhook] Bot not found for telegram ID:", botId, botError)
      return NextResponse.json({ ok: true })
    }
    
    // Use the actual bot UUID for database operations
    const botUuid = bot.id

    const botToken = bot.token
    if (!botToken) {
      console.error("[webhook] Bot has no token:", botId)
      return NextResponse.json({ ok: true })
    }

    console.log("[webhook] Found bot:", bot.name, "Token exists:", !!botToken)

    // 2. Extract message data
    const message = update.message || update.callback_query?.message
    if (!message) {
      console.log("[webhook] No message in update")
      return NextResponse.json({ ok: true })
    }

    const chatId = message.chat.id
    const from = message.from || update.callback_query?.from
    const text = message.text || ""
    const telegramUserId = from?.id

    console.log("[webhook] Message from:", telegramUserId, "Text:", text, "ChatId:", chatId)

    // 3. Check if /start command
    const isStart = text.toLowerCase().startsWith("/start")

    // 4. Get or create lead
    let lead = null
    if (telegramUserId) {
      const { data: existingLead } = await supabase
        .from("leads")
        .select("*")
        .eq("bot_id", botUuid)
        .eq("telegram_id", String(telegramUserId))
        .single()

      if (existingLead) {
        lead = existingLead
        console.log("[webhook] Existing lead:", lead.id)
      } else if (isStart) {
        // Create new lead on /start
        const { data: newLead } = await supabase
          .from("leads")
          .insert({
            bot_id: botUuid,
            telegram_id: String(telegramUserId),
            chat_id: String(chatId),
            first_name: from.first_name || "",
            last_name: from.last_name || "",
            username: from.username || "",
            status: "active",
            source: "telegram"
          })
          .select()
          .single()
        lead = newLead
        console.log("[webhook] Created new lead:", lead?.id)
      }
    }

    // 5. Process /start command - execute welcome flow
    if (isStart) {
      console.log("[webhook] Processing /start command...")

      // Find flow for this bot - try multiple strategies
      let startFlow = null

      // Strategy 1: Primary flow with status 'ativo'
      const { data: primaryFlow, error: primaryError } = await supabase
        .from("flows")
        .select("*")
        .eq("bot_id", botUuid)
        .eq("is_primary", true)
        .eq("status", "ativo")
        .single()

      if (primaryFlow) {
        startFlow = primaryFlow
        console.log("[webhook] Found primary flow:", startFlow.id, startFlow.name)
      } else {
        console.log("[webhook] No primary flow found, error:", primaryError?.message)
      }

      // Strategy 2: Any active flow for this bot
      if (!startFlow) {
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
          console.log("[webhook] Found any active flow:", startFlow.id, startFlow.name)
        }
      }

      // Strategy 3: Any flow regardless of status
      if (!startFlow) {
        const { data: fallbackFlow } = await supabase
          .from("flows")
          .select("*")
          .eq("bot_id", botUuid)
          .order("created_at", { ascending: true })
          .limit(1)
          .single()

        if (fallbackFlow) {
          startFlow = fallbackFlow
          console.log("[webhook] Found fallback flow:", startFlow.id, startFlow.name)
        }
      }

      if (startFlow) {
        console.log("[webhook] Executing flow:", startFlow.id, startFlow.name)

        // Get flow nodes
        const { data: nodes, error: nodesError } = await supabase
          .from("flow_nodes")
          .select("*")
          .eq("flow_id", startFlow.id)
          .order("position", { ascending: true })

        if (nodesError) {
          console.error("[webhook] Error fetching nodes:", nodesError)
        }

        console.log("[webhook] Found", nodes?.length || 0, "nodes")

        if (nodes && nodes.length > 0) {
          for (const node of nodes) {
            console.log("[webhook] Executing node:", node.type, node.label)
            await executeNode(botToken, chatId, node)
            await new Promise(resolve => setTimeout(resolve, 500))
          }
        } else {
          console.log("[webhook] No nodes, sending default message")
          await sendTelegramMessage(botToken, chatId, `Ola! Bem-vindo ao ${bot.name || "bot"}.`)
        }
      } else {
        console.log("[webhook] No flow found, sending default message")
        await sendTelegramMessage(botToken, chatId, `Ola! Bem-vindo ao ${bot.name || "bot"}.`)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    console.error("[webhook] Error:", error)
    return NextResponse.json({ ok: true })
  }
}

// ---------------------------------------------------------------------------
// Execute a flow node
// ---------------------------------------------------------------------------

async function executeNode(botToken: string, chatId: number, node: Record<string, unknown>) {
  const nodeType = node.type as string
  const config = (node.config as Record<string, unknown>) || {}
  const subVariant = config.subVariant as string || ""

  console.log("[webhook] executeNode:", nodeType, subVariant)

  switch (nodeType) {
    case "trigger":
      // Skip trigger nodes
      break

    case "text":
    case "message": {
      const text = (config.text as string) || (config.content as string) || ""
      const mediaUrl = (config.media_url as string) || ""
      const mediaType = (config.media_type as string) || ""
      
      // Parse buttons
      let buttons: Array<{ text: string; url: string }> = []
      const buttonsRaw = config.buttons
      if (buttonsRaw) {
        try {
          buttons = typeof buttonsRaw === "string" ? JSON.parse(buttonsRaw) : buttonsRaw
        } catch {
          buttons = []
        }
      }

      // Build reply markup
      let replyMarkup = undefined
      if (buttons && buttons.length > 0) {
        const validButtons = buttons.filter(b => b.text && b.url)
        if (validButtons.length > 0) {
          replyMarkup = {
            inline_keyboard: validButtons.map(b => [{ text: b.text, url: b.url }])
          }
        }
      }

      // Send media if exists
      if (mediaUrl && mediaType && mediaType !== "none") {
        if (mediaType === "photo") {
          await sendTelegramPhoto(botToken, chatId, mediaUrl, text || undefined)
          return // Photo was sent with caption
        } else if (mediaType === "video") {
          await sendTelegramVideo(botToken, chatId, mediaUrl, text || undefined)
          return // Video was sent with caption
        }
      }

      // Send text message
      if (text) {
        await sendTelegramMessage(botToken, chatId, text, replyMarkup)
      }
      break
    }

    case "image": {
      const imageUrl = (config.url as string) || (config.media_url as string) || ""
      const caption = (config.caption as string) || (config.text as string) || ""
      if (imageUrl) {
        await sendTelegramPhoto(botToken, chatId, imageUrl, caption || undefined)
      }
      break
    }

    case "video": {
      const videoUrl = (config.url as string) || (config.media_url as string) || ""
      const videoCaption = (config.caption as string) || (config.text as string) || ""
      if (videoUrl) {
        await sendTelegramVideo(botToken, chatId, videoUrl, videoCaption || undefined)
      }
      break
    }

    case "delay": {
      const seconds = parseInt(String(config.seconds)) || 1
      console.log("[webhook] Waiting", seconds, "seconds")
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
      // Payment nodes - send payment buttons
      const paymentButtonsRaw = config.payment_buttons as string
      if (paymentButtonsRaw) {
        try {
          const paymentButtons = JSON.parse(paymentButtonsRaw)
          if (paymentButtons.length > 0) {
            const firstBtn = paymentButtons[0]
            await sendTelegramMessage(
              botToken,
              chatId,
              `${firstBtn.text}\nValor: R$ ${firstBtn.amount}`,
              {
                inline_keyboard: [[{ text: `Pagar R$ ${firstBtn.amount}`, callback_data: `pay_${firstBtn.id}` }]]
              }
            )
          }
        } catch {
          console.error("[webhook] Error parsing payment buttons")
        }
      }
      break
    }

    default:
      console.log("[webhook] Unknown node type:", nodeType)
  }
}

// ---------------------------------------------------------------------------
// GET - For webhook verification
// ---------------------------------------------------------------------------

export async function GET() {
  return NextResponse.json({ status: "Webhook endpoint active" })
}

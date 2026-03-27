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
    console.log("[webhook] Received update for bot:", botId)

    // 1. Buscar o bot no banco pelo botId para obter o token
    const { data: bot, error: botError } = await supabase
      .from("bots")
      .select("id, token, name, user_id, is_active")
      .eq("id", botId)
      .single()

    if (botError || !bot) {
      console.error("[webhook] Bot not found:", botId)
      return NextResponse.json({ ok: true })
    }

    if (!bot.is_active) {
      console.log("[webhook] Bot is inactive:", botId)
      return NextResponse.json({ ok: true })
    }

    const botToken = bot.token

    // 2. Handle my_chat_member event - bot added/removed from group
    if (update.my_chat_member) {
      const chatMember = update.my_chat_member
      const chat = chatMember.chat
      const newStatus = chatMember.new_chat_member?.status

      console.log("[webhook] my_chat_member event:", {
        chat_id: chat.id,
        title: chat.title,
        type: chat.type,
        new_status: newStatus
      })

      // Bot was added or promoted to admin
      if (newStatus === "administrator" || newStatus === "member") {
        const isAdmin = newStatus === "administrator"
        const canInvite = isAdmin && chatMember.new_chat_member?.can_invite_users === true

        await supabase
          .from("bot_groups")
          .upsert({
            bot_id: botId,
            chat_id: chat.id,
            title: chat.title || "Grupo sem nome",
            chat_type: chat.type,
            is_admin: isAdmin,
            can_invite: canInvite,
            updated_at: new Date().toISOString()
          }, {
            onConflict: "bot_id,chat_id"
          })
      }

      // Bot was removed or demoted
      if (newStatus === "left" || newStatus === "kicked") {
        await supabase
          .from("bot_groups")
          .delete()
          .eq("bot_id", botId)
          .eq("chat_id", chat.id)
      }

      return NextResponse.json({ ok: true })
    }

    // 3. Handle callback_query (button clicks)
    if (update.callback_query) {
      const callbackQuery = update.callback_query
      const cbFrom = callbackQuery.from
      const cbMessage = callbackQuery.message
      const cbData = callbackQuery.data as string
      const cbChatId = cbMessage?.chat?.id as number
      const cbUserId = cbFrom?.id as number

      console.log("[webhook] Callback query:", { cbData, cbChatId, cbUserId })

      // Answer callback query to remove loading state
      await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callback_query_id: callbackQuery.id })
      })

      // Process callback data (e.g., button clicks in flows)
      // Add your callback processing logic here

      return NextResponse.json({ ok: true })
    }

    // 4. Handle regular messages
    const message = update.message
    if (!message) {
      return NextResponse.json({ ok: true })
    }

    const chat = message.chat
    const from = message.from || {}
    const chatId = chat.id as number
    const telegramUserId = from.id || chatId
    const messageText = (message.text || "").trim()
    const isStart = messageText === "/start" || messageText.startsWith("/start ")

    console.log("[webhook] Message received:", { chatId, telegramUserId, messageText, isStart })

    // 5. Save group info if message is from a group
    if (chat.type && chat.type !== "private") {
      await supabase
        .from("bot_groups")
        .upsert({
          bot_id: botId,
          chat_id: chat.id,
          title: chat.title || "Grupo sem nome",
          chat_type: chat.type,
          is_admin: false,
          can_invite: false,
          updated_at: new Date().toISOString()
        }, {
          onConflict: "bot_id,chat_id",
          ignoreDuplicates: true
        })
    }

    // 6. Find or create lead
    let lead = null
    const { data: existingLead } = await supabase
      .from("leads")
      .select("*")
      .eq("bot_id", botId)
      .eq("telegram_id", String(telegramUserId))
      .single()

    if (existingLead) {
      lead = existingLead
    } else if (isStart) {
      // Create new lead on /start
      const { data: newLead } = await supabase
        .from("leads")
        .insert({
          bot_id: botId,
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
    }

    // 7. Process /start command - execute start flow
    if (isStart && lead) {
      // Find start flow for this bot
      const { data: startFlow } = await supabase
        .from("flows")
        .select("*")
        .eq("bot_id", botId)
        .eq("trigger_type", "start")
        .eq("is_active", true)
        .single()

      if (startFlow) {
        console.log("[webhook] Executing start flow:", startFlow.id)
        
        // Get flow nodes
        const { data: nodes } = await supabase
          .from("flow_nodes")
          .select("*")
          .eq("flow_id", startFlow.id)
          .order("position", { ascending: true })

        if (nodes && nodes.length > 0) {
          // Execute first node (usually a message)
          for (const node of nodes) {
            await executeNode(botToken, chatId, node)
            // Add delay between nodes
            await new Promise(resolve => setTimeout(resolve, 500))
          }
        }
      } else {
        // Default welcome message if no flow
        await sendTelegramMessage(botToken, chatId, `Ola! Bem-vindo ao ${bot.name || "bot"}.`)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    console.error("[webhook] Error:", error)
    return NextResponse.json({ ok: true }) // Always return 200 to Telegram
  }
}

// ---------------------------------------------------------------------------
// Execute a flow node
// ---------------------------------------------------------------------------

async function executeNode(botToken: string, chatId: number, node: Record<string, unknown>) {
  const nodeType = node.type as string
  const config = (node.config as Record<string, unknown>) || {}

  switch (nodeType) {
    case "text":
    case "message":
      const text = (config.text as string) || (config.content as string) || ""
      if (text) {
        await sendTelegramMessage(botToken, chatId, text)
      }
      break

    case "image":
      const imageUrl = config.url as string
      const caption = config.caption as string
      if (imageUrl) {
        await sendTelegramPhoto(botToken, chatId, imageUrl, caption)
      }
      break

    case "delay":
      const delayMs = ((config.seconds as number) || 1) * 1000
      await new Promise(resolve => setTimeout(resolve, delayMs))
      break

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

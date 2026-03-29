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

// Send multiple medias as album (grouped)
async function sendMediaGroup(
  botToken: string,
  chatId: number,
  mediaUrls: string[],
  caption?: string,
) {
  const url = `https://api.telegram.org/bot${botToken}/sendMediaGroup`
  
  const media = mediaUrls.map((mediaUrl, index) => {
    const isVideo = mediaUrl.includes(".mp4") || mediaUrl.includes("video")
    const item: Record<string, unknown> = {
      type: isVideo ? "video" : "photo",
      media: mediaUrl,
    }
    // Caption only on first item
    if (index === 0 && caption) {
      item.caption = caption
      item.parse_mode = "HTML"
    }
    return item
  })
  
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, media }),
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

    // 3. Check if callback query (button click)
    const callbackQuery = update.callback_query as Record<string, unknown> | null
    const callbackData = callbackQuery?.data as string | null
    
    // 3.1 Handle callback queries
    if (callbackQuery && callbackData) {
      // Answer callback to remove loading state
      await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callback_query_id: callbackQuery.id })
      })
      
      // Handle "ver_planos" - show plans as buttons
      if (callbackData === "ver_planos") {
        // Find flow for this bot
        const { data: directFlow } = await supabase
          .from("flows")
          .select("*")
          .eq("bot_id", botUuid)
          .eq("status", "ativo")
          .limit(1)
          .single()
        
        let flowId = directFlow?.id
        let flowForConfig = directFlow
        
        if (!flowId) {
          const { data: flowBot } = await supabase
            .from("flow_bots")
            .select("flow_id")
            .eq("bot_id", botUuid)
            .limit(1)
            .single()
          flowId = flowBot?.flow_id
          
          // Fetch full flow to get config
          if (flowId) {
            const { data: fullFlow } = await supabase
              .from("flows")
              .select("*")
              .eq("id", flowId)
              .single()
            flowForConfig = fullFlow
          }
        }
        
        if (flowId && flowForConfig) {
          // Get plans from flow_plans table first
          const { data: plans } = await supabase
            .from("flow_plans")
            .select("*")
            .eq("flow_id", flowId)
            .eq("is_active", true)
            .order("position", { ascending: true })
          
          if (plans && plans.length > 0) {
            // Build buttons for each plan
            const planButtons = plans.map(plan => [{
              text: `${plan.name} - R$ ${Number(plan.price).toFixed(2).replace(".", ",")}`,
              callback_data: `plan_${plan.id}`
            }])
            
            await sendTelegramMessage(
              botToken, 
              chatId, 
              "Escolha seu plano:",
              { inline_keyboard: planButtons }
            )
          } else {
            // Fallback: get plans from flow config JSON
            const flowConfig = (flowForConfig.config as Record<string, unknown>) || {}
            const configPlans = (flowConfig.plans as Array<{ id: string; name: string; price: number }>) || []
            
            if (configPlans.length > 0) {
              const planButtons = configPlans.map(plan => [{
                text: `${plan.name} - R$ ${Number(plan.price).toFixed(2).replace(".", ",")}`,
                callback_data: `plan_${plan.id}`
              }])
              
              await sendTelegramMessage(
                botToken, 
                chatId, 
                "Escolha seu plano:",
                { inline_keyboard: planButtons }
              )
            } else {
              await sendTelegramMessage(botToken, chatId, "Nenhum plano disponivel no momento.")
            }
          }
        } else {
          await sendTelegramMessage(botToken, chatId, "Fluxo nao encontrado.")
        }
        return
      }
      
      // Handle plan selection - generate PIX
      if (callbackData.startsWith("plan_")) {
        const planId = callbackData.replace("plan_", "")
        
        // First try to get plan from flow_plans table
        let planName = ""
        let planPrice = 0
        let flowIdForGateway = ""
        
        const { data: dbPlan } = await supabase
          .from("flow_plans")
          .select("*, flows!inner(id, config, bot_id)")
          .eq("id", planId)
          .single()
        
        if (dbPlan) {
          planName = dbPlan.name
          planPrice = Number(dbPlan.price)
          flowIdForGateway = dbPlan.flows?.id || ""
        } else {
          // Try to find plan in flow config - check direct flow first
          let flowWithPlan = null
          
          const { data: directFlow } = await supabase
            .from("flows")
            .select("id, config, bot_id")
            .eq("bot_id", botUuid)
            .eq("status", "ativo")
            .limit(1)
            .single()
          
          if (directFlow) {
            flowWithPlan = directFlow
          } else {
            // Check via flow_bots table
            const { data: flowBot } = await supabase
              .from("flow_bots")
              .select("flow_id")
              .eq("bot_id", botUuid)
              .limit(1)
              .single()
            
            if (flowBot?.flow_id) {
              const { data: linkedFlow } = await supabase
                .from("flows")
                .select("id, config, bot_id")
                .eq("id", flowBot.flow_id)
                .single()
              flowWithPlan = linkedFlow
            }
          }
          
          if (flowWithPlan) {
            const flowConfig = (flowWithPlan.config as Record<string, unknown>) || {}
            const configPlans = (flowConfig.plans as Array<{ id: string; name: string; price: number }>) || []
            const foundPlan = configPlans.find(p => p.id === planId)
            
            if (foundPlan) {
              planName = foundPlan.name
              planPrice = Number(foundPlan.price)
              flowIdForGateway = flowWithPlan.id
            }
          }
        }
        
        if (!planName || planPrice <= 0) {
          await sendTelegramMessage(botToken, chatId, "Plano nao encontrado.")
          return
        }
        
        // Send processing message
        await sendTelegramMessage(
          botToken,
          chatId,
          `Voce selecionou: *${planName}*\n\nValor: R$ ${planPrice.toFixed(2).replace(".", ",")}\n\nGerando pagamento PIX...`,
          undefined
        )
        
        // Get gateway credentials for this bot (table is user_gateways)
        const { data: gateway } = await supabase
          .from("user_gateways")
          .select("*")
          .eq("bot_id", botUuid)
          .eq("is_active", true)
          .limit(1)
          .single()
        
        if (!gateway || !gateway.access_token) {
          await sendTelegramMessage(
            botToken,
            chatId,
            "Gateway de pagamento nao configurado. Entre em contato com o suporte.",
            undefined
          )
          return
        }
        
        // Generate PIX via Mercado Pago
        try {
          const mpResponse = await fetch("https://api.mercadopago.com/v1/payments", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${gateway.access_token}`,
              "X-Idempotency-Key": `${Date.now()}-${Math.random().toString(36).substring(7)}`,
            },
            body: JSON.stringify({
              transaction_amount: planPrice,
              description: `Pagamento - ${planName}`,
              payment_method_id: "pix",
              payer: {
                email: `telegram_${telegramUserId}@pix.payment`,
              },
            }),
          })
          
          if (!mpResponse.ok) {
            const errorData = await mpResponse.json()
            console.error("Mercado Pago error:", errorData)
            await sendTelegramMessage(
              botToken,
              chatId,
              "Erro ao gerar pagamento. Tente novamente.",
              undefined
            )
            return
          }
          
          const paymentData = await mpResponse.json()
          const pixData = paymentData.point_of_interaction?.transaction_data
          
          if (pixData?.qr_code_base64) {
            // Send QR Code image
            const qrImageUrl = `data:image/png;base64,${pixData.qr_code_base64}`
            
            // For Telegram, we need to send the base64 as a file or use the ticket_url
            // Using ticket_url which is a direct link to the QR code
            if (pixData.ticket_url) {
              await sendTelegramPhoto(
                botToken,
                chatId,
                pixData.ticket_url,
                `Escaneie o QR Code para pagar\n\nValor: R$ ${planPrice.toFixed(2).replace(".", ",")}\nPlano: ${planName}`
              )
            }
            
            // Also send PIX copy-paste code
            if (pixData.qr_code) {
              await sendTelegramMessage(
                botToken,
                chatId,
                `Ou copie o codigo PIX abaixo:\n\n\`${pixData.qr_code}\``,
                undefined
              )
            }
            
            // Save payment record
            await supabase.from("payments").insert({
              bot_id: botUuid,
              flow_id: flowIdForGateway || null,
              telegram_user_id: String(telegramUserId),
              plan_name: planName,
              amount: planPrice,
              payment_id: String(paymentData.id),
              status: paymentData.status,
              gateway: gateway.gateway_name,
            })
            
          } else {
            await sendTelegramMessage(
              botToken,
              chatId,
              "Erro ao gerar QR Code. Tente novamente.",
              undefined
            )
          }
          
        } catch (err) {
          console.error("PIX generation error:", err)
          await sendTelegramMessage(
            botToken,
            chatId,
            "Erro ao processar pagamento. Tente novamente.",
            undefined
          )
        }
        
        return
      }
    }
    
    // 4. Check if /start command
    const isStart = text.toLowerCase().startsWith("/start")

    // 5. Get or create lead
    if (telegramUserId && isStart) {
      const { data: existingLead } = await supabase
        .from("leads")
        .select("id")
        .eq("bot_id", botUuid)
        .eq("telegram_id", String(telegramUserId))
        .single()

      if (!existingLead) {
        const { error: leadError } = await supabase.from("leads").insert({
          bot_id: botUuid,
          telegram_id: String(telegramUserId),
          chat_id: String(chatId),
          first_name: (from.first_name as string) || "",
          last_name: (from.last_name as string) || "",
          username: (from.username as string) || "",
          status: "active",
          source: "telegram"
        })
        
        if (leadError) {
          console.error("[webhook] Erro ao inserir lead:", leadError.message, leadError.code)
        }
      }
    }

    // 6. Process /start - execute welcome flow
    if (isStart) {
      // Find flow for this bot
      let startFlow = null

      // Strategy 1: Check flows.bot_id (direct link)
      const { data: directFlow } = await supabase
        .from("flows")
        .select("*")
        .eq("bot_id", botUuid)
        .eq("status", "ativo")
        .order("is_primary", { ascending: false })
        .limit(1)
        .single()

      if (directFlow) {
        startFlow = directFlow
      } else {
        // Strategy 2: Check flow_bots table (many-to-many link from /fluxos page)
        const { data: flowBotLink } = await supabase
          .from("flow_bots")
          .select("flow_id")
          .eq("bot_id", botUuid)
          .limit(1)
          .single()

        if (flowBotLink) {
          const { data: linkedFlow } = await supabase
            .from("flows")
            .select("*")
            .eq("id", flowBotLink.flow_id)
            .single()

          if (linkedFlow) {
            startFlow = linkedFlow
          }
        }
      }

      // Strategy 3: Any flow from user (last resort)
      if (!startFlow) {
        const { data: anyUserFlow } = await supabase
          .from("flows")
          .select("*")
          .eq("user_id", bot.user_id)
          .eq("status", "ativo")
          .order("created_at", { ascending: false })
          .limit(1)
          .single()

        startFlow = anyUserFlow
      }

      if (startFlow) {
        // Get flow config (contains all settings from /fluxos/[id] page)
        const flowConfig = (startFlow.config as Record<string, unknown>) || {}
        
        // Helper to replace variables
        const replaceVars = (text: string) => {
          if (!text) return ""
          return text
            .replace(/\{nome\}/gi, (from?.first_name as string) || "")
            .replace(/\{username\}/gi, (from?.username as string) ? `@${from.username}` : "")
            .replace(/\{bot\.username\}/gi, bot.username ? `@${bot.username}` : bot.name || "")
        }
        
        // Get welcome message - try config first, then table field
        const welcomeMsg = (flowConfig.welcomeMessage as string) || (startFlow.welcome_message as string) || ""
        
        // Get medias - filter out base64 (Telegram only accepts URLs)
        const allMedias = (flowConfig.welcomeMedias as string[]) || []
        const welcomeMedias = allMedias.filter(m => m && !m.startsWith("data:") && (m.startsWith("http") || m.startsWith("/")))
        
        const ctaButtonText = (flowConfig.ctaButtonText as string) || "Ver Planos"
        const redirectButton = flowConfig.redirectButton as { enabled?: boolean; text?: string; url?: string } || {}
        const secondaryMsg = flowConfig.secondaryMessage as { enabled?: boolean; message?: string } || {}
        
        // Always send welcome flow (we have at least a default message)
        const finalMsg = replaceVars(welcomeMsg) || `Ola! Bem-vindo ao ${bot.name || "bot"}.`
        
        // Build inline keyboard with buttons
        const inlineKeyboard: Array<Array<{ text: string; callback_data?: string; url?: string }>> = []
        
        // CTA Button (Ver Planos) - callback button
        inlineKeyboard.push([{ text: ctaButtonText, callback_data: "ver_planos" }])
        
        // Redirect Button - URL button (if enabled)
        if (redirectButton.enabled && redirectButton.text && redirectButton.url) {
          inlineKeyboard.push([{ text: redirectButton.text, url: redirectButton.url }])
        }
        
        const replyMarkup = { inline_keyboard: inlineKeyboard }
        
        // STEP 1: Send medias (if any valid URLs) - grouped as album
        if (welcomeMedias.length > 0) {
          try {
            // Send all medias together as album with welcome message as caption
            await sendMediaGroup(botToken, chatId, welcomeMedias, finalMsg)
            // Send buttons separately after the album
            await sendTelegramMessage(botToken, chatId, "Escolha uma opcao:", replyMarkup)
          } catch {
            // If media group fails, send message with buttons normally
            await sendTelegramMessage(botToken, chatId, finalMsg, replyMarkup)
          }
        } else {
          // STEP 2: No medias - send welcome message with buttons
          await sendTelegramMessage(botToken, chatId, finalMsg, replyMarkup)
        }
        
        // STEP 3: Send secondary message (if enabled)
        if (secondaryMsg.enabled && secondaryMsg.message) {
          await new Promise(resolve => setTimeout(resolve, 500))
          await sendTelegramMessage(botToken, chatId, replaceVars(secondaryMsg.message))
        }
        
        return

        // Fallback: Get flow nodes
        const { data: nodes } = await supabase
          .from("flow_nodes")
          .select("*")
          .eq("flow_id", startFlow.id)
          .order("position", { ascending: true })

        if (nodes && nodes.length > 0) {
          for (const node of nodes) {
            await executeNode(botToken, chatId, node, from as Record<string, unknown>)
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

async function executeNode(botToken: string, chatId: number, node: Record<string, unknown>, from?: Record<string, unknown>) {
  const nodeType = node.type as string
  const config = (node.config as Record<string, unknown>) || {}
  const subVariant = (config.subVariant as string) || ""

  // Helper to replace variables
  const replaceVars = (text: string) => {
    return text
      .replace(/\{nome\}/gi, (from?.first_name as string) || "")
      .replace(/\{username\}/gi, (from?.username as string) ? `@${from.username}` : "")
  }

  switch (nodeType) {
    case "trigger":
      break

    case "text":
    case "message": {
      let text = (config.text as string) || (config.content as string) || ""
      text = replaceVars(text)
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

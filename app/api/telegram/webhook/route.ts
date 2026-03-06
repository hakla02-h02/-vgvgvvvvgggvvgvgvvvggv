import { NextRequest, NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InlineButton {
  text: string
  url: string
}

interface FlowNode {
  id: string
  type: string
  label: string
  config: Record<string, unknown>
  position: number
}

interface ConditionBranch {
  label: string
  target_flow_id: string
}

// ---------------------------------------------------------------------------
// Telegram helpers
// ---------------------------------------------------------------------------

function buildInlineKeyboard(buttons: InlineButton[]) {
  if (!buttons || buttons.length === 0) return undefined
  return { inline_keyboard: buttons.map((btn) => [{ text: btn.text, url: btn.url }]) }
}

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
  caption: string,
  replyMarkup?: object,
) {
  const url = `https://api.telegram.org/bot${botToken}/sendPhoto`

  if (photoUrl.startsWith("data:")) {
    const formData = new FormData()
    formData.append("chat_id", String(chatId))
    if (caption) formData.append("caption", caption)
    formData.append("parse_mode", "HTML")
    if (replyMarkup) formData.append("reply_markup", JSON.stringify(replyMarkup))

    const base64Match = photoUrl.match(/^data:([^;]+);base64,(.+)$/)
    if (base64Match) {
      const mimeType = base64Match[1]
      const base64Data = base64Match[2]
      const binaryStr = atob(base64Data)
      const bytes = new Uint8Array(binaryStr.length)
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i)
      }
      formData.append("photo", new Blob([bytes], { type: mimeType }), "photo.jpg")
    }

    const res = await fetch(url, { method: "POST", body: formData })
    return res.json()
  }

  const body: Record<string, unknown> = {
    chat_id: chatId,
    photo: photoUrl,
    caption,
    parse_mode: "HTML",
  }
  if (replyMarkup) body.reply_markup = replyMarkup
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
  caption: string,
  replyMarkup?: object,
) {
  const url = `https://api.telegram.org/bot${botToken}/sendVideo`

  if (videoUrl.startsWith("data:")) {
    const formData = new FormData()
    formData.append("chat_id", String(chatId))
    if (caption) formData.append("caption", caption)
    formData.append("parse_mode", "HTML")
    if (replyMarkup) formData.append("reply_markup", JSON.stringify(replyMarkup))

    const base64Match = videoUrl.match(/^data:([^;]+);base64,(.+)$/)
    if (base64Match) {
      const mimeType = base64Match[1]
      const base64Data = base64Match[2]
      const binaryStr = atob(base64Data)
      const bytes = new Uint8Array(binaryStr.length)
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i)
      }
      formData.append("video", new Blob([bytes], { type: mimeType }), "video.mp4")
    }

    const res = await fetch(url, { method: "POST", body: formData })
    return res.json()
  }

  const body: Record<string, unknown> = {
    chat_id: chatId,
    video: videoUrl,
    caption,
    parse_mode: "HTML",
  }
  if (replyMarkup) body.reply_markup = replyMarkup
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return res.json()
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ---------------------------------------------------------------------------
// Helpers – send message node (text / photo / video + inline buttons)
// ---------------------------------------------------------------------------

async function sendMessageNode(botToken: string, chatId: number, config: Record<string, unknown>) {
  const text = (config.text as string) || ""
  const mediaType = (config.media_type as string) || ""
  const mediaUrl = (config.media_url as string) || ""
  const buttonsStr = (config.buttons as string) || ""

  let inlineKeyboard: object | undefined
  if (buttonsStr) {
    try {
      inlineKeyboard = buildInlineKeyboard(JSON.parse(buttonsStr) as InlineButton[])
    } catch {
      /* ignore */
    }
  }

  const displayText = text || "Mensagem"
  const hasMedia = !!mediaUrl && !!mediaType

  try {
    if (hasMedia) {
      // Step 1: Send media alone (no caption, no buttons)
      let mediaResult: { ok?: boolean; description?: string } = { ok: false }
      if (mediaType === "photo") {
        mediaResult = await sendTelegramPhoto(botToken, chatId, mediaUrl, "", undefined)
      } else if (mediaType === "video") {
        mediaResult = await sendTelegramVideo(botToken, chatId, mediaUrl, "", undefined)
      }

      // If media failed, just log and continue to text
      if (!mediaResult.ok) {
        console.log("[v0] Media send failed, continuing to text message")
      }

      // Step 2: Send text + buttons as a separate message
      await sendTelegramMessage(botToken, chatId, displayText, inlineKeyboard)
    } else {
      // No media - just send text with buttons
      await sendTelegramMessage(botToken, chatId, displayText, inlineKeyboard)
    }
  } catch {
    // Last resort: plain text
    try {
      await sendTelegramMessage(botToken, chatId, displayText)
    } catch {
      /* give up */
    }
  }
}

// ---------------------------------------------------------------------------
// Database helpers
// ---------------------------------------------------------------------------

async function upsertBotUser(
  botId: string,
  telegramUserId: number,
  chatId: number,
  fromData: Record<string, string>,
) {
  const supabase = getSupabase()

  const { data: existing } = await supabase
    .from("bot_users")
    .select("id")
    .eq("bot_id", botId)
    .eq("telegram_user_id", telegramUserId)
    .limit(1)

  if (existing && existing.length > 0) {
    await supabase
      .from("bot_users")
      .update({
        first_name: fromData.first_name || null,
        last_name: fromData.last_name || null,
        username: fromData.username || null,
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("bot_id", botId)
      .eq("telegram_user_id", telegramUserId)
  } else {
    await supabase.from("bot_users").insert({
      bot_id: botId,
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
}

async function updateFunnelStep(botId: string, telegramUserId: number, newStep: number) {
  const supabase = getSupabase()
  const { data: users } = await supabase
    .from("bot_users")
    .select("funnel_step")
    .eq("bot_id", botId)
    .eq("telegram_user_id", telegramUserId)
    .limit(1)

  const user = users?.[0]
  if (user && newStep > user.funnel_step) {
    const payload: Record<string, unknown> = {
      funnel_step: newStep,
      updated_at: new Date().toISOString(),
    }
    if (newStep >= 4) {
      payload.is_subscriber = true
      payload.subscription_start = new Date().toISOString()
      payload.subscription_end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      payload.subscription_plan = "Mensal"
    }
    await supabase
      .from("bot_users")
      .update(payload)
      .eq("bot_id", botId)
      .eq("telegram_user_id", telegramUserId)
  }
}

async function fetchNodes(flowId: string): Promise<FlowNode[]> {
  const supabase = getSupabase()
  const { data } = await supabase
    .from("flow_nodes")
    .select("id, type, label, config, position")
    .eq("flow_id", flowId)
    .order("position", { ascending: true })
  return (data as FlowNode[]) || []
}

async function setFlowState(
  botId: string,
  flowId: string,
  telegramUserId: number,
  chatId: number,
  position: number,
  status: string,
) {
  const supabase = getSupabase()

  const { data: existing } = await supabase
    .from("user_flow_state")
    .select("id")
    .eq("bot_id", botId)
    .eq("flow_id", flowId)
    .eq("telegram_user_id", telegramUserId)
    .limit(1)

  if (existing && existing.length > 0) {
    await supabase
      .from("user_flow_state")
      .update({
        current_node_position: position,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing[0].id)
  } else {
    await supabase.from("user_flow_state").insert({
      bot_id: botId,
      flow_id: flowId,
      telegram_user_id: telegramUserId,
      chat_id: chatId,
      current_node_position: position,
      status,
    })
  }
}

async function completeAllStates(botId: string, telegramUserId: number) {
  const supabase = getSupabase()
  const { data: states } = await supabase
    .from("user_flow_state")
    .select("id")
    .eq("bot_id", botId)
    .eq("telegram_user_id", telegramUserId)

  if (states && states.length > 0) {
    for (const s of states) {
      // Mark as "finished" to indicate flow ended (not "completed" which is for explicit ends)
      await supabase
        .from("user_flow_state")
        .update({ status: "finished", updated_at: new Date().toISOString() })
        .eq("id", s.id)
    }
  }
}

// ---------------------------------------------------------------------------
// POST – Telegram webhook entry point
// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const botToken = searchParams.get("token")

  if (!botToken) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 })
  }

  let update: Record<string, unknown>
  try {
    update = await req.json()
  } catch {
    return NextResponse.json({ ok: true })
  }

  // Handle callback_query (button clicks)
  const callbackQuery = update?.callback_query as Record<string, unknown> | undefined
  if (callbackQuery) {
    const cbFrom = callbackQuery.from as Record<string, unknown>
    const cbMessage = callbackQuery.message as Record<string, unknown>
    const cbData = callbackQuery.data as string
    const cbChatId = (cbMessage?.chat as Record<string, unknown>)?.id as number
    const cbUserId = cbFrom?.id as number

    try {
      await processCallbackQuery({ botToken, chatId: cbChatId, telegramUserId: cbUserId, callbackData: cbData, callbackQueryId: callbackQuery.id as string })
    } catch {
      // Always return 200
    }
    return NextResponse.json({ ok: true })
  }

  const message = update?.message as Record<string, unknown> | undefined
  if (!message) {
    return NextResponse.json({ ok: true })
  }

  const chat = message.chat as Record<string, unknown>
  const from = (message.from as Record<string, string>) || {}
  const chatId = chat.id as number
  const telegramUserId = (from.id as unknown as number) || chatId
  const messageText = ((message.text as string) || "").trim()
  const isStart = messageText === "/start" || messageText.startsWith("/start ")

  try {
    await processWebhook({ botToken, chatId, telegramUserId, messageText, isStart, fromData: from })
  } catch {
    // Always return 200 to Telegram
  }

  return NextResponse.json({ ok: true })
}

// ---------------------------------------------------------------------------
// Core processing
// ---------------------------------------------------------------------------

async function processWebhook({
  botToken,
  chatId,
  telegramUserId,
  messageText,
  isStart,
  fromData,
}: {
  botToken: string
  chatId: number
  telegramUserId: number
  messageText: string
  isStart: boolean
  fromData: Record<string, string>
}) {
  const supabase = getSupabase()

  // 1. Find bot
  const { data: bots, error: botError } = await supabase
    .from("bots")
    .select("id, token, status")
    .eq("token", botToken)
    .limit(1)

  if (botError || !bots?.length) return
  const bot = bots[0]
  if (bot.status !== "active") return

  // 2. Upsert user
  await upsertBotUser(bot.id, telegramUserId, chatId, fromData)

  // 3. Find active flows
  const { data: allFlows, error: flowsError } = await supabase
    .from("flows")
    .select("id, name, category, status")
    .eq("bot_id", bot.id)
    .eq("status", "ativo")
    .order("created_at", { ascending: true })

  if (!allFlows || allFlows.length === 0) return
  const primaryFlow = allFlows[0]

  // 4. Get user states
  const { data: allStates } = await supabase
    .from("user_flow_state")
    .select("*")
    .eq("bot_id", bot.id)
    .eq("telegram_user_id", telegramUserId)
    .order("updated_at", { ascending: false })

  // Find active state - only "in_progress" or "waiting_response" are considered active
  // "completed" and "finished" mean the flow has ended and should NOT restart
  const activeState = allStates?.find(
    (s: Record<string, unknown>) =>
      s.status === "in_progress" || s.status === "waiting_response",
  ) || null

  // ------------------------------------------------------------------
  // /start  –  Reset everything and run the primary flow from scratch
  // ------------------------------------------------------------------
if (isStart) {
  await completeAllStates(bot.id, telegramUserId)
  
  const nodes = await fetchNodes(primaryFlow.id)
  if (nodes.length === 0) return
  
  await setFlowState(bot.id, primaryFlow.id, telegramUserId, chatId, 0, "in_progress")
  await executeNodes(botToken, chatId, nodes, 0, bot.id, primaryFlow.id, telegramUserId)
  return
  }

  // ------------------------------------------------------------------
  // Normal message – only matters if we're waiting for a response
  // ------------------------------------------------------------------
  // If there's no active state, or the flow has completed/finished, or it's in_progress
  // (meaning it's still executing), we should NOT process the message.
  // "finished" = flow ended naturally (no more messages to send)
  // "completed" = flow was explicitly ended (e.g., by "end" action or condition redirect)
  if (!activeState || 
      activeState.status === "completed" || 
      activeState.status === "finished" || 
      activeState.status === "in_progress") {
    return
  }

  if (activeState.status === "waiting_response") {
    const currentFlowId = activeState.flow_id as string
    const currentPosition = activeState.current_node_position as number
    const nodes = await fetchNodes(currentFlowId)

    // Find the condition node we're waiting on
    const conditionNode = nodes.find((n) => n.position === currentPosition)

    if (conditionNode && conditionNode.type === "condition") {
      // Try to match the user's response against the condition branches
      const branchesRaw = (conditionNode.config?.condition_branches as string) || "[]"
      let branches: ConditionBranch[] = []
      try {
        branches = JSON.parse(branchesRaw)
      } catch {
        branches = []
      }

      // Normalize user text for matching (lowercase, trimmed)
      const normalizedResponse = messageText.toLowerCase().trim()

      // Find a matching branch
      const matchedBranch = branches.find((b) => {
        if (!b.label) return false
        return normalizedResponse === b.label.toLowerCase().trim()
      })

      if (matchedBranch && matchedBranch.target_flow_id) {
        // Branch has a target flow -> redirect to that flow
        await setFlowState(bot.id, currentFlowId, telegramUserId, chatId, currentPosition, "completed")

        const targetNodes = await fetchNodes(matchedBranch.target_flow_id)
        if (targetNodes.length === 0) return

        await setFlowState(bot.id, matchedBranch.target_flow_id, telegramUserId, chatId, 0, "in_progress")
        await executeNodes(botToken, chatId, targetNodes, 0, bot.id, matchedBranch.target_flow_id, telegramUserId)
        return
      }

      // No matching branch or no target -> just advance to the next node
      const nextPos = currentPosition + 1
      await setFlowState(bot.id, currentFlowId, telegramUserId, chatId, nextPos, "in_progress")
      await executeNodes(botToken, chatId, nodes, nextPos, bot.id, currentFlowId, telegramUserId)
      return
    }

    // Not a condition node (shouldn't normally happen) – advance anyway
    const nextPos = currentPosition + 1
    await setFlowState(bot.id, currentFlowId, telegramUserId, chatId, nextPos, "in_progress")
    await executeNodes(botToken, chatId, nodes, nextPos, bot.id, currentFlowId, telegramUserId)
  }
}

// ---------------------------------------------------------------------------
// Node execution engine
// ---------------------------------------------------------------------------

async function executeNodes(
  botToken: string,
  chatId: number,
  nodes: FlowNode[],
  startPosition: number,
  botId: string,
  flowId: string,
  telegramUserId: number,
  depth: number = 0,
) {
  // Proteção contra loop infinito (max 5 restarts por execução)
  if (depth > 5) return
  
  const supabase = getSupabase()
  const remaining = nodes.filter((n) => n.position >= startPosition)

  for (const node of remaining) {
    // Update position & refresh lock
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
      // ---------------------------------------------------------------
      case "trigger":
        // No-op, it's just a marker
        break

      // ---------------------------------------------------------------
      case "message": {
        await sendMessageNode(botToken, chatId, node.config || {})
        await updateFunnelStep(botId, telegramUserId, 2)
        break
      }

      // ---------------------------------------------------------------
      case "delay": {
        const seconds = Math.min(parseInt((node.config?.seconds as string) || "5", 10), 55)
        await sleep(seconds * 1000)
        // Refresh lock after sleeping so it doesn't look stale
        await supabase
          .from("user_flow_state")
          .update({ updated_at: new Date().toISOString() })
          .eq("bot_id", botId)
          .eq("flow_id", flowId)
          .eq("telegram_user_id", telegramUserId)
        break
      }

      // ---------------------------------------------------------------
      case "condition": {
        // Send the condition question to the user
        const conditionMessage = (node.config?.condition_message as string) || (node.config?.text as string) || ""
        if (conditionMessage) {
          await sendTelegramMessage(botToken, chatId, conditionMessage)
        }

        // Pause and wait for user response
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

        return // STOP – wait for user reply
      }

      // ---------------------------------------------------------------
      case "payment": {
        const paymentMessage = (node.config?.payment_message as string) || "Escolha seu plano:"
        const paymentMode = (node.config?.payment_mode as string) || "bot_plans"
        const selectedPlansStr = (node.config?.selected_plans as string) || "[]"
        
        let inlineKeyboard: { inline_keyboard: { text: string; callback_data: string }[][] } | undefined

        if (paymentMode === "custom") {
          // Modo personalizado - botao unico
          const amount = (node.config?.amount as string) || "0"
          const description = (node.config?.description as string) || "Pagamento"
          const buttonText = (node.config?.button_text as string) || `Pagar R$ ${amount}`
          
          inlineKeyboard = {
            inline_keyboard: [[{
              text: buttonText,
              callback_data: `pay_custom_${amount.replace(",", ".")}_${node.id}`
            }]]
          }
          
          await sendTelegramMessage(botToken, chatId, paymentMessage, inlineKeyboard)
        } else {
          // Modo planos do bot - buscar planos selecionados
          let selectedPlanIds: string[] = []
          try {
            selectedPlanIds = JSON.parse(selectedPlansStr)
          } catch { /* ignore */ }

          if (selectedPlanIds.length > 0) {
            // Buscar planos do banco
            const { data: plans } = await supabase
              .from("payment_plans")
              .select("id, name, price")
              .in("id", selectedPlanIds)
              .eq("is_active", true)

            if (plans && plans.length > 0) {
              inlineKeyboard = {
                inline_keyboard: plans.map((plan) => [{
                  text: `${plan.name} - R$ ${plan.price.toFixed(2).replace(".", ",")}`,
                  callback_data: `pay_plan_${plan.id}`
                }])
              }
            }
          }

          await sendTelegramMessage(botToken, chatId, paymentMessage, inlineKeyboard)
        }

        // Pausar e aguardar o usuario clicar no botao
        await supabase
          .from("user_flow_state")
          .update({
            current_node_position: node.position,
            status: "waiting_payment",
            updated_at: new Date().toISOString(),
          })
          .eq("bot_id", botId)
          .eq("flow_id", flowId)
          .eq("telegram_user_id", telegramUserId)

        await updateFunnelStep(botId, telegramUserId, 3)
        return // STOP - aguardar callback do botao
      }

      // ---------------------------------------------------------------
      // ACTION – this is where restart / end / goto_flow / add_group live
      // The dashboard saves all of these with type="action" and
      // config.subVariant to distinguish them.
      // ---------------------------------------------------------------
      case "action": {
        const subVariant = (node.config?.subVariant as string) || ""

        switch (subVariant) {
          // -- End the conversation --
          case "end": {
            await setFlowState(botId, flowId, telegramUserId, chatId, node.position, "completed")
            return // STOP
          }

          // -- Go to another flow --
          case "goto_flow": {
            const targetFlowId = (node.config?.target_flow_id as string) || ""
            if (!targetFlowId) break // no target, just continue

            // Complete current flow
            await setFlowState(botId, flowId, telegramUserId, chatId, node.position, "completed")

            // Load & execute target flow
            const targetNodes = await fetchNodes(targetFlowId)
            if (targetNodes.length === 0) return

            await setFlowState(botId, targetFlowId, telegramUserId, chatId, 0, "in_progress")
            await executeNodes(botToken, chatId, targetNodes, 0, botId, targetFlowId, telegramUserId, depth + 1)
            return // STOP
          }

          // -- Add to group (send group link) --
          case "add_group": {
            const groupLink = (node.config?.action_name as string) || ""
            if (groupLink) {
              await sendTelegramMessage(botToken, chatId, groupLink)
            }
            await updateFunnelStep(botId, telegramUserId, 4)
            break
          }

          // -- Generic / unknown action --
          default: {
            const actionText =
              (node.config?.text as string) ||
              (node.config?.action_name as string) ||
              node.label
            if (actionText) {
              await sendTelegramMessage(botToken, chatId, actionText)
            }
            break
          }
        }
        break
      }

      // ---------------------------------------------------------------
      // Fallback for any unknown node type
      // ---------------------------------------------------------------
      default:
        break
    }
  }

  // All nodes executed – mark flow as completed (finished naturally)
  // When a flow ends naturally (no more messages), mark it as "finished" 
  // so it won't restart or loop infinitely
  if (remaining.length > 0) {
    const lastNode = remaining[remaining.length - 1]
    await setFlowState(botId, flowId, telegramUserId, chatId, lastNode.position, "finished")
  } else {
    // No remaining nodes means flow is done - mark as finished
    await setFlowState(botId, flowId, telegramUserId, chatId, startPosition, "finished")
  }
}

// ---------------------------------------------------------------------------
// Process callback query (button clicks)
// ---------------------------------------------------------------------------

async function processCallbackQuery({
  botToken,
  chatId,
  telegramUserId,
  callbackData,
  callbackQueryId,
}: {
  botToken: string
  chatId: number
  telegramUserId: number
  callbackData: string
  callbackQueryId: string
}) {
  const supabase = getSupabase()

  // Answer the callback to remove loading state
  await fetch(`https://api.telegram.org/bot${botToken}/answerCallbackQuery`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ callback_query_id: callbackQueryId }),
  })

  // Find bot
  const { data: bots } = await supabase
    .from("bots")
    .select("id, user_id, token, status")
    .eq("token", botToken)
    .limit(1)

  if (!bots?.length) return
  const bot = bots[0]

  // Check if this is a payment callback
  if (callbackData.startsWith("pay_plan_") || callbackData.startsWith("pay_custom_")) {
    let amount = 0
    let description = "Pagamento"
    let planId: string | null = null

    if (callbackData.startsWith("pay_plan_")) {
      // Get plan info
      planId = callbackData.replace("pay_plan_", "")
      const { data: plan } = await supabase
        .from("payment_plans")
        .select("id, name, price")
        .eq("id", planId)
        .single()

      if (plan) {
        amount = plan.price
        description = plan.name
      }
    } else if (callbackData.startsWith("pay_custom_")) {
      // Parse custom amount: pay_custom_29.90_nodeId
      const parts = callbackData.replace("pay_custom_", "").split("_")
      amount = parseFloat(parts[0]) || 0
    }

    if (amount <= 0) {
      await sendTelegramMessage(botToken, chatId, "Erro ao processar pagamento. Tente novamente.")
      return
    }

    // Get user's gateway (Mercado Pago)
    // Primeiro tenta buscar gateway vinculado ao bot específico, depois fallback para qualquer gateway ativo
    let gateway = null
    
    // Tenta gateway específico do bot
    const { data: botGateway } = await supabase
      .from("user_gateways")
      .select("id, access_token, is_active, bot_id, gateway_name")
      .eq("user_id", bot.user_id)
      .eq("bot_id", bot.id)
      .eq("gateway_name", "mercadopago")
      .eq("is_active", true)
      .single()
    
    if (botGateway?.access_token) {
      gateway = botGateway
    } else {
      // Fallback: busca qualquer gateway ativo do usuario
      const { data: anyGateway } = await supabase
        .from("user_gateways")
        .select("id, access_token, is_active, bot_id, gateway_name")
        .eq("user_id", bot.user_id)
        .eq("gateway_name", "mercadopago")
        .eq("is_active", true)
        .limit(1)
        .single()
      
      gateway = anyGateway
    }

    if (!gateway?.access_token) {
      await sendTelegramMessage(botToken, chatId, "Gateway de pagamento nao configurado. Entre em contato com o suporte.")
      return
    }

    // Generate PIX via Mercado Pago
    try {
      await sendTelegramMessage(botToken, chatId, "Gerando seu pagamento PIX... Aguarde.")

      const mpResponse = await fetch("https://api.mercadopago.com/v1/payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${gateway.access_token}`,
          "X-Idempotency-Key": `${telegramUserId}-${Date.now()}`,
        },
        body: JSON.stringify({
          transaction_amount: amount,
          description: description,
          payment_method_id: "pix",
          payer: {
            email: `telegram_${telegramUserId}@temp.com`,
          },
        }),
      })

      const mpData = await mpResponse.json()

      if (mpData.id && mpData.point_of_interaction?.transaction_data) {
        const pixData = mpData.point_of_interaction.transaction_data
        const qrCodeBase64 = pixData.qr_code_base64
        const pixCopyPaste = pixData.qr_code

        // Save payment to database
        await supabase.from("payments").insert({
          user_id: bot.user_id,
          bot_id: bot.id,
          telegram_user_id: String(telegramUserId),
          gateway: "mercadopago",
          external_payment_id: String(mpData.id),
          amount: amount,
          description: description,
          qr_code: qrCodeBase64 || null,
          copy_paste: pixCopyPaste || null,
          status: "pending",
        })

        // Send QR Code image
        if (qrCodeBase64) {
          const photoUrl = `data:image/png;base64,${qrCodeBase64}`
          await sendTelegramPhoto(botToken, chatId, photoUrl, "", undefined)
        }

        // Send PIX copy-paste
        const pixMessage = `<b>PIX Copia e Cola:</b>\n\n<code>${pixCopyPaste}</code>\n\n<b>Valor:</b> R$ ${amount.toFixed(2).replace(".", ",")}\n<b>Descricao:</b> ${description}\n\nCopie o codigo acima e pague no seu banco.`
        await sendTelegramMessage(botToken, chatId, pixMessage)

        // Update funnel step
        await updateFunnelStep(bot.id, telegramUserId, 4)

        // Continue flow after payment generated
        const { data: state } = await supabase
          .from("user_flow_state")
          .select("flow_id, current_node_position")
          .eq("bot_id", bot.id)
          .eq("telegram_user_id", telegramUserId)
          .eq("status", "waiting_payment")
          .single()

        if (state) {
          const nodes = await fetchNodes(state.flow_id)
          const nextPos = state.current_node_position + 1
          await setFlowState(bot.id, state.flow_id, telegramUserId, chatId, nextPos, "in_progress")
          await executeNodes(botToken, chatId, nodes, nextPos, bot.id, state.flow_id, telegramUserId)
        }
      } else {
        console.error("[v0] Mercado Pago error:", mpData)
        await sendTelegramMessage(botToken, chatId, "Erro ao gerar PIX. Tente novamente mais tarde.")
      }
    } catch (error) {
      console.error("[v0] Payment generation error:", error)
      await sendTelegramMessage(botToken, chatId, "Erro ao processar pagamento. Tente novamente.")
    }
  }
}

// ---------------------------------------------------------------------------
// GET – health check
// ---------------------------------------------------------------------------

export async function GET() {
  return NextResponse.json({ status: "Telegram webhook is active" })
}

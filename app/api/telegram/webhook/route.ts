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

  try {
    let result: { ok?: boolean; description?: string } = { ok: false }

    if (mediaType === "photo" && mediaUrl) {
      result = await sendTelegramPhoto(botToken, chatId, mediaUrl, displayText, inlineKeyboard)
    } else if (mediaType === "video" && mediaUrl) {
      result = await sendTelegramVideo(botToken, chatId, mediaUrl, displayText, inlineKeyboard)
    } else {
      result = await sendTelegramMessage(botToken, chatId, displayText, inlineKeyboard)
    }

    // Fallback: if media failed, send text only
    if (!result.ok && mediaUrl) {
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
      await supabase
        .from("user_flow_state")
        .update({ status: "completed", updated_at: new Date().toISOString() })
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
  const { data: allFlows } = await supabase
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
  if (!activeState || activeState.status === "completed" || activeState.status === "in_progress") {
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
        const amount = (node.config?.amount as string) || "0"
        const description = (node.config?.description as string) || "Pagamento"
        await sendTelegramMessage(botToken, chatId, `${description}\nValor: R$ ${amount}`)
        await updateFunnelStep(botId, telegramUserId, 3)
        break
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

  // All nodes executed – mark flow as completed
  if (remaining.length > 0) {
    const lastNode = remaining[remaining.length - 1]
    await setFlowState(botId, flowId, telegramUserId, chatId, lastNode.position, "completed")
  }
}

// ---------------------------------------------------------------------------
// GET – health check
// ---------------------------------------------------------------------------

export async function GET() {
  return NextResponse.json({ status: "Telegram webhook is active" })
}

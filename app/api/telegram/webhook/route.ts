import { NextRequest, NextResponse } from "next/server"
import { after } from "next/server"
import { getSupabase } from "@/lib/supabase"

interface InlineButton {
  text: string
  url: string
}

function buildInlineKeyboard(buttons: InlineButton[]) {
  if (!buttons || buttons.length === 0) return undefined
  // Each button goes on its own row for better mobile display
  const keyboard = buttons.map((btn) => [{ text: btn.text, url: btn.url }])
  return { inline_keyboard: keyboard }
}

async function sendTelegramMessage(botToken: string, chatId: number, text: string, replyMarkup?: object) {
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

async function sendTelegramPhoto(botToken: string, chatId: number, photoUrl: string, caption: string, replyMarkup?: object) {
  const url = `https://api.telegram.org/bot${botToken}/sendPhoto`
  
  // If it's a base64 data URL, send as multipart/form-data with file upload
  if (photoUrl.startsWith("data:")) {
    const formData = new FormData()
    formData.append("chat_id", String(chatId))
    if (caption) formData.append("caption", caption)
    formData.append("parse_mode", "HTML")
    if (replyMarkup) formData.append("reply_markup", JSON.stringify(replyMarkup))

    // Convert base64 data URL to Blob
    const base64Match = photoUrl.match(/^data:([^;]+);base64,(.+)$/)
    if (base64Match) {
      const mimeType = base64Match[1]
      const base64Data = base64Match[2]
      const binaryStr = atob(base64Data)
      const bytes = new Uint8Array(binaryStr.length)
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: mimeType })
      formData.append("photo", blob, "photo.jpg")
    }

    const res = await fetch(url, { method: "POST", body: formData })
    return res.json()
  }

  // Regular URL
  const body: Record<string, unknown> = { chat_id: chatId, photo: photoUrl, caption, parse_mode: "HTML" }
  if (replyMarkup) body.reply_markup = replyMarkup
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return res.json()
}

async function sendTelegramVideo(botToken: string, chatId: number, videoUrl: string, caption: string, replyMarkup?: object) {
  const url = `https://api.telegram.org/bot${botToken}/sendVideo`

  // If it's a base64 data URL, send as multipart/form-data with file upload
  if (videoUrl.startsWith("data:")) {
    const formData = new FormData()
    formData.append("chat_id", String(chatId))
    if (caption) formData.append("caption", caption)
    formData.append("parse_mode", "HTML")
    if (replyMarkup) formData.append("reply_markup", JSON.stringify(replyMarkup))

    // Convert base64 data URL to Blob
    const base64Match = videoUrl.match(/^data:([^;]+);base64,(.+)$/)
    if (base64Match) {
      const mimeType = base64Match[1]
      const base64Data = base64Match[2]
      const binaryStr = atob(base64Data)
      const bytes = new Uint8Array(binaryStr.length)
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: mimeType })
      formData.append("video", blob, "video.mp4")
    }

    const res = await fetch(url, { method: "POST", body: formData })
    return res.json()
  }

  // Regular URL
  const body: Record<string, unknown> = { chat_id: chatId, video: videoUrl, caption, parse_mode: "HTML" }
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

// Check if flow is currently being executed (database-based lock via status + timestamp)
// If status is "in_progress" and updated_at is less than 60 seconds ago, consider it locked
function isFlowLocked(state: { status: string; updated_at: string } | null): boolean {
  if (!state) return false
  if (state.status !== "in_progress") return false
  const updatedAt = new Date(state.updated_at).getTime()
  const now = Date.now()
  // If updated less than 60 seconds ago, it's still running
  return now - updatedAt < 60_000
}

export async function POST(req: NextRequest) {
  console.log("[v0] WEBHOOK POST RECEIVED")
  
  // Parse everything we need BEFORE returning the response
  const supabase = getSupabase()

  const { searchParams } = new URL(req.url)
  const botToken = searchParams.get("token")
  console.log("[v0] Bot token present:", !!botToken)
  
  if (!botToken) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 })
  }

  const update = await req.json()
  console.log("[v0] Update received:", JSON.stringify(update).slice(0, 500))
  
  const updateId = update?.update_id
  const message = update?.message
  if (!message) {
    console.log("[v0] No message in update, returning early")
    return NextResponse.json({ ok: true })
  }

  const chatId = message.chat.id
  const telegramUserId = message.from?.id || chatId
  const messageText = (message.text || "").trim()
  const isStart = messageText === "/start" || messageText.startsWith("/start ")
  const fromData = message.from || {}
  
  console.log("[v0] Processing message:", { chatId, telegramUserId, messageText, isStart })

  // Process webhook SYNCHRONOUSLY instead of using after() to ensure it runs
  try {
    await processWebhook({
      supabase,
      botToken,
      updateId,
      chatId,
      telegramUserId,
      messageText,
      isStart,
      fromData,
    })
    console.log("[v0] processWebhook completed successfully")
  } catch (err) {
    console.error("[v0] webhook processing error:", err)
  }

  // Return 200 so Telegram does NOT retry
  return NextResponse.json({ ok: true })
}

async function processWebhook({
  supabase,
  botToken,
  updateId,
  chatId,
  telegramUserId,
  messageText,
  isStart,
  fromData,
}: {
  supabase: ReturnType<typeof getSupabase>
  botToken: string
  updateId: number | undefined
  chatId: number
  telegramUserId: number
  messageText: string
  isStart: boolean
  fromData: Record<string, string>
}) {
  console.log("[v0] processWebhook started", { chatId, messageText, isStart, telegramUserId })
  
  // 1. Database-based deduplication using update_id
  // We store processed update_ids in user_flow_state metadata or check via a simple approach:
  // For /start commands, we use the flow state lock. For other messages, we check state status.

  // 2. Buscar bot pelo token
  const { data: bots, error: botError } = await supabase
    .from("bots")
    .select("id, token, status")
    .eq("token", botToken)

  console.log("[v0] Bot query result", { bots, botError })

  if (botError) {
    console.log("[v0] Bot error, returning early")
    return
  }

  const bot = bots?.[0]
  if (!bot || bot.status !== "active") {
    console.log("[v0] Bot not found or not active", { bot })
    return
  }

  // 3. Salvar/atualizar o usuario
  const { data: existingUsers } = await supabase
    .from("bot_users")
    .select("id")
    .eq("bot_id", bot.id)
    .eq("telegram_user_id", telegramUserId)

  if (existingUsers && existingUsers.length > 0) {
    await supabase
      .from("bot_users")
      .update({
        first_name: fromData.first_name || null,
        last_name: fromData.last_name || null,
        username: fromData.username || null,
        last_activity: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("bot_id", bot.id)
      .eq("telegram_user_id", telegramUserId)
  } else {
    await supabase
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
  }

  // 4. Buscar fluxo ativo (o primeiro/mais antigo com status ativo)
  const { data: allFlows, error: flowsError } = await supabase
    .from("flows")
    .select("id, name, category, status")
    .eq("bot_id", bot.id)
    .eq("status", "ativo")
    .order("created_at", { ascending: true })

  console.log("[v0] Flows query result", { allFlows, flowsError, botId: bot.id })

  if (flowsError) {
    console.log("[v0] Flows query error", flowsError)
    return
  }

  if (!allFlows || allFlows.length === 0) {
    console.log("[v0] No active flows found, returning early")
    return
  }

  // Usar o primeiro fluxo ativo (mais antigo)
  const primaryFlow = allFlows[0]
  console.log("[v0] Primary flow selected", { primaryFlow })

  // 5. Buscar estado ATUAL do usuario (pode estar em qualquer fluxo)
  const { data: allStates } = await supabase
    .from("user_flow_state")
    .select("*")
    .eq("bot_id", bot.id)
    .eq("telegram_user_id", telegramUserId)
    .order("updated_at", { ascending: false })

  // Encontrar estado ativo (in_progress ou waiting_response)
  const activeState = allStates?.find((s) => s.status === "in_progress" || s.status === "waiting_response") || null
  const currentFlowId = activeState?.flow_id || primaryFlow.id

  // 6. Buscar nodes do fluxo atual
  const { data: nodes, error: nodesError } = await supabase
    .from("flow_nodes")
    .select("id, type, label, config, position")
    .eq("flow_id", currentFlowId)
    .order("position", { ascending: true })

  console.log("[v0] Nodes query result", { nodes, nodesError, currentFlowId, nodeCount: nodes?.length })

  if (!nodes || nodes.length === 0) {
    console.log("[v0] No nodes found for flow, returning early")
    return
  }

  // 7. Se /start => resetar TODOS os estados e executar fluxo principal do zero
  if (isStart) {
    console.log("[v0] Processing /start command", { activeState, isLocked: isFlowLocked(activeState) })
    if (isFlowLocked(activeState)) {
      console.log("[v0] Flow is locked, returning early")
      return
    }

    // Resetar todos os estados deste usuario neste bot
    if (allStates && allStates.length > 0) {
      for (const state of allStates) {
        await supabase
          .from("user_flow_state")
          .update({
            status: "completed",
            updated_at: new Date().toISOString(),
          })
          .eq("id", state.id)
      }
    }

    // Buscar nodes do fluxo principal (pode ser diferente do currentFlowId)
    let primaryNodes = nodes
    if (currentFlowId !== primaryFlow.id) {
      const { data: pNodes } = await supabase
        .from("flow_nodes")
        .select("id, type, label, config, position")
        .eq("flow_id", primaryFlow.id)
        .order("position", { ascending: true })
      primaryNodes = pNodes || []
    }

    if (primaryNodes.length === 0) {
      console.log("[v0] Primary nodes empty, returning early")
      return
    }

    console.log("[v0] About to execute nodes", { primaryNodesCount: primaryNodes.length, primaryNodes: primaryNodes.map(n => ({ id: n.id, type: n.type, position: n.position })) })

    // Criar/atualizar estado no fluxo principal
    const existingPrimaryState = allStates?.find((s) => s.flow_id === primaryFlow.id)
    if (existingPrimaryState) {
      await supabase
        .from("user_flow_state")
        .update({
          current_node_position: 0,
          status: "in_progress",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingPrimaryState.id)
    } else {
      await supabase.from("user_flow_state").insert({
        bot_id: bot.id,
        flow_id: primaryFlow.id,
        telegram_user_id: telegramUserId,
        chat_id: chatId,
        current_node_position: 0,
        status: "in_progress",
      })
    }

    await executeNodes(botToken, chatId, primaryNodes, 0, bot.id, primaryFlow.id, telegramUserId)
    return
  }

  // 8. Se NAO e /start - processar no fluxo ativo
  if (!activeState || activeState.status === "completed") {
    return
  }

  if (activeState.status === "in_progress") {
    return
  }

  if (activeState.status === "waiting_response") {
    if (isFlowLocked(activeState)) {
      return
    }

    await supabase
      .from("user_flow_state")
      .update({
        status: "in_progress",
        updated_at: new Date().toISOString(),
      })
      .eq("id", activeState.id)

    const nextPos = activeState.current_node_position + 1
    await executeNodes(botToken, chatId, nodes, nextPos, bot.id, currentFlowId, telegramUserId)
  }
}

// Executa nodes a partir de uma posicao
async function executeNodes(
  botToken: string,
  chatId: number,
  nodes: Array<{ id: string; type: string; label: string; config: Record<string, unknown>; position: number }>,
  startPosition: number,
  botId: string,
  flowId: string,
  telegramUserId: number
) {
  console.log("[v0] executeNodes called", { startPosition, nodesCount: nodes.length, flowId })
  const supabase = getSupabase()
  const remainingNodes = nodes.filter((n) => n.position >= startPosition)
  console.log("[v0] Remaining nodes to execute", { count: remainingNodes.length, nodes: remainingNodes.map(n => ({ type: n.type, position: n.position })) })

  for (const node of remainingNodes) {
    console.log("[v0] Executing node", { type: node.type, position: node.position, label: node.label })
    // Update current position and keep refreshing the lock timestamp
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
      case "trigger":
        break

      case "message": {
        const text = (node.config?.text as string) || node.label || "Mensagem"
        const mediaType = (node.config?.media_type as string) || ""
        const mediaUrl = (node.config?.media_url as string) || ""
        const buttonsStr = (node.config?.buttons as string) || ""

        // Parse inline keyboard buttons
        let inlineKeyboard: object | undefined
        if (buttonsStr) {
          try {
            const buttons = JSON.parse(buttonsStr) as InlineButton[]
            inlineKeyboard = buildInlineKeyboard(buttons)
          } catch {
            // Ignore parse errors
          }
        }

        try {
          let sendResult: { ok?: boolean; description?: string } = { ok: false }

          // Send with media or text only
          if (mediaType === "photo" && mediaUrl) {
            sendResult = await sendTelegramPhoto(botToken, chatId, mediaUrl, text, inlineKeyboard)
          } else if (mediaType === "video" && mediaUrl) {
            sendResult = await sendTelegramVideo(botToken, chatId, mediaUrl, text, inlineKeyboard)
          } else {
            sendResult = await sendTelegramMessage(botToken, chatId, text, inlineKeyboard)
          }

          // If media send failed, fallback to text-only with buttons
          if (!sendResult.ok && mediaUrl) {
            console.error("Media send failed, falling back to text:", sendResult.description)
            await sendTelegramMessage(botToken, chatId, text, inlineKeyboard)
          }
        } catch (err) {
          // If sending fails entirely, try text-only as last resort
          console.error("Message send error, trying text fallback:", err)
          try {
            await sendTelegramMessage(botToken, chatId, text, inlineKeyboard)
          } catch (fallbackErr) {
            console.error("Even text fallback failed:", fallbackErr)
          }
        }

        await updateFunnelStep(botId, telegramUserId, 2)
        break
      }

      case "delay": {
        const seconds = Math.min(parseInt((node.config?.seconds as string) || "5", 10), 55)
        await sleep(seconds * 1000)
        // Refresh lock after delay so it doesn't expire
        await supabase
          .from("user_flow_state")
          .update({ updated_at: new Date().toISOString() })
          .eq("bot_id", botId)
          .eq("flow_id", flowId)
          .eq("telegram_user_id", telegramUserId)
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
          await sendTelegramMessage(botToken, chatId, node.config.text as string)
        }
        return // Para aqui e espera resposta
      }

      case "payment": {
        try {
          const amount = (node.config?.amount as string) || "0"
          const description = (node.config?.description as string) || "Pagamento"
          await sendTelegramMessage(botToken, chatId, `${description}\nValor: R$ ${amount}`)
          await updateFunnelStep(botId, telegramUserId, 3)
        } catch (err) {
          console.error("Payment node error:", err)
        }
        break
      }

      case "action": {
        try {
          const actionText = (node.config?.text as string) || (node.config?.action_name as string) || node.label
          await sendTelegramMessage(botToken, chatId, `${actionText}`)
          await updateFunnelStep(botId, telegramUserId, 4)
        } catch (err) {
          console.error("Action node error:", err)
        }
        break
      }

      case "redirect": {
        const subVariant = (node.config?.subVariant as string) || ""
        const targetFlowId = (node.config?.target_flow_id as string) || ""

        if (subVariant === "end") {
          // Encerrar conversa - marcar como completed e parar
          await supabase
            .from("user_flow_state")
            .update({
              current_node_position: node.position,
              status: "completed",
              updated_at: new Date().toISOString(),
            })
            .eq("bot_id", botId)
            .eq("flow_id", flowId)
            .eq("telegram_user_id", telegramUserId)
          return // Para aqui
        }

        if (subVariant === "restart") {
          // Recomecar o mesmo fluxo do zero
          await supabase
            .from("user_flow_state")
            .update({
              current_node_position: 0,
              status: "in_progress",
              updated_at: new Date().toISOString(),
            })
            .eq("bot_id", botId)
            .eq("flow_id", flowId)
            .eq("telegram_user_id", telegramUserId)

          // Recarregar todos os nodes e executar do inicio
          const { data: restartNodes } = await supabase
            .from("flow_nodes")
            .select("id, type, label, config, position")
            .eq("flow_id", flowId)
            .order("position", { ascending: true })

          if (restartNodes && restartNodes.length > 0) {
            await executeNodes(botToken, chatId, restartNodes, 0, botId, flowId, telegramUserId)
          }
          return
        }

        // Redirecionar para outro fluxo (goto_flow)
        if (targetFlowId) {
          // Marcar fluxo atual como completed
          await supabase
            .from("user_flow_state")
            .update({
              current_node_position: node.position,
              status: "completed",
              updated_at: new Date().toISOString(),
            })
            .eq("bot_id", botId)
            .eq("flow_id", flowId)
            .eq("telegram_user_id", telegramUserId)

          // Buscar nodes do fluxo destino
          const { data: targetNodes } = await supabase
            .from("flow_nodes")
            .select("id, type, label, config, position")
            .eq("flow_id", targetFlowId)
            .order("position", { ascending: true })

          if (!targetNodes || targetNodes.length === 0) break

          // Criar/atualizar estado no fluxo destino
          const { data: targetStates } = await supabase
            .from("user_flow_state")
            .select("id")
            .eq("bot_id", botId)
            .eq("flow_id", targetFlowId)
            .eq("telegram_user_id", telegramUserId)

          if (targetStates && targetStates.length > 0) {
            await supabase
              .from("user_flow_state")
              .update({
                current_node_position: 0,
                status: "in_progress",
                updated_at: new Date().toISOString(),
              })
              .eq("id", targetStates[0].id)
          } else {
            await supabase.from("user_flow_state").insert({
              bot_id: botId,
              flow_id: targetFlowId,
              telegram_user_id: telegramUserId,
              chat_id: chatId,
              current_node_position: 0,
              status: "in_progress",
            })
          }

          // Executar fluxo destino
          await executeNodes(botToken, chatId, targetNodes, 0, botId, targetFlowId, telegramUserId)
          return // Para execucao do fluxo atual
        }
        break
      }
    }
  }

  // Fluxo concluido - marcar como completed
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
  }
}

export async function GET() {
  return NextResponse.json({ status: "Telegram webhook is active" })
}

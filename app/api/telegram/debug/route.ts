import { NextRequest, NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

// Debug endpoint para verificar configuracao do bot
// GET /api/telegram/debug?token=BOT_TOKEN
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")
  
  if (!token) {
    return NextResponse.json({ error: "Token nao fornecido. Use ?token=SEU_TOKEN_DO_BOT" }, { status: 400 })
  }
  
  const supabase = getSupabase()
  const results: Record<string, unknown> = {}
  
  // 1. Verificar se o bot existe
  const { data: bots, error: botError } = await supabase
    .from("bots")
    .select("id, name, token, status, created_at")
    .eq("token", token)
  
  if (botError) {
    results.botError = botError.message
  }
  
  const bot = bots?.[0]
  results.bot = bot ? {
    id: bot.id,
    name: bot.name,
    status: bot.status,
    isActive: bot.status === "active",
  } : null
  
  if (!bot) {
    return NextResponse.json({
      success: false,
      message: "Bot nao encontrado com esse token",
      results
    })
  }
  
  // 2. Verificar fluxos ativos
  const { data: flows, error: flowsError } = await supabase
    .from("flows")
    .select("id, name, status, created_at")
    .eq("bot_id", bot.id)
    .order("created_at", { ascending: true })
  
  if (flowsError) {
    results.flowsError = flowsError.message
  }
  
  const activeFlows = flows?.filter(f => f.status === "ativo") || []
  const primaryFlow = activeFlows[0] // Primeiro fluxo ativo (mais antigo)
  
  results.flows = {
    total: flows?.length || 0,
    active: activeFlows.length,
    primaryFlow: primaryFlow ? {
      id: primaryFlow.id,
      name: primaryFlow.name,
    } : null,
    allFlows: flows?.map(f => ({
      id: f.id,
      name: f.name,
      status: f.status,
    }))
  }
  
  // 3. Verificar nodes do fluxo principal
  if (primaryFlow) {
    const { data: nodes, error: nodesError } = await supabase
      .from("flow_nodes")
      .select("id, type, label, position, config")
      .eq("flow_id", primaryFlow.id)
      .order("position", { ascending: true })
    
    if (nodesError) {
      results.nodesError = nodesError.message
    }
    
    results.nodes = {
      total: nodes?.length || 0,
      list: nodes?.map(n => ({
        id: n.id,
        type: n.type,
        label: n.label,
        position: n.position,
        hasConfig: !!n.config && Object.keys(n.config as object).length > 0
      }))
    }
  }
  
  // 4. Verificar webhook no Telegram
  try {
    const webhookInfoRes = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`)
    const webhookInfo = await webhookInfoRes.json()
    results.telegramWebhook = webhookInfo.result ? {
      url: webhookInfo.result.url,
      hasUrl: !!webhookInfo.result.url,
      pendingUpdates: webhookInfo.result.pending_update_count,
      lastError: webhookInfo.result.last_error_message,
      lastErrorDate: webhookInfo.result.last_error_date
    } : webhookInfo
  } catch (e) {
    results.telegramWebhookError = e instanceof Error ? e.message : String(e)
  }
  
  // 5. Determinar problemas
  const problems: string[] = []
  
  if (bot.status !== "active") {
    problems.push("Bot nao esta ativo. Ative o bot na interface.")
  }
  
  if (activeFlows.length === 0) {
    problems.push("Nenhum fluxo ativo encontrado. Defina o status do fluxo como 'Ativo'.")
  }
  
  if (primaryFlow && results.nodes && (results.nodes as { total: number }).total === 0) {
    problems.push("Fluxo principal nao tem nodes. Adicione mensagens ao fluxo.")
  }
  
  const webhook = results.telegramWebhook as { hasUrl?: boolean; url?: string; lastError?: string } | undefined
  if (webhook && !webhook.hasUrl) {
    problems.push("Webhook nao configurado no Telegram. Desative e reative o bot.")
  }
  
  if (webhook && webhook.lastError) {
    problems.push(`Erro do Telegram: ${webhook.lastError}`)
  }
  
  return NextResponse.json({
    success: problems.length === 0,
    problems,
    results
  })
}

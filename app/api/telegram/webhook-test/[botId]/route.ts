import { NextRequest, NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ botId: string }> }
) {
  const { botId } = await params
  
  const result: Record<string, unknown> = {
    botId,
    timestamp: new Date().toISOString(),
    env: {
      BASE_URL: process.env.BASE_URL || "NAO CONFIGURADA",
    }
  }

  try {
    const supabase = getSupabase()

    // 1. Buscar bot
    const { data: bot, error: botError } = await supabase
      .from("bots")
      .select("*")
      .eq("id", botId)
      .single()

    result.bot = bot ? { id: bot.id, name: bot.name, hasToken: !!bot.token } : null
    result.botError = botError?.message || null

    if (!bot?.token) {
      return NextResponse.json({ ...result, error: "Bot nao encontrado ou sem token" })
    }

    // 2. Verificar webhook no Telegram
    const webhookRes = await fetch(`https://api.telegram.org/bot${bot.token}/getWebhookInfo`)
    const webhookInfo = await webhookRes.json()
    result.telegramWebhook = webhookInfo.result

    // 3. Buscar fluxos do bot
    const { data: flows, error: flowsError } = await supabase
      .from("flows")
      .select("id, name, status, is_primary, category, bot_id, created_at")
      .eq("bot_id", botId)

    result.flows = flows
    result.flowsError = flowsError?.message || null
    result.flowsCount = flows?.length || 0

    // 4. Se tem fluxo, buscar nodes
    if (flows && flows.length > 0) {
      const primaryFlow = flows.find(f => f.is_primary) || flows[0]
      const { data: nodes, error: nodesError } = await supabase
        .from("flow_nodes")
        .select("id, type, label, position, config")
        .eq("flow_id", primaryFlow.id)
        .order("position", { ascending: true })

      result.primaryFlow = primaryFlow
      result.nodes = nodes
      result.nodesError = nodesError?.message || null
      result.nodesCount = nodes?.length || 0
    }

    // 5. Verificar flow_bots
    const { data: flowBots } = await supabase
      .from("flow_bots")
      .select("*")
      .eq("bot_id", botId)

    result.flowBots = flowBots
    result.flowBotsCount = flowBots?.length || 0

    return NextResponse.json(result)
  } catch (error) {
    result.error = error instanceof Error ? error.message : "Erro desconhecido"
    return NextResponse.json(result, { status: 500 })
  }
}

import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  // Pega o usuario logado
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  const debugInfo: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    user: user ? { id: user.id, email: user.email } : null,
    userError: userError?.message || null,
  }

  if (!user) {
    return NextResponse.json({
      ...debugInfo,
      error: "Usuario nao logado"
    })
  }

  // Busca TODOS os gateways do usuario
  const { data: allGateways, error: gatewaysError } = await supabase
    .from("user_gateways")
    .select("*")
    .eq("user_id", user.id)

  debugInfo.allGateways = allGateways
  debugInfo.gatewaysError = gatewaysError?.message || null
  debugInfo.gatewaysCount = allGateways?.length || 0

  // Busca gateway mercadopago ativo especificamente
  const { data: mpGateway, error: mpError } = await supabase
    .from("user_gateways")
    .select("*")
    .eq("user_id", user.id)
    .eq("gateway_name", "mercadopago")
    .eq("is_active", true)
    .single()

  debugInfo.mercadoPagoGateway = mpGateway ? {
    id: mpGateway.id,
    gateway_name: mpGateway.gateway_name,
    is_active: mpGateway.is_active,
    bot_id: mpGateway.bot_id,
    has_access_token: !!mpGateway.access_token,
    access_token_preview: mpGateway.access_token ? mpGateway.access_token.substring(0, 20) + "..." : null,
    created_at: mpGateway.created_at,
  } : null
  debugInfo.mpError = mpError?.message || null

  // Busca os bots do usuario
  const { data: bots, error: botsError } = await supabase
    .from("bots")
    .select("id, name, user_id")
    .eq("user_id", user.id)

  debugInfo.bots = bots
  debugInfo.botsError = botsError?.message || null

  // Verifica estrutura da tabela user_gateways
  const { data: tableInfo, error: tableError } = await supabase
    .from("user_gateways")
    .select("*")
    .limit(0)

  debugInfo.tableError = tableError?.message || null

  return NextResponse.json(debugInfo, { status: 200 })
}

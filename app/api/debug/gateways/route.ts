import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function GET() {
  const debugInfo: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
  }

  // Busca TODOS os gateways do banco (sem filtro de user para debug)
  const { data: allGateways, error: gatewaysError } = await supabase
    .from("user_gateways")
    .select("*")

  debugInfo.allGateways = allGateways?.map(g => ({
    id: g.id,
    user_id: g.user_id,
    bot_id: g.bot_id,
    gateway_name: g.gateway_name,
    is_active: g.is_active,
    has_access_token: !!g.access_token,
    access_token_preview: g.access_token ? g.access_token.substring(0, 30) + "..." : null,
    created_at: g.created_at,
  }))
  debugInfo.gatewaysError = gatewaysError?.message || null
  debugInfo.gatewaysCount = allGateways?.length || 0

  // Busca todos os bots
  const { data: bots, error: botsError } = await supabase
    .from("bots")
    .select("id, name, user_id, token")

  debugInfo.bots = bots?.map(b => ({
    id: b.id,
    name: b.name,
    user_id: b.user_id,
    has_token: !!b.token,
  }))
  debugInfo.botsError = botsError?.message || null

  // Busca todos os usuarios
  const { data: users, error: usersError } = await supabase
    .from("users")
    .select("id, email")

  debugInfo.users = users
  debugInfo.usersError = usersError?.message || null

  return NextResponse.json(debugInfo, { status: 200 })
}

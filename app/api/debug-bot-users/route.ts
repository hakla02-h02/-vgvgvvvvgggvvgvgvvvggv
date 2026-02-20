import { NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

export async function GET() {
  const supabase = getSupabase()
  const results: Record<string, unknown> = {}

  // 1. Ler todos os bots
  const { data: botsData, error: botsErr } = await supabase
    .from("bots")
    .select("id, name, token, status")
  results.bots = { count: botsData?.length || 0, data: botsData, error: botsErr?.message || null }

  // 2. Ler bot_users
  const { data: usersData, error: usersErr } = await supabase
    .from("bot_users")
    .select("*")
    .order("created_at", { ascending: false })
  results.bot_users = { count: usersData?.length || 0, data: usersData, error: usersErr?.message || null }

  // 3. Ler user_flow_state
  const { data: stateData, error: stateErr } = await supabase
    .from("user_flow_state")
    .select("*")
    .order("created_at", { ascending: false })
  results.user_flow_state = { count: stateData?.length || 0, data: stateData, error: stateErr?.message || null }

  // 4. Limpar qualquer RLS_TEST que ficou pra tras
  await supabase.from("bot_users").delete().eq("telegram_user_id", 99999999)

  // 5. Encontrar usuarios faltantes e INSERIR automaticamente
  const synced: string[] = []
  const syncErrors: string[] = []

  if (stateData && usersData) {
    const userKeys = new Set(usersData.map((u) => `${u.bot_id}_${u.telegram_user_id}`))
    const missing = stateData.filter((s) => !userKeys.has(`${s.bot_id}_${s.telegram_user_id}`))

    // Deduplica por bot_id + telegram_user_id
    const uniqueMissing = new Map<string, typeof stateData[0]>()
    for (const m of missing) {
      const key = `${m.bot_id}_${m.telegram_user_id}`
      if (!uniqueMissing.has(key)) uniqueMissing.set(key, m)
    }

    for (const [, m] of uniqueMissing) {
      const { error: insErr } = await supabase
        .from("bot_users")
        .insert({
          bot_id: m.bot_id,
          telegram_user_id: m.telegram_user_id,
          chat_id: m.chat_id,
          first_name: null,
          last_name: null,
          username: null,
          funnel_step: 1,
          is_subscriber: false,
          last_activity: m.created_at,
        })

      if (insErr) {
        syncErrors.push(`${m.telegram_user_id}: ${insErr.message}`)
      } else {
        synced.push(`${m.telegram_user_id}`)
      }
    }

    results.sync = {
      missing_count: uniqueMissing.size,
      synced,
      errors: syncErrors,
    }
  }

  // 6. Re-ler bot_users apos sync
  const { data: finalUsers } = await supabase
    .from("bot_users")
    .select("id, bot_id, telegram_user_id, first_name, username, funnel_step, created_at")
    .order("created_at", { ascending: false })
  results.bot_users_after_sync = { count: finalUsers?.length || 0, data: finalUsers }

  return NextResponse.json(results, { status: 200 })
}

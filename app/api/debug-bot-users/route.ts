import { NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

export async function GET() {
  const supabase = getSupabase()
  const results: Record<string, unknown> = {}

  // 1. Tentar ler bot_users
  const { data: readData, error: readErr } = await supabase
    .from("bot_users")
    .select("*")
  results.read_bot_users = { data: readData, error: readErr }

  // 2. Tentar inserir um teste
  const { data: insertData, error: insertErr } = await supabase
    .from("bot_users")
    .insert({
      bot_id: "0f0d1c8a-cb21-4bd3-a0d5-e5399" + "INVALID", // vai falhar, mas mostra o erro
      telegram_user_id: 99999999,
      chat_id: 99999999,
      first_name: "TESTE",
      funnel_step: 1,
      is_subscriber: false,
    })
    .select()
  results.insert_test = { data: insertData, error: insertErr }

  // 3. Ler user_flow_state para comparar
  const { data: stateData, error: stateErr } = await supabase
    .from("user_flow_state")
    .select("*")
  results.read_flow_state = { data: stateData, error: stateErr }

  // 4. Ler bots
  const { data: botsData, error: botsErr } = await supabase
    .from("bots")
    .select("id, name, status")
  results.read_bots = { data: botsData, error: botsErr }

  // 5. Tentar inserir com o bot_id REAL do user_flow_state
  if (stateData && stateData.length > 0) {
    const realBotId = stateData[0].bot_id
    const { data: realInsert, error: realInsErr } = await supabase
      .from("bot_users")
      .insert({
        bot_id: realBotId,
        telegram_user_id: 12345678,
        chat_id: 12345678,
        first_name: "TESTE_REAL",
        funnel_step: 1,
        is_subscriber: false,
      })
      .select()
    results.insert_real_test = { data: realInsert, error: realInsErr }
  }

  return NextResponse.json(results, { status: 200 })
}

import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET: Return referral stats for the current user
export async function GET() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 })
  }

  const { count, error } = await supabase
    .from("referrals")
    .select("*", { count: "exact", head: true })
    .eq("referrer_id", session.user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    total_referrals: count || 0,
    total_earnings: (count || 0) * 50, // R$ 50 per referral
  })
}

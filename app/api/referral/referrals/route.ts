import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET: Return list of referred users for the current user
export async function GET() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 })
  }

  // Get referrals with referred user info
  const { data: referrals, error } = await supabase
    .from("referrals")
    .select("id, coupon_code, created_at, referred_id")
    .eq("referrer_id", session.user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!referrals || referrals.length === 0) {
    return NextResponse.json({ referrals: [] })
  }

  // Get user details for each referred user
  const referredIds = referrals.map((r) => r.referred_id)
  const { data: users } = await supabase
    .from("users")
    .select("id, name, email, created_at")
    .in("id", referredIds)

  const usersMap = new Map(users?.map((u) => [u.id, u]) || [])

  const result = referrals.map((r) => {
    const user = usersMap.get(r.referred_id)
    return {
      id: r.id,
      name: user?.name || "Usuario",
      email: user?.email || "",
      created_at: r.created_at,
    }
  })

  return NextResponse.json({ referrals: result })
}

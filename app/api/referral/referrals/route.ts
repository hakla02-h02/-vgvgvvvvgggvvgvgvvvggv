import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const SUPABASE_URL = "https://dbtpnafcqfcllgoxdhxs.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRidHBuYWZjcWZjbGxnb3hkaHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0Nzg3MTQsImV4cCI6MjA4NzA1NDcxNH0.0MF5a1uAuxeHIVGNglWYbFHYRIECNVEVZN1MLH4Z26A"

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// GET: Return list of referred users for a user
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId")
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 })
  }

  try {
    const { data: referrals, error } = await supabase
      .from("referrals")
      .select("id, coupon_code, created_at, referred_id")
      .eq("referrer_id", userId)
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
  } catch (err) {
    console.error("[v0] Referrals GET error:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

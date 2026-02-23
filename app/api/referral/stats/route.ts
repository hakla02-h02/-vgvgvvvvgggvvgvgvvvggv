import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET: Return referral stats for a user
export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId")
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 })
  }

  try {
    const { count, error } = await supabase
      .from("referrals")
      .select("*", { count: "exact", head: true })
      .eq("referrer_id", userId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // R$0,10 por venda feita pelo indicado
    const totalSales = count || 0
    const earningsPerSale = 0.10

    return NextResponse.json({
      total_referrals: totalSales,
      total_earnings: Number((totalSales * earningsPerSale).toFixed(2)),
    })
  } catch (err) {
    console.error("[v0] Stats GET error:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const SUPABASE_URL = "https://dbtpnafcqfcllgoxdhxs.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRidHBuYWZjcWZjbGxnb3hkaHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0Nzg3MTQsImV4cCI6MjA4NzA1NDcxNH0.0MF5a1uAuxeHIVGNglWYbFHYRIECNVEVZN1MLH4Z26A"

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// POST: Track a referral after user registration
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { referredId, couponCode } = body

    if (!referredId || !couponCode) {
      return NextResponse.json(
        { error: "referredId and couponCode are required" },
        { status: 400 }
      )
    }

    const normalizedCode = couponCode.trim().toLowerCase()

    // Look up the coupon to find the referrer
    const { data: couponData, error: couponError } = await supabase
      .from("referral_coupons")
      .select("user_id, coupon_code")
      .eq("coupon_code", normalizedCode)
      .single()

    if (couponError || !couponData) {
      console.error("[v0] Coupon lookup error:", couponError)
      return NextResponse.json(
        { error: "Cupom nao encontrado" },
        { status: 404 }
      )
    }

    // Don't allow self-referral
    if (couponData.user_id === referredId) {
      return NextResponse.json(
        { error: "Auto-indicacao nao permitida" },
        { status: 400 }
      )
    }

    // Use the RPC function to insert the referral (bypasses RLS)
    const { error: rpcError } = await supabase.rpc("track_referral", {
      p_referrer_id: couponData.user_id,
      p_referred_id: referredId,
      p_coupon_code: couponData.coupon_code,
    })

    if (rpcError) {
      console.error("[v0] Track referral RPC error:", rpcError)
      // If it's a unique constraint violation, the referral already exists
      if (rpcError.code === "23505") {
        return NextResponse.json({ success: true, message: "Indicacao ja registrada" })
      }
      return NextResponse.json(
        { error: rpcError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[v0] Track referral error:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

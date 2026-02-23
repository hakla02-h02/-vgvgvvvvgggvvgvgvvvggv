import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// POST: Track a referral after user registration
// Uses the track_referral RPC function (SECURITY DEFINER) to bypass RLS
// so we don't need the user's access token
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

    // Use the SECURITY DEFINER RPC function to insert the referral
    // This bypasses RLS so we don't need the user's auth token
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

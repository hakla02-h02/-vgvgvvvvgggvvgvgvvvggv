import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const SUPABASE_URL = "https://dbtpnafcqfcllgoxdhxs.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRidHBuYWZjcWZjbGxnb3hkaHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0Nzg3MTQsImV4cCI6MjA4NzA1NDcxNH0.0MF5a1uAuxeHIVGNglWYbFHYRIECNVEVZN1MLH4Z26A"

// POST: Track a referral after user registration
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { referredId, couponCode, accessToken } = body

    if (!referredId || !couponCode || !accessToken) {
      return NextResponse.json(
        { error: "referredId, couponCode, and accessToken are required" },
        { status: 400 }
      )
    }

    const normalizedCode = couponCode.trim().toLowerCase()

    // Create an authenticated Supabase client using the user's access token
    // This ensures auth.uid() = referredId in RLS policies
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    })

    // Also create an anon client for the coupon lookup (public read policy exists)
    const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    // Look up the coupon to find the referrer
    const { data: couponData, error: couponError } = await supabaseAnon
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

    // Insert the referral using the authenticated client
    // RLS policy: auth.uid() = referred_id - this works because we pass the user's token
    const { error: insertError } = await supabaseAuth
      .from("referrals")
      .insert({
        referrer_id: couponData.user_id,
        referred_id: referredId,
        coupon_code: couponData.coupon_code,
      })

    if (insertError) {
      console.error("[v0] Insert referral error:", insertError)
      // If it's a unique constraint violation, the referral already exists
      if (insertError.code === "23505") {
        return NextResponse.json({ success: true, message: "Indicacao ja registrada" })
      }
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[v0] Track referral error:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

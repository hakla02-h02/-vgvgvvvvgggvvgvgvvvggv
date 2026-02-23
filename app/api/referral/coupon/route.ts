import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

// GET: Return the current user's coupon
export async function GET() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("referral_coupons")
    .select("coupon_code, created_at")
    .eq("user_id", session.user.id)
    .single()

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ coupon: data || null })
}

// POST: Create a new coupon for the user
export async function POST(req: Request) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 })
  }

  const body = await req.json()
  const couponCode = body.coupon_code?.trim()?.toLowerCase()

  if (!couponCode || couponCode.length < 3 || couponCode.length > 20) {
    return NextResponse.json(
      { error: "O cupom deve ter entre 3 e 20 caracteres" },
      { status: 400 }
    )
  }

  // Only allow alphanumeric and hyphens
  if (!/^[a-z0-9-]+$/.test(couponCode)) {
    return NextResponse.json(
      { error: "O cupom deve conter apenas letras, numeros e hifens" },
      { status: 400 }
    )
  }

  // Check if user already has a coupon
  const { data: existing } = await supabase
    .from("referral_coupons")
    .select("id")
    .eq("user_id", session.user.id)
    .single()

  if (existing) {
    return NextResponse.json(
      { error: "Voce ja possui um cupom" },
      { status: 400 }
    )
  }

  // Create the coupon
  const { data, error } = await supabase
    .from("referral_coupons")
    .insert({
      user_id: session.user.id,
      coupon_code: couponCode,
    })
    .select("coupon_code, created_at")
    .single()

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Este cupom ja esta em uso" },
        { status: 400 }
      )
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ coupon: data })
}

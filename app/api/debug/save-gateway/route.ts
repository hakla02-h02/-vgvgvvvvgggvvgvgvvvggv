import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { user_id, gateway_name, access_token } = body

    console.log("[v0] Tentando salvar gateway:", { user_id, gateway_name, has_token: !!access_token })

    // Tenta inserir diretamente
    const { data, error } = await supabase
      .from("user_gateways")
      .insert({
        user_id,
        bot_id: null,
        gateway_name,
        access_token,
        is_active: true,
      })
      .select()
      .single()

    console.log("[v0] Resultado do insert:", { data, error })

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        errorCode: error.code,
        errorDetails: error.details,
        errorHint: error.hint,
      })
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (err) {
    console.error("[v0] Erro inesperado:", err)
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : "Erro desconhecido",
    })
  }
}

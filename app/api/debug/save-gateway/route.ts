import { supabase } from "@/lib/supabase"
import { NextResponse } from "next/server"

// GET para teste facil pelo navegador
export async function GET() {
  const user_id = "467a4d1e-01a6-4fec-bc47-5788eba9ea64" // seu user_id
  const gateway_name = "mercadopago"
  const access_token = "TEST-TOKEN-DEBUG-123"

  console.log("[v0] Tentando salvar gateway via GET:", { user_id, gateway_name })

  // Primeiro verifica se tabela existe
  const { data: checkTable, error: tableError } = await supabase
    .from("user_gateways")
    .select("id")
    .limit(1)

  if (tableError) {
    return NextResponse.json({
      success: false,
      step: "verificar_tabela",
      error: tableError.message,
      errorCode: tableError.code,
      hint: tableError.hint,
    })
  }

  // Tenta inserir
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

  if (error) {
    return NextResponse.json({
      success: false,
      step: "inserir_gateway",
      error: error.message,
      errorCode: error.code,
      errorDetails: error.details,
      errorHint: error.hint,
    })
  }

  // Verifica se foi salvo
  const { data: verify, error: verifyError } = await supabase
    .from("user_gateways")
    .select("*")
    .eq("user_id", user_id)

  return NextResponse.json({
    success: true,
    inserted: data,
    allGatewaysForUser: verify,
    verifyError: verifyError?.message || null,
  })
}

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

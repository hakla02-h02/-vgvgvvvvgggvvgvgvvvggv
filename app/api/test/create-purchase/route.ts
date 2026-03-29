import { NextRequest, NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

// API de teste para simular uma compra com dados do usuario Telegram
export async function GET(request: NextRequest) {
  const supabase = getSupabase()
  const { searchParams } = request.nextUrl
  
  // Parametros do usuario Telegram
  const telegramUserId = searchParams.get("telegramUserId") || "5099610171"
  const username = searchParams.get("username") || "luismarques"
  const firstName = searchParams.get("firstName") || "Luis"
  const lastName = searchParams.get("lastName") || "Marques"
  
  // Parametros do pagamento
  const amount = Number(searchParams.get("amount") || "50")
  const planName = searchParams.get("planName") || "Plano Teste"
  
  try {
    // Buscar um bot e seu user_id
    const { data: bot } = await supabase
      .from("bots")
      .select("id, user_id, name")
      .limit(1)
      .single()
    
    if (!bot) {
      return NextResponse.json({ error: "Nenhum bot encontrado" }, { status: 404 })
    }
    
    // Criar pagamento de teste com dados do usuario Telegram
    const { data: payment, error } = await supabase
      .from("payments")
      .insert({
        user_id: bot.user_id,
        bot_id: bot.id,
        telegram_user_id: telegramUserId,
        telegram_username: username,
        telegram_first_name: firstName,
        telegram_last_name: lastName,
        gateway: "mercadopago",
        external_payment_id: `TEST_${Date.now()}`,
        amount,
        description: `Pagamento - ${planName}`,
        status: "pending",
      })
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: "Pagamento de teste criado!",
      payment: {
        id: payment.id,
        telegram_user: {
          id: telegramUserId,
          username: `@${username}`,
          name: `${firstName} ${lastName}`,
        },
        amount: `R$ ${amount.toFixed(2)}`,
        status: payment.status,
        bot: bot.name,
      },
      nextStep: "Acesse /payments para ver o pagamento com os dados do usuario"
    })
    
  } catch (err) {
    return NextResponse.json({ 
      error: err instanceof Error ? err.message : "Erro desconhecido" 
    }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { getSupabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const supabase = getSupabase()
  const { searchParams } = new URL(request.url)
  
  // Dados do usuario do Telegram que comprou
  const telegramUserId = searchParams.get("telegramUserId") || "5099610171"
  const telegramUsername = searchParams.get("username") || "luismarques"
  const telegramFirstName = searchParams.get("firstName") || "Luis"
  const telegramLastName = searchParams.get("lastName") || "Marques"
  const amount = Number(searchParams.get("amount") || "50")
  const planName = searchParams.get("planName") || "Plano Premium"
  const botId = searchParams.get("botId") || "900f3312-0cde-4825-a913-c2ad019b2d0b"

  try {
    // Buscar user_id do bot
    const { data: bot } = await supabase
      .from("bots")
      .select("user_id, name")
      .eq("id", botId)
      .single()

    if (!bot?.user_id) {
      return NextResponse.json({ error: "Bot nao encontrado" }, { status: 404 })
    }

    // Criar pagamento com dados do usuario Telegram
    const { data: payment, error } = await supabase
      .from("payments")
      .insert({
        user_id: bot.user_id,
        bot_id: botId,
        telegram_user_id: telegramUserId,
        telegram_username: telegramUsername,
        telegram_first_name: telegramFirstName,
        telegram_last_name: telegramLastName,
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
        usuario: `${telegramFirstName} ${telegramLastName}`,
        username: `@${telegramUsername}`,
        telegram_id: telegramUserId,
        valor: `R$ ${amount.toFixed(2)}`,
        status: payment.status,
        bot: bot.name,
      },
      hint: "Acesse /financeiro para ver o pagamento"
    })
  } catch (err) {
    return NextResponse.json({ 
      error: err instanceof Error ? err.message : "Erro desconhecido" 
    }, { status: 500 })
  }
}

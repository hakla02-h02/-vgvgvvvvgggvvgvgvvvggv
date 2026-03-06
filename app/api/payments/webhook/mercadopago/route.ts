import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://rqgzgnknaklzlxlpuwwh.supabase.co"
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log("Mercado Pago webhook received:", JSON.stringify(body))

    // O Mercado Pago envia diferentes tipos de notificacao
    if (body.type === "payment" || body.action === "payment.updated") {
      const paymentId = body.data?.id || body.id

      if (!paymentId) {
        return NextResponse.json({ received: true })
      }

      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

      // Busca o pagamento no banco pelo external_payment_id
      const { data: payment, error } = await supabase
        .from("payments")
        .select("*, user_gateways!inner(access_token)")
        .eq("external_payment_id", String(paymentId))
        .single()

      if (error || !payment) {
        console.log("Payment not found for webhook:", paymentId)
        return NextResponse.json({ received: true })
      }

      // Busca o status atualizado no Mercado Pago
      const accessToken = payment.user_gateways?.access_token
      if (accessToken) {
        const mpResponse = await fetch(
          `https://api.mercadopago.com/v1/payments/${paymentId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )

        if (mpResponse.ok) {
          const mpData = await mpResponse.json()
          const newStatus = mpData.status

          // Atualiza o status no banco
          await supabase
            .from("payments")
            .update({
              status: newStatus,
              updated_at: new Date().toISOString(),
            })
            .eq("id", payment.id)

          console.log(`Payment ${paymentId} updated to status: ${newStatus}`)

          // Se o pagamento foi aprovado, podemos disparar acoes
          if (newStatus === "approved") {
            // TODO: Implementar logica para liberar acesso ao grupo VIP
            // por exemplo, enviar mensagem no Telegram
            console.log(`Payment ${paymentId} approved! User: ${payment.telegram_user_id}`)
          }
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing Mercado Pago webhook:", error)
    return NextResponse.json({ received: true })
  }
}

// Mercado Pago tambem envia HEAD para verificar se o endpoint existe
export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}

export async function GET() {
  return NextResponse.json({ status: "Webhook endpoint active" })
}

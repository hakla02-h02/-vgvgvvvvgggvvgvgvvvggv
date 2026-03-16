import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://izvulojnfvgsbmhyvqtn.supabase.co"
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

// ---------------------------------------------------------------------------
// Telegram helpers
// ---------------------------------------------------------------------------

async function sendTelegramMessage(
  botToken: string,
  chatId: number,
  text: string,
  replyMarkup?: object,
) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`
  const body: Record<string, unknown> = { chat_id: chatId, text, parse_mode: "HTML" }
  if (replyMarkup) body.reply_markup = replyMarkup
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return res.json()
}

async function sendTelegramPhoto(
  botToken: string,
  chatId: number,
  photoUrl: string,
  caption: string,
) {
  const url = `https://api.telegram.org/bot${botToken}/sendPhoto`
  const body: Record<string, unknown> = {
    chat_id: chatId,
    photo: photoUrl,
    caption,
    parse_mode: "HTML",
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return res.json()
}

async function sendTelegramVideo(
  botToken: string,
  chatId: number,
  videoUrl: string,
  caption: string,
) {
  const url = `https://api.telegram.org/bot${botToken}/sendVideo`
  const body: Record<string, unknown> = {
    chat_id: chatId,
    video: videoUrl,
    caption,
    parse_mode: "HTML",
  }
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return res.json()
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ---------------------------------------------------------------------------
// Webhook handler
// ---------------------------------------------------------------------------

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

          // ========== PAGAMENTO APROVADO - DISPARAR UPSELL ==========
          if (newStatus === "approved") {
            console.log(`Payment ${paymentId} approved! User: ${payment.telegram_user_id}, Product Type: ${payment.product_type}`)

            // Buscar bot e dados do usuario
            const { data: bot } = await supabase
              .from("bots")
              .select("id, token, user_id")
              .eq("id", payment.bot_id)
              .single()

            if (bot?.token && payment.telegram_user_id) {
              const chatId = parseInt(payment.telegram_user_id)

              // Enviar mensagem de confirmacao
              await sendTelegramMessage(
                bot.token,
                chatId,
                `<b>Pagamento Aprovado!</b>\n\nSeu pagamento de R$ ${payment.amount.toFixed(2).replace(".", ",")} foi confirmado.\nObrigado pela sua compra!`
              )

              // Se for pagamento do produto principal ou order bump, disparar upsell
              if (payment.product_type === "main_product" || payment.product_type === "order_bump") {
                // Buscar estado do usuario e fluxo
                const { data: state } = await supabase
                  .from("user_flow_state")
                  .select("flow_id, current_node_position")
                  .eq("bot_id", bot.id)
                  .eq("telegram_user_id", chatId)
                  .order("updated_at", { ascending: false })
                  .limit(1)
                  .single()

                if (state) {
                  // Buscar nodes do fluxo para pegar configuracoes de upsell
                  const { data: nodes } = await supabase
                    .from("flow_nodes")
                    .select("id, type, config")
                    .eq("flow_id", state.flow_id)
                    .eq("type", "payment")

                  const paymentNode = nodes?.[0]
                  if (paymentNode?.config) {
                    let upsells: { enabled: boolean; description: string; buttons: { text: string; amount: string }[]; media_url?: string; media_type?: string; delay_seconds?: string }[] = []
                    try {
                      const upsellsStr = paymentNode.config?.upsells as string
                      if (upsellsStr) upsells = JSON.parse(upsellsStr)
                    } catch { /* ignore */ }

                    // Encontrar primeiro upsell habilitado
                    const firstEnabledUpsell = upsells.findIndex(u => u.enabled && u.buttons?.length > 0)
                    
                    if (firstEnabledUpsell >= 0) {
                      const upsell = upsells[firstEnabledUpsell]
                      
                      // Delay opcional antes de enviar
                      const delaySeconds = parseInt(upsell.delay_seconds || "3")
                      if (delaySeconds > 0 && delaySeconds <= 30) {
                        await sleep(delaySeconds * 1000)
                      }

                      // Enviar midia se configurada
                      if (upsell.media_url) {
                        if (upsell.media_type === "video") {
                          await sendTelegramVideo(bot.token, chatId, upsell.media_url, "")
                        } else if (upsell.media_type === "photo") {
                          await sendTelegramPhoto(bot.token, chatId, upsell.media_url, "")
                        }
                      }

                      // Montar botoes do upsell
                      const validButtons = upsell.buttons?.filter(b => b.text?.trim() && b.amount?.trim()) || []
                      
                      if (validButtons.length > 0) {
                        const amount = validButtons[0].amount.replace(",", ".")
                        const inlineKeyboard = {
                          inline_keyboard: [
                            [{ text: validButtons[0].text, callback_data: `up_accept_${amount}_${firstEnabledUpsell}` }],
                            [{ text: "Nao, obrigado", callback_data: `up_decline_${firstEnabledUpsell}` }]
                          ]
                        }

                        const message = upsell.description || "Seu acesso foi liberado! Deseja aproveitar esta oferta especial?"
                        await sendTelegramMessage(bot.token, chatId, message, inlineKeyboard)

                        // Atualizar estado para aguardar decisao do upsell
                        await supabase
                          .from("user_flow_state")
                          .update({
                            status: "waiting_upsell",
                            updated_at: new Date().toISOString(),
                          })
                          .eq("bot_id", bot.id)
                          .eq("telegram_user_id", chatId)

                        console.log(`Upsell ${firstEnabledUpsell} sent to user ${chatId}`)
                      }
                    } else {
                      console.log(`No upsells configured for payment ${paymentId}`)
                    }
                  }
                }
              }
            }
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

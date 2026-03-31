import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Funcao para criar cliente Supabase (lazy initialization)
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Funcoes de envio do Telegram (copiadas do webhook)
async function sendTelegramMessage(
  botToken: string,
  chatId: number | string,
  text: string,
  replyMarkup?: unknown
) {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`
  const body: Record<string, unknown> = {
    chat_id: chatId,
    text,
    parse_mode: "HTML",
  }
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
  chatId: number | string,
  photoUrl: string,
  caption?: string
) {
  const url = `https://api.telegram.org/bot${botToken}/sendPhoto`
  const body: Record<string, unknown> = {
    chat_id: chatId,
    photo: photoUrl,
    parse_mode: "HTML",
  }
  if (caption) body.caption = caption
  
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return res.json()
}

async function sendTelegramVideo(
  botToken: string,
  chatId: number | string,
  videoUrl: string,
  caption?: string
) {
  const url = `https://api.telegram.org/bot${botToken}/sendVideo`
  const body: Record<string, unknown> = {
    chat_id: chatId,
    video: videoUrl,
    parse_mode: "HTML",
  }
  if (caption) body.caption = caption
  
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  return res.json()
}

export async function GET(request: NextRequest) {
  // Verificar autorizacao (pode ser um secret ou API key)
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  
  // Criar cliente Supabase dentro da funcao (lazy initialization)
  const supabaseAdmin = getSupabaseAdmin()
  
  try {
    const now = new Date().toISOString()
    
    // Buscar mensagens pendentes que devem ser enviadas agora
    const { data: pendingMessages, error } = await supabaseAdmin
      .from("scheduled_messages")
      .select("*")
      .eq("status", "pending")
      .lte("scheduled_for", now)
      .limit(50) // Processar em lotes
    
    if (error) {
      console.error("Erro ao buscar mensagens agendadas:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    if (!pendingMessages || pendingMessages.length === 0) {
      return NextResponse.json({ processed: 0, message: "Nenhuma mensagem pendente" })
    }
    
    let processed = 0
    let failed = 0
    
    for (const msg of pendingMessages) {
      try {
        const metadata = msg.metadata as {
          message?: string
          medias?: string[]
          price?: number
          botToken?: string
          deliveryType?: string
        } | null
        
        if (!metadata?.botToken) {
          // Se nao tem token, buscar do bot
          const { data: bot } = await supabaseAdmin
            .from("bots")
            .select("token")
            .eq("id", msg.bot_id)
            .single()
          
          if (!bot?.token) {
            throw new Error("Bot token not found")
          }
          metadata!.botToken = bot.token
        }
        
        const botToken = metadata!.botToken
        const chatId = msg.telegram_chat_id
        const message = metadata?.message || ""
        const medias = metadata?.medias || []
        const price = metadata?.price || 0
        
        // Verificar se o usuario ja pagou (cancelar se ja pagou)
        const { data: userState } = await supabaseAdmin
          .from("user_flow_state")
          .select("status")
          .eq("bot_id", msg.bot_id)
          .eq("telegram_user_id", msg.telegram_user_id)
          .single()
        
        if (userState?.status === "paid" || userState?.status === "completed") {
          // Usuario ja pagou, cancelar downsell
          await supabaseAdmin
            .from("scheduled_messages")
            .update({ status: "cancelled" })
            .eq("id", msg.id)
          continue
        }
        
        // Enviar mensagem
        if (medias.length > 0) {
          // Enviar primeira midia com caption
          const firstMedia = medias[0]
          if (firstMedia.includes("video") || firstMedia.includes("mp4")) {
            await sendTelegramVideo(botToken, chatId, firstMedia, message)
          } else {
            await sendTelegramPhoto(botToken, chatId, firstMedia, message)
          }
          
          // Enviar demais midias sem caption
          for (let i = 1; i < medias.length; i++) {
            const media = medias[i]
            if (media.includes("video") || media.includes("mp4")) {
              await sendTelegramVideo(botToken, chatId, media)
            } else {
              await sendTelegramPhoto(botToken, chatId, media)
            }
          }
        } else {
          // Apenas texto
          await sendTelegramMessage(botToken, chatId, message)
        }
        
        // Se tem preco, enviar botao de pagamento
        if (price > 0) {
          const paymentButton = {
            inline_keyboard: [[
              { text: `Pagar R$ ${price.toFixed(2)}`, callback_data: `downsell_pay_${msg.sequence_id}_${price}` }
            ]]
          }
          await sendTelegramMessage(botToken, chatId, "Aproveite esta oferta especial:", paymentButton)
        }
        
        // Marcar como enviado
        await supabaseAdmin
          .from("scheduled_messages")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", msg.id)
        
        processed++
      } catch (err) {
        console.error("Erro ao processar mensagem:", msg.id, err)
        
        // Marcar como falho
        await supabaseAdmin
          .from("scheduled_messages")
          .update({ 
            status: "failed", 
            error_message: err instanceof Error ? err.message : "Unknown error" 
          })
          .eq("id", msg.id)
        
        failed++
      }
    }
    
    return NextResponse.json({ 
      processed, 
      failed, 
      total: pendingMessages.length,
      message: `Processado ${processed} mensagens, ${failed} falhas`
    })
  } catch (error) {
    console.error("Erro no cron:", error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 })
  }
}

// Tambem aceitar POST para flexibilidade
export async function POST(request: NextRequest) {
  return GET(request)
}

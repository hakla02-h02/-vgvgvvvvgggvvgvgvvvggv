import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const flowId = searchParams.get("flowId")
  
  // Buscar o flow
  const { data: flow, error: flowError } = await supabase
    .from("flows")
    .select("*")
    .eq("id", flowId)
    .single()
  
  if (flowError || !flow) {
    return NextResponse.json({ 
      error: "Flow not found", 
      details: flowError?.message 
    }, { status: 404 })
  }
  
  // Simular extração de dados como o webhook faz
  const flowConfig = (flow.config as Record<string, unknown>) || {}
  
  const welcomeMsg = (flowConfig.welcomeMessage as string) || (flow.welcome_message as string) || ""
  const welcomeMedias = (flowConfig.welcomeMedias as string[]) || []
  const ctaButtonText = (flowConfig.ctaButtonText as string) || "Ver Planos"
  const redirectButton = flowConfig.redirectButton as { enabled?: boolean; text?: string; url?: string } || {}
  const secondaryMsg = flowConfig.secondaryMessage as { enabled?: boolean; message?: string } || {}
  
  // Simular variaveis
  const replaceVars = (text: string) => {
    if (!text) return ""
    return text
      .replace(/\{nome\}/gi, "Usuario Teste")
      .replace(/\{username\}/gi, "@usuario_teste")
      .replace(/\{bot\.username\}/gi, "@bot_teste")
  }
  
  const hasContent = welcomeMsg.trim() || welcomeMedias.length > 0 || (secondaryMsg.enabled && secondaryMsg.message)
  
  // Simular o que seria enviado
  const simulatedMessages: Array<{
    step: number
    type: string
    content?: string
    mediaUrl?: string
    buttons?: Array<{ text: string; type: string; data?: string; url?: string }>
  }> = []
  
  let step = 1
  
  // STEP 1: Midias
  if (welcomeMedias.length > 0) {
    for (const media of welcomeMedias) {
      const isVideo = media.includes(".mp4") || media.includes("video")
      simulatedMessages.push({
        step: step++,
        type: isVideo ? "VIDEO" : "PHOTO",
        mediaUrl: media
      })
    }
  }
  
  // STEP 2: Mensagem principal com botoes
  if (hasContent) {
    const finalMsg = replaceVars(welcomeMsg) || "Ola! Bem-vindo ao bot."
    const buttons: Array<{ text: string; type: string; data?: string; url?: string }> = []
    
    // CTA Button
    buttons.push({ 
      text: ctaButtonText, 
      type: "callback", 
      data: "ver_planos" 
    })
    
    // Redirect Button
    if (redirectButton.enabled && redirectButton.text && redirectButton.url) {
      buttons.push({ 
        text: redirectButton.text, 
        type: "url", 
        url: redirectButton.url 
      })
    }
    
    simulatedMessages.push({
      step: step++,
      type: "MESSAGE_WITH_BUTTONS",
      content: finalMsg,
      buttons
    })
  }
  
  // STEP 3: Mensagem secundaria
  if (secondaryMsg.enabled && secondaryMsg.message) {
    simulatedMessages.push({
      step: step++,
      type: "SECONDARY_MESSAGE",
      content: replaceVars(secondaryMsg.message)
    })
  }
  
  return NextResponse.json({
    success: true,
    flowId: flow.id,
    flowName: flow.name,
    rawData: {
      welcome_message_field: flow.welcome_message,
      config: flowConfig
    },
    extractedData: {
      welcomeMsg,
      welcomeMedias,
      ctaButtonText,
      redirectButton,
      secondaryMsg,
      hasContent
    },
    simulatedMessages,
    summary: {
      totalSteps: simulatedMessages.length,
      hasMedias: welcomeMedias.length > 0,
      hasWelcomeMessage: !!welcomeMsg.trim(),
      hasRedirectButton: redirectButton.enabled,
      hasSecondaryMessage: secondaryMsg.enabled
    }
  }, { status: 200 })
}

import { NextRequest, NextResponse } from "next/server"

// Register or unregister a Telegram webhook for a bot
// POST /api/telegram/register
// Body: { botToken: string, action: "register" | "unregister" }

export async function POST(req: NextRequest) {
  try {
    const { botToken, action } = await req.json()

    if (!botToken) {
      return NextResponse.json({ error: "Missing botToken" }, { status: 400 })
    }

    if (action === "unregister") {
      // Remove webhook
      const res = await fetch(
        `https://api.telegram.org/bot${botToken}/deleteWebhook`
      )
      const data = await res.json()
      return NextResponse.json(data)
    }

    // Register webhook - detect URL automatically
    // Priority: NEXT_PUBLIC_APP_URL > VERCEL_PROJECT_PRODUCTION_URL > VERCEL_URL > request host
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "")
    
    if (!baseUrl && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
      baseUrl = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    }
    
    if (!baseUrl && process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`
    }
    
    if (!baseUrl) {
      // Fallback: use request host header
      const host = req.headers.get("host")
      const proto = req.headers.get("x-forwarded-proto") || "https"
      if (host) {
        baseUrl = `${proto}://${host}`
      }
    }

    if (!baseUrl) {
      return NextResponse.json(
        { error: "Nao foi possivel detectar a URL do app. Configure NEXT_PUBLIC_APP_URL nas variaveis de ambiente." },
        { status: 400 }
      )
    }
    
    // Ensure we're not using preview URLs for production webhook
    console.log("[v0] Registrando webhook com URL:", baseUrl)

    const webhookUrl = `${baseUrl}/api/telegram/webhook?token=${encodeURIComponent(botToken)}`

    // Check if this is a preview URL (won't work 24/7)
    const isPreviewUrl = baseUrl.includes("vusercontent.net") || 
                         baseUrl.includes("localhost") ||
                         (baseUrl.includes("vercel.app") && baseUrl.includes("-"))

    // Delete old webhook first to ensure clean state
    await fetch(`https://api.telegram.org/bot${botToken}/deleteWebhook?drop_pending_updates=true`)

    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ["message", "callback_query"],
          drop_pending_updates: true,
        }),
      }
    )

    const data = await res.json()

    return NextResponse.json({
      ...data,
      webhook_url: webhookUrl,
      warning: isPreviewUrl ? "ATENCAO: URL de preview detectada! O bot so funcionara enquanto o preview estiver ativo. Para funcionar 24/7, configure NEXT_PUBLIC_APP_URL com sua URL de producao." : null,
    })
  } catch (err) {
    console.error("[register] Error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

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

    // Register webhook
    // Build the webhook URL dynamically based on the request origin
    const origin = req.headers.get("origin") || req.headers.get("referer")?.replace(/\/$/, "") || ""
    
    // Use the origin or fall back to constructing from host
    let baseUrl = origin
    if (!baseUrl) {
      const host = req.headers.get("host") || "localhost:3000"
      const proto = host.includes("localhost") ? "http" : "https"
      baseUrl = `${proto}://${host}`
    }

    const webhookUrl = `${baseUrl}/api/telegram/webhook?token=${encodeURIComponent(botToken)}`

    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/setWebhook`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ["message", "callback_query"],
        }),
      }
    )

    const data = await res.json()

    return NextResponse.json({
      ...data,
      webhook_url: webhookUrl,
    })
  } catch (err) {
    console.error("[register] Error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

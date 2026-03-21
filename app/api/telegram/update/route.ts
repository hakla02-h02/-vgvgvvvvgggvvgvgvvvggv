import { NextRequest, NextResponse } from "next/server"

interface TelegramResponse<T> {
  ok: boolean
  result?: T
  description?: string
}

export async function POST(request: NextRequest) {
  try {
    const { token, name, description, shortDescription } = await request.json()

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Token é obrigatório" },
        { status: 400 }
      )
    }

    const baseUrl = `https://api.telegram.org/bot${token}`
    const results: { name?: boolean; description?: boolean; shortDescription?: boolean } = {}

    // Update bot name
    if (name !== undefined) {
      try {
        const response = await fetch(`${baseUrl}/setMyName`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        })
        const data: TelegramResponse<boolean> = await response.json()
        results.name = data.ok
      } catch {
        results.name = false
      }
    }

    // Update description
    if (description !== undefined) {
      try {
        const response = await fetch(`${baseUrl}/setMyDescription`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description }),
        })
        const data: TelegramResponse<boolean> = await response.json()
        results.description = data.ok
      } catch {
        results.description = false
      }
    }

    // Update short description
    if (shortDescription !== undefined) {
      try {
        const response = await fetch(`${baseUrl}/setMyShortDescription`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ short_description: shortDescription }),
        })
        const data: TelegramResponse<boolean> = await response.json()
        results.shortDescription = data.ok
      } catch {
        results.shortDescription = false
      }
    }

    return NextResponse.json({
      success: true,
      results,
    })
  } catch (error) {
    console.error("Error updating telegram bot:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar bot" },
      { status: 500 }
    )
  }
}

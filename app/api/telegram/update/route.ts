import { NextRequest, NextResponse } from "next/server"
import FormData from "form-data"

interface TelegramResponse<T> {
  ok: boolean
  result?: T
  description?: string
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const token = formData.get("token") as string
    const name = formData.get("name") as string | null
    const description = formData.get("description") as string | null
    const shortDescription = formData.get("shortDescription") as string | null
    const photo = formData.get("photo") as File | null
    const deletePhoto = formData.get("deletePhoto") === "true"

    console.log("[v0] UPDATE API - Received request")
    console.log("[v0] UPDATE API - token exists:", !!token)
    console.log("[v0] UPDATE API - name:", name)
    console.log("[v0] UPDATE API - photo:", photo ? `File: ${photo.name}, size: ${photo.size}, type: ${photo.type}` : "null")

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { error: "Token é obrigatório" },
        { status: 400 }
      )
    }

    const baseUrl = `https://api.telegram.org/bot${token}`
    const results: { name?: boolean; description?: boolean; shortDescription?: boolean; photo?: boolean; photoError?: string } = {}

    // Update bot name
    if (name !== undefined && name !== null) {
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
    if (description !== undefined && description !== null) {
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
    if (shortDescription !== undefined && shortDescription !== null) {
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

    // Delete profile photo
    if (deletePhoto) {
      try {
        const response = await fetch(`${baseUrl}/deleteMyProfilePhoto`, {
          method: "POST",
        })
        const data: TelegramResponse<boolean> = await response.json()
        results.photo = data.ok
      } catch {
        results.photo = false
      }
    }

    // Upload new profile photo using form-data library (Node.js compatible)
    if (photo) {
      console.log("[v0] UPDATE API - Photo upload starting...")
      try {
        // Converter File para Buffer
        const arrayBuffer = await photo.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const fileName = photo.name || "photo.jpg"
        const mimeType = photo.type || "image/jpeg"
        
        console.log("[v0] UPDATE API - Buffer size:", buffer.length)
        console.log("[v0] UPDATE API - File name:", fileName)
        console.log("[v0] UPDATE API - MIME type:", mimeType)
        
        // Usar form-data library (funciona corretamente no Node.js)
        const form = new FormData()
        form.append("photo", buffer, {
          filename: fileName,
          contentType: mimeType,
        })
        
        console.log("[v0] UPDATE API - FormData headers:", form.getHeaders())
        console.log("[v0] UPDATE API - Sending to Telegram:", `${baseUrl}/setMyProfilePhoto`)
        
        // Usar fetch com headers do form-data (inclui boundary correto)
        const response = await fetch(`${baseUrl}/setMyProfilePhoto`, {
          method: "POST",
          body: form as unknown as BodyInit,
          headers: form.getHeaders(),
        })
        
        const data: TelegramResponse<boolean> & { description?: string } = await response.json()
        console.log("[v0] UPDATE API - Telegram response:", JSON.stringify(data))
        
        results.photo = data.ok
        if (!data.ok) {
          results.photoError = data.description || "Unknown error"
          console.log("[v0] UPDATE API - Photo upload FAILED:", data.description)
        } else {
          console.log("[v0] UPDATE API - Photo upload SUCCESS")
        }
      } catch (err) {
        console.log("[v0] UPDATE API - Photo upload EXCEPTION:", err)
        results.photo = false
        results.photoError = String(err)
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

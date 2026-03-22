import { NextRequest, NextResponse } from "next/server"

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
    console.log("[v0] UPDATE API - photo instanceof File:", photo instanceof File)

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

    // Upload new profile photo
    console.log("[v0] UPDATE API - Checking photo upload condition")
    console.log("[v0] UPDATE API - photo:", photo)
    console.log("[v0] UPDATE API - photo is truthy:", !!photo)
    
    if (photo) {
      console.log("[v0] UPDATE API - Photo condition passed, starting upload...")
      try {
        // Ler o arquivo como ArrayBuffer
        const arrayBuffer = await photo.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        console.log("[v0] UPDATE API - Buffer size:", buffer.length)
        
        // Criar um novo File object com o buffer
        const photoFile = new File([buffer], photo.name || "photo.jpg", { 
          type: photo.type || "image/jpeg" 
        })
        
        // Criar FormData e adicionar o arquivo
        const photoFormData = new FormData()
        photoFormData.set("photo", photoFile)
        
        console.log("[v0] UPDATE API - FormData entries:")
        for (const [key, value] of photoFormData.entries()) {
          console.log(`[v0] UPDATE API - ${key}:`, value)
        }
        
        console.log("[v0] UPDATE API - Sending to Telegram:", `${baseUrl}/setMyProfilePhoto`)
        
        const response = await fetch(`${baseUrl}/setMyProfilePhoto`, {
          method: "POST",
          body: photoFormData,
        })
        
        const data = await response.json()
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
    } else {
      console.log("[v0] UPDATE API - No photo to upload")
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

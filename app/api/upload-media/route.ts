import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const SUPABASE_URL = "https://dbtpnafcqfcllgoxdhxs.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRidHBuYWZjcWZjbGxnb3hkaHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0Nzg3MTQsImV4cCI6MjA4NzA1NDcxNH0.0MF5a1uAuxeHIVGNglWYbFHYRIECNVEVZN1MLH4Z26A"

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const mediaType = formData.get("mediaType") as string | null

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    // Validate file type
    const allowedImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime"]
    const allAllowed = [...allowedImageTypes, ...allowedVideoTypes]

    if (!allAllowed.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de arquivo nao suportado. Use JPG, PNG, GIF, WEBP, MP4, WEBM ou MOV." },
        { status: 400 }
      )
    }

    if (mediaType === "photo" && !allowedImageTypes.includes(file.type)) {
      return NextResponse.json({ error: "Selecione um arquivo de imagem valido." }, { status: 400 })
    }

    if (mediaType === "video" && !allowedVideoTypes.includes(file.type)) {
      return NextResponse.json({ error: "Selecione um arquivo de video valido." }, { status: 400 })
    }

    // Max 50MB
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "Arquivo muito grande. Maximo 50MB." }, { status: 400 })
    }

    const ext = file.name.split(".").pop() || "bin"
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`
    const filePath = `${mediaType === "video" ? "videos" : "images"}/${fileName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from("flow-media")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return NextResponse.json({ error: "Erro ao fazer upload: " + uploadError.message }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from("flow-media").getPublicUrl(filePath)

    return NextResponse.json({ url: urlData.publicUrl })
  } catch (err) {
    console.error("Upload route error:", err)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

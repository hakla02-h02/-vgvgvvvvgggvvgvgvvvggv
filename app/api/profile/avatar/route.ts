import { createClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

const SUPABASE_URL = "https://dbtpnafcqfcllgoxdhxs.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRidHBuYWZjcWZjbGxnb3hkaHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0Nzg3MTQsImV4cCI6MjA4NzA1NDcxNH0.0MF5a1uAuxeHIVGNglWYbFHYRIECNVEVZN1MLH4Z26A"

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// POST /api/profile/avatar — upload avatar image
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const userId = formData.get("userId") as string | null

    if (!file || !userId) {
      return NextResponse.json({ error: "Arquivo e userId obrigatorios" }, { status: 400 })
    }

    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Use JPG, PNG, GIF ou WEBP" }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Maximo 5MB" }, { status: 400 })
    }

    const ext = file.name.split(".").pop() || "jpg"
    const filePath = `avatars/${userId}.${ext}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    // Upload to flow-media bucket (avatars folder)
    const { error: uploadError } = await supabase.storage
      .from("flow-media")
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error("Avatar upload error:", uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }

    const { data: urlData } = supabase.storage.from("flow-media").getPublicUrl(filePath)

    // Update users table
    const { error: updateError } = await supabase
      .from("users")
      .update({ avatar_url: urlData.publicUrl })
      .eq("id", userId)

    if (updateError) {
      console.error("Avatar DB update error:", updateError)
    }

    return NextResponse.json({ url: urlData.publicUrl })
  } catch (err) {
    console.error("Avatar route error:", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from 'next/server'
import { getSupabase } from '@/lib/supabase'

// For App Router: set max duration
export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Allowed: JPG, PNG, GIF, WEBP, MP4, WEBM, MOV' }, { status: 400 })
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Max 50MB' }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const ext = file.name.split('.').pop()
    const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.${ext}`

    // Get Supabase client
    const supabase = getSupabase()

    // Convert File to ArrayBuffer then to Buffer for upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Try to create bucket if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some(b => b.name === 'media')
    
    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket('media', {
        public: true,
        fileSizeLimit: 52428800, // 50MB
      })
      if (createError && !createError.message.includes('already exists')) {
        console.error('Failed to create bucket:', createError)
        return NextResponse.json({ error: 'Storage not configured. Contact admin.' }, { status: 500 })
      }
    }

    // Upload to Supabase Storage (bucket: media)
    const { data, error } = await supabase.storage
      .from('media')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error('Supabase upload error:', error)
      // Check for specific errors
      if (error.message.includes('Bucket not found')) {
        return NextResponse.json({ error: 'Bucket de storage nao existe. Crie o bucket "media" no Supabase.' }, { status: 500 })
      }
      if (error.message.includes('row-level security') || error.message.includes('permission')) {
        return NextResponse.json({ error: 'Sem permissao para upload. Verifique as policies do bucket.' }, { status: 500 })
      }
      return NextResponse.json({ error: 'Upload falhou: ' + error.message }, { status: 500 })
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('media')
      .getPublicUrl(data.path)

    return NextResponse.json({
      url: urlData.publicUrl,
      filename: file.name,
      size: file.size,
      type: file.type,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

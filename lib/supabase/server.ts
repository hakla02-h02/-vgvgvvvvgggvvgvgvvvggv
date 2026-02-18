import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  const supabaseUrl = "https://volaxembfnmwghuqnlgl.supabase.co"
  const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvbGF4ZW1iZm5td2dodXFubGdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMTMxMTksImV4cCI6MjA4Njc4OTExOX0.LcxwQLsfbYkXWe_rlxe8TDnuQvHsryiLFaaAKi8Gfo8"

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // The "setAll" method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    },
  )
}

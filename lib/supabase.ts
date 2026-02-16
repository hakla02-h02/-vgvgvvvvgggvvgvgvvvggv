import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://volaxembfnmwghuqnlgl.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvbGF4ZW1iZm5td2dodXFubGdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMTMxMTksImV4cCI6MjA4Njc4OTExOX0.LcxwQLsfbYkXWe_rlxe8TDnuQvHsryiLFaaAKi8Gfo8"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

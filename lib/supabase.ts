import { createClient } from "@supabase/supabase-js"

const SUPABASE_URL = "https://rqgzgnknaklzlxlpuwwh.supabase.co"
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxZ3pnbmtuYWtsemx4bHB1d3doIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MjgwNTUsImV4cCI6MjA4ODAwNDA1NX0.Nv2Pz-kvREBMNglkiKoRs4GyNqKXosdIMSfzTXHCkQs"

let _supabase: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (!_supabase) {
    _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  }
  return _supabase
}

// Mantém export para compatibilidade, mas agora é lazy
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_, prop) {
    return (getSupabase() as Record<string | symbol, unknown>)[prop]
  },
})

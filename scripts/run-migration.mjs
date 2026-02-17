import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  "https://volaxembfnmwghuqnlgl.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZvbGF4ZW1iZm5td2dodXFubGdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyMTMxMTksImV4cCI6MjA4Njc4OTExOX0.LcxwQLsfbYkXWe_rlxe8TDnuQvHsryiLFaaAKi8Gfo8"
)

// Test connection by trying to read from users table
async function main() {
  console.log("Testing Supabase connection...")
  
  // Try to select from users - if table doesn't exist we'll get an error
  const { data, error } = await supabase.from("users").select("id").limit(1)
  
  if (error) {
    console.log("Error querying users table:", error.message, error.code)
    console.log("")
    console.log("=== IMPORTANTE ===")
    console.log("Voce precisa rodar este SQL no Supabase Dashboard (SQL Editor):")
    console.log("")
    console.log(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  banned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bots (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  token TEXT NOT NULL,
  group_name TEXT,
  group_link TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_all" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "bots_all" ON bots FOR ALL USING (true) WITH CHECK (true);
    `)
    console.log("=================")
  } else {
    console.log("Tabela 'users' existe! Registros:", data?.length ?? 0)
    
    // Also check bots table
    const { data: botsData, error: botsError } = await supabase.from("bots").select("id").limit(1)
    if (botsError) {
      console.log("Tabela 'bots' NAO existe:", botsError.message)
    } else {
      console.log("Tabela 'bots' existe! Registros:", botsData?.length ?? 0)
    }
    
    console.log("")
    console.log("Supabase conectado e tabelas prontas!")
  }
}

main().catch(console.error)

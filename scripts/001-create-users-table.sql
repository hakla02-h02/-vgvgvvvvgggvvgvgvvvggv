-- ==============================================
-- TeleFlow: SQL para criar tabela de usuarios
-- Execute este script no SQL Editor do Supabase
-- ==============================================

-- 1. Criar a tabela public.users
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL DEFAULT '',
  banned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Politica: usuarios autenticados podem ler seus proprios dados
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- 4. Politica: usuarios autenticados podem inserir seus proprios dados
CREATE POLICY "Users can insert own data"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 5. Politica: permitir leitura anonima para o painel admin
--    (ajuste conforme necessario para seguranca)
CREATE POLICY "Allow anon read for admin"
  ON public.users
  FOR SELECT
  TO anon
  USING (true);

-- 6. Politica: permitir insert anonimo para cadastro
--    (necessario pois o signUp pode usar anon antes de autenticar)
CREATE POLICY "Allow anon insert for signup"
  ON public.users
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- 7. Politica: permitir update anonimo para admin (ban/unban)
--    (ajuste conforme necessario para seguranca)
CREATE POLICY "Allow anon update for admin"
  ON public.users
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- 8. Desabilitar confirmacao de email (opcional, para facilitar testes)
--    Voce pode fazer isso em: Supabase Dashboard > Authentication > Settings
--    Desmarque "Enable email confirmations"

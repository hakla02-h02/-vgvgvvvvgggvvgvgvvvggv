-- ==============================================
-- Adicionar avatar_url na tabela de usuarios
-- e criar bucket para avatares
-- ==============================================

-- 1. Adicionar coluna avatar_url na tabela users
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '';

-- 2. Criar bucket para avatares de usuarios
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Politicas de storage para o bucket avatars
CREATE POLICY "avatars read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars');
CREATE POLICY "avatars insert" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "avatars update" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'avatars') WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "avatars delete" ON storage.objects FOR DELETE TO public USING (bucket_id = 'avatars');

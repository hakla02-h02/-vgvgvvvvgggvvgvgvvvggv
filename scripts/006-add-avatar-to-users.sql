-- Adicionar avatar_url na tabela de usuarios
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT '';

-- ============================================
-- Tabela: bots
-- Cada usuario pode criar quantos bots quiser
-- ============================================

create table if not exists public.bots (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  name text not null,
  token text not null,
  group_name text,
  group_id text,       -- ID numerico do grupo (ex: -1001234567890) ou @ (ex: @meugrupo)
  group_link text,     -- Link do grupo (ex: https://t.me/+abc123)
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz default now()
);

-- Indice para buscar bots por usuario rapidamente
create index if not exists idx_bots_user_id on public.bots(user_id);

-- Habilitar RLS
alter table public.bots enable row level security;

-- Politica: usuario so ve seus proprios bots
create policy "Users can view their own bots"
  on public.bots
  for select
  using (auth.uid() = user_id);

-- Politica: usuario pode criar bots para si mesmo
create policy "Users can create their own bots"
  on public.bots
  for insert
  with check (auth.uid() = user_id);

-- Politica: usuario pode atualizar seus proprios bots
create policy "Users can update their own bots"
  on public.bots
  for update
  using (auth.uid() = user_id);

-- Politica: usuario pode deletar seus proprios bots
create policy "Users can delete their own bots"
  on public.bots
  for delete
  using (auth.uid() = user_id);

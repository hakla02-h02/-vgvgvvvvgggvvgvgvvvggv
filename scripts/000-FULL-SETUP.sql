-- ==============================================
-- TeleFlow: SETUP COMPLETO DO BANCO DE DADOS
-- Execute este script UMA VEZ no SQL Editor do Supabase
-- Ele cria todas as tabelas, indexes, RLS policies e storage
-- ==============================================

-- ============================================
-- PARTE 1: TABELA DE USUARIOS
-- ============================================

CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL DEFAULT '',
  avatar_url TEXT DEFAULT '',
  banned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
DROP POLICY IF EXISTS "Allow anon read for admin" ON public.users;
DROP POLICY IF EXISTS "Allow anon insert for signup" ON public.users;
DROP POLICY IF EXISTS "Allow anon update for admin" ON public.users;

CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow anon read for admin" ON public.users
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow anon insert for signup" ON public.users
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anon update for admin" ON public.users
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- ============================================
-- PARTE 2: TABELA DE BOTS
-- ============================================

CREATE TABLE IF NOT EXISTS public.bots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  token TEXT NOT NULL,
  group_name TEXT,
  group_id TEXT,
  group_link TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bots_user_id ON public.bots(user_id);

ALTER TABLE public.bots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own bots" ON public.bots;
DROP POLICY IF EXISTS "Users can create their own bots" ON public.bots;
DROP POLICY IF EXISTS "Users can update their own bots" ON public.bots;
DROP POLICY IF EXISTS "Users can delete their own bots" ON public.bots;
DROP POLICY IF EXISTS "Anon can read bots for webhook" ON public.bots;

CREATE POLICY "Users can view their own bots" ON public.bots
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bots" ON public.bots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bots" ON public.bots
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bots" ON public.bots
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anon can read bots for webhook" ON public.bots
  FOR SELECT TO anon USING (true);

-- ============================================
-- PARTE 3: TABELAS DE REFERRAL
-- ============================================

CREATE TABLE IF NOT EXISTS referral_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coupon_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT coupon_code_lowercase CHECK (coupon_code = LOWER(coupon_code))
);

CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coupon_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_referred UNIQUE (referred_id)
);

CREATE INDEX IF NOT EXISTS idx_referral_coupons_user_id ON referral_coupons(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_coupons_code ON referral_coupons(coupon_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);

ALTER TABLE referral_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Drop all referral policies
DROP POLICY IF EXISTS "Users can view their own coupons" ON referral_coupons;
DROP POLICY IF EXISTS "Users can create their own coupons" ON referral_coupons;
DROP POLICY IF EXISTS "Anyone can validate a coupon" ON referral_coupons;
DROP POLICY IF EXISTS "Anon can read referral coupons" ON referral_coupons;
DROP POLICY IF EXISTS "Anon can insert referral coupons" ON referral_coupons;
DROP POLICY IF EXISTS "Anon can update referral coupons" ON referral_coupons;
DROP POLICY IF EXISTS "Allow all select on referral_coupons" ON referral_coupons;
DROP POLICY IF EXISTS "Allow all insert on referral_coupons" ON referral_coupons;
DROP POLICY IF EXISTS "Allow all update on referral_coupons" ON referral_coupons;
DROP POLICY IF EXISTS "Allow all delete on referral_coupons" ON referral_coupons;

DROP POLICY IF EXISTS "Users can view referrals they made" ON referrals;
DROP POLICY IF EXISTS "Authenticated users can create referrals" ON referrals;
DROP POLICY IF EXISTS "Anon can read referrals" ON referrals;
DROP POLICY IF EXISTS "Anon can insert referrals" ON referrals;
DROP POLICY IF EXISTS "Allow all select on referrals" ON referrals;
DROP POLICY IF EXISTS "Allow all insert on referrals" ON referrals;
DROP POLICY IF EXISTS "Allow all update on referrals" ON referrals;
DROP POLICY IF EXISTS "Allow all delete on referrals" ON referrals;

CREATE POLICY "Allow all select on referral_coupons" ON referral_coupons
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow all insert on referral_coupons" ON referral_coupons
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow all update on referral_coupons" ON referral_coupons
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all delete on referral_coupons" ON referral_coupons
  FOR DELETE TO anon, authenticated USING (true);

CREATE POLICY "Allow all select on referrals" ON referrals
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow all insert on referrals" ON referrals
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow all update on referrals" ON referrals
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all delete on referrals" ON referrals
  FOR DELETE TO anon, authenticated USING (true);

-- ============================================
-- PARTE 4: TABELAS DE FLOWS E FLOW NODES
-- ============================================

CREATE TABLE IF NOT EXISTS flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Novo Fluxo',
  category TEXT DEFAULT 'personalizado',
  is_primary BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'pausado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS flow_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('trigger', 'message', 'delay', 'condition', 'payment', 'action', 'redirect')),
  label TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS webhook_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  chat_id BIGINT NOT NULL,
  telegram_user_id BIGINT NOT NULL,
  message_text TEXT,
  flow_id UUID REFERENCES flows(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'processed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_flows_bot_id ON flows(bot_id);
CREATE INDEX IF NOT EXISTS idx_flows_user_id ON flows(user_id);
CREATE INDEX IF NOT EXISTS idx_flow_nodes_flow_id ON flow_nodes(flow_id);
CREATE INDEX IF NOT EXISTS idx_flow_nodes_position ON flow_nodes(flow_id, position);
CREATE INDEX IF NOT EXISTS idx_webhook_log_bot_id ON webhook_log(bot_id);
CREATE INDEX IF NOT EXISTS idx_webhook_log_chat_id ON webhook_log(chat_id);

ALTER TABLE flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_log ENABLE ROW LEVEL SECURITY;

-- Flows policies
DROP POLICY IF EXISTS "Users can view own flows" ON flows;
DROP POLICY IF EXISTS "Users can insert own flows" ON flows;
DROP POLICY IF EXISTS "Users can update own flows" ON flows;
DROP POLICY IF EXISTS "Users can delete own flows" ON flows;
DROP POLICY IF EXISTS "Anon can read flows by bot_id" ON flows;

CREATE POLICY "Users can view own flows" ON flows
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own flows" ON flows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flows" ON flows
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own flows" ON flows
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anon can read flows by bot_id" ON flows
  FOR SELECT TO anon USING (true);

-- Flow nodes policies
DROP POLICY IF EXISTS "Users can view own flow nodes" ON flow_nodes;
DROP POLICY IF EXISTS "Users can insert own flow nodes" ON flow_nodes;
DROP POLICY IF EXISTS "Users can update own flow nodes" ON flow_nodes;
DROP POLICY IF EXISTS "Users can delete own flow nodes" ON flow_nodes;
DROP POLICY IF EXISTS "Anon can read flow nodes" ON flow_nodes;

CREATE POLICY "Users can view own flow nodes" ON flow_nodes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM flows WHERE flows.id = flow_nodes.flow_id AND flows.user_id = auth.uid())
  );

CREATE POLICY "Users can insert own flow nodes" ON flow_nodes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM flows WHERE flows.id = flow_nodes.flow_id AND flows.user_id = auth.uid())
  );

CREATE POLICY "Users can update own flow nodes" ON flow_nodes
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM flows WHERE flows.id = flow_nodes.flow_id AND flows.user_id = auth.uid())
  );

CREATE POLICY "Users can delete own flow nodes" ON flow_nodes
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM flows WHERE flows.id = flow_nodes.flow_id AND flows.user_id = auth.uid())
  );

CREATE POLICY "Anon can read flow nodes" ON flow_nodes
  FOR SELECT TO anon USING (true);

-- Webhook log policies
DROP POLICY IF EXISTS "Users can view own webhook logs" ON webhook_log;
DROP POLICY IF EXISTS "Anon can insert webhook logs" ON webhook_log;
DROP POLICY IF EXISTS "Anon can read webhook logs" ON webhook_log;

CREATE POLICY "Users can view own webhook logs" ON webhook_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM bots WHERE bots.id = webhook_log.bot_id AND bots.user_id = auth.uid())
  );

CREATE POLICY "Anon can insert webhook logs" ON webhook_log
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon can read webhook logs" ON webhook_log
  FOR SELECT TO anon USING (true);

-- ============================================
-- PARTE 5: USER FLOW STATE
-- ============================================

CREATE TABLE IF NOT EXISTS user_flow_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  flow_id UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
  telegram_user_id BIGINT NOT NULL,
  chat_id BIGINT NOT NULL,
  current_node_position INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'waiting_response')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (bot_id, flow_id, telegram_user_id)
);

CREATE INDEX IF NOT EXISTS idx_user_flow_state_lookup ON user_flow_state(bot_id, telegram_user_id);

ALTER TABLE user_flow_state ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anon can read user flow state" ON user_flow_state;
DROP POLICY IF EXISTS "Anon can insert user flow state" ON user_flow_state;
DROP POLICY IF EXISTS "Anon can update user flow state" ON user_flow_state;
DROP POLICY IF EXISTS "Users can view user flow state" ON user_flow_state;

CREATE POLICY "Anon can read user flow state" ON user_flow_state
  FOR SELECT TO anon USING (true);

CREATE POLICY "Anon can insert user flow state" ON user_flow_state
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon can update user flow state" ON user_flow_state
  FOR UPDATE TO anon USING (true);

CREATE POLICY "Users can view user flow state" ON user_flow_state
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM bots WHERE bots.id = user_flow_state.bot_id AND bots.user_id = auth.uid())
  );

-- ============================================
-- PARTE 6: BOT USERS
-- ============================================

CREATE TABLE IF NOT EXISTS bot_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  telegram_user_id BIGINT NOT NULL,
  chat_id BIGINT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  username TEXT,
  funnel_step INTEGER NOT NULL DEFAULT 1,
  is_subscriber BOOLEAN NOT NULL DEFAULT false,
  subscription_plan TEXT,
  subscription_start TIMESTAMPTZ,
  subscription_end TIMESTAMPTZ,
  last_activity TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (bot_id, telegram_user_id)
);

CREATE INDEX IF NOT EXISTS idx_bot_users_bot_id ON bot_users(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_users_telegram ON bot_users(bot_id, telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_bot_users_funnel ON bot_users(bot_id, funnel_step);
CREATE INDEX IF NOT EXISTS idx_bot_users_subscriber ON bot_users(bot_id, is_subscriber);

ALTER TABLE bot_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bot users" ON bot_users;
DROP POLICY IF EXISTS "Anon can read bot users" ON bot_users;
DROP POLICY IF EXISTS "Anon can insert bot users" ON bot_users;
DROP POLICY IF EXISTS "Anon can update bot users" ON bot_users;

CREATE POLICY "Users can view own bot users" ON bot_users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM bots WHERE bots.id = bot_users.bot_id AND bots.user_id = auth.uid())
  );

CREATE POLICY "Anon can read bot users" ON bot_users
  FOR SELECT TO anon USING (true);

CREATE POLICY "Anon can insert bot users" ON bot_users
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon can update bot users" ON bot_users
  FOR UPDATE TO anon USING (true);

-- ============================================
-- PARTE 7: BOT PLANS
-- ============================================

CREATE TABLE IF NOT EXISTS bot_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  duration_days INTEGER NOT NULL DEFAULT 30,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bot_plans_bot_id ON bot_plans(bot_id);

ALTER TABLE bot_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bot plans" ON bot_plans;
DROP POLICY IF EXISTS "Users can insert own bot plans" ON bot_plans;
DROP POLICY IF EXISTS "Users can update own bot plans" ON bot_plans;
DROP POLICY IF EXISTS "Users can delete own bot plans" ON bot_plans;
DROP POLICY IF EXISTS "Anon can read bot plans" ON bot_plans;

CREATE POLICY "Users can view own bot plans" ON bot_plans
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM bots WHERE bots.id = bot_plans.bot_id AND bots.user_id = auth.uid())
  );

CREATE POLICY "Users can insert own bot plans" ON bot_plans
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM bots WHERE bots.id = bot_plans.bot_id AND bots.user_id = auth.uid())
  );

CREATE POLICY "Users can update own bot plans" ON bot_plans
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM bots WHERE bots.id = bot_plans.bot_id AND bots.user_id = auth.uid())
  );

CREATE POLICY "Users can delete own bot plans" ON bot_plans
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM bots WHERE bots.id = bot_plans.bot_id AND bots.user_id = auth.uid())
  );

CREATE POLICY "Anon can read bot plans" ON bot_plans
  FOR SELECT TO anon USING (true);

-- ============================================
-- PARTE 8: STORAGE BUCKET (flow-media)
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('flow-media', 'flow-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing storage policies for flow-media
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'objects' AND schemaname = 'storage'
      AND (policyname LIKE '%flow-media%' OR policyname LIKE '%flow_media%')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END$$;

CREATE POLICY "Allow public read flow-media" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'flow-media');

CREATE POLICY "Allow public upload flow-media" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'flow-media');

CREATE POLICY "Allow public update flow-media" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'flow-media')
  WITH CHECK (bucket_id = 'flow-media');

CREATE POLICY "Allow public delete flow-media" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'flow-media');

-- ============================================
-- FIM DO SETUP
-- ============================================

-- ============================================
-- Tabela: bot_plans
-- Planos de assinatura configurados por bot
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bot_plans_bot_id ON bot_plans(bot_id);

-- RLS
ALTER TABLE bot_plans ENABLE ROW LEVEL SECURITY;

-- Authenticated user can manage plans for their own bots
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

-- Anon access for webhook (bot needs to present plans to users)
CREATE POLICY "Anon can read bot plans" ON bot_plans
  FOR SELECT TO anon USING (true);

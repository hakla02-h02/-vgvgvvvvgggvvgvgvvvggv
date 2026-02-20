-- ============================================
-- Bot Users: usuarios que interagiram com o bot
-- Rastreia cada usuario do Telegram, seu status no funil,
-- assinatura, etc.
-- ============================================

DROP TABLE IF EXISTS bot_users CASCADE;

CREATE TABLE IF NOT EXISTS bot_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  telegram_user_id BIGINT NOT NULL,
  chat_id BIGINT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  username TEXT,
  -- Etapa no funil: 1=iniciou bot, 2=recebeu mensagem, 3=chegou pagamento, 4=assinante
  funnel_step INTEGER NOT NULL DEFAULT 1,
  -- Assinatura
  is_subscriber BOOLEAN NOT NULL DEFAULT false,
  subscription_plan TEXT, -- ex: 'Mensal', 'Trimestral', 'Anual'
  subscription_start TIMESTAMPTZ,
  subscription_end TIMESTAMPTZ,
  -- Tracking
  last_activity TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Um usuario so pode existir uma vez por bot
  UNIQUE (bot_id, telegram_user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bot_users_bot_id ON bot_users(bot_id);
CREATE INDEX IF NOT EXISTS idx_bot_users_telegram ON bot_users(bot_id, telegram_user_id);
CREATE INDEX IF NOT EXISTS idx_bot_users_funnel ON bot_users(bot_id, funnel_step);
CREATE INDEX IF NOT EXISTS idx_bot_users_subscriber ON bot_users(bot_id, is_subscriber);

-- RLS
ALTER TABLE bot_users ENABLE ROW LEVEL SECURITY;

-- Dashboard: usuario autenticado pode ver seus bot_users
CREATE POLICY "Users can view own bot users" ON bot_users
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM bots WHERE bots.id = bot_users.bot_id AND bots.user_id = auth.uid())
  );

-- Webhook (anon) pode inserir/atualizar/ler bot_users
CREATE POLICY "Anon can read bot users" ON bot_users
  FOR SELECT TO anon USING (true);

CREATE POLICY "Anon can insert bot users" ON bot_users
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon can update bot users" ON bot_users
  FOR UPDATE TO anon USING (true);

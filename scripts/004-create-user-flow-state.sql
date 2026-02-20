-- ============================================
-- User Flow State: rastreia em qual passo do fluxo cada usuario esta
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
  -- Um usuario so pode ter um estado por fluxo por bot
  UNIQUE (bot_id, flow_id, telegram_user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_flow_state_lookup 
  ON user_flow_state(bot_id, telegram_user_id);

-- RLS
ALTER TABLE user_flow_state ENABLE ROW LEVEL SECURITY;

-- Anon pode ler/inserir/atualizar (webhook precisa)
CREATE POLICY "Anon can read user flow state" ON user_flow_state
  FOR SELECT TO anon USING (true);

CREATE POLICY "Anon can insert user flow state" ON user_flow_state
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon can update user flow state" ON user_flow_state
  FOR UPDATE TO anon USING (true);

-- Dashboard pode ver
CREATE POLICY "Users can view user flow state" ON user_flow_state
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM bots WHERE bots.id = user_flow_state.bot_id AND bots.user_id = auth.uid())
  );

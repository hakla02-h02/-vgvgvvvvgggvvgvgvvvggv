-- ============================================
-- TeleFlow: Flows & Flow Nodes + Webhook Log
-- ============================================

-- Drop everything first to avoid conflicts
DROP POLICY IF EXISTS "Users can view own flows" ON flows;
DROP POLICY IF EXISTS "Users can insert own flows" ON flows;
DROP POLICY IF EXISTS "Users can update own flows" ON flows;
DROP POLICY IF EXISTS "Users can delete own flows" ON flows;
DROP POLICY IF EXISTS "Anon can read flows by bot_id" ON flows;
DROP POLICY IF EXISTS "Users can view own flow nodes" ON flow_nodes;
DROP POLICY IF EXISTS "Users can insert own flow nodes" ON flow_nodes;
DROP POLICY IF EXISTS "Users can update own flow nodes" ON flow_nodes;
DROP POLICY IF EXISTS "Users can delete own flow nodes" ON flow_nodes;
DROP POLICY IF EXISTS "Anon can read flow nodes" ON flow_nodes;
DROP POLICY IF EXISTS "Users can view own webhook logs" ON webhook_log;
DROP POLICY IF EXISTS "Anon can insert webhook logs" ON webhook_log;
DROP POLICY IF EXISTS "Anon can read webhook logs" ON webhook_log;

DROP TABLE IF EXISTS webhook_log CASCADE;
DROP TABLE IF EXISTS flow_nodes CASCADE;
DROP TABLE IF EXISTS flows CASCADE;

-- Table: flows (each flow belongs to a bot)
CREATE TABLE IF NOT EXISTS flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Novo Fluxo',
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'pausado')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: flow_nodes (each node belongs to a flow)
CREATE TABLE IF NOT EXISTS flow_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flow_id UUID NOT NULL REFERENCES flows(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('trigger', 'message', 'delay', 'condition', 'payment', 'action')),
  label TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table: webhook_log (logs de mensagens processadas pelo webhook)
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_flows_bot_id ON flows(bot_id);
CREATE INDEX IF NOT EXISTS idx_flows_user_id ON flows(user_id);
CREATE INDEX IF NOT EXISTS idx_flow_nodes_flow_id ON flow_nodes(flow_id);
CREATE INDEX IF NOT EXISTS idx_flow_nodes_position ON flow_nodes(flow_id, position);
CREATE INDEX IF NOT EXISTS idx_webhook_log_bot_id ON webhook_log(bot_id);
CREATE INDEX IF NOT EXISTS idx_webhook_log_chat_id ON webhook_log(chat_id);

-- ============================================
-- RLS Policies
-- ============================================

-- Enable RLS
ALTER TABLE flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE flow_nodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_log ENABLE ROW LEVEL SECURITY;

-- ---- Flows ----
-- Dashboard access (authenticated users - their own flows)
CREATE POLICY "Users can view own flows" ON flows
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own flows" ON flows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own flows" ON flows
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own flows" ON flows
  FOR DELETE USING (auth.uid() = user_id);

-- Webhook access (anon role can SELECT flows via bot_id for webhook processing)
CREATE POLICY "Anon can read flows by bot_id" ON flows
  FOR SELECT TO anon USING (true);

-- ---- Flow Nodes ----
-- Dashboard access (authenticated users)
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

-- Webhook access (anon role can SELECT flow_nodes for webhook processing)
CREATE POLICY "Anon can read flow nodes" ON flow_nodes
  FOR SELECT TO anon USING (true);

-- ---- Webhook Log ----
-- Dashboard can view logs
CREATE POLICY "Users can view own webhook logs" ON webhook_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM bots WHERE bots.id = webhook_log.bot_id AND bots.user_id = auth.uid())
  );

-- Webhook can insert logs (anon)
CREATE POLICY "Anon can insert webhook logs" ON webhook_log
  FOR INSERT TO anon WITH CHECK (true);

-- Anon can also read (for dashboard if needed without auth)
CREATE POLICY "Anon can read webhook logs" ON webhook_log
  FOR SELECT TO anon USING (true);

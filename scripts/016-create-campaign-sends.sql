-- Tabela para rastrear envios de campanha por usuario
CREATE TABLE IF NOT EXISTS campaign_sends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  campaign_node_id UUID NOT NULL REFERENCES campaign_nodes(id) ON DELETE CASCADE,
  bot_user_id UUID NOT NULL,
  telegram_user_id BIGINT NOT NULL,
  chat_id BIGINT NOT NULL,
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'failed')),
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campaign_sends_campaign ON campaign_sends(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_user ON campaign_sends(bot_user_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_node ON campaign_sends(campaign_node_id);
CREATE INDEX IF NOT EXISTS idx_campaign_sends_unique ON campaign_sends(campaign_id, campaign_node_id, bot_user_id);

-- Tabela para rastrear posicao de cada usuario na campanha
CREATE TABLE IF NOT EXISTS campaign_user_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  bot_user_id UUID NOT NULL,
  telegram_user_id BIGINT NOT NULL,
  chat_id BIGINT NOT NULL,
  current_node_position INTEGER NOT NULL DEFAULT 0,
  next_send_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, bot_user_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_user_state_campaign ON campaign_user_state(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_user_state_next ON campaign_user_state(next_send_at) WHERE status = 'active';

-- RLS
ALTER TABLE campaign_sends ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_user_state ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campaign_sends' AND policyname = 'campaign_sends_all_policy') THEN
    CREATE POLICY campaign_sends_all_policy ON campaign_sends USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campaign_user_state' AND policyname = 'campaign_user_state_all_policy') THEN
    CREATE POLICY campaign_user_state_all_policy ON campaign_user_state USING (true) WITH CHECK (true);
  END IF;
END $$;

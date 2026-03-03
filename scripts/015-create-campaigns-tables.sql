-- Tabela de campanhas de remarketing
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id UUID NOT NULL REFERENCES bots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'ativa', 'pausada', 'concluida')),
  campaign_type TEXT NOT NULL DEFAULT 'basic' CHECK (campaign_type IN ('basic', 'complete')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabela de nodes da campanha (mensagem ou delay)
CREATE TABLE IF NOT EXISTS campaign_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('message', 'delay')),
  label TEXT NOT NULL DEFAULT '',
  config JSONB NOT NULL DEFAULT '{}',
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campaigns_bot_id ON campaigns(bot_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaign_nodes_campaign_id ON campaign_nodes(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_nodes_position ON campaign_nodes(campaign_id, position);

-- RLS
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_nodes ENABLE ROW LEVEL SECURITY;

-- Policies para campaigns
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campaigns' AND policyname = 'campaigns_select_policy') THEN
    CREATE POLICY campaigns_select_policy ON campaigns FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campaigns' AND policyname = 'campaigns_insert_policy') THEN
    CREATE POLICY campaigns_insert_policy ON campaigns FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campaigns' AND policyname = 'campaigns_update_policy') THEN
    CREATE POLICY campaigns_update_policy ON campaigns FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campaigns' AND policyname = 'campaigns_delete_policy') THEN
    CREATE POLICY campaigns_delete_policy ON campaigns FOR DELETE USING (true);
  END IF;
END $$;

-- Policies para campaign_nodes
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campaign_nodes' AND policyname = 'campaign_nodes_select_policy') THEN
    CREATE POLICY campaign_nodes_select_policy ON campaign_nodes FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campaign_nodes' AND policyname = 'campaign_nodes_insert_policy') THEN
    CREATE POLICY campaign_nodes_insert_policy ON campaign_nodes FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campaign_nodes' AND policyname = 'campaign_nodes_update_policy') THEN
    CREATE POLICY campaign_nodes_update_policy ON campaign_nodes FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campaign_nodes' AND policyname = 'campaign_nodes_delete_policy') THEN
    CREATE POLICY campaign_nodes_delete_policy ON campaign_nodes FOR DELETE USING (true);
  END IF;
END $$;

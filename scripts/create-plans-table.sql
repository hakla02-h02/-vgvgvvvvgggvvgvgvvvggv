-- Tabela de planos de cobranca
CREATE TABLE IF NOT EXISTS payment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_payment_plans_user_id ON payment_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_plans_bot_id ON payment_plans(bot_id);

-- RLS
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own plans" ON payment_plans
  FOR ALL USING (user_id = auth.uid()::uuid);

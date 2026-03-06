-- Criar tabela payment_plans que estava faltando
CREATE TABLE IF NOT EXISTS payment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
  button_name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  gateway TEXT DEFAULT 'mercadopago',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_payment_plans_user_id ON payment_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_plans_bot_id ON payment_plans(bot_id);

-- Habilitar RLS
ALTER TABLE payment_plans ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view own payment plans" ON payment_plans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payment plans" ON payment_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payment plans" ON payment_plans
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own payment plans" ON payment_plans
  FOR DELETE USING (auth.uid() = user_id);

-- Permitir acesso via service role (para webhooks)
CREATE POLICY "Service role full access to payment_plans" ON payment_plans
  FOR ALL USING (true) WITH CHECK (true);

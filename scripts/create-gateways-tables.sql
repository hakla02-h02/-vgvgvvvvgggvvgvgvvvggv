-- Tabela para armazenar os gateways conectados pelos usuarios
CREATE TABLE IF NOT EXISTS user_gateways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bot_id UUID REFERENCES bots(id) ON DELETE CASCADE,
  gateway_name TEXT NOT NULL,
  access_token TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, bot_id, gateway_name)
);

-- Tabela para armazenar os pagamentos gerados
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bot_id UUID REFERENCES bots(id) ON DELETE SET NULL,
  telegram_user_id TEXT,
  gateway TEXT NOT NULL,
  external_payment_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  qr_code TEXT,
  qr_code_url TEXT,
  copy_paste TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices para performance
CREATE INDEX IF NOT EXISTS idx_user_gateways_user_id ON user_gateways(user_id);
CREATE INDEX IF NOT EXISTS idx_user_gateways_bot_id ON user_gateways(bot_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_bot_id ON payments(bot_id);
CREATE INDEX IF NOT EXISTS idx_payments_external_id ON payments(external_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- RLS policies
ALTER TABLE user_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Usuarios podem ver/editar apenas seus proprios gateways
CREATE POLICY "Users can view own gateways" ON user_gateways
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own gateways" ON user_gateways
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own gateways" ON user_gateways
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own gateways" ON user_gateways
  FOR DELETE USING (auth.uid() = user_id);

-- Usuarios podem ver/editar apenas seus proprios pagamentos
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" ON payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own payments" ON payments
  FOR UPDATE USING (auth.uid() = user_id);

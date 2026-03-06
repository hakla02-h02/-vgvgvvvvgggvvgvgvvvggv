-- Verifica se a tabela user_gateways existe e corrige as politicas RLS

-- Recria a tabela se nao existir
CREATE TABLE IF NOT EXISTS user_gateways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bot_id UUID REFERENCES bots(id) ON DELETE SET NULL,
  gateway_name VARCHAR(100) NOT NULL,
  access_token TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cria indices
CREATE INDEX IF NOT EXISTS idx_user_gateways_user_id ON user_gateways(user_id);
CREATE INDEX IF NOT EXISTS idx_user_gateways_bot_id ON user_gateways(bot_id);

-- Remove politicas antigas se existirem
DROP POLICY IF EXISTS "Users can view their own gateways" ON user_gateways;
DROP POLICY IF EXISTS "Users can create their own gateways" ON user_gateways;
DROP POLICY IF EXISTS "Users can update their own gateways" ON user_gateways;
DROP POLICY IF EXISTS "Users can delete their own gateways" ON user_gateways;
DROP POLICY IF EXISTS "Service role can do anything" ON user_gateways;

-- Habilita RLS
ALTER TABLE user_gateways ENABLE ROW LEVEL SECURITY;

-- Cria politicas novas
CREATE POLICY "Users can view their own gateways" ON user_gateways 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own gateways" ON user_gateways 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own gateways" ON user_gateways 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gateways" ON user_gateways 
  FOR DELETE USING (auth.uid() = user_id);

-- Permite acesso total para service role (para webhooks e APIs)
CREATE POLICY "Service role bypass" ON user_gateways 
  FOR ALL USING (auth.role() = 'service_role');

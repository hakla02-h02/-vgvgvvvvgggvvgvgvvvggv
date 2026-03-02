-- Adiciona contador de restarts na tabela user_flow_state
ALTER TABLE user_flow_state 
ADD COLUMN IF NOT EXISTS restart_count INTEGER NOT NULL DEFAULT 0;

-- ============================================
-- Fix flow_nodes type CHECK constraint to include 'redirect'
-- Fix flows table to ensure category and is_primary columns exist
-- ============================================

-- 1) Drop the old CHECK constraint on flow_nodes.type and recreate with 'redirect'
ALTER TABLE flow_nodes DROP CONSTRAINT IF EXISTS flow_nodes_type_check;
ALTER TABLE flow_nodes ADD CONSTRAINT flow_nodes_type_check 
  CHECK (type IN ('trigger', 'message', 'delay', 'condition', 'payment', 'action', 'redirect'));

-- 2) Ensure flows has category and is_primary (idempotent)
ALTER TABLE flows ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'personalizado';
ALTER TABLE flows ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;

-- 3) If no flow is marked primary per bot, mark the earliest one
UPDATE flows f
SET is_primary = true, category = 'inicial'
WHERE f.id = (
  SELECT id FROM flows
  WHERE bot_id = f.bot_id
  ORDER BY created_at ASC
  LIMIT 1
)
AND NOT EXISTS (
  SELECT 1 FROM flows f2
  WHERE f2.bot_id = f.bot_id AND f2.is_primary = true
);

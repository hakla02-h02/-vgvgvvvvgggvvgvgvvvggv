-- Add category and is_primary columns to flows table
ALTER TABLE flows ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'personalizado';
ALTER TABLE flows ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT false;

-- Set the first flow per bot as primary (if none is set)
UPDATE flows f
SET is_primary = true, category = 'inicial'
WHERE f.id = (
  SELECT id FROM flows
  WHERE bot_id = f.bot_id AND user_id = f.user_id
  ORDER BY created_at ASC
  LIMIT 1
)
AND NOT EXISTS (
  SELECT 1 FROM flows f2
  WHERE f2.bot_id = f.bot_id AND f2.user_id = f.user_id AND f2.is_primary = true
);

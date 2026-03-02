-- Add flow_type column to flows table
-- Values: 'basico' (simple, single message) or 'completo' (full editor with steps)

ALTER TABLE flows 
ADD COLUMN IF NOT EXISTS flow_type TEXT NOT NULL DEFAULT 'completo' 
CHECK (flow_type IN ('basico', 'completo'));

-- Add index for filtering by flow_type
CREATE INDEX IF NOT EXISTS idx_flows_flow_type ON flows(flow_type);

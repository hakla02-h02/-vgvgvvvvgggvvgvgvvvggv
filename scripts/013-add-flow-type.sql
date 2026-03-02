-- Add flow_type column to flows table
-- Values: 'basic' (simple, single message) or 'complete' (full editor with steps)

ALTER TABLE flows 
ADD COLUMN IF NOT EXISTS flow_type TEXT NOT NULL DEFAULT 'complete' 
CHECK (flow_type IN ('basic', 'complete'));

-- Add index for filtering by flow_type
CREATE INDEX IF NOT EXISTS idx_flows_flow_type ON flows(flow_type);

-- Dragon Bio Sites Table
CREATE TABLE IF NOT EXISTS dragon_bio_sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  template VARCHAR(50) DEFAULT 'minimal',
  
  -- Profile data
  profile_name VARCHAR(255),
  profile_bio TEXT,
  profile_image TEXT,
  
  -- Theme/colors
  primary_color VARCHAR(20) DEFAULT '#8b5cf6',
  secondary_color VARCHAR(20) DEFAULT '#0f172a',
  text_color VARCHAR(20) DEFAULT '#ffffff',
  
  -- Stats
  views INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dragon Bio Links Table
CREATE TABLE IF NOT EXISTS dragon_bio_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES dragon_bio_sites(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  icon VARCHAR(50),
  position INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_dragon_bio_sites_user_id ON dragon_bio_sites(user_id);
CREATE INDEX IF NOT EXISTS idx_dragon_bio_sites_slug ON dragon_bio_sites(slug);
CREATE INDEX IF NOT EXISTS idx_dragon_bio_links_site_id ON dragon_bio_links(site_id);

-- RLS Policies
ALTER TABLE dragon_bio_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE dragon_bio_links ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (you can restrict later)
DROP POLICY IF EXISTS "Allow all dragon_bio_sites" ON dragon_bio_sites;
CREATE POLICY "Allow all dragon_bio_sites" ON dragon_bio_sites FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all dragon_bio_links" ON dragon_bio_links;
CREATE POLICY "Allow all dragon_bio_links" ON dragon_bio_links FOR ALL USING (true) WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_dragon_bio_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
DROP TRIGGER IF EXISTS dragon_bio_sites_updated_at ON dragon_bio_sites;
CREATE TRIGGER dragon_bio_sites_updated_at
  BEFORE UPDATE ON dragon_bio_sites
  FOR EACH ROW
  EXECUTE FUNCTION update_dragon_bio_updated_at();

DROP TRIGGER IF EXISTS dragon_bio_links_updated_at ON dragon_bio_links;
CREATE TRIGGER dragon_bio_links_updated_at
  BEFORE UPDATE ON dragon_bio_links
  FOR EACH ROW
  EXECUTE FUNCTION update_dragon_bio_updated_at();

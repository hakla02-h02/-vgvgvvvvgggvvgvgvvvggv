-- ============================================
-- Fix Storage RLS for flow-media bucket
-- ============================================

-- 1) Ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('flow-media', 'flow-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2) Drop ALL existing policies on storage.objects for this bucket to avoid conflicts
DROP POLICY IF EXISTS "flow-media read" ON storage.objects;
DROP POLICY IF EXISTS "flow-media insert" ON storage.objects;
DROP POLICY IF EXISTS "flow-media delete" ON storage.objects;
DROP POLICY IF EXISTS "flow-media update" ON storage.objects;
DROP POLICY IF EXISTS "flow-media-read" ON storage.objects;
DROP POLICY IF EXISTS "flow-media-insert" ON storage.objects;
DROP POLICY IF EXISTS "flow-media-delete" ON storage.objects;
DROP POLICY IF EXISTS "flow-media-update" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read flow-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public insert flow-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public delete flow-media" ON storage.objects;
DROP POLICY IF EXISTS "Allow public update flow-media" ON storage.objects;

-- 3) Create fresh policies allowing all operations for anon and authenticated on flow-media bucket
CREATE POLICY "Allow public read flow-media"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'flow-media');

CREATE POLICY "Allow public insert flow-media"
  ON storage.objects FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'flow-media');

CREATE POLICY "Allow public update flow-media"
  ON storage.objects FOR UPDATE
  TO public
  USING (bucket_id = 'flow-media')
  WITH CHECK (bucket_id = 'flow-media');

CREATE POLICY "Allow public delete flow-media"
  ON storage.objects FOR DELETE
  TO public
  USING (bucket_id = 'flow-media');

-- Ensure the bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('flow-media', 'flow-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop all existing policies for flow-media to avoid conflicts
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'objects' AND schemaname = 'storage'
      AND policyname LIKE '%flow-media%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END$$;

-- Allow anyone to read files from flow-media
CREATE POLICY "flow-media-read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'flow-media');

-- Allow anyone to insert files into flow-media
CREATE POLICY "flow-media-insert" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'flow-media');

-- Allow anyone to update files in flow-media (needed for upsert)
CREATE POLICY "flow-media-update" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'flow-media')
  WITH CHECK (bucket_id = 'flow-media');

-- Allow anyone to delete files from flow-media
CREATE POLICY "flow-media-delete" ON storage.objects
  FOR DELETE TO anon, authenticated
  USING (bucket_id = 'flow-media');

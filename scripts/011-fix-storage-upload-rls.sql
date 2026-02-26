-- ============================================
-- Fix: Allow anon uploads to flow-media bucket
-- ============================================

-- 1) Ensure bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('flow-media', 'flow-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2) Drop ALL existing policies on storage.objects for flow-media to start clean
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE tablename = 'objects' AND schemaname = 'storage'
  LOOP
    -- Only drop policies that reference flow-media
    BEGIN
      EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;
  END LOOP;
END$$;

-- 3) Recreate clean policies - allow ALL operations for anon and authenticated
-- SELECT (read/download files)
CREATE POLICY "Allow public read flow-media"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'flow-media');

-- INSERT (upload new files)
CREATE POLICY "Allow public upload flow-media"
  ON storage.objects FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'flow-media');

-- UPDATE (overwrite files)
CREATE POLICY "Allow public update flow-media"
  ON storage.objects FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'flow-media')
  WITH CHECK (bucket_id = 'flow-media');

-- DELETE (remove files)
CREATE POLICY "Allow public delete flow-media"
  ON storage.objects FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'flow-media');

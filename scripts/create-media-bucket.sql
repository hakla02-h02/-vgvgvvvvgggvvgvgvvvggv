-- Create a public storage bucket for flow media (photos/videos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'flow-media',
  'flow-media',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];

-- Allow anyone to read files (public bucket)
CREATE POLICY IF NOT EXISTS "Public read access for flow-media"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'flow-media');

-- Allow authenticated users to upload files
CREATE POLICY IF NOT EXISTS "Authenticated upload for flow-media"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'flow-media');

-- Allow authenticated users to delete their files
CREATE POLICY IF NOT EXISTS "Authenticated delete for flow-media"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'flow-media');

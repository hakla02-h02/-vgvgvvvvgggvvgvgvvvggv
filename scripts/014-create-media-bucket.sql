-- Create media bucket for file uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to media files
CREATE POLICY IF NOT EXISTS "Public read access for media"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Allow authenticated uploads (via service role)
CREATE POLICY IF NOT EXISTS "Service role can upload media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'media');

-- Allow service role to delete media
CREATE POLICY IF NOT EXISTS "Service role can delete media"
ON storage.objects FOR DELETE
USING (bucket_id = 'media');

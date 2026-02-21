INSERT INTO storage.buckets (id, name, public)
VALUES ('flow-media', 'flow-media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "flow-media read" ON storage.objects FOR SELECT TO public USING (bucket_id = 'flow-media');
CREATE POLICY "flow-media insert" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'flow-media');
CREATE POLICY "flow-media delete" ON storage.objects FOR DELETE TO public USING (bucket_id = 'flow-media');

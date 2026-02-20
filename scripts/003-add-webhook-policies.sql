-- ============================================
-- Add anon read policy to bots table for webhook processing
-- The webhook needs to look up bots by token to process incoming messages
-- ============================================

-- Allow anon role to read bots (needed for webhook to find bot by token)
CREATE POLICY "Anon can read bots for webhook" ON public.bots
  FOR SELECT TO anon USING (true);

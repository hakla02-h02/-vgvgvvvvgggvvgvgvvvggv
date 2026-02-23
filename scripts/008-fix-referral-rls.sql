-- Fix RLS policies on referral_coupons and referrals tables
-- The API routes use the anon key, so policies must allow anon role operations

-- Drop ALL existing policies on referral_coupons (both original and any partial anon ones)
DROP POLICY IF EXISTS "Users can view their own coupons" ON referral_coupons;
DROP POLICY IF EXISTS "Users can create their own coupons" ON referral_coupons;
DROP POLICY IF EXISTS "Anyone can validate a coupon" ON referral_coupons;
DROP POLICY IF EXISTS "Anon can read referral coupons" ON referral_coupons;
DROP POLICY IF EXISTS "Anon can insert referral coupons" ON referral_coupons;
DROP POLICY IF EXISTS "Anon can update referral coupons" ON referral_coupons;

-- Drop ALL existing policies on referrals
DROP POLICY IF EXISTS "Users can view referrals they made" ON referrals;
DROP POLICY IF EXISTS "Authenticated users can create referrals" ON referrals;
DROP POLICY IF EXISTS "Anon can read referrals" ON referrals;
DROP POLICY IF EXISTS "Anon can insert referrals" ON referrals;

-- Re-create anon-friendly policies for referral_coupons
CREATE POLICY "Allow all select on referral_coupons" ON referral_coupons
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow all insert on referral_coupons" ON referral_coupons
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow all update on referral_coupons" ON referral_coupons
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all delete on referral_coupons" ON referral_coupons
  FOR DELETE TO anon, authenticated USING (true);

-- Re-create anon-friendly policies for referrals
CREATE POLICY "Allow all select on referrals" ON referrals
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow all insert on referrals" ON referrals
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow all update on referrals" ON referrals
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all delete on referrals" ON referrals
  FOR DELETE TO anon, authenticated USING (true);

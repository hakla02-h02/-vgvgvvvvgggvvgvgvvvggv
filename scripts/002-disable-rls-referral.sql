-- Fix RLS policies on referral tables to allow anon key operations
-- (matches the pattern used by users, bots, bot_users tables in this project)

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view their own coupons" ON referral_coupons;
DROP POLICY IF EXISTS "Users can create their own coupons" ON referral_coupons;
DROP POLICY IF EXISTS "Anyone can validate a coupon" ON referral_coupons;
DROP POLICY IF EXISTS "Users can view referrals they made" ON referrals;
DROP POLICY IF EXISTS "Authenticated users can create referrals" ON referrals;

-- Add anon-friendly policies for referral_coupons
CREATE POLICY "Anon can read referral coupons" ON referral_coupons
  FOR SELECT TO anon USING (true);

CREATE POLICY "Anon can insert referral coupons" ON referral_coupons
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Anon can update referral coupons" ON referral_coupons
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- Add anon-friendly policies for referrals
CREATE POLICY "Anon can read referrals" ON referrals
  FOR SELECT TO anon USING (true);

CREATE POLICY "Anon can insert referrals" ON referrals
  FOR INSERT TO anon WITH CHECK (true);

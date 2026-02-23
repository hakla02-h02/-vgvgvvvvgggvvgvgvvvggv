-- Disable RLS on referral tables since API routes handle auth via userId parameter
-- (matches the pattern used by the users table in this project)

ALTER TABLE referral_coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE referrals DISABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies (they use auth.uid() which doesn't work with anon key on server)
DROP POLICY IF EXISTS "Users can view their own coupons" ON referral_coupons;
DROP POLICY IF EXISTS "Users can create their own coupons" ON referral_coupons;
DROP POLICY IF EXISTS "Anyone can validate a coupon" ON referral_coupons;
DROP POLICY IF EXISTS "Users can view referrals they made" ON referrals;
DROP POLICY IF EXISTS "Authenticated users can create referrals" ON referrals;

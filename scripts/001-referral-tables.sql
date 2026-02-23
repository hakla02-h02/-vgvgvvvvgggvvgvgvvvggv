-- Create referral_coupons table
CREATE TABLE IF NOT EXISTS referral_coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coupon_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT coupon_code_lowercase CHECK (coupon_code = LOWER(coupon_code))
);

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coupon_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_referred UNIQUE (referred_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_referral_coupons_user_id ON referral_coupons(user_id);
CREATE INDEX IF NOT EXISTS idx_referral_coupons_code ON referral_coupons(coupon_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);

-- Enable RLS
ALTER TABLE referral_coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_coupons
CREATE POLICY "Users can view their own coupons"
  ON referral_coupons FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own coupons"
  ON referral_coupons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can validate a coupon"
  ON referral_coupons FOR SELECT
  USING (true);

-- RLS Policies for referrals
CREATE POLICY "Users can view referrals they made"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Authenticated users can create referrals"
  ON referrals FOR INSERT
  WITH CHECK (auth.uid() = referred_id);

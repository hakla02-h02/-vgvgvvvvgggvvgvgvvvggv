-- Create a SECURITY DEFINER function to insert referrals bypassing RLS
-- This is called from the server-side API route after user registration

CREATE OR REPLACE FUNCTION track_referral(
  p_referrer_id UUID,
  p_referred_id UUID,
  p_coupon_code TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO referrals (referrer_id, referred_id, coupon_code)
  VALUES (p_referrer_id, p_referred_id, p_coupon_code);
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION track_referral(UUID, UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION track_referral(UUID, UUID, TEXT) TO authenticated;

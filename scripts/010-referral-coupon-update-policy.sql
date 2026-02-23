-- Allow users to update their own coupons
CREATE POLICY "Users can update their own coupons"
  ON referral_coupons FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

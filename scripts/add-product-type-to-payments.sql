-- Migration: Add product_type column to payments table
-- This column tracks the type of product being purchased:
-- - main_product: The original product
-- - order_bump: An additional product offered during checkout
-- - upsell: A higher-value product offered after payment approval
-- - downsell: A lower-value product offered when upsell is declined

ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'main_product';

-- Add comment for documentation
COMMENT ON COLUMN payments.product_type IS 'Type of product: main_product, order_bump, upsell, downsell';

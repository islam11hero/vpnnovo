-- Wallet credits, Stripe session tracking, payment provider label
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS wallet_balance_usd numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_provider text,
  ADD COLUMN IF NOT EXISTS stripe_session_id text;

CREATE INDEX IF NOT EXISTS idx_orders_stripe_session_id ON orders (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders (status, created_at DESC);

-- Create boosts table for US-001: Offer Boost Feature
-- Supports Stripe and Mercado Pago payment tracking

CREATE TABLE boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL,
  user_id UUID NOT NULL,
  payment_id VARCHAR(255) NOT NULL, -- Stripe or Mercado Pago transaction ID
  amount DECIMAL(10, 2) NOT NULL, -- Amount in USD cents (0.01 = $0.01)
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, completed, failed, refunded
  payment_method VARCHAR(50) NOT NULL, -- stripe or mercado_pago
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP + INTERVAL '7 days'),
  
  -- Optional: store payment metadata
  stripe_payment_intent_id VARCHAR(255),
  mercado_pago_preference_id VARCHAR(255),
  mercado_pago_payment_id VARCHAR(255),
  
  -- Error tracking
  error_message TEXT CHECK (length(error_message) <= 500),
  retry_count INT DEFAULT 0,
  
  CONSTRAINT boosts_offer_id_fk FOREIGN KEY (offer_id) REFERENCES offers(id) ON DELETE CASCADE,
  CONSTRAINT boosts_user_id_fk FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_boosts_offer_id_created_at ON boosts(offer_id, created_at DESC);
CREATE INDEX idx_boosts_user_id_created_at ON boosts(user_id, created_at DESC);
CREATE INDEX idx_boosts_status ON boosts(status);
CREATE INDEX idx_boosts_expires_at ON boosts(expires_at);
CREATE INDEX idx_boosts_payment_id ON boosts(payment_id);

-- Add RLS (Row Level Security) if needed
ALTER TABLE boosts ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only view boosts for their own offers or see boosts of other offers (public visibility)
CREATE POLICY "Users can view all boosts" ON boosts
  FOR SELECT
  USING (true);

-- RLS Policy: Users can only create boosts for offers they own (via auth context)
CREATE POLICY "Users can create boosts for their offers" ON boosts
  FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM offers
      WHERE id = offer_id AND user_id = auth.uid()
    )
  );

-- Create trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_boosts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER boosts_update_updated_at
BEFORE UPDATE ON boosts
FOR EACH ROW
EXECUTE FUNCTION update_boosts_updated_at();

-- Create function to mark boosts as expired
CREATE OR REPLACE FUNCTION mark_expired_boosts()
RETURNS void AS $$
BEGIN
  UPDATE boosts
  SET status = 'expired'
  WHERE status = 'completed' AND expires_at <= CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

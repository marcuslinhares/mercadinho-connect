-- Create offers table for Mercadinho Connect
-- Each offer represents a product promotion by a store

CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  category VARCHAR(100) DEFAULT 'geral',
  photo_url TEXT,
  active BOOLEAN DEFAULT true,
  expires_at TIMESTAMP WITH TIME ZONE,
  views INT DEFAULT 0,
  clicks INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_offers_user_id ON offers(user_id);
CREATE INDEX idx_offers_category ON offers(category);
CREATE INDEX idx_offers_active ON offers(active);
CREATE INDEX idx_offers_created_at ON offers(created_at DESC);

-- Row Level Security
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;

-- Anyone can read active offers
CREATE POLICY "Anyone can view active offers" ON offers
  FOR SELECT
  USING (active = true OR auth.uid() = user_id);

-- Authenticated users can create offers
CREATE POLICY "Users can create offers" ON offers
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own offers
CREATE POLICY "Users can update own offers" ON offers
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own offers
CREATE POLICY "Users can delete own offers" ON offers
  FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_offers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER offers_update_updated_at
BEFORE UPDATE ON offers
FOR EACH ROW
EXECUTE FUNCTION update_offers_updated_at();

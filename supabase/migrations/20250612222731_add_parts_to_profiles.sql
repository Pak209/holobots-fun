-- Add parts field to profiles table to store user's owned parts
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS parts JSONB DEFAULT '[]'::jsonb;

-- Add gacha_tickets field to profiles table for booster pack system
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS gacha_tickets INTEGER DEFAULT 0;

-- Add equipped_parts column to profiles table for storing equipped parts per holobot
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS equipped_parts JSONB DEFAULT '{}'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN profiles.parts IS 'JSON array storing user''s owned holobot parts with their properties';
COMMENT ON COLUMN profiles.gacha_tickets IS 'Number of gacha tickets available for opening booster packs';

-- Add pack_history column to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS pack_history JSONB DEFAULT '[]'::jsonb;

-- Create an index on pack_history for efficient queries
CREATE INDEX IF NOT EXISTS idx_profiles_pack_history 
ON profiles USING GIN (pack_history);

-- Add a comment to describe the column
COMMENT ON COLUMN profiles.pack_history IS 'Stores array of BoosterPackResult objects containing pack opening history'; 
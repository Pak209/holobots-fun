-- Apply parts and equipped parts migration
-- Run this in your Supabase SQL editor

-- Add parts column to profiles table for storing holobot parts
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS parts JSONB DEFAULT '[]'::jsonb;

-- Add equipped_parts column to profiles table for storing equipped parts per holobot
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS equipped_parts JSONB DEFAULT '{}'::jsonb;

-- Verify the columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name IN ('parts', 'equipped_parts'); 
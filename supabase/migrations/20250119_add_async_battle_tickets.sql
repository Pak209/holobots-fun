-- Add async battle ticket fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS async_battle_tickets INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS last_async_ticket_refresh TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create an index on last_async_ticket_refresh for efficient daily refresh queries
CREATE INDEX IF NOT EXISTS idx_profiles_async_ticket_refresh 
ON profiles(last_async_ticket_refresh);

-- Update existing users to have 3 default tickets
UPDATE profiles 
SET async_battle_tickets = 3, 
    last_async_ticket_refresh = NOW() 
WHERE async_battle_tickets IS NULL; 
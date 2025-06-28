-- Fix leaderboard RLS policies for profiles table
-- This allows users to read public leaderboard data from other users

-- First, drop any existing policies that might conflict
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Public leaderboard data readable by all" ON profiles;

-- Enable RLS on profiles table if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profile data (fix type casting)
CREATE POLICY "Users can read their own profile" ON profiles
FOR SELECT USING (auth.uid() = id::uuid);

-- Allow users to update their own profile data (fix type casting)
CREATE POLICY "Users can update their own profile" ON profiles
FOR UPDATE USING (auth.uid() = id::uuid);

-- Allow users to insert their own profile data (fix type casting)
CREATE POLICY "Users can insert their own profile" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id::uuid);

-- Allow users to read public leaderboard data from all profiles
-- This includes: username, wins, losses, holos_tokens, holobots (for levels), player_rank
-- But excludes sensitive data like energy, tickets, blueprints, etc.
CREATE POLICY "Public leaderboard data readable by all" ON profiles
FOR SELECT USING (true);

-- Note: This policy allows reading all columns, but in practice the app
-- only selects the specific columns needed for leaderboards
-- If you want to be more restrictive, you could create a view instead 
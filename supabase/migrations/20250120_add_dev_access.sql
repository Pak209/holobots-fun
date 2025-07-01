-- Add dev access field to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_dev_account BOOLEAN DEFAULT FALSE;

-- Add comment for documentation
COMMENT ON COLUMN profiles.is_dev_account IS 'Boolean flag to enable dev access for testing features like Sync Points';

-- Manually set pak209 as dev account (update this with the actual user ID once they sign up)
-- You'll need to run this command manually after pak209 creates their account:
-- UPDATE profiles SET is_dev_account = TRUE WHERE username = 'pak209' OR id = 'USER_ID_HERE';

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_profiles_dev_account ON profiles(is_dev_account) WHERE is_dev_account = TRUE; 
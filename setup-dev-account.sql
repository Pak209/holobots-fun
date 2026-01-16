-- Manual setup for dev account access
-- Run this on your Supabase database after pak209 creates their account

-- First, find the user ID for pak209
-- SELECT id, username, email FROM profiles WHERE username = 'pak209' OR email = 'dkimoto@yahoo.com';

-- Then update their profile to enable dev access
-- UPDATE profiles 
-- SET is_dev_account = TRUE 
-- WHERE username = 'pak209' OR email = 'dkimoto@yahoo.com';

-- Alternative: If you know the exact user ID, use this instead:
-- UPDATE profiles 
-- SET is_dev_account = TRUE 
-- WHERE id = 'REPLACE_WITH_ACTUAL_USER_ID';

-- Verify the change
-- SELECT id, username, email, is_dev_account FROM profiles WHERE is_dev_account = TRUE; 
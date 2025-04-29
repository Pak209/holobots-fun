-- Enable RLS
ALTER TABLE web3_users ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert
CREATE POLICY "Anyone can insert users" ON web3_users
FOR INSERT WITH CHECK (true);

-- Allow users to read their own data
CREATE POLICY "Users can read their own data" ON web3_users
FOR SELECT USING (wallet_address = current_user);

-- Allow users to update their own data
CREATE POLICY "Users can update their own data" ON web3_users
FOR UPDATE USING (wallet_address = current_user);
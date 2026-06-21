-- AI Course Tracker - Supabase Database Schema
-- Run this in Supabase SQL Editor to create the user_profiles table

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index on updated_at for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_updated_at ON user_profiles(updated_at DESC);

-- Create index on user_id for faster lookups (already covered by PRIMARY KEY but explicit)
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow all operations" ON user_profiles;

-- Create policy to allow all operations
-- Note: We use service_role key in the app which bypasses RLS
-- But we set a permissive policy for anon key usage if needed
CREATE POLICY "Allow all operations" ON user_profiles
  FOR ALL
  TO authenticated, anon
  USING (true)
  WITH CHECK (true);

-- Add helpful comments
COMMENT ON TABLE user_profiles IS 'Stores user progress data and learning statistics for AI course tracker';
COMMENT ON COLUMN user_profiles.user_id IS 'Unique username (sanitized)';
COMMENT ON COLUMN user_profiles.data IS 'Full user profile stored as JSONB including progress, phases, schedule, and statistics';
COMMENT ON COLUMN user_profiles.created_at IS 'Timestamp when user profile was first created';
COMMENT ON COLUMN user_profiles.updated_at IS 'Timestamp of last profile update';

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row update
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify table was created successfully
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Display success message
DO $$
BEGIN
  RAISE NOTICE 'Table user_profiles created successfully!';
  RAISE NOTICE 'You can now configure your environment variables and start using the app.';
END $$;

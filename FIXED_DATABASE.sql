-- ============================================
-- APKL Database Fix - Resolves RLS & Auth Issues
-- Run this in your Supabase SQL Editor
-- ============================================

-- Step 1: Drop RLS policies on users table
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

-- Step 2: DISABLE RLS on users table (allows auth.users to insert)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Step 3: Drop RLS policies on user_profiles table
DROP POLICY IF EXISTS "Users can view their own profile data" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile data" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile data" ON user_profiles;

-- Step 4: DISABLE RLS on user_profiles table
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Step 5: Create proper RLS policy for student_courses (keep this one)
DROP POLICY IF EXISTS "Students can view their own courses" ON student_courses;
DROP POLICY IF EXISTS "Students can insert own courses" ON student_courses;
DROP POLICY IF EXISTS "Students can update own courses" ON student_courses;
DROP POLICY IF EXISTS "Students can delete own courses" ON student_courses;

-- Keep RLS on student_courses with simpler policies
CREATE POLICY "Students can manage own courses" ON student_courses FOR ALL
  USING (auth.uid() = user_id);

-- Step 6: Enable anon role to insert into users & user_profiles
GRANT INSERT ON users TO anon;
GRANT INSERT ON user_profiles TO anon;
GRANT SELECT ON users TO anon;
GRANT SELECT ON user_profiles TO anon;
GRANT UPDATE ON users TO anon;
GRANT UPDATE ON user_profiles TO anon;

-- Step 7: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_courses_user_id ON student_courses(user_id);

-- ============================================
-- Verification Queries (Run to check)
-- ============================================

-- Check RLS status:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public';

-- Check if this works:
-- SELECT * FROM users LIMIT 1;

# How to Fix the RLS Policy Error

## Problem
Registration is failing with: **"new row violates row-level security policy for table 'users'"**

This happens because:
1. User is successfully created in Supabase Auth ✅
2. But the profile insert is blocked by Row-Level Security (RLS) policies ❌

## Solution: Disable RLS on Users Table (For Development)

### Steps:

1. **Go to Supabase Dashboard:**
   - Open: https://app.supabase.com
   - Select your project: `dftnznkpaiybmchgumgb`

2. **Navigate to the users table:**
   - Go to **SQL Editor** or **Table Editor**
   - Find the **users** table

3. **Disable RLS on the users table:**
   - Click on the **users** table
   - Look for **Row-Level Security (RLS)** toggle
   - Click the toggle to **DISABLE** it
   - Or run this SQL in the SQL Editor:
   ```sql
   ALTER TABLE public."users" DISABLE ROW LEVEL SECURITY;
   ```

## Alternative: Set Up Proper RLS Policies (For Production)

If you want to keep RLS enabled, add this policy:

```sql
-- Allow authenticated users to insert their own profile
CREATE POLICY "Users can create their own profile" ON public."users"
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Allow users to read their own profile
CREATE POLICY "Users can view their own profile" ON public."users"
  FOR SELECT 
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile" ON public."users"
  FOR UPDATE 
  USING (auth.uid() = id);
```

## Test the Fix

After disabling RLS:

1. Start the server:
   ```bash
   node server.js
   ```

2. Try registration again with a valid email (like `test@gmail.com`)

3. Check the server console - you should see:
   - ✅ Auth signup successful
   - ✅ Profile creation successful
   - ✅ Registration complete

## Email Validation Note

Some emails may be rejected by Supabase Auth (like "urur@gmail.com"). If this happens:
- Try a different email address like `test@gmail.com`, `yourname@example.com`, or `admin@test.com`
- This is a Supabase security feature and can vary

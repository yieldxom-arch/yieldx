-- ============================================
-- YieldX Demo Accounts Setup Script
-- ============================================
-- Run this in your Supabase SQL Editor
-- ============================================

-- Step 1: Check if profiles table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    RAISE EXCEPTION 'ERROR: profiles table does not exist. Please create database schema first.';
  END IF;
END $$;

-- Step 2: Insert demo profiles (these will be linked to auth users)
-- NOTE: You must first create the auth users manually in Supabase Auth Dashboard

-- First, let's see if we have any auth users
DO $$
BEGIN
  RAISE NOTICE '=========================================';
  RAISE NOTICE 'STEP 1: Check Auth Users';
  RAISE NOTICE '=========================================';
  RAISE NOTICE 'Run this query to see your auth users:';
  RAISE NOTICE 'SELECT id, email, created_at FROM auth.users;';
  RAISE NOTICE '';
END $$;

-- Step 3: Create demo profiles
-- IMPORTANT: Replace the UUIDs below with actual user IDs from auth.users

-- Example: If your auth.users shows:
-- | id                                   | email                      |
-- | 12345678-1234-1234-1234-123456789012 | demo.teacher@yieldx.com    |
-- | 87654321-4321-4321-4321-210987654321 | demo.student@yieldx.com    |

-- Then use those UUIDs in the INSERT statements below:

/*
INSERT INTO profiles (
  id,
  email,
  full_name,
  role,
  display_name,
  subscription_tier,
  total_xp,
  current_streak,
  total_login_days,
  language,
  theme,
  profile_visibility,
  created_at,
  updated_at
) VALUES
  (
    '12345678-1234-1234-1234-123456789012', -- REPLACE WITH ACTUAL UUID FROM auth.users
    'demo.teacher@yieldx.com',
    'Demo Teacher',
    'lecturer',
    'Teacher Demo',
    'premium',
    0,
    0,
    1,
    'ar',
    'dark',
    'public',
    NOW(),
    NOW()
  ),
  (
    '87654321-4321-4321-4321-210987654321', -- REPLACE WITH ACTUAL UUID FROM auth.users
    'demo.student@yieldx.com',
    'Demo Student',
    'student',
    'Student Demo',
    'free',
    2450,
    5,
    12,
    'ar',
    'dark',
    'public',
    NOW(),
    NOW()
  ),
  (
    'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', -- REPLACE WITH ACTUAL UUID FROM auth.users
    'admin@yieldx.com',
    'System Admin',
    'admin',
    'Admin',
    'enterprise',
    0,
    0,
    0,
    'en',
    'dark',
    'private',
    NOW(),
    NOW()
  )
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  updated_at = NOW();
*/

-- Instructions to follow:
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=========================================';
  RAISE NOTICE 'MANUAL STEPS REQUIRED';
  RAISE NOTICE '=========================================';
  RAISE NOTICE '';
  RAISE NOTICE '1. Go to Authentication > Users in Supabase Dashboard';
  RAISE NOTICE '';
  RAISE NOTICE '2. Click "Add user" > "Create new user"';
  RAISE NOTICE '';
  RAISE NOTICE '3. Create these accounts:';
  RAISE NOTICE '   - Email: demo.teacher@yieldx.com';
  RAISE NOTICE '   - Password: demo123';
  RAISE NOTICE '   - Auto Confirm User: YES';
  RAISE NOTICE '';
  RAISE NOTICE '   - Email: demo.student@yieldx.com';
  RAISE NOTICE '   - Password: demo123';
  RAISE NOTICE '   - Auto Confirm User: YES';
  RAISE NOTICE '';
  RAISE NOTICE '   - Email: admin@yieldx.com';
  RAISE NOTICE '   - Password: admin123';
  RAISE NOTICE '   - Auto Confirm User: YES';
  RAISE NOTICE '';
  RAISE NOTICE '4. After creating auth users, run this query:';
  RAISE NOTICE '   SELECT id, email FROM auth.users;';
  RAISE NOTICE '';
  RAISE NOTICE '5. Copy the user IDs and uncomment the INSERT statement above';
  RAISE NOTICE '';
  RAISE NOTICE '6. Replace the placeholder UUIDs with actual ones';
  RAISE NOTICE '';
  RAISE NOTICE '7. Run the INSERT statement';
  RAISE NOTICE '';
  RAISE NOTICE '=========================================';
END $$;

-- Quick verification query
-- Run this after inserting profiles:
-- SELECT id, email, full_name, role FROM profiles ORDER BY created_at DESC;

-- =============================================
-- YieldX Demo Accounts Setup
-- =============================================
-- 🚀 Run this AFTER running DEPLOY_SCHEMA.sql
-- =============================================

-- =============================================
-- STEP 1: Check if profiles table exists
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
  ) THEN
    RAISE EXCEPTION '❌ ERROR: profiles table does not exist. Run DEPLOY_SCHEMA.sql first!';
  END IF;
  
  RAISE NOTICE '✅ profiles table exists';
END $$;

-- =============================================
-- STEP 2: Get auth user IDs
-- =============================================
-- First, display existing auth users
DO $$
DECLARE
  user_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO user_count FROM auth.users;
  
  RAISE NOTICE '';
  RAISE NOTICE '=========================================';
  RAISE NOTICE 'Current Auth Users: %', user_count;
  RAISE NOTICE '=========================================';
  RAISE NOTICE '';
  
  IF user_count = 0 THEN
    RAISE NOTICE '⚠️  No auth users found!';
    RAISE NOTICE '';
    RAISE NOTICE '📝 CREATE ACCOUNTS MANUALLY:';
    RAISE NOTICE '';
    RAISE NOTICE '1. Go to: https://supabase.com/dashboard/project/hwbpgmbcasgdvhbofauc/auth/users';
    RAISE NOTICE '';
    RAISE NOTICE '2. Click "Add user" → "Create new user"';
    RAISE NOTICE '';
    RAISE NOTICE '3. Create these 3 accounts:';
    RAISE NOTICE '';
    RAISE NOTICE '   Account #1 (Teacher):';
    RAISE NOTICE '   - Email: demo.teacher@yieldx.com';
    RAISE NOTICE '   - Password: demo123';
    RAISE NOTICE '   - Auto Confirm User: ✅ CHECK THIS!';
    RAISE NOTICE '';
    RAISE NOTICE '   Account #2 (Student):';
    RAISE NOTICE '   - Email: demo.student@yieldx.com';
    RAISE NOTICE '   - Password: demo123';
    RAISE NOTICE '   - Auto Confirm User: ✅ CHECK THIS!';
    RAISE NOTICE '';
    RAISE NOTICE '   Account #3 (Admin):';
    RAISE NOTICE '   - Email: admin@yieldx.com';
    RAISE NOTICE '   - Password: admin123';
    RAISE NOTICE '   - Auto Confirm User: ✅ CHECK THIS!';
    RAISE NOTICE '';
    RAISE NOTICE '4. After creating, come back and run the INSERT section below';
    RAISE NOTICE '';
  ELSE
    RAISE NOTICE '✅ Found % auth user(s)', user_count;
    RAISE NOTICE '';
  END IF;
END $$;

-- Display auth users
SELECT 
  id,
  email,
  created_at,
  confirmed_at
FROM auth.users
ORDER BY created_at DESC;

-- =============================================
-- STEP 3: Create Profiles
-- =============================================
-- Run this section AFTER creating auth users

-- Get the user IDs dynamically and insert profiles
DO $$
DECLARE
  teacher_uuid UUID;
  student_uuid UUID;
  admin_uuid UUID;
  inserted_count INTEGER := 0;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=========================================';
  RAISE NOTICE 'Creating Profiles...';
  RAISE NOTICE '=========================================';
  
  -- Get teacher UUID
  SELECT id INTO teacher_uuid 
  FROM auth.users 
  WHERE email = 'demo.teacher@yieldx.com';
  
  -- Get student UUID
  SELECT id INTO student_uuid 
  FROM auth.users 
  WHERE email = 'demo.student@yieldx.com';
  
  -- Get admin UUID
  SELECT id INTO admin_uuid 
  FROM auth.users 
  WHERE email = 'admin@yieldx.com';
  
  -- Insert teacher profile
  IF teacher_uuid IS NOT NULL THEN
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
      profile_visibility
    ) VALUES (
      teacher_uuid,
      'demo.teacher@yieldx.com',
      'Demo Teacher',
      'lecturer',
      'Demo Teacher',
      'premium',
      0,
      0,
      1,
      'ar',
      'dark',
      'public'
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      updated_at = NOW();
    
    inserted_count := inserted_count + 1;
    RAISE NOTICE '✅ Teacher profile created: %', teacher_uuid;
  ELSE
    RAISE NOTICE '⚠️  Teacher auth user not found (demo.teacher@yieldx.com)';
  END IF;
  
  -- Insert student profile
  IF student_uuid IS NOT NULL THEN
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
      student_id,
      organization,
      major
    ) VALUES (
      student_uuid,
      'demo.student@yieldx.com',
      'Demo Student',
      'student',
      'Demo Student',
      'free',
      2450,
      5,
      12,
      'ar',
      'dark',
      'public',
      'STU-2024-001',
      'Sultan Qaboos University',
      'Business Administration'
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      updated_at = NOW();
    
    inserted_count := inserted_count + 1;
    RAISE NOTICE '✅ Student profile created: %', student_uuid;
  ELSE
    RAISE NOTICE '⚠️  Student auth user not found (demo.student@yieldx.com)';
  END IF;
  
  -- Insert admin profile
  IF admin_uuid IS NOT NULL THEN
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
      profile_visibility
    ) VALUES (
      admin_uuid,
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
      'private'
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      updated_at = NOW();
    
    inserted_count := inserted_count + 1;
    RAISE NOTICE '✅ Admin profile created: %', admin_uuid;
  ELSE
    RAISE NOTICE '⚠️  Admin auth user not found (admin@yieldx.com)';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '=========================================';
  RAISE NOTICE 'Summary: % profile(s) created/updated', inserted_count;
  RAISE NOTICE '=========================================';
  RAISE NOTICE '';
  
  IF inserted_count = 0 THEN
    RAISE EXCEPTION '❌ No profiles created. Create auth users first!';
  END IF;
END $$;

-- =============================================
-- STEP 4: Initialize Student Progress (Level 0)
-- =============================================
DO $$
DECLARE
  student_uuid UUID;
  level_0_id INTEGER;
BEGIN
  -- Get student UUID
  SELECT id INTO student_uuid 
  FROM auth.users 
  WHERE email = 'demo.student@yieldx.com';
  
  -- Get Level 0 ID
  SELECT id INTO level_0_id 
  FROM levels 
  WHERE level_number = 0;
  
  IF student_uuid IS NOT NULL AND level_0_id IS NOT NULL THEN
    INSERT INTO user_progress (
      user_id,
      level_id,
      status,
      unlocked,
      completed,
      xp_earned
    ) VALUES (
      student_uuid,
      level_0_id,
      'not-started',
      true,
      false,
      0
    )
    ON CONFLICT (user_id, level_id) DO NOTHING;
    
    RAISE NOTICE '✅ Student Level 0 unlocked';
  END IF;
END $$;

-- =============================================
-- STEP 5: Verify Everything
-- =============================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=========================================';
  RAISE NOTICE 'Verification Results';
  RAISE NOTICE '=========================================';
  RAISE NOTICE '';
END $$;

-- Show all profiles
SELECT 
  email,
  full_name,
  role,
  subscription_tier,
  total_xp,
  language,
  theme,
  created_at
FROM profiles
ORDER BY created_at DESC;

-- =============================================
-- COMPLETION MESSAGE
-- =============================================
DO $$
DECLARE
  profile_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO profile_count FROM profiles;
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ =========================================';
  RAISE NOTICE '✅ Demo Accounts Setup Complete!';
  RAISE NOTICE '✅ =========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Total Profiles: %', profile_count;
  RAISE NOTICE '';
  RAISE NOTICE '🔑 Login Credentials:';
  RAISE NOTICE '';
  RAISE NOTICE '   Teacher Account:';
  RAISE NOTICE '   - Email: demo.teacher@yieldx.com';
  RAISE NOTICE '   - Password: demo123';
  RAISE NOTICE '   - Role: lecturer';
  RAISE NOTICE '';
  RAISE NOTICE '   Student Account:';
  RAISE NOTICE '   - Email: demo.student@yieldx.com';
  RAISE NOTICE '   - Password: demo123';
  RAISE NOTICE '   - Role: student';
  RAISE NOTICE '';
  RAISE NOTICE '   Admin Account:';
  RAISE NOTICE '   - Email: admin@yieldx.com';
  RAISE NOTICE '   - Password: admin123';
  RAISE NOTICE '   - Role: admin';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Next Steps:';
  RAISE NOTICE '   1. Test login at your YieldX app';
  RAISE NOTICE '   2. Verify teacher dashboard loads';
  RAISE NOTICE '   3. Verify student dashboard loads';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 You are ready to use YieldX!';
  RAISE NOTICE '';
END $$;

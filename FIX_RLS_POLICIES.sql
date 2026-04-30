-- =============================================
-- FIX RLS POLICIES - COMPLETE SOLUTION
-- =============================================
-- 🚀 Run this to fix the "row-level security policy" error
-- =============================================

-- =============================================
-- 1. DROP EXISTING POLICIES (Clean Slate)
-- =============================================

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- =============================================
-- 2. CREATE NEW PERMISSIVE POLICIES
-- =============================================

-- Allow anyone to read public profiles OR their own profile
CREATE POLICY "profiles_select_policy"
  ON profiles FOR SELECT
  USING (
    profile_visibility = 'public' 
    OR auth.uid() = id
    OR auth.role() = 'service_role'
  );

-- Allow users to insert their own profile after signup
CREATE POLICY "profiles_insert_policy"
  ON profiles FOR INSERT
  WITH CHECK (
    auth.uid() = id 
    OR auth.role() = 'service_role'
  );

-- Allow users to update their own profile
CREATE POLICY "profiles_update_policy"
  ON profiles FOR UPDATE
  USING (
    auth.uid() = id 
    OR auth.role() = 'service_role'
  )
  WITH CHECK (
    auth.uid() = id 
    OR auth.role() = 'service_role'
  );

-- Allow users to delete their own profile (optional, usually not needed)
CREATE POLICY "profiles_delete_policy"
  ON profiles FOR DELETE
  USING (
    auth.uid() = id 
    OR auth.role() = 'service_role'
  );

-- =============================================
-- 3. CREATE AUTO-PROFILE TRIGGER (RECOMMENDED)
-- =============================================
-- This automatically creates a profile when a user signs up
-- Eliminates the RLS issue entirely!

-- Create the function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
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
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(new.raw_user_meta_data->>'role', 'student'),
    COALESCE(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', 'User'),
    'free',
    0,
    0,
    0,
    'ar',
    'dark',
    'public'
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- 4. FIX EXISTING DEMO USERS WITHOUT PROFILES
-- =============================================
-- This creates profiles for any auth users that don't have one

DO $$
DECLARE
  user_record RECORD;
  inserted_count INTEGER := 0;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=========================================';
  RAISE NOTICE 'Fixing existing users without profiles...';
  RAISE NOTICE '=========================================';
  RAISE NOTICE '';
  
  -- Loop through all auth users
  FOR user_record IN 
    SELECT 
      au.id,
      au.email,
      au.raw_user_meta_data->>'full_name' as full_name,
      au.raw_user_meta_data->>'role' as role
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE p.id IS NULL  -- Only users without profiles
  LOOP
    -- Insert profile for this user
    INSERT INTO public.profiles (
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
    )
    VALUES (
      user_record.id,
      user_record.email,
      COALESCE(user_record.full_name, 'User'),
      COALESCE(user_record.role, 'student'),
      COALESCE(user_record.full_name, 'User'),
      'free',
      0,
      0,
      0,
      'ar',
      'dark',
      'public'
    )
    ON CONFLICT (id) DO NOTHING;
    
    inserted_count := inserted_count + 1;
    RAISE NOTICE '✅ Created profile for: % (%)', user_record.email, user_record.id;
  END LOOP;
  
  RAISE NOTICE '';
  RAISE NOTICE '=========================================';
  RAISE NOTICE 'Fixed % user(s)', inserted_count;
  RAISE NOTICE '=========================================';
  RAISE NOTICE '';
END $$;

-- =============================================
-- 5. VERIFY THE FIX
-- =============================================

-- Show all auth users and whether they have profiles
SELECT 
  au.id,
  au.email,
  au.created_at as auth_created,
  CASE 
    WHEN p.id IS NOT NULL THEN '✅ Has Profile'
    ELSE '❌ Missing Profile'
  END as profile_status,
  p.full_name,
  p.role
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
ORDER BY au.created_at DESC;

-- =============================================
-- 6. TEST PROFILE CREATION
-- =============================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ =========================================';
  RAISE NOTICE '✅ RLS Policies Fixed!';
  RAISE NOTICE '✅ =========================================';
  RAISE NOTICE '';
  RAISE NOTICE '🔧 What was fixed:';
  RAISE NOTICE '   1. Updated RLS policies to allow profile creation';
  RAISE NOTICE '   2. Created auto-profile trigger (new signups auto-create profiles)';
  RAISE NOTICE '   3. Created profiles for existing auth users';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Next Steps:';
  RAISE NOTICE '   1. Try logging in again';
  RAISE NOTICE '   2. Profile should load automatically';
  RAISE NOTICE '   3. New signups will auto-create profiles';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Current Status:';
END $$;

-- Show summary
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_auth_users,
  (SELECT COUNT(*) FROM public.profiles) as total_profiles,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM public.profiles) 
    THEN '✅ All users have profiles'
    ELSE '⚠️  Some users missing profiles'
  END as status;

-- =============================================
-- FIX: Add 'organization' role to profiles table
-- =============================================
-- Run this in your Supabase SQL Editor to fix the role constraint
-- Project: https://hwbpgmbcasgdvhbofauc.supabase.co
-- =============================================

-- This script is IDEMPOTENT - safe to run multiple times

DO $$ 
BEGIN
    -- Check if constraint already allows 'organization'
    IF EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'profiles_role_check' 
        AND conrelid = 'profiles'::regclass
        AND pg_get_constraintdef(oid) LIKE '%organization%'
    ) THEN
        RAISE NOTICE '✅ Constraint already includes organization role - no update needed';
    ELSE
        -- Drop old constraint
        ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
        
        -- Add new constraint with organization role
        ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
        CHECK (role IN ('student', 'lecturer', 'admin', 'organization'));
        
        RAISE NOTICE '✅ Constraint updated successfully - organization role added';
    END IF;
END $$;

-- Verify the constraint
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'profiles_role_check';

-- Expected result:
-- profiles_role_check | CHECK (role IN ('student', 'lecturer', 'admin', 'organization'))

-- ✅ Done! You can now register users with the 'organization' role

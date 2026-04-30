-- =====================================================
-- YieldX Supabase Auth Trigger
-- Auto-creates profile when user signs up
-- =====================================================

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role, subscription_tier, total_xp, current_streak, total_login_days, language, theme, profile_visibility)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'student')::text,
    'free',
    0,
    0,
    0,
    coalesce(new.raw_user_meta_data->>'language', 'ar')::text,
    'dark',
    'public'
  )
  on conflict (id) do nothing;

  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create trigger
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- =====================================================
-- Verify Setup
-- =====================================================

-- Check if trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- =====================================================
-- Test (Optional - Remove after testing)
-- =====================================================

/*
-- Test by creating a test user in SQL Editor:

-- 1. Check current users
SELECT * FROM auth.users;

-- 2. Check profiles
SELECT * FROM profiles;

-- 3. After using signup in your app, both tables should have matching records
*/

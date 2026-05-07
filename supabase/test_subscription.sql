-- ============================================================
-- YieldX: Subscription Tier Verification Queries
-- Run these in the Supabase SQL Editor after applying the migration
-- ============================================================

-- 1. Verify the column exists and check all users and their tiers
SELECT id, email, name, subscription_tier
FROM public.users
ORDER BY created_at DESC;

-- 2. Count users by tier (sanity check)
SELECT subscription_tier, COUNT(*) AS user_count
FROM public.users
GROUP BY subscription_tier;

-- 3. Flip a specific user to 'premium' to test the AI chatbot:
-- UPDATE public.users SET subscription_tier = 'premium' WHERE email = 'your@email.com';

-- 4. Reset back to 'free' after testing:
-- UPDATE public.users SET subscription_tier = 'free' WHERE email = 'your@email.com';

-- 5. Confirm the CHECK constraint is working (this should ERROR with invalid tier):
-- UPDATE public.users SET subscription_tier = 'gold' WHERE email = 'your@email.com';

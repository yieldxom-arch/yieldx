-- Migration: add_subscription_tier_to_users
-- Adds the subscription_tier column to public.users.
-- Safe to re-run: uses IF NOT EXISTS and ON CONFLICT DO NOTHING.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT NOT NULL DEFAULT 'free'
  CHECK (subscription_tier IN ('free', 'premium', 'enterprise'));

COMMENT ON COLUMN public.users.subscription_tier IS
  'Subscription plan: free, premium, or enterprise. Gates access to AI Assistant and premium features.';

-- Backfill: ensure every existing row has the default value explicitly set.
-- The DEFAULT handles new rows; this covers rows inserted before the column existed.
UPDATE public.users
  SET subscription_tier = 'free'
  WHERE subscription_tier IS NULL;

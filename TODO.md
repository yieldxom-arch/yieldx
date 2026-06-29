# TODO — Manual Admin-Approval Subscription System

## Step 1 — PaymentForm.tsx
- [x] Replace fake instant-payment flow with manual approval submission UI (bilingual).
- [x] Ensure it writes to Supabase `upgrade_requests` (insert) with correct fields.

## Step 2 — Supabase migration
- [x] Create a new migration file to add `upgrade_requests` table + RLS policies.

## Step 3 — Edge Functions
- [x] Create Edge Function `approve-upgrade` (admin-only) to approve: update `users.subscription_tier` and request status.
- [x] Create Edge Function `reject-upgrade` (admin-only) to reject: update request status (+ reason).

## Step 4 — Admin panel UI
- [x] Find existing admin dashboard component; add new section for pending upgrade requests.
- [x] Wire Approve/Reject buttons to the new Edge Functions.

## Step 5 — Build verification
- [x] Run `npm run build` and confirm compilation.

## Step 6 — Deployment instructions
- [ ] Provide exact `supabase` CLI commands to deploy migration + edge functions.
- [ ] Provide clear “where to click” instructions for admins in the UI.


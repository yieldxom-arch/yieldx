-- Migration: add_upgrade_requests
-- Creates the upgrade_requests table for manual admin-approval subscription upgrades.
-- Safe to re-run: uses IF NOT EXISTS.

CREATE TABLE IF NOT EXISTS public.upgrade_requests (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id        UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  full_name      TEXT        NOT NULL,
  email          TEXT        NOT NULL,
  requested_plan TEXT        NOT NULL CHECK (requested_plan IN ('free', 'premium', 'enterprise')),
  note           TEXT        NOT NULL,
  status         TEXT        NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note     TEXT,
  reviewed_by    UUID        REFERENCES public.users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at    TIMESTAMPTZ
);

COMMENT ON TABLE public.upgrade_requests IS
  'Tracks manual subscription upgrade requests submitted by users and actioned by admins.';

-- ── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS upgrade_requests_user_id_idx    ON public.upgrade_requests (user_id);
CREATE INDEX IF NOT EXISTS upgrade_requests_status_idx     ON public.upgrade_requests (status);
CREATE INDEX IF NOT EXISTS upgrade_requests_created_at_idx ON public.upgrade_requests (created_at DESC);

-- ── Row-Level Security ────────────────────────────────────────────────────────

ALTER TABLE public.upgrade_requests ENABLE ROW LEVEL SECURITY;

-- Users: insert their own requests only
CREATE POLICY "users_insert_own_upgrade_request"
  ON public.upgrade_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users: read their own requests
CREATE POLICY "users_select_own_upgrade_requests"
  ON public.upgrade_requests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Admins: read all requests
CREATE POLICY "admins_select_all_upgrade_requests"
  ON public.upgrade_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Note: UPDATE (approve/reject) is performed by Edge Functions using the
-- service-role key, which bypasses RLS — no UPDATE policy is needed here.

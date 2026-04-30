// ═══════════════════════════════════════════════════════════════════════════════
// HYBRID MODE — Re-exports the single shared Supabase client singleton.
// All browser-side code must import from here (or from /utils/supabase/client).
// ═══════════════════════════════════════════════════════════════════════════════
export { supabase, getSupabaseClient } from '/utils/supabase/client';

export const isSupabaseConfigured = (): boolean => true;

// Talks to the business-name registry in Supabase (see
// supabase/migrations/20261031120000_business_names.sql).
//
// Only the normalised key of a name is sent and stored. The check returns
// counts, never other users' names. If the table is not installed yet, or the
// user is offline or not signed in, the functions return null and the UI falls
// back to checking the user's own studies.

import { supabase } from '@/lib/supabase';

export interface RegistryCounts {
  exact: number;
  similar: number;
}

export async function checkNameInRegistry(normalized: string): Promise<RegistryCounts | null> {
  if (!normalized) return { exact: 0, similar: 0 };
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session) return null;
    const { data, error } = await supabase.rpc('check_business_name', { p_normalized: normalized.slice(0, 120) });
    if (error) return null;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row) return { exact: 0, similar: 0 };
    return { exact: Number(row.exact_matches) || 0, similar: Number(row.similar_matches) || 0 };
  } catch {
    return null;
  }
}

/** Saves (or updates) this study's name key. Returns false if it could not be saved. */
export async function registerNameInRegistry(projectKey: string, normalized: string): Promise<boolean> {
  if (!projectKey || !normalized) return false;
  try {
    const { data: session } = await supabase.auth.getSession();
    const userId = session?.session?.user?.id;
    if (!userId) return false;
    const { error } = await supabase
      .from('business_names')
      .upsert(
        {
          user_id: userId,
          project_key: projectKey.slice(0, 100),
          normalized: normalized.slice(0, 120),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,project_key' }
      );
    return !error;
  } catch {
    return false;
  }
}

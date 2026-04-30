// ═══════════════════════════════════════════════════════════════════════════════
// HYBRID MODE — Real Supabase client singleton.
// Uses Supabase when online, localStorage when offline.
// ═══════════════════════════════════════════════════════════════════════════════
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

const supabaseUrl = `https://${projectId}.supabase.co`;

let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(supabaseUrl, publicAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
  }
  return _client;
}

export const supabase = getSupabaseClient();

// Re-export Database interface for type compatibility
export interface Database {
  public: {
    Tables: Record<string, any>;
    Views: Record<string, any>;
    Functions: Record<string, any>;
  };
}

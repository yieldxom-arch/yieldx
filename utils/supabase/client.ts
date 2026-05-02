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
    if (!publicAnonKey || !projectId) {
      console.error('⚠️ Missing Supabase credentials. Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
      // Return a dummy client that won't throw — app will run in offline/local mode
      _client = createClient('https://placeholder.supabase.co', 'placeholder-key-for-offline-mode', {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
      });
      return _client;
    }
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

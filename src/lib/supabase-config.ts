/**
 * Supabase Configuration — HYBRID MODE
 * Real Supabase connection when online, localStorage fallback when offline.
 */
import { projectId, publicAnonKey } from '/utils/supabase/info';

export const supabaseConfig = {
  url: `https://${projectId}.supabase.co`,
  anonKey: publicAnonKey,
};

export function checkSupabaseConfig() {
  const url = supabaseConfig.url;
  const key = supabaseConfig.anonKey;
  const urlExists = Boolean(url);
  const keyExists = Boolean(key);
  const urlFormat = url.startsWith('https://') && url.includes('.supabase.co');
  const keyFormat = key.length > 20;
  const isValid = urlExists && keyExists && urlFormat && keyFormat;

  return {
    isValid,
    checks: {
      urlExists,
      keyExists,
      urlFormat,
      keyFormat,
      usingEnvVars: true,
      usingFallback: false,
    },
    config: {
      url,
      keyPreview: key.substring(0, 20) + '...',
      source: 'Supabase (Hybrid Online/Offline)',
    },
  };
}

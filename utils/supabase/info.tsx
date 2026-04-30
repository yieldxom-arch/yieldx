/* Reads Supabase config from .env file */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

// Extract project ID from the URL (e.g., "bplhbxhjjdotndkgufzi" from "https://bplhbxhjjdotndkgufzi.supabase.co")
export const projectId = supabaseUrl
  .replace("https://", "")
  .replace(".supabase.co", "");

export const publicAnonKey = anonKey;

export const supabaseUrl_full = supabaseUrl;

// Helpful console warning if env vars are missing
if (!supabaseUrl || !anonKey) {
  console.error(
    "⚠️ Missing Supabase environment variables! Check your .env file has VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY"
  );
}

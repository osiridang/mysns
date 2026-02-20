/**
 * Supabase config from environment variables.
 * Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local (see .env.example).
 * For Vercel: add the same variables in Project Settings → Environment Variables.
 */

function getSupabaseUrl(): string {
  return typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL
    ? String(import.meta.env.VITE_SUPABASE_URL)
    : '';
}

function getAnonKey(): string {
  return typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY
    ? String(import.meta.env.VITE_SUPABASE_ANON_KEY)
    : '';
}

/** Supabase project ID (extracted from VITE_SUPABASE_URL). */
export const projectId = (() => {
  const url = getSupabaseUrl();
  if (!url) return '';
  try {
    return new URL(url).hostname.split('.')[0] ?? '';
  } catch {
    return '';
  }
})();

/** Supabase anonymous (public) key. */
export const publicAnonKey = getAnonKey();

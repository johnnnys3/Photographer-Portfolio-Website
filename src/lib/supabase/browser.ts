import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | undefined;

/**
 * Browser client for the admin. The session lives in memory only (persistSession: false), so closing,
 * reloading or leaving the page signs you out: the owner must log in each time they open the admin.
 */
export function getBrowserDb(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY');
  client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: true, detectSessionInUrl: true } });
  return client;
}

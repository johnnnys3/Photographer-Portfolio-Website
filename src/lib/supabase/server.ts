import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | null | undefined;

/**
 * Anonymous, read-only client for server components. RLS limits it to published content.
 * Returns null when the env vars are missing (e.g. CI), so callers fall back to seed content.
 * Every request is cached for 60s and tagged `content` so /api/revalidate can refresh it.
 */
export function getDb(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  client =
    url && key
      ? createClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
          global: {
            fetch: (input, init) => fetch(input, { ...init, next: { revalidate: 60, tags: ['content'] } } as RequestInit),
          },
        })
      : null;
  return client;
}

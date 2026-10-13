import { createClient } from '@supabase/supabase-js';
import { revalidatePath, revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Called by the admin after a save so the public site refreshes immediately instead of waiting
 * out the 60s cache. Only a signed-in admin's token is accepted: is_admin() is checked by the
 * database against the JWT, so a forged or non-admin token gets a 403.
 */
export async function POST(request: NextRequest) {
  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!token || !url || !key) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data, error } = await db.rpc('is_admin');
  if (error || data !== true) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  revalidateTag('content');
  revalidatePath('/', 'layout');
  return NextResponse.json({ revalidated: true });
}

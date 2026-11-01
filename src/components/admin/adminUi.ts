import type { SupabaseClient } from '@supabase/supabase-js';

export const field = 'min-h-11 w-full rounded-(--radius-field) bg-surface px-3 text-text focus:outline focus:outline-1 focus:outline-text';
export const btn =
  'inline-flex min-h-11 items-center rounded-(--radius-button) border border-text px-5 font-mono text-[12px] uppercase tracking-[0.06em] text-text hover:bg-surface disabled:opacity-50';
export const btnPrimary = `${btn} !border-button !bg-button !text-bg hover:!bg-text`;
export const btnDanger = `${btn} !border-negative !text-negative`;
export const label = 'block text-[14px] text-text';
export const hint = 'mt-1 block text-[13px] leading-snug text-muted';

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Ask the server to refresh the public site now (it only accepts an admin's token). */
export async function refreshSite(db: SupabaseClient) {
  const { data } = await db.auth.getSession();
  const token = data.session?.access_token;
  if (token) await fetch('/api/revalidate', { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
}

/** Storage object path from a public URL (`.../object/public/images/<path>`). */
export const storagePath = (url: string) => url.split('/object/public/images/')[1] ?? null;

import { compressImage } from '@/lib/image-compress';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'];

/**
 * Shrink a picture in the browser (longest side at most `maxEdge` px, re-encoded as WebP) and upload
 * it for use on the site. Returns its public web address and the sizes before/after.
 * Throws a plain-English message.
 */
export async function uploadImage(db: SupabaseClient, file: File, maxEdge = 2400): Promise<{ url: string; before: number; after: number }> {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error('Please choose a JPG, PNG, WebP, AVIF or SVG picture.');
  if (file.size > 40 * 1024 * 1024) throw new Error('That picture is larger than 40 MB. Please choose a smaller one.');
  const c = await compressImage(file, maxEdge);
  const base = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]+/g, '-').slice(0, 40) || 'picture';
  const path = `site/${crypto.randomUUID()}-${base}.${c.ext}`;
  const { error } = await db.storage.from('images').upload(path, c.blob, { contentType: c.type });
  if (error) throw new Error(`The upload failed: ${error.message}`);
  return { url: db.storage.from('images').getPublicUrl(path).data.publicUrl, before: c.before, after: c.after };
}

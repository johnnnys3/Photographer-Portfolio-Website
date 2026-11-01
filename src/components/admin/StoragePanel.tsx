'use client';

import type { SupabaseClient } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';
import { compressImage, formatBytes } from '@/lib/image-compress';
import { btn, btnDanger, btnPrimary, refreshSite, storagePath } from './adminUi';

const FREE_BYTES = 1024 * 1024 * 1024; // Supabase free plan: 1 GB of files
const SHRINK_OVER = 450 * 1024; // photos bigger than this are worth shrinking

type Obj = { name: string; size: number };
type ImageRow = { id: string; url: string; gallery: string };

/**
 * How much of the free 1 GB is used, which files nothing uses any more (safe to delete),
 * and a one-click shrink for photos that were uploaded at full camera size.
 */
export function StoragePanel({ db }: { db: SupabaseClient }) {
  const [objects, setObjects] = useState<Obj[]>([]);
  const [rows, setRows] = useState<ImageRow[]>([]);
  const [used, setUsed] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    const [o, r, c] = await Promise.all([
      db.rpc('admin_storage_objects'),
      db.from('images').select('id, url, gallery'),
      db.from('site_content').select('content'),
    ]);
    if (o.error) return setMsg({ ok: false, text: `Could not read storage: ${o.error.message}` });
    setObjects((o.data as Obj[]).map((x) => ({ name: x.name, size: Number(x.size) })));
    setRows((r.data ?? []) as ImageRow[]);
    // Everything any page or photo points at, including the old site's own saved content.
    const refs = new Set<string>();
    for (const row of r.data ?? []) {
      const p = storagePath(row.url);
      if (p) refs.add(decodeURIComponent(p));
    }
    for (const row of c.data ?? []) {
      for (const m of JSON.stringify(row.content).matchAll(/\/object\/public\/images\/([^"\\?]+)/g)) refs.add(decodeURIComponent(m[1]));
    }
    setUsed(refs);
  }, [db]);
  useEffect(() => {
    load();
  }, [load]);

  const total = objects.reduce((n, o) => n + o.size, 0);
  const unused = objects.filter((o) => !used.has(o.name));
  const unusedBytes = unused.reduce((n, o) => n + o.size, 0);
  const sizeOf = new Map(objects.map((o) => [o.name, o.size]));
  const big = rows.filter((r) => (sizeOf.get(decodeURIComponent(storagePath(r.url) ?? '')) ?? 0) > SHRINK_OVER);
  const pct = Math.min(100, (total / FREE_BYTES) * 100);

  const removeUnused = async () => {
    if (!confirm(`Delete ${unused.length} unused ${unused.length === 1 ? 'file' : 'files'} (${formatBytes(unusedBytes)})? Nothing on your website uses them.`)) return;
    setBusy('Deleting…');
    for (let i = 0; i < unused.length; i += 50) {
      const { error } = await db.storage.from('images').remove(unused.slice(i, i + 50).map((o) => o.name));
      if (error) {
        setBusy('');
        return setMsg({ ok: false, text: error.message });
      }
    }
    setBusy('');
    setMsg({ ok: true, text: `Freed ${formatBytes(unusedBytes)}.` });
    load();
  };

  const shrinkAll = async () => {
    if (!confirm(`Shrink ${big.length} large ${big.length === 1 ? 'photo' : 'photos'}? They will look the same but take far less space. This cannot be undone.`)) return;
    let saved = 0;
    let n = 0;
    for (const r of big) {
      setBusy(`Shrinking photo ${++n} of ${big.length}…`);
      try {
        const oldPath = decodeURIComponent(storagePath(r.url) ?? '');
        const src = await (await fetch(r.url)).blob();
        const c = await compressImage(src);
        if (c.after > c.before * 0.8) continue; // not worth replacing
        const path = `shrunk/${crypto.randomUUID()}.${c.ext}`;
        const up = await db.storage.from('images').upload(path, c.blob, { contentType: c.type });
        if (up.error) throw up.error;
        const url = db.storage.from('images').getPublicUrl(path).data.publicUrl;
        const { error } = await db.from('images').update({ url, width: c.width || null, height: c.height || null }).eq('id', r.id);
        if (error) {
          await db.storage.from('images').remove([path]);
          throw error;
        }
        // Only delete the old file if no other photo still uses it.
        const stillUsed = rows.some((o) => o.id !== r.id && decodeURIComponent(storagePath(o.url) ?? '') === oldPath);
        if (!stillUsed && oldPath) await db.storage.from('images').remove([oldPath]);
        saved += c.before - c.after;
      } catch (e) {
        setMsg({ ok: false, text: `Stopped at photo ${n}: ${(e as Error).message}` });
        break;
      }
    }
    setBusy('');
    await refreshSite(db);
    setMsg((m) => (m && !m.ok ? m : { ok: true, text: `Done. Freed ${formatBytes(saved)}.` }));
    load();
  };

  return (
    <div className="space-y-6">
      <div className="brut-card p-5">
        <p className="text-[18px] text-text">
          {formatBytes(total)} used of 1 GB free <span className="text-muted">({objects.length} files)</span>
        </p>
        <div className="mt-3 h-3 w-full border-2 border-text">
          <div className="h-full bg-accent" style={{ width: `${Math.max(pct, 0.5)}%` }} />
        </div>
        <p className="mt-3 text-[14px] text-muted">
          Photos you add from now on are automatically resized and compressed before they are stored, which fits roughly ten to twenty times more photos into the same space.
        </p>
      </div>

      <div className="rounded-(--radius-card) bg-surface p-5">
        <h3 className="text-[18px] text-text">Unused files</h3>
        <p className="mt-1 text-[14px] text-muted">
          {unused.length === 0
            ? 'None. Every stored file is used by your website.'
            : `${unused.length} ${unused.length === 1 ? 'file is' : 'files are'} not used by any page or photo (${formatBytes(unusedBytes)}). They are leftovers, for example from replaced pictures or the old site, and are safe to delete.`}
        </p>
        {unused.length > 0 && (
          <>
            <ul className="mt-3 max-h-40 overflow-y-auto text-[13px] text-muted">
              {unused.map((o) => (
                <li key={o.name} className="flex justify-between gap-4 border-b border-hairline py-1">
                  <span className="truncate">{o.name}</span>
                  <span>{formatBytes(o.size)}</span>
                </li>
              ))}
            </ul>
            <button type="button" disabled={!!busy} onClick={removeUnused} className={`${btnDanger} mt-4`}>
              Delete unused files
            </button>
          </>
        )}
      </div>

      <div className="rounded-(--radius-card) bg-surface p-5">
        <h3 className="text-[18px] text-text">Large photos</h3>
        <p className="mt-1 text-[14px] text-muted">
          {big.length === 0
            ? 'All your photos are already a sensible size.'
            : `${big.length} ${big.length === 1 ? 'photo is' : 'photos are'} over ${formatBytes(SHRINK_OVER)}. Shrinking keeps them looking the same (up to 2400 px wide) but uses much less space.`}
        </p>
        {big.length > 0 && (
          <button type="button" disabled={!!busy} onClick={shrinkAll} className={`${btnPrimary} mt-4`}>
            Shrink large photos
          </button>
        )}
      </div>

      {(busy || msg) && (
        <p role="status" className={`text-[15px] ${busy ? 'text-text' : msg?.ok ? 'text-positive' : 'text-negative'}`}>
          {busy || msg?.text}
        </p>
      )}
      <button type="button" onClick={load} className={btn}>
        Refresh numbers
      </button>
    </div>
  );
}

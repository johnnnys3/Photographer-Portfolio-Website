'use client';

import type { SupabaseClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { cloneDefault, resolvePage, rowName, type PageDef, type PageValues, type Section } from '@/content/cms';
import { btn, btnPrimary, hint, refreshSite } from './adminUi';
import { FieldRenderer } from './fields';

type Status = { ok: boolean; text: string } | null;

/** Every storage file path mentioned anywhere in a page's values. */
const filesIn = (v: unknown) =>
  new Set([...JSON.stringify(v ?? {}).matchAll(/\/object\/public\/images\/([^"\\?]+)/g)].map((m) => decodeURIComponent(m[1])));

/**
 * Edit one page. Every section is a card of ordinary form fields drawn from the page's definition
 * in cms.ts. Nothing reaches the live site until "Save changes" is pressed.
 */
export function PageEditor({
  db,
  page,
  projects,
  onDirty,
}: {
  db: SupabaseClient;
  page: PageDef;
  projects: { slug: string; title: string }[];
  onDirty: (dirty: boolean) => void;
}) {
  const [saved, setSaved] = useState<PageValues | null>(null);
  const [draft, setDraft] = useState<PageValues | null>(null);
  const [status, setStatus] = useState<Status>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let live = true;
    db.from('site_content')
      .select('content')
      .eq('section', rowName(page.key))
      .maybeSingle()
      .then(({ data, error }) => {
        if (!live) return;
        if (error) setStatus({ ok: false, text: `Could not load this page: ${error.message}` });
        const v = resolvePage(page, data?.content);
        setSaved(v);
        setDraft(cloneDefault(v));
      });
    return () => {
      live = false;
    };
  }, [db, page]);

  const dirty = !!draft && JSON.stringify(draft) !== JSON.stringify(saved);
  useEffect(() => onDirty(dirty), [dirty, onDirty]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    addEventListener('beforeunload', warn);
    return () => removeEventListener('beforeunload', warn);
  }, [dirty]);

  if (!draft) return <p className="text-muted">Loading…</p>;

  const set = (section: string, key: string, value: unknown) =>
    setDraft((d) => d && { ...d, [section]: { ...d[section], [key]: value } });

  const save = async () => {
    setSaving(true);
    setStatus(null);
    const { error } = await db
      .from('site_content')
      .upsert({ section: rowName(page.key), content: draft, content_type: 'json', updated_at: new Date().toISOString() }, { onConflict: 'section' });
    if (error) {
      setStatus({ ok: false, text: `Could not save: ${error.message}` });
    } else {
      // Free the space: delete pictures this page used before but no longer does. (Done only after a
      // successful save, so discarding changes never breaks the live site.)
      const now = filesIn(draft);
      const replaced = [...filesIn(saved)].filter((f) => !now.has(f));
      if (replaced.length) await db.storage.from('images').remove(replaced);
      await refreshSite(db);
      setSaved(cloneDefault(draft));
      setStatus({ ok: true, text: 'Saved. Your live site is updated.' });
    }
    setSaving(false);
  };

  const resetSection = (s: Section) => {
    if (!confirm(`Put "${s.title}" back to its original wording and pictures? Press Save afterwards to keep that.`)) return;
    const original = resolvePage(page, {})[s.key];
    setDraft((d) => d && { ...d, [s.key]: original });
  };

  const ctx = { db, projects };
  return (
    <div>
      <div className="space-y-4">
        {page.sections.map((s, i) => (
          <details key={s.key} open={i === 0} className="group rounded-(--radius-card) bg-surface">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3">
              <span>
                <span className="block text-[18px] text-text">{s.title}</span>
                {s.help && <span className={hint}>{s.help}</span>}
              </span>
              <span aria-hidden className="text-muted transition-transform group-open:rotate-180">
                ▾
              </span>
            </summary>
            <div className="space-y-6 border-t border-hairline px-5 py-5">
              {s.fields.map((f) => (
                <FieldRenderer key={f.key} f={f} value={draft[s.key][f.key]} onChange={(v) => set(s.key, f.key, v)} ctx={ctx} />
              ))}
              <button type="button" onClick={() => resetSection(s)} className={btn}>
                Put this section back to the original
              </button>
            </div>
          </details>
        ))}
      </div>

      {/* Always-visible save bar */}
      <div className="sticky bottom-0 z-10 -mx-(--gutter) mt-8 flex flex-wrap items-center gap-3 border-t border-hairline bg-bg/95 px-(--gutter) py-4 backdrop-blur">
        <button type="button" onClick={save} disabled={!dirty || saving} className={btnPrimary}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        {dirty && (
          <button type="button" onClick={() => setDraft(cloneDefault(saved!))} className={btn}>
            Undo my changes
          </button>
        )}
        <span role="status" className={`text-[14px] ${status ? (status.ok ? 'text-positive' : 'text-negative') : 'text-muted'}`}>
          {status?.text ?? (dirty ? 'You have changes that are not saved yet.' : 'Everything is saved.')}
        </span>
        <a href={page.path} target="_blank" rel="noopener noreferrer" className="ml-auto text-[14px] text-text underline">
          View this page ↗
        </a>
      </div>
    </div>
  );
}

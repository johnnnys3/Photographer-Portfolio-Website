'use client';

import type { SupabaseClient } from '@supabase/supabase-js';
import { useState } from 'react';
import { newItem, type Field } from '@/content/cms';
import { formatBytes } from '@/lib/image-compress';
import { btn, btnDanger, field as inputClass, hint, label, uploadImage } from './adminUi';

export type FieldCtx = { db: SupabaseClient; projects: { slug: string; title: string }[] };
type Img = { src: string; alt: string };

const arrowBtn = 'inline-flex size-9 items-center justify-center rounded-full border border-outline text-text hover:border-text disabled:opacity-30';

/** Move item `i` by `d` places in a copy of the array. */
const moved = <T,>(arr: T[], i: number, d: number) => {
  const j = i + d;
  if (j < 0 || j >= arr.length) return arr;
  const copy = [...arr];
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
};

function ImageField({ value, onChange, ctx, maxEdge }: { value: Img; onChange: (v: Img) => void; ctx: FieldCtx; maxEdge?: number }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const r = await uploadImage(ctx.db, file, maxEdge);
      onChange({ ...value, src: r.url });
      setNote(r.after < r.before ? `Optimised for the web: ${formatBytes(r.before)} → ${formatBytes(r.after)}` : '');
    } catch (e) {
      setError((e as Error).message);
    }
    setBusy(false);
  };

  return (
    <div className="flex flex-wrap items-start gap-4">
      <div className="grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-(--radius-card) border border-hairline bg-surface-2">
        {value.src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value.src} alt="" className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="px-2 text-center text-[12px] text-muted">No picture</span>
        )}
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap gap-2">
          <label className={`${btn} cursor-pointer`}>
            {busy ? 'Optimising and uploading…' : value.src ? 'Replace picture' : 'Upload a picture'}
            <input type="file" hidden accept="image/jpeg,image/png,image/webp,image/avif,image/svg+xml" disabled={busy} onChange={(e) => pick(e.target.files?.[0])} />
          </label>
          {value.src && (
            <button type="button" onClick={() => onChange({ src: '', alt: '' })} className={btn}>
              Remove
            </button>
          )}
        </div>
        {value.src && (
          <label className="block">
            <span className={hint}>Describe the picture in a few words (read aloud to visitors who cannot see it)</span>
            <input value={value.alt} onChange={(e) => onChange({ ...value, alt: e.target.value })} className={`${inputClass} mt-1`} />
          </label>
        )}
        {note && <p className="text-[13px] text-positive">{note}</p>}
        {error && (
          <p role="alert" className="text-[13px] text-negative">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

function StringsField({ f, value, onChange }: { f: Extract<Field, { type: 'strings' }>; value: string[]; onChange: (v: string[]) => void }) {
  const set = (i: number, v: string) => onChange(value.map((x, k) => (k === i ? v : x)));
  return (
    <div className="space-y-2">
      {value.map((v, i) => (
        <div key={i} className="flex items-start gap-2">
          {f.multiline ? (
            <textarea value={v} onChange={(e) => set(i, e.target.value)} rows={3} className={`${inputClass} py-2`} />
          ) : (
            <input value={v} onChange={(e) => set(i, e.target.value)} className={inputClass} />
          )}
          <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => onChange(moved(value, i, -1))} className={arrowBtn}>
            ↑
          </button>
          <button type="button" aria-label="Move down" disabled={i === value.length - 1} onClick={() => onChange(moved(value, i, 1))} className={arrowBtn}>
            ↓
          </button>
          <button type="button" aria-label="Remove" onClick={() => onChange(value.filter((_, k) => k !== i))} className={arrowBtn}>
            ✕
          </button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...value, ''])} className={btn}>
        + Add {f.itemLabel}
      </button>
    </div>
  );
}

function ListField({ f, value, onChange, ctx }: { f: Extract<Field, { type: 'list' }>; value: Record<string, unknown>[]; onChange: (v: Record<string, unknown>[]) => void; ctx: FieldCtx }) {
  const [open, setOpen] = useState<number | null>(null);
  const setItem = (i: number, key: string, v: unknown) => onChange(value.map((it, k) => (k === i ? { ...it, [key]: v } : it)));

  return (
    <div className="space-y-3">
      {value.length === 0 && <p className="text-[14px] text-muted">Nothing here yet.</p>}
      {value.map((item, i) => {
        const title = String(item[f.titleKey] || '').trim() || `New ${f.itemLabel}`;
        const isOpen = open === i;
        return (
          <div key={i} className="rounded-(--radius-card) border border-hairline bg-surface-2">
            <div className="flex items-center gap-2 p-2">
              <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : i)} className="flex min-h-11 flex-1 items-center gap-3 px-2 text-left text-[16px] text-text">
                <span aria-hidden className="text-muted">
                  {isOpen ? '▾' : '▸'}
                </span>
                <span className="truncate">{title}</span>
              </button>
              <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => onChange(moved(value, i, -1))} className={arrowBtn}>
                ↑
              </button>
              <button type="button" aria-label="Move down" disabled={i === value.length - 1} onClick={() => onChange(moved(value, i, 1))} className={arrowBtn}>
                ↓
              </button>
            </div>
            {isOpen && (
              <div className="space-y-5 border-t border-hairline p-4">
                {f.fields.map((sub) => (
                  <FieldRenderer key={sub.key} f={sub} value={item[sub.key]} onChange={(v) => setItem(i, sub.key, v)} ctx={ctx} />
                ))}
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Remove this ${f.itemLabel}?`)) {
                      onChange(value.filter((_, k) => k !== i));
                      setOpen(null);
                    }
                  }}
                  className={btnDanger}
                >
                  Remove this {f.itemLabel}
                </button>
              </div>
            )}
          </div>
        );
      })}
      <button
        type="button"
        onClick={() => {
          onChange([...value, newItem(f.fields)]);
          setOpen(value.length);
        }}
        className={btn}
      >
        + Add {f.itemLabel}
      </button>
    </div>
  );
}

/** One editable field, drawn from its definition in cms.ts. No code or JSON is ever shown. */
export function FieldRenderer({ f, value, onChange, ctx }: { f: Field; value: unknown; onChange: (v: unknown) => void; ctx: FieldCtx }) {
  let control: React.ReactNode;
  switch (f.type) {
    case 'textarea':
      control = <textarea value={value as string} onChange={(e) => onChange(e.target.value)} rows={4} className={`${inputClass} py-2`} />;
      break;
    case 'color':
      control = (
        <div className="flex items-center gap-3">
          <input type="color" value={/^#[0-9a-f]{6}$/i.test(value as string) ? (value as string) : '#ff3b2f'} onChange={(e) => onChange(e.target.value)} className="h-11 w-16 cursor-pointer rounded-(--radius-card) border border-hairline bg-surface-2 p-1" />
          <span className="text-[14px] text-muted">{value as string}</span>
        </div>
      );
      break;
    case 'number':
      control = <input type="number" value={value as number} onChange={(e) => onChange(Number(e.target.value))} className={inputClass} />;
      break;
    case 'toggle':
      return (
        <label className="flex min-h-11 cursor-pointer items-start gap-3">
          <input type="checkbox" checked={value as boolean} onChange={(e) => onChange(e.target.checked)} className="mt-1 size-5 accent-[var(--color-accent)]" />
          <span>
            <span className={label}>{f.label}</span>
            {f.help && <span className={hint}>{f.help}</span>}
          </span>
        </label>
      );
    case 'select':
      control = (
        <select value={value as string} onChange={(e) => onChange(e.target.value)} className={inputClass}>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    case 'project':
      control = (
        <select value={value as string} onChange={(e) => onChange(e.target.value)} className={inputClass}>
          <option value="">No link</option>
          {ctx.projects.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.title}
            </option>
          ))}
        </select>
      );
      break;
    case 'image':
      control = <ImageField value={value as Img} onChange={onChange} ctx={ctx} maxEdge={f.maxEdge} />;
      break;
    case 'strings':
      control = <StringsField f={f} value={value as string[]} onChange={onChange} />;
      break;
    case 'list':
      control = <ListField f={f} value={value as Record<string, unknown>[]} onChange={onChange} ctx={ctx} />;
      break;
    default:
      control = <input type={f.type === 'text' ? 'text' : f.type} value={value as string} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} className={inputClass} />;
  }
  return (
    <div>
      <span className={label}>{f.label}</span>
      {f.help && <span className={hint}>{f.help}</span>}
      <div className="mt-2">{control}</div>
    </div>
  );
}

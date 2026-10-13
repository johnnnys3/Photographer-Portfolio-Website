'use client';

import type { SupabaseClient } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';
import { CATEGORY_OPTIONS } from '@/content/cms';
import { compressImage, formatBytes } from '@/lib/image-compress';
import { btn, btnDanger, btnPrimary, field, hint, label, refreshSite, slugify, storagePath } from './adminUi';

type Project = {
  id: string;
  name: string;
  slug: string | null;
  client: string | null;
  category: string | null;
  location: string | null;
  shot_date: string | null;
  camera: string | null;
  story: string | null;
  scope: string[] | null;
  links: { label: string; href: string }[] | null;
  featured: boolean;
  published: boolean;
  sort_order: number;
};
type Photo = {
  id: string;
  url: string;
  title: string;
  description: string | null;
  role: string;
  layout: string | null;
  category: string | null;
  alt: string | null;
  exif: { aperture?: string; shutter?: string; iso?: number; focal?: string } | null;
  sort_order: number;
};
type Draft = Omit<Project, 'id' | 'scope' | 'links'> & { scope: string; links: string };

const toDraft = (p?: Project): Draft => ({
  name: p?.name ?? '',
  slug: p?.slug ?? '',
  client: p?.client ?? '',
  category: p?.category ?? 'portraits',
  location: p?.location ?? '',
  shot_date: p?.shot_date ?? '',
  camera: p?.camera ?? '',
  story: p?.story ?? '',
  scope: (p?.scope ?? []).join(', '),
  links: (p?.links ?? []).map((l) => `${l.label} | ${l.href}`).join('\n'),
  featured: p?.featured ?? false,
  published: p?.published ?? true,
  sort_order: p?.sort_order ?? 0,
});

/** One "Label | https://…" per line. Only http(s) links are kept. */
const parseLinks = (text: string) =>
  text
    .split('\n')
    .map((line) => line.split('|').map((s) => s.trim()))
    .filter(([label, href]) => label && href && /^https?:\/\//i.test(href))
    .map(([label, href]) => ({ label, href }));

const ROLE_NAMES: Record<string, string> = { cover: 'Main photo of the project', hover: 'Extra frame (not used)', hero: 'Top photo (not used)', gallery: 'Photo in the project' };

function PhotoRow({ db, photo, onChange }: { db: SupabaseClient; photo: Photo; onChange: () => void }) {
  const e = photo.exif ?? {};
  const [f, setF] = useState({
    role: photo.role,
    layout: photo.layout ?? '',
    category: photo.category ?? '',
    alt: photo.alt ?? '',
    description: photo.description ?? '',
    aperture: e.aperture ?? '',
    shutter: e.shutter ?? '',
    iso: e.iso ? String(e.iso) : '',
    focal: e.focal ?? '',
    sort_order: photo.sort_order,
  });
  const [msg, setMsg] = useState('');
  const set = (k: keyof typeof f, v: string | number) => setF((s) => ({ ...s, [k]: v }));

  const save = async () => {
    const exif = Object.fromEntries(
      Object.entries({ aperture: f.aperture, shutter: f.shutter, iso: f.iso ? Number(f.iso) : '', focal: f.focal }).filter(([, v]) => v !== ''),
    );
    const { error } = await db
      .from('images')
      .update({ role: f.role, layout: f.layout || null, category: f.category || null, alt: f.alt || null, description: f.description || null, exif: Object.keys(exif).length ? exif : null, sort_order: f.sort_order })
      .eq('id', photo.id);
    setMsg(error ? error.message : 'Saved');
    if (!error) {
      await refreshSite(db);
      onChange();
    }
  };

  const remove = async () => {
    if (!confirm('Delete this photo?')) return;
    const path = storagePath(photo.url);
    if (path) await db.storage.from('images').remove([path]);
    await db.from('images').delete().eq('id', photo.id);
    await refreshSite(db);
    onChange();
  };

  const small = `${field} !min-h-9 !px-2 text-[14px]`;
  return (
    <div className="grid gap-3 rounded-(--radius-card) bg-surface-2 p-3 sm:grid-cols-[120px_1fr]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.url} alt={photo.alt || photo.title} className="aspect-[4/5] w-full rounded-(--radius-image) object-cover" />
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        <label>
          <span className={label}>Where it is used</span>
          <select value={f.role} onChange={(x) => set('role', x.target.value)} className={small}>
            {['cover', 'gallery', ...(f.role === 'hover' || f.role === 'hero' ? [f.role] : [])].map((r) => (
              <option key={r} value={r}>{ROLE_NAMES[r]}</option>
            ))}
          </select>
        </label>
        <label>
          <span className={label}>Type of photo</span>
          <select value={f.category} onChange={(x) => set('category', x.target.value)} className={small}>
            <option value="">Not set (choose one)</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className={label}>Position</span>
          <input type="number" value={f.sort_order} onChange={(x) => set('sort_order', Number(x.target.value))} className={small} />
        </label>
        <label>
          <span className={label}>Focal length</span>
          <input value={f.focal} onChange={(x) => set('focal', x.target.value)} placeholder="35mm" className={small} />
        </label>
        <label>
          <span className={label}>Aperture</span>
          <input value={f.aperture} onChange={(x) => set('aperture', x.target.value)} placeholder="f/2.0" className={small} />
        </label>
        <label>
          <span className={label}>Shutter</span>
          <input value={f.shutter} onChange={(x) => set('shutter', x.target.value)} placeholder="1/250" className={small} />
        </label>
        <label>
          <span className={label}>ISO</span>
          <input type="number" value={f.iso} onChange={(x) => set('iso', x.target.value)} placeholder="400" className={small} />
        </label>
        <span />
        <label className="col-span-2">
          <span className={label}>Alt text</span>
          <input value={f.alt} onChange={(x) => set('alt', x.target.value)} className={small} />
        </label>
        <label className="col-span-2">
          <span className={label}>Caption</span>
          <input value={f.description} onChange={(x) => set('description', x.target.value)} className={small} />
        </label>
        <div className="col-span-2 flex items-center gap-2 md:col-span-4">
          <button type="button" onClick={save} className={btn}>
            Save photo
          </button>
          <button type="button" onClick={remove} className={btnDanger}>
            Delete
          </button>
          <span className="t-label">{msg}</span>
        </div>
      </div>
    </div>
  );
}

function Photos({ db, project, userId }: { db: SupabaseClient; project: Project; userId: string }) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [type, setType] = useState(''); // type of the photos about to be uploaded

  const load = useCallback(async () => {
    const { data } = await db.from('images').select('*').eq('gallery', project.name).order('sort_order');
    setPhotos((data ?? []) as Photo[]);
  }, [db, project.name]);
  useEffect(() => {
    load();
  }, [load]);

  const upload = async (files: FileList | null) => {
    if (!files?.length || !project.slug || !type) return;
    setBusy(true);
    const errs: string[] = [];
    let order = Math.max(-1, ...photos.map((p) => p.sort_order)) + 1;
    let hasCover = photos.some((p) => p.role === 'cover');
    let saved = 0;

    for (const file of Array.from(files)) {
      if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) {
        errs.push(`${file.name}: use JPEG, PNG, WebP or AVIF`);
        continue;
      }
      if (file.size > 25 * 1024 * 1024) {
        errs.push(`${file.name}: larger than 25 MB`);
        continue;
      }
      try {
        // Shrink first: far less of the free storage is used and pages load faster.
        const c = await compressImage(file);
        const w = c.width;
        const h = c.height;
        saved += c.before - c.after;
        const path = `${project.slug}/${crypto.randomUUID()}.${c.ext}`;
        const up = await db.storage.from('images').upload(path, c.blob, { contentType: c.type });
        if (up.error) throw up.error;
        const url = db.storage.from('images').getPublicUrl(path).data.publicUrl;
        const { error } = await db.from('images').insert({
          filename: file.name,
          url,
          title: file.name.replace(/\.[^.]+$/, ''),
          gallery: project.name,
          category: type,
          role: hasCover ? 'gallery' : 'cover',
          photographer_id: userId,
          width: w || null,
          height: h || null,
          sort_order: order++,
        });
        if (error) {
          await db.storage.from('images').remove([path]);
          throw error;
        }
        hasCover = true;
      } catch (e) {
        errs.push(`${file.name}: ${(e as Error).message}`);
      }
    }
    if (saved > 0) errs.unshift(`Photos were optimised for the web and saved ${formatBytes(saved)} of your free storage.`);
    setErrors(errs);
    setBusy(false);
    await refreshSite(db);
    load();
  };

  return (
    <section className="mt-8">
      <h3 className="t-heading !text-[22px]">Photos ({photos.length})</h3>
      <p className="t-body mt-1 !text-[14px]">
        1. Choose what kind of photos you are adding. 2. Upload them (you can select many at once). Each photo has its own type, which decides where it appears under "By type" on the Work page, so one project can mix landscapes, editorial and anything else: upload each kind in turn, or change a photo's type below. The first photo you upload becomes the project's main photo.
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label>
          <span className={label}>Type of these photos</span>
          <select value={type} onChange={(e) => setType(e.target.value)} className={`${field} !w-auto`}>
            <option value="">Choose a type…</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className={`${btnPrimary} ${type && !busy ? 'cursor-pointer' : 'pointer-events-none opacity-50'}`}>
          {busy ? 'Uploading…' : 'Upload photos'}
          <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" multiple hidden disabled={busy || !type} onChange={(e) => upload(e.target.files)} />
        </label>
      </div>
      {!type && <p className="t-label mt-2">Choose a type first, then the upload button turns on.</p>}
      {errors.map((m) => (
        <p key={m} className="t-label mt-2 !text-negative">
          {m}
        </p>
      ))}
      <div className="mt-4 space-y-3">
        {photos.map((p) => (
          <PhotoRow key={`${p.id}-${p.sort_order}-${p.role}`} db={db} photo={p} onChange={load} />
        ))}
      </div>
    </section>
  );
}

function Editor({ db, userId, initial, onClose }: { db: SupabaseClient; userId: string; initial: Project | null; onClose: () => void }) {
  const [current, setCurrent] = useState<Project | null>(initial);
  const [d, setD] = useState<Draft>(toDraft(initial ?? undefined));
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((s) => ({ ...s, [k]: v }));

  const save = async () => {
    if (!d.name.trim()) return setMsg({ ok: false, text: 'A title is required.' });
    if (!d.shot_date) return setMsg({ ok: false, text: 'A date is required (the year is shown on the site).' });
    const slug = slugify(d.slug || d.name);
    if (!slug) return setMsg({ ok: false, text: 'The Web address ending is empty.' });
    const row = {
      name: d.name.trim(),
      slug,
      client: d.client || null,
      category: d.category,
      location: d.location || null,
      shot_date: d.shot_date,
      camera: d.camera || null,
      story: d.story || null,
      scope: d.scope.split(',').map((s) => s.trim()).filter(Boolean),
      links: parseLinks(d.links),
      featured: d.featured,
      published: d.published,
      sort_order: d.sort_order,
    };
    const q = current ? db.from('galleries').update(row).eq('id', current.id) : db.from('galleries').insert(row);
    const { data, error } = await q.select().single();
    if (error) return setMsg({ ok: false, text: error.message.includes('duplicate') ? 'That title or slug is already used by another project.' : error.message });
    setCurrent(data as Project);
    setD(toDraft(data as Project));
    await refreshSite(db);
    setMsg({ ok: true, text: d.published ? 'Saved and live.' : 'Saved as a draft (not on the site yet).' });
  };

  const remove = async () => {
    if (!current) return;
    const result = await deleteProject(db, current);
    if (result === 'cancelled') return;
    if (result) return setMsg({ ok: false, text: result });
    onClose();
  };

  return (
    <div>
      <button type="button" onClick={onClose} className="t-label min-h-11 hover:text-text">
        ← All projects
      </button>
      <h2 className="t-heading mt-2">{current ? current.name : 'New project'}</h2>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label>
          <span className={label}>Project title *</span>
          <input
            value={d.name}
            onChange={(e) => {
              set('name', e.target.value);
              if (!slugTouched) set('slug', slugify(e.target.value));
            }}
            className={field}
          />
        </label>
        <label>
          <span className={label}>Web address ending</span>
          <input value={d.slug ?? ''} onChange={(e) => { setSlugTouched(true); set('slug', slugify(e.target.value)); }} className={field} />
        </label>
        <label>
          <span className={label}>Client</span>
          <input value={d.client ?? ''} onChange={(e) => set('client', e.target.value)} className={field} />
        </label>
        <label>
          <span className={label}>Place (City, Country)</span>
          <input value={d.location ?? ''} onChange={(e) => set('location', e.target.value)} className={field} />
        </label>
        <label>
          <span className={label}>Date shot *</span>
          <input type="date" value={d.shot_date ?? ''} onChange={(e) => set('shot_date', e.target.value)} className={field} />
        </label>
        <label>
          <span className={label}>Camera and lens (optional)</span>
          <input value={d.camera ?? ''} onChange={(e) => set('camera', e.target.value)} placeholder="Fujifilm X-T5 / 35mm" className={field} />
        </label>
        <label>
          <span className={label}>What you did (separate with commas)</span>
          <input value={d.scope} onChange={(e) => set('scope', e.target.value)} placeholder="Concept, Lighting, Retouching" className={field} />
        </label>
        <label className="md:col-span-2">
          <span className={label}>Statement (2–3 lines, shown beside the photographs)</span>
          <span className={hint}>Keep it short: it sits next to the gallery. Leave empty for none.</span>
          <textarea
            value={d.story ?? ''}
            onChange={(e) => set('story', e.target.value)}
            rows={7}
            placeholder="This project was shot for … in … The brief was …"
            className={`${field} mt-1 py-2`}
          />
        </label>
        <label className="md:col-span-2">
          <span className={label}>Links (one per line, like: Featured in Vogue | https://vogue.com/…)</span>
          <textarea value={d.links} onChange={(e) => set('links', e.target.value)} rows={2} className={`${field} py-2`} />
        </label>
        <label>
          <span className={label}>Position in the list (1 = first)</span>
          <input type="number" value={d.sort_order} onChange={(e) => set('sort_order', Number(e.target.value))} className={field} />
        </label>
        <div className="flex items-end gap-6 pb-2">
          <label className="flex min-h-11 items-center gap-2">
            <input type="checkbox" checked={d.published} onChange={(e) => set('published', e.target.checked)} className="size-5 accent-[var(--color-accent)]" />
            <span className={label}>Visible on the website</span>
          </label>
          <label className="flex min-h-11 items-center gap-2">
            <input type="checkbox" checked={d.featured} onChange={(e) => set('featured', e.target.checked)} className="size-5 accent-[var(--color-accent)]" />
            <span className={label}>Show on the home page</span>
          </label>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button type="button" onClick={save} className={btnPrimary}>
          {current ? 'Save project' : 'Create project'}
        </button>
        {current && (
          <button type="button" onClick={remove} className={btnDanger}>
            Delete project
          </button>
        )}
        {msg && <span className={`t-label ${msg.ok ? '!text-positive' : '!text-negative'}`}>{msg.text}</span>}
      </div>

      {current ? (
        <Photos db={db} project={current} userId={userId} />
      ) : (
        <section className="mt-8 rounded-(--radius-card) border border-hairline p-5">
          <h3 className="t-heading !text-[22px]">Photos</h3>
          <p className="t-body mt-1 !text-[14px]">
            Photos are uploaded to a saved project. Fill in the title and date above, then create the project: the upload button appears right here.
          </p>
          <button type="button" onClick={save} className={`${btnPrimary} mt-3`}>
            Create project and add photos
          </button>
        </section>
      )}
    </div>
  );
}

/** Delete a project and all its photos (files too). Returns true if it was deleted. */
async function deleteProject(db: SupabaseClient, p: { id: string; name: string }): Promise<string | null> {
  if (!confirm(`Delete "${p.name}" and all its photos? This cannot be undone.`)) return 'cancelled';
  const { data } = await db.from('images').select('url').eq('gallery', p.name);
  const paths = (data ?? []).map((r: { url: string }) => storagePath(r.url)).filter((x): x is string => !!x);
  if (paths.length) await db.storage.from('images').remove(paths);
  const { error } = await db.from('galleries').delete().eq('id', p.id);
  if (error) return error.message;
  await refreshSite(db);
  return null;
}

export function ProjectsPanel({ db, userId }: { db: SupabaseClient; userId: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Project | 'new' | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const { data, error } = await db.from('galleries').select('*').order('sort_order').order('shot_date', { ascending: false });
    if (error) setError(error.message);
    else setProjects(data as Project[]);
  }, [db]);
  useEffect(() => {
    load();
  }, [load]);

  if (editing)
    return (
      <Editor
        key={editing === 'new' ? 'new' : editing.id}
        db={db}
        userId={userId}
        initial={editing === 'new' ? null : editing}
        onClose={() => {
          setEditing(null);
          load();
        }}
      />
    );

  return (
    <div>
      <button type="button" onClick={() => setEditing('new')} className={btnPrimary}>
        + Add a project
      </button>
      {error && <p className="mt-4 text-negative">{error}</p>}
      <ul className="mt-4 divide-y divide-hairline border-y border-hairline">
        {projects.length === 0 && !error && <li className="t-body py-4">No projects yet. The website shows sample projects until you publish your first one (a project is only shown once "Visible on the website" is ticked).</li>}
        {projects.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-4 py-3">
            <div>
              <p className="t-row text-[22px]">{p.name}</p>
              <p className="t-label">
                {p.shot_date?.slice(0, 4) ?? 'no date'} · {p.published ? 'published' : 'draft'}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setEditing(p)} className={btn}>
                Edit
              </button>
              <button
                type="button"
                onClick={async () => {
                  const result = await deleteProject(db, p);
                  if (result && result !== 'cancelled') setError(result);
                  else if (!result) load();
                }}
                className={btnDanger}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

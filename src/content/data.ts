/**
 * Content loader. Reads projects, photos and site settings from Supabase (60s ISR cache). With no
 * database or no published projects the site shows none; page text falls back to the admin's
 * default wording. Server-only: import from server components and route handlers.
 */
import { cache } from 'react';
import { getDb } from '@/lib/supabase/server';
import { PAGE_BY_KEY, resolvePage, rowName, type PageKey, type PageValues, type Vars } from './cms';
import { site as seedSite } from './site';
import type { CategorySlug, GalleryImage, Img, Project, SiteSettings } from './types';

type GalleryRow = {
  name: string;
  slug: string | null;
  client: string | null;
  category: CategorySlug | null;
  location: string | null;
  shot_date: string | null;
  camera: string | null;
  story: string | null;
  scope: string[] | null;
  links: { label: string; href: string }[] | null;
  featured: boolean;
  sort_order: number;
};
type ImageRow = {
  url: string;
  title: string;
  description: string | null;
  gallery: string;
  role: 'cover' | 'hover' | 'hero' | 'gallery';
  layout: GalleryImage['layout'] | null;
  category: CategorySlug | null;
  alt: string | null;
  exif: Partial<GalleryImage['exif']> | null;
  width: number | null;
  height: number | null;
  sort_order: number;
};

const byOrder = (a: ImageRow, b: ImageRow) => a.sort_order - b.sort_order;
const layoutFor = (w: number, h: number): GalleryImage['layout'] => (w / h < 0.9 ? 'portrait' : w / h > 1.8 ? 'full' : 'wide');

const toImg = (r: ImageRow, fallbackAlt: string): Img => ({
  src: r.url,
  alt: r.alt || r.title || fallbackAlt,
  width: r.width ?? 1600,
  height: r.height ?? 1067,
});

/** A photo with its resolved type (its own, else its project's) and gallery layout. */
function toPhoto(i: ImageRow, g: GalleryRow): GalleryImage {
  const img = toImg(i, g.name);
  const e = i.exif ?? {};
  return {
    ...img,
    caption: i.description ?? undefined,
    layout: i.layout ?? layoutFor(img.width, img.height),
    category: i.category ?? g.category ?? 'portraits',
    exif: { aperture: e.aperture ?? '', shutter: e.shutter ?? '', iso: e.iso ?? 0, focal: e.focal ?? '' },
  };
}

function toProject(g: GalleryRow, all: ImageRow[]): Project | null {
  if (!g.slug) return null;
  const mine = all.filter((i) => i.gallery === g.name).sort(byOrder);
  const role = (r: ImageRow['role']) => mine.filter((i) => i.role === r);
  const first = role('cover')[0] ?? role('hero')[0] ?? role('gallery')[0];
  if (!first) return null; // a project with no photos cannot be shown
  const cover = toImg(first, g.name);
  const hero = role('hero')[0];

  return {
    slug: g.slug,
    title: g.name,
    client: g.client ?? '',
    category: g.category ?? 'landscapes',
    location: g.location ?? '',
    date: g.shot_date ?? new Date().toISOString().slice(0, 10),
    camera: g.camera ?? '',
    cover,
    hoverFrames: role('hover').map((i) => toImg(i, g.name)),
    hero: hero ? toImg(hero, g.name) : cover,
    story: { en: g.story ?? '' },
    scope: g.scope ?? [],
    gallery: [...role('cover'), ...role('gallery')].map((i) => toPhoto(i, g)),
    photos: [...role('cover'), ...role('hero'), ...role('gallery')]
      .filter((i, k, all) => all.findIndex((x) => x.url === i.url) === k)
      .map((i) => toPhoto(i, g)),
    links: (g.links ?? []).filter((l) => /^https?:\/\//i.test(l.href)),
    featured: g.featured,
    order: g.sort_order,
  };
}

async function fetchProjects(): Promise<Project[] | null> {
  const db = getDb();
  if (!db) return null;
  try {
    const [g, i] = await Promise.all([
      db.from('galleries').select('*').order('sort_order').order('shot_date', { ascending: false }),
      db.from('images').select('*'),
    ]);
    if (g.error) throw g.error;
    if (i.error) throw i.error;
    return (g.data as GalleryRow[]).map((row) => toProject(row, i.data as ImageRow[])).filter((p): p is Project => !!p);
  } catch (e) {
    console.warn('[content] Supabase projects unavailable, using seed content:', e instanceof Error ? e.message : e);
    return null;
  }
}

/** Published projects, ordered. Only what is in the database: no built-in demo projects. */
export const getProjects = cache(async (): Promise<Project[]> => (await fetchProjects()) ?? []);

export const getProject = async (slug: string) => (await getProjects()).find((p) => p.slug === slug);

const getContent = cache(async (): Promise<Record<string, unknown>> => {
  const db = getDb();
  if (!db) return {};
  try {
    const { data, error } = await db.from('site_content').select('section, content');
    if (error) throw error;
    return Object.fromEntries((data ?? []).map((r: { section: string; content: unknown }) => [r.section, r.content]));
  } catch (e) {
    console.warn('[content] Supabase site_content unavailable, using seed content:', e instanceof Error ? e.message : e);
    return {};
  }
});

/** One page's editable content: what the owner saved in the admin, over the built-in wording. */
export const getPage = cache(
  async (key: PageKey): Promise<PageValues> => resolvePage(PAGE_BY_KEY[key], (await getContent())[rowName(key)]),
);

/** Site-wide settings, built from the Site-wide page's saved content. */
export const getSite = cache(async (): Promise<SiteSettings> => {
  const g = await getPage('global');
  const { brand: b, contact: c } = g;
  // Older saves keep links as { instagram: 'https://…' } instead of the `accounts` list; show those too.
  const saved = ((await getContent())[rowName('global')] as { social?: Record<string, unknown> } | undefined)?.social ?? {};
  const older = Object.entries(saved)
    .filter(([k, v]) => k !== 'accounts' && typeof v === 'string')
    .map(([k, v]) => ({ label: k.charAt(0).toUpperCase() + k.slice(1), url: v as string }));
  return {
    url: (g.seo.siteUrl || seedSite.url).replace(/\/+$/, ''),
    name: b.name,
    shortName: b.shortName,
    city: c.city,
    city2: c.city2,
    country: c.country,
    timezone: c.timezone,
    email: c.email,
    printsEmail: c.printsEmail,
    // Only web links reach an href: a `javascript:` URL saved in the database must never render.
    socials: [...(g.social.accounts as { label: string; url: string }[]), ...older]
      .filter((a) => a.label && /^https?:\/\//i.test(a.url))
      .map((a) => ({ label: a.label, href: a.url })),
    seoDescription: g.seo.description,
    notFoundLine: g.notfound.line,
  };
});

/** An About page with nothing on it (no biography, lists, portrait, CV or social links) is hidden. */
export const isAboutFilled = (about: PageValues, site: SiteSettings): boolean =>
  (about.biography.paragraphs as string[]).some((t) => t.trim()) ||
  Object.values(about.lists as Record<string, string[]>).some((l) => l.length > 0) ||
  !!about.portrait.image.src ||
  !!about.cv.url ||
  site.socials.length > 0;

/** Menu entries. Work and Contact always show; Exhibitions, Publications and About only once they have content. */
export const getNavLinks = cache(async (): Promise<{ href: string; label: string }[]> => {
  const [ex, pub, about, site] = await Promise.all([getPage('exhibitions'), getPage('publications'), getPage('about'), getSite()]);
  const has = (items: unknown) => (items as { title?: string }[]).some((i) => i.title?.trim());
  return [
    { href: '/work', label: 'Work' },
    ...(has(ex.list.items) ? [{ href: '/exhibitions', label: 'Exhibitions' }] : []),
    ...(has(pub.list.items) ? [{ href: '/publications', label: 'Publications' }] : []),
    ...(isAboutFilled(about, site) ? [{ href: '/about', label: 'About' }] : []),
    { href: '/contact', label: 'Contact' },
  ];
});

/** {name}, {city}… in owner-written text, filled from the site settings. */
export const siteVars = (s: SiteSettings): Vars => ({
  name: s.name, shortName: s.shortName, city: s.city, city2: s.city2, country: s.country, email: s.email,
});

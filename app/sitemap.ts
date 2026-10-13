import type { MetadataRoute } from 'next';
import { getNavLinks, getProjects, getSite } from '@/content/data';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [site, projects, links] = await Promise.all([getSite(), getProjects(), getNavLinks()]);
  // Only pages that are in the menu (empty sections are left out).
  const pages = links.map((l) => ({ url: `${site.url}${l.href}` }));
  const work = projects.map((p) => ({ url: `${site.url}/work/${p.slug}`, lastModified: p.date }));
  return [...pages, ...work];
}

import { getNavLinks, getProjects, getSite } from '@/content/data';

export const revalidate = 3600;

const BLURB: Record<string, string> = {
  '/work': 'selected series',
  '/exhibitions': 'solo and group shows',
  '/publications': 'books and magazines',
  '/about': 'biography, awards, press',
  '/contact': 'commissions and prints',
};

/** Short plain-text summary of the site for AI tools (llms.txt convention). */
export async function GET() {
  const [site, projects, links] = await Promise.all([getSite(), getProjects(), getNavLinks()]);
  const body = [
    `# ${site.name}`,
    '',
    `> Photographer based in ${site.city}, ${site.country}.`,
    '',
    '## Pages',
    ...links.map((l) => `- [${l.label}](${site.url}${l.href}): ${BLURB[l.href] ?? ''}`),
    '',
    '## Series',
    ...projects.map((p) => `- [${p.title}](${site.url}/work/${p.slug}): ${p.location}, ${p.date.slice(0, 4)}`),
    '',
    `Contact: ${site.email}`,
    '',
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}

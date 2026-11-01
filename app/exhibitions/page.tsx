import Link from 'next/link';
import { JsonLd } from '@/components/JsonLd';
import { getPage, getProjects, getSite } from '@/content/data';

export const metadata = { title: 'Exhibitions', description: 'Solo and group exhibitions.' };

type Item = { title: string; year: string; venue: string; city: string; country: string; type: string; series: string; image1: Pic; image2: Pic };
type Pic = { src: string; alt: string };

export default async function Exhibitions() {
  const [site, c, projects] = await Promise.all([getSite(), getPage('exhibitions'), getProjects()]);
  const items = (c.list.items as Item[]).filter((e) => e.title);
  const slugs = new Set(projects.map((p) => p.slug));

  // Newest year first; entries keep the order they were entered in within a year.
  const byYear = new Map<string, Item[]>();
  for (const e of items) byYear.set(e.year, [...(byYear.get(e.year) ?? []), e]);
  const years = [...byYear].sort(([a], [b]) => b.localeCompare(a));

  return (
    <div className="wall-page">
      <h1 className="sr-only">Exhibitions</h1>
      <JsonLd
        data={items.map((e) => ({
          '@context': 'https://schema.org',
          '@type': 'ExhibitionEvent',
          name: e.title,
          startDate: e.year,
          location: { '@type': 'Place', name: e.venue, address: [e.city, e.country].filter(Boolean).join(', ') },
          performer: { '@type': 'Person', name: site.name },
        }))}
      />
      {years.map(([year, list]) => (
        <section key={year} className="wall !mb-16">
          <h2 className="wall-label font-normal">{year}</h2>
          <div className="wall-body">
            {list.map((e) => (
              <div key={e.title + e.venue}>
                <p>{slugs.has(e.series) ? <Link href={`/work/${e.series}`} className="ulink">{e.title}</Link> : e.title}</p>
                <p className="text-muted">{e.venue}</p>
                <p className="text-muted">{[e.city, e.country].filter(Boolean).join(', ')}</p>
                <p className="text-muted">{e.type === 'group' ? 'Group exhibition' : 'Solo exhibition'}</p>
                {[e.image1, e.image2].some((i) => i.src) && (
                  <div className="mt-3 flex gap-3">
                    {[e.image1, e.image2]
                      .filter((i) => i.src)
                      .map((i) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i.src} src={i.src} alt={i.alt || `${e.title}, ${e.venue}`} className="h-auto w-[160px] max-w-[45%]" />
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

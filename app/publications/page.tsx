import { getPage } from '@/content/data';

export const metadata = { title: 'Publications', description: 'Books, magazines and zines.' };

type Item = { title: string; year: string; publisher: string; date: string; link: string; cover: { src: string; alt: string } };

export default async function Publications() {
  const items = ((await getPage('publications')).list.items as Item[]).filter((p) => p.title);

  const byYear = new Map<string, Item[]>();
  for (const p of items) byYear.set(p.year, [...(byYear.get(p.year) ?? []), p]);
  const years = [...byYear].sort(([a], [b]) => b.localeCompare(a));

  return (
    <div className="wall-page">
      <h1 className="sr-only">Publications</h1>
      {years.map(([year, list]) => (
        <section key={year} className="wall !mb-16">
          <h2 className="wall-label font-normal">{year}</h2>
          <div className="wall-body">
            {list.map((p) => (
              <div key={p.title + p.publisher}>
                <p>
                  {/^https?:\/\//i.test(p.link) ? (
                    <a href={p.link} target="_blank" rel="noopener noreferrer" className="ulink">
                      {p.title}
                    </a>
                  ) : (
                    p.title
                  )}
                </p>
                <p className="text-muted">{p.publisher}</p>
                <p className="text-muted">{p.date}</p>
                {p.cover.src && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.cover.src} alt={p.cover.alt || p.title} className="mt-3 h-auto w-[120px]" />
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

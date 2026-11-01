import { JsonLd } from '@/components/JsonLd';
import { fill } from '@/content/cms';
import { getPage, getSite, siteVars } from '@/content/data';

export const metadata = { title: 'About', description: 'Biography, awards, press and clients.' };

/** "Name | https://…" becomes a link; anything else is plain text. */
function Item({ text }: { text: string }) {
  const [name, url] = text.split('|').map((s) => s.trim());
  return url && /^https?:\/\//i.test(url) ? (
    <a href={url} target="_blank" rel="noopener noreferrer" className="ulink">
      {name}
    </a>
  ) : (
    <>{name}</>
  );
}

export default async function About() {
  const [site, c] = await Promise.all([getSite(), getPage('about')]);
  const vars = siteVars(site);
  const portrait = c.portrait.image as { src: string; alt: string };
  const paras = (c.biography.paragraphs as string[]).map((t) => fill(t, vars).trim()).filter(Boolean);
  // The first sentence is the one big line on the site; the rest of that paragraph follows in body size.
  const first = paras[0]?.match(/^.+?[.!?](?=\s|$)/)?.[0] ?? paras[0] ?? '';
  const rest = paras[0]?.slice(first.length).trim();
  const lists: [string, string[]][] = [
    ['Awards', c.lists.awards],
    ['Selected press', c.lists.press],
    ['Talks', c.lists.talks],
    ['Selected clients', c.lists.clients],
    ['Residencies', c.lists.residencies],
    ['Collections', c.lists.collections],
  ];

  return (
    <div className="wall-page">
      <h1 className="sr-only">About</h1>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: site.name,
          jobTitle: 'Photographer',
          url: `${site.url}/about`,
          ...(site.socials.length && { sameAs: site.socials.map((s) => s.href) }),
        }}
      />

      {portrait.src && (
        <div className="wall">
          <div className="wall-body">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={portrait.src} alt={portrait.alt || `Portrait of ${site.name}`} className="h-auto w-[320px] max-w-full" />
          </div>
        </div>
      )}

      {paras.length > 0 && (
        <section className="wall">
          <h2 className="wall-label font-normal">Biography</h2>
          <div className="wall-body">
            <p className="serif blur-in">{first}</p>
            {rest && <p>{rest}</p>}
            {paras.slice(1).map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>
        </section>
      )}

      {lists
        .filter(([, items]) => items.length > 0)
        .map(([label, items]) => (
          <section key={label} className="wall">
            <h2 className="wall-label font-normal">{label}</h2>
            <ul className="wall-body">
              {items.map((t) => (
                <li key={t}>
                  <Item text={t} />
                </li>
              ))}
            </ul>
          </section>
        ))}

      {site.socials.length > 0 && (
        <section className="wall">
          <h2 className="wall-label font-normal">Social</h2>
          <ul className="wall-body">
            {site.socials.map((s) => (
              <li key={s.href}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="ulink">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/^https?:\/\//i.test(c.cv.url) && (
        <div className="wall">
          <div className="wall-body">
            <a href={c.cv.url} target="_blank" rel="noopener noreferrer" className="ulink">
              Download CV (PDF)
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

import { fill } from '@/content/cms';
import { getPage, getSite, siteVars } from '@/content/data';

export const metadata = { title: 'Contact', description: 'Commissions, prints and press enquiries.' };

export default async function Contact() {
  const [site, c] = await Promise.all([getSite(), getPage('contact')]);
  // Without a second city the sentence would read "between Accra & ." so use the single-city line.
  const line = site.city2 ? fill(c.page.line, siteVars(site)) : `Based in ${site.city}. Working worldwide.`;

  return (
    <div className="wall-page">
      <h1 className="sr-only">Contact</h1>
      <p className="serif mb-16 max-w-[22em] !text-[clamp(22px,3vw,38px)] !leading-[1.15]">{line}</p>

      <section className="wall">
        <h2 className="wall-label font-normal">Studio</h2>
        <p className="wall-body">
          <a href={`mailto:${site.email}`} className="ulink">
            {site.email}
          </a>
        </p>
      </section>

      {site.printsEmail && (
        <section className="wall">
          <h2 className="wall-label font-normal">Prints</h2>
          <p className="wall-body">
            <a href={`mailto:${site.printsEmail}`} className="ulink">
              {site.printsEmail}
            </a>
          </p>
        </section>
      )}

      {site.socials.length > 0 && (
        <section className="wall">
          <h2 className="wall-label font-normal">Social</h2>
          <p className="wall-body flex flex-wrap gap-x-6 gap-y-2">
            {site.socials.map(({ label, href }) => (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="ulink">
                {label}
              </a>
            ))}
          </p>
        </section>
      )}
    </div>
  );
}

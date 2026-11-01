import { LandingStrip } from '@/components/sections/LandingStrip';
import { getProjects, getSite } from '@/content/data';

// Landing page: a strip of random photographs from across the work, then on into the series.
export default async function Home() {
  const [projects, site] = await Promise.all([getProjects(), getSite()]);
  const photos = projects
    .flatMap((p) =>
      (p.gallery.length ? p.gallery : p.photos).slice(0, 4).map((f) => ({
        src: f.src, alt: f.alt, width: f.width, height: f.height,
        slug: p.slug, title: p.title, place: p.location, year: p.date.slice(0, 4),
      })),
    ); // ponytail: 4 per series so every series shows and the page stays light; the browser picks the random order

  return (
    <div className="pt-(--top-h)">
      <h1 className="sr-only">
        {site.name}, photographer based in {site.city}
      </h1>
      <LandingStrip photos={photos} />
    </div>
  );
}

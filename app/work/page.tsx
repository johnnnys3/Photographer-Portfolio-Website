import { WorkBrowser } from '@/components/sections/WorkBrowser';
import { CATEGORY_OPTIONS } from '@/content/cms';
import { getProjects } from '@/content/data';

export const metadata = { title: 'Work', description: 'Selected photographic series.' };

export default async function Work() {
  const projects = await getProjects();
  const series = projects.map((p, i) => ({
    plate: String(i + 1).padStart(2, '0'),
    ratio: p.cover.width / p.cover.height,
    // up to three more photographs of the project, flipped through when a cover is hovered
    frames: (p.gallery.length ? p.gallery : p.photos)
      .filter((f) => f.src !== p.cover.src)
      .slice(0, 3)
      .map((f) => ({ src: f.src, alt: f.alt })),
    slug: p.slug,
    title: p.title,
    place: p.location,
    year: p.date.slice(0, 4),
    count: (p.gallery.length ? p.gallery : p.photos).length,
    cover: { src: p.cover.src, alt: p.cover.alt },
  }));

  // Every photograph with its own type (else its series' type), for the "By type" view.
  const photos = projects.flatMap((p) =>
    (p.gallery.length ? p.gallery : p.photos).map(({ src, alt, width, height, category }) => ({
      src, alt, width, height, type: category as string, slug: p.slug, title: p.title,
    })),
  );
  // Only types that have photographs: an empty "Events" never shows.
  const types = CATEGORY_OPTIONS.filter((c) => photos.some((p) => p.type === c.value));

  return (
    <div className="px-6 pt-(--top-h) md:px-(--edge)">
      <h1 className="sr-only">Work</h1>
      <WorkBrowser series={series} photos={photos} types={types} />
    </div>
  );
}

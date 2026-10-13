import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { JsonLd } from '@/components/JsonLd';
import { SeriesGallery } from '@/components/sections/SeriesGallery';
import { getProject, getProjects, getSite } from '@/content/data';

type Props = { params: Promise<{ slug: string }> };

// Series published after the build are rendered on first request, then cached (dynamicParams).
export const generateStaticParams = async () => (await getProjects()).map((p) => ({ slug: p.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProject((await params).slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.story.en || `${p.title}, ${p.location} ${p.date.slice(0, 4)}.`,
    openGraph: { images: [p.cover.src] },
  };
}

export default async function SeriesPage({ params }: Props) {
  const [p, projects, site] = await Promise.all([getProject((await params).slug), getProjects(), getSite()]);
  if (!p) notFound();
  const at = projects.findIndex((x) => x.slug === p.slug);
  const next = projects.length > 1 ? projects[(at + 1) % projects.length] : null;
  // Camera details line per photo, e.g. "35mm · f/2.0 · 1/250 · ISO 400" (only the parts that were entered).
  const photos = (p.gallery.length ? p.gallery : p.photos).map(({ src, alt, width, height, caption, exif: e }) => ({
    src,
    alt,
    width,
    height,
    caption,
    exif: [e.focal, e.aperture, e.shutter, e.iso ? `ISO ${e.iso}` : ''].filter(Boolean).join(' · '),
  }));

  return (
    <article>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ImageGallery',
          name: p.title,
          description: p.story.en,
          url: `${site.url}/work/${p.slug}`,
          dateCreated: p.date,
          creator: { '@type': 'Person', name: site.name },
          contentLocation: p.location,
          image: photos.map((i) => ({ '@type': 'ImageObject', contentUrl: i.src, description: i.alt })),
        }}
      />
      <SeriesGallery
        plate={String(at + 1).padStart(2, '0')}
        title={p.title}
        place={p.location}
        year={p.date.slice(0, 4)}
        statement={p.story.en}
        photos={photos}
        next={next && { slug: next.slug, title: next.title }}
        credit={`© ${site.name} ${new Date().getFullYear()}`}
      />
    </article>
  );
}

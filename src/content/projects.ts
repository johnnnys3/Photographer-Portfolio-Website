import { photo } from './site';
import type { CategorySlug, Exif, GalleryImage, Project } from './types';

const EXIFS: Exif[] = [
  { aperture: 'f/2.0', shutter: '1/250', iso: 400, focal: '35mm' },
  { aperture: 'f/1.4', shutter: '1/500', iso: 200, focal: '50mm' },
  { aperture: 'f/4', shutter: '1/125', iso: 800, focal: '23mm' },
  { aperture: 'f/2.8', shutter: '1/1000', iso: 100, focal: '85mm' },
];

// Mirrors the spec's gallery rhythm: 3 tall, 2 wide, 1 full-bleed.
const LAYOUTS: GalleryImage['layout'][] = ['portrait', 'portrait', 'portrait', 'wide', 'wide', 'full'];
const SIZE = { portrait: [1000, 1400], wide: [1600, 1067], full: [2400, 1200] } as const;

const gallery = (slug: string, title: string, category: CategorySlug): GalleryImage[] =>
  LAYOUTS.map((layout, i) => {
    const [w, h] = SIZE[layout];
    return {
      ...photo(`${slug}-g${i}`, w, h, `${title}, frame ${i + 1}`),
      layout,
      category,
      exif: EXIFS[i % EXIFS.length],
    };
  });

const project = (
  order: number,
  slug: string,
  title: string,
  client: string,
  category: CategorySlug,
  location: string,
  date: string,
  camera: string,
  story: string,
  scope: string[],
): Project => ({
  slug,
  title,
  client,
  category,
  location,
  date,
  camera,
  cover: photo(`${slug}-cover`, 1200, 1500, `${title} cover`),
  hoverFrames: [1, 2, 3].map((n) => photo(`${slug}-h${n}`, 1200, 1500, `${title}, alternate frame ${n}`)),
  hero: photo(`${slug}-hero`, 2400, 1400, `${title} hero`),
  story: { en: story },
  scope,
  gallery: gallery(slug, title, category),
  photos: gallery(slug, title, category),
  links: [],
  featured: order <= 4,
  order,
});

// PLACEHOLDER projects: replace with real work (or CMS documents).
export const projects: Project[] = [
  project(1, 'quiet-hours', 'Quiet Hours', 'Placeholder Studio', 'portraits', 'Accra, Ghana', '2026-03-14',
    'Fujifilm X-T5 / 35mm', 'A week of portraits made in the hour before the city wakes up.', ['Concept', 'Lighting', 'Retouching']),
  project(2, 'harbour-lights', 'Harbour Lights', 'Placeholder Magazine', 'editorial', 'Tema, Ghana', '2025-11-02',
    'Leica Q3 / 28mm', 'A night shift at the port, told in sodium light and long exposures.', ['Concept', 'Location', 'Edit']),
  project(3, 'open-air', 'Open Air', 'Placeholder Festival', 'events', 'Lagos, Nigeria', '2025-08-21',
    'Sony A7 IV / 24-70mm', 'Three days, forty thousand people, one very large sky.', ['Coverage', 'Same-day edit']),
  project(4, 'material-world', 'Material World', 'Placeholder Brand', 'commercial', 'Kumasi, Ghana', '2025-05-09',
    'Hasselblad X2D / 90mm', 'A campaign about cloth, craft and the hands behind both.', ['Creative direction', 'Set design', 'Retouching']),
  project(5, 'slow-film', 'Slow Film', 'Self-initiated', 'landscapes', 'Various', '2024-12-01',
    'Contax T2 / Portra 400', 'A year of unhurried frames on 35mm, developed by hand.', ['Concept', 'Darkroom']),
  project(6, 'after-rain', 'After Rain', 'Placeholder Records', 'portraits', 'Accra, Ghana', '2024-07-18',
    'Fujifilm GFX100S / 63mm', 'Album artwork shot in the forty minutes the storm allowed.', ['Concept', 'Lighting']),
];

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);

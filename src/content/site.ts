import type { Category, Img } from './types';

/** Placeholder photo. Swap for CMS assets; picsum seeds keep each frame stable. */
export const photo = (seed: string, width: number, height: number, alt: string): Img => ({
  src: `https://picsum.photos/seed/${seed}/${width}/${height}`,
  width,
  height,
  alt,
});

// PLACEHOLDER URL: set NEXT_PUBLIC_SITE_URL (or the address in Admin → Site-wide).
export const site = { url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com' };

// Photo types the admin can tag a series or a photo with.
export const categories: Category[] = [
  { slug: 'portraits', name: 'Portraits' },
  { slug: 'editorial', name: 'Editorial' },
  { slug: 'events', name: 'Events' },
  { slug: 'commercial', name: 'Commercial' },
  { slug: 'landscapes', name: 'Landscapes' },
];

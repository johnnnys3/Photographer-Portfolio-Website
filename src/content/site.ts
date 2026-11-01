import type { Category } from './types';

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

/** Localised text, ready for a second language: { en, fr } pairs from day one. */
export type Text = { en: string; fr?: string };

export type Img = { src: string; alt: string; width: number; height: number };

export type Exif = { aperture: string; shutter: string; iso: number; focal: string };

export type GalleryImage = Img & {
  caption?: string;
  category: CategorySlug; // the photo's own type (falls back to its project's)
  exif: Exif;
  layout: 'portrait' | 'wide' | 'full';
};

export type CategorySlug = 'portraits' | 'editorial' | 'events' | 'commercial' | 'landscapes';

export type Category = { slug: CategorySlug; name: string };

export type Project = {
  slug: string;
  title: string;
  client: string;
  category: CategorySlug;
  location: string;
  date: string; // ISO YYYY-MM-DD
  camera: string;
  cover: Img;
  hoverFrames: Img[];
  hero: Img;
  story: Text;
  scope: string[];
  gallery: GalleryImage[];
  /** Every photo of the project (cover, hero and gallery) for the "by type" wall on the Work page. */
  photos: GalleryImage[];
  links: { label: string; href: string }[];
  featured: boolean;
  order: number;
};

export type SiteSettings = {
  url: string; // canonical origin, no trailing slash
  name: string;
  shortName: string;
  city: string;
  city2: string; // second base, may be empty
  country: string;
  timezone: string; // of city
  email: string; // studio
  printsEmail: string;
  socials: { label: string; href: string }[];
  seoDescription: string;
  notFoundLine: string;
};

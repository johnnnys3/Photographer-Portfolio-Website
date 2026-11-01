import type { Exif } from './types';

/** `f/2.0 · 1/250 · ISO 400 · 35mm`, skipping any part that was never filled in. */
export const exifLine = (e: Exif) =>
  [e.aperture, e.shutter, e.iso ? `ISO ${e.iso}` : '', e.focal].filter(Boolean).join(' · ');

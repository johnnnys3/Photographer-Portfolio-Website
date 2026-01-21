// Data service for photographer portfolio
// This will work with real data from your backend/API

import { fetchImages, getGalleries } from '../lib/storage';
import type { DatabaseImage } from '../lib/supabase';

export interface Photo {
  id: string;
  url: string; // Primary field for image URL (matches DatabaseImage)
  src?: string; // Alias for url (for backward compatibility)
  title: string;
  description: string;
  tags: string[];
  gallery: string; // Primary field for gallery name (matches DatabaseImage)
  category?: string; // Alias for gallery (for backward compatibility)
  width: number;
  height: number;
  uploaded_at?: string;
}


export interface Category {
  id: string;
  name: string;
  count: number;
}

// Empty data arrays - will be populated from your real data source
export const carouselImages: Photo[] = [];
export const galleryImages: Photo[] = [];
export const categories: Category[] = [
  { id: 'all', name: 'All Work', count: 0 },
  { id: 'weddings', name: 'Weddings', count: 0 },
  { id: 'portraits', name: 'Portraits', count: 0 },
  { id: 'landscapes', name: 'Landscapes', count: 0 },
  { id: 'nature', name: 'Nature', count: 0 },
  { id: 'urban', name: 'Urban', count: 0 },
  { id: 'interior', name: 'Interior', count: 0 },
];

// Data fetching functions
export async function fetchCarouselImages(): Promise<Photo[]> {
  try {
    const images = await fetchImages();
    // Return the 6 most recent images for carousel
    return images.slice(0, 6).map((img: DatabaseImage) => ({
      id: img.id,
      url: img.url, // Primary field
      src: img.url, // Alias for backward compatibility
      title: img.title,
      description: img.description || '',
      tags: img.tags || [],
      gallery: img.gallery, // Primary field
      category: img.gallery, // Alias for backward compatibility
      width: img.width || 800, // Use actual width or default
      height: img.height || 600, // Use actual height or default
      uploaded_at: img.uploaded_at
    }));
  } catch (error) {
    return [];
  }
}

export async function fetchGalleryImages(): Promise<Photo[]> {
  try {
    const images = await fetchImages();
    return images.map((img: DatabaseImage) => ({
      id: img.id,
      url: img.url, // Primary field
      src: img.url, // Alias for backward compatibility
      title: img.title,
      description: img.description || '',
      tags: img.tags || [],
      gallery: img.gallery, // Primary field
      category: img.gallery, // Alias for backward compatibility
      width: img.width || 800, // Use actual width or default
      height: img.height || 600, // Use actual height or default
      uploaded_at: img.uploaded_at
    }));
  } catch (error) {
    return [];
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    // Use getGalleries() to get actual galleries from database
    const galleries = await getGalleries();
    
    // Return categories with 'all' option first, then actual galleries
    return [
      { id: 'all', name: 'All Work', count: 0 },
      ...galleries.map(gallery => ({
        id: gallery.id,
        name: gallery.name,
        count: gallery.count
      }))
    ];
  } catch (error) {
    // Return default categories on error
    return [
      { id: 'all', name: 'All Work', count: 0 },
      { id: 'weddings', name: 'Weddings', count: 0 },
      { id: 'portraits', name: 'Portraits', count: 0 },
      { id: 'landscapes', name: 'Landscapes', count: 0 },
      { id: 'nature', name: 'Nature', count: 0 },
      { id: 'urban', name: 'Urban', count: 0 },
      { id: 'interior', name: 'Interior', count: 0 },
    ];
  }
}

// Function to get images by category/gallery
export function getImagesByCategory(images: Photo[], categoryId: string): Photo[] {
  if (categoryId === 'all') return images;
  // Check both gallery (primary) and category (alias) for backward compatibility
  return images.filter(img => img.gallery === categoryId || img.category === categoryId);
}

// Function to get featured images - most recent from each gallery
export async function getFeaturedImages(count: number = 6): Promise<DatabaseImage[]> {
  try {
    // Get actual galleries from database
    const galleries = await getGalleries();
    const allImages = await fetchImages();
    const featuredImages: DatabaseImage[] = [];
    
    // For each actual gallery, find the most recent image
    for (const gallery of galleries) {
      const galleryImages = allImages
        .filter((img: DatabaseImage) => img.gallery === gallery.name || img.gallery === gallery.id)
        .sort((a: DatabaseImage, b: DatabaseImage) => {
          // Sort by uploaded_at descending (most recent first)
          const dateA = a.uploaded_at ? new Date(a.uploaded_at).getTime() : 0;
          const dateB = b.uploaded_at ? new Date(b.uploaded_at).getTime() : 0;
          return dateB - dateA;
        });
      
      // Take the most recent image from this gallery
      if (galleryImages.length > 0) {
        featuredImages.push(galleryImages[0]);
      }
    }
    
    // Return only the requested count
    return featuredImages.slice(0, count);
  } catch (error) {
    return [];
  }
}

// Function to update categories based on images
export function updateCategoriesFromImages(images: Photo[]): Category[] {
  const categoryCounts = images.reduce((acc, img) => {
    const category = img.category || img.gallery || '';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return [
    { id: 'all', name: 'All Work', count: images.length },
    { id: 'weddings', name: 'Weddings', count: categoryCounts['weddings'] || 0 },
    { id: 'portraits', name: 'Portraits', count: categoryCounts['portraits'] || 0 },
    { id: 'landscapes', name: 'Landscapes', count: categoryCounts['landscapes'] || 0 },
    { id: 'nature', name: 'Nature', count: categoryCounts['nature'] || 0 },
    { id: 'urban', name: 'Urban', count: categoryCounts['urban'] || 0 },
    { id: 'interior', name: 'Interior', count: categoryCounts['interior'] || 0 },
  ];
}

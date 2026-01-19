// Data service for photographer portfolio
// This will work with real data from your backend/API

export interface Photo {
  id: string;
  src: string;
  url: string; // Alternative field name for consistency
  title: string;
  description: string;
  tags: string[];
  category: string;
  gallery?: string; // Alternative field name
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
  { id: 'nature', name: 'Nature', count: 0 },
  { id: 'urban', name: 'Urban', count: 0 },
  { id: 'portrait', name: 'Portrait', count: 0 },
  { id: 'interior', name: 'Interior', count: 0 },
];

// Data fetching functions
export async function fetchCarouselImages(): Promise<Photo[]> {
  try {
    // Replace this with your actual API call
    // const response = await fetch('/api/images/carousel');
    // return await response.json();
    
    // For now, return empty array
    return [];
  } catch (error) {
    console.error('Failed to fetch carousel images:', error);
    return [];
  }
}

export async function fetchGalleryImages(): Promise<Photo[]> {
  try {
    // Replace this with your actual API call
    // const response = await fetch('/api/images/gallery');
    // return await response.json();
    
    // For now, return empty array
    return [];
  } catch (error) {
    console.error('Failed to fetch gallery images:', error);
    return [];
  }
}

export async function fetchCategories(): Promise<Category[]> {
  try {
    // Replace this with your actual API call
    // const response = await fetch('/api/categories');
    // return await response.json();
    
    // For now, return default categories with zero counts
    return [
      { id: 'all', name: 'All Work', count: 0 },
      { id: 'nature', name: 'Nature', count: 0 },
      { id: 'urban', name: 'Urban', count: 0 },
      { id: 'portrait', name: 'Portrait', count: 0 },
      { id: 'interior', name: 'Interior', count: 0 },
    ];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

// Function to get images by category
export function getImagesByCategory(images: Photo[], categoryId: string): Photo[] {
  if (categoryId === 'all') return images;
  return images.filter(img => img.category === categoryId);
}

// Function to get featured images
export function getFeaturedImages(images: Photo[], count: number = 6): Photo[] {
  return images.slice(0, count);
}

// Function to update categories based on images
export function updateCategoriesFromImages(images: Photo[]): Category[] {
  const categoryCounts = images.reduce((acc, img) => {
    acc[img.category] = (acc[img.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return [
    { id: 'all', name: 'All Work', count: images.length },
    { id: 'nature', name: 'Nature', count: categoryCounts['nature'] || 0 },
    { id: 'urban', name: 'Urban', count: categoryCounts['urban'] || 0 },
    { id: 'portrait', name: 'Portrait', count: categoryCounts['portrait'] || 0 },
    { id: 'interior', name: 'Interior', count: categoryCounts['interior'] || 0 },
  ];
}

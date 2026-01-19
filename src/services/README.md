# Data Service Documentation

This directory contains the data service that replaces the mock data system.

## Files

- `dataService.ts` - Main data service with interfaces and functions
- `README.md` - This documentation

## How to Use

### 1. Import the service

```typescript
import { 
  fetchCarouselImages, 
  fetchGalleryImages, 
  fetchCategories,
  Photo,
  Category 
} from '../services/dataService';
```

### 2. Fetch data in your components

```typescript
const [images, setImages] = useState<Photo[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadData = async () => {
    try {
      const data = await fetchGalleryImages();
      setImages(data);
    } catch (error) {
      console.error('Failed to load images:', error);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);
```

### 3. Handle loading and empty states

```typescript
{loading ? (
  <div>Loading...</div>
) : images.length > 0 ? (
  <div>{/* Render images */}</div>
) : (
  <div>No images available</div>
)}
```

## Data Structure

### Photo Interface

```typescript
interface Photo {
  id: string;
  src: string;
  url: string; // Alternative field name
  title: string;
  description: string;
  tags: string[];
  category: string;
  gallery?: string; // Alternative field name
  width: number;
  height: number;
  uploaded_at?: string;
}
```

### Category Interface

```typescript
interface Category {
  id: string;
  name: string;
  count: number;
}
```

## Available Functions

### `fetchCarouselImages()`
Returns carousel images for the homepage hero section.

### `fetchGalleryImages()`
Returns all gallery images for the gallery page.

### `fetchCategories()`
Returns available categories with image counts.

### `getImagesByCategory(images, categoryId)`
Filters images by category.

### `getFeaturedImages(images, count)`
Returns featured images for the homepage.

### `updateCategoriesFromImages(images)`
Updates category counts based on available images.

## Integration with Backend

To connect to your real backend, update the fetch functions in `dataService.ts`:

```typescript
export async function fetchGalleryImages(): Promise<Photo[]> {
  const response = await fetch('/api/images/gallery');
  return await response.json();
}
```

## Migration from Mock Data

1. Replace imports from `../data/mockData` with `../services/dataService`
2. Add loading states to your components
3. Add empty states for when no data is available
4. Handle both `src` and `url` fields for image sources

## Example Component

```typescript
import React, { useState, useEffect } from 'react';
import { fetchGalleryImages, Photo } from '../services/dataService';

export function MyComponent() {
  const [images, setImages] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGalleryImages().then(data => {
      setImages(data);
      setLoading(false);
    });
  }, []);

  if (loading) return <div>Loading...</div>;
  if (images.length === 0) return <div>No images</div>;

  return (
    <div>
      {images.map(image => (
        <img key={image.id} src={image.src || image.url} alt={image.title} />
      ))}
    </div>
  );
}
```

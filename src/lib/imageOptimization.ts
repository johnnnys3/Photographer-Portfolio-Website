/**
 * Image optimization utilities for better performance
 */

export interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  crop?: string;
}

/**
 * Generates optimized image URL with parameters
 * Note: This is a placeholder implementation. 
 * In production, you would integrate with a CDN or image service like Cloudinary, Imgix, etc.
 */
export function getOptimizedImageUrl(
  originalUrl: string, 
  options: ImageOptimizationOptions = {}
): string {
  // For now, return original URL since we don't have a CDN configured
  // In production, this would append optimization parameters to the URL
  return originalUrl;
}

/**
 * Determines if an image should be loaded lazily based on its position and context
 */
export function shouldUseLazyLoading(context: 'gallery' | 'carousel' | 'lightbox' | 'hero' | 'thumbnail'): boolean {
  // Carousel and lightbox images should load immediately since they're the main focus
  // Hero images should load immediately for above-the-fold content
  // Gallery and thumbnail images can use lazy loading
  return context === 'gallery' || context === 'thumbnail';
}

/**
 * Generates appropriate loading strategy for images
 */
export function getImageLoadingStrategy(context: 'gallery' | 'carousel' | 'lightbox' | 'hero' | 'thumbnail'): 'lazy' | 'eager' {
  return shouldUseLazyLoading(context) ? 'lazy' : 'eager';
}

/**
 * Preloads critical images for better perceived performance
 */
export function preloadCriticalImages(imageUrls: string[]): void {
  imageUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
}

/**
 * Creates a responsive image srcset for different screen sizes
 */
export function generateSrcSet(
  baseUrl: string, 
  widths: number[] = [320, 640, 768, 1024, 1280, 1536]
): string {
  // This is a placeholder implementation
  // In production, you would generate actual URLs for different widths
  return widths.map(width => `${baseUrl}?w=${width} ${width}w`).join(', ');
}

/**
 * Calculates appropriate image sizes attribute for responsive images
 */
export function getResponsiveSizes(sizes: string): string {
  const commonSizes = {
    'gallery': '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    'hero': '100vw',
    'thumbnail': '(max-width: 640px) 50vw, 25vw',
    'carousel': '100vw',
    'lightbox': '(max-width: 768px) 100vw, 80vw'
  };
  
  return commonSizes[sizes as keyof typeof commonSizes] || '100vw';
}

/**
 * Intersection Observer for advanced lazy loading with fade-in effect
 */
export class ImageLazyLoader {
  public observer: IntersectionObserver;
  private loadedImages = new Set<string>();

  constructor(options: IntersectionObserverInit = {}) {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            this.loadImage(img);
            this.observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before image comes into view
        threshold: 0.01,
        ...options
      }
    );
  }

  observe(img: HTMLImageElement): void {
    if (img.dataset.src && !this.loadedImages.has(img.dataset.src)) {
      this.observer.observe(img);
    }
  }

  private loadImage(img: HTMLImageElement): void {
    const src = img.dataset.src;
    if (!src) return;

    img.onload = () => {
      img.classList.add('loaded');
      this.loadedImages.add(src);
    };

    img.onerror = () => {
      img.classList.add('error');
    };

    img.src = src;
    img.classList.add('loading');
  }

  disconnect(): void {
    this.observer.disconnect();
  }
}

/**
 * Global lazy loader instance
 */
export const globalLazyLoader = new ImageLazyLoader();

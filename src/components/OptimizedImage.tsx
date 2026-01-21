import React, { useState, useRef, useEffect } from 'react';
import { getImageLoadingStrategy, globalLazyLoader } from '../lib/imageOptimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  context?: 'gallery' | 'carousel' | 'lightbox' | 'hero' | 'thumbnail';
  width?: number;
  height?: number;
  aspectRatio?: string;
  onLoad?: () => void;
  onError?: () => void;
  fallbackSrc?: string;
}

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

export function OptimizedImage({
  src,
  alt,
  className = '',
  context = 'gallery',
  width,
  height,
  aspectRatio,
  onLoad,
  onError,
  fallbackSrc = ERROR_IMG_SRC
}: OptimizedImageProps) {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [currentSrc, setCurrentSrc] = useState(src);
  const imgRef = useRef<HTMLImageElement>(null);

  const loadingStrategy = getImageLoadingStrategy(context);
  const shouldUseAdvancedLazyLoading = context === 'gallery' && loadingStrategy === 'lazy';

  useEffect(() => {
    setImageState('loading');
    setCurrentSrc(src);
  }, [src]);

  useEffect(() => {
    if (shouldUseAdvancedLazyLoading && imgRef.current) {
      // Use advanced lazy loading with intersection observer
      imgRef.current.dataset.src = src;
      globalLazyLoader.observe(imgRef.current);
    } else if (imgRef.current && !shouldUseAdvancedLazyLoading) {
      // Use standard loading
      imgRef.current.src = src;
    }

    return () => {
      if (imgRef.current && shouldUseAdvancedLazyLoading) {
        globalLazyLoader.observer.unobserve(imgRef.current);
      }
    };
  }, [src, shouldUseAdvancedLazyLoading]);

  const handleLoad = () => {
    setImageState('loaded');
    onLoad?.();
  };

  const handleError = () => {
    setImageState('error');
    setCurrentSrc(fallbackSrc);
    onError?.();
  };

  const containerStyle: React.CSSProperties = {};
  if (aspectRatio) {
    containerStyle.aspectRatio = aspectRatio;
  } else if (width && height) {
    containerStyle.aspectRatio = `${width} / ${height}`;
  }

  return (
    <div className={`relative ${className}`} style={containerStyle}>
      {/* Loading skeleton */}
      {imageState === 'loading' && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
          </div>
        </div>
      )}

      {/* Error state */}
      {imageState === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
          <img
            src={fallbackSrc}
            alt="Error loading image"
            className="w-12 h-12 opacity-50"
          />
        </div>
      )}

      {/* Main image */}
      <img
        ref={imgRef}
        src={shouldUseAdvancedLazyLoading ? undefined : currentSrc}
        data-src={shouldUseAdvancedLazyLoading ? currentSrc : undefined}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 rounded ${
          imageState === 'loaded' ? 'opacity-100' : 'opacity-0'
        } ${imageState === 'loading' ? 'animate-pulse' : ''}`}
        loading={shouldUseAdvancedLazyLoading ? undefined : loadingStrategy}
        onLoad={handleLoad}
        onError={handleError}
        decoding="async"
      />
    </div>
  );
}

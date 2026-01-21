import { useState, useRef, useEffect } from 'react';
import type { DatabaseImage } from '../lib/supabase';
import { isTouchDevice, addTouchFriendlyHover } from '../lib/touchInteractions';
import { Download, Share2 } from 'lucide-react';

interface GalleryCardProps {
  photo: DatabaseImage;
  onClick: () => void;
}

const ERROR_IMG_SRC =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==';

export function GalleryCard({ photo, onClick }: GalleryCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const isTouch = isTouchDevice();

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  // Setup touch-friendly interactions
  useEffect(() => {
    if (cardRef.current) {
      addTouchFriendlyHover(cardRef.current);
    }
  }, []);

  // Ensure we have a valid image URL
  const imageUrl = photo?.url || ERROR_IMG_SRC;
  
  // Use actual aspect ratio if available, otherwise default to square for grid consistency
  const hasDimensions = photo?.width && photo?.height && photo.width > 0 && photo.height > 0;
  const aspectRatio = hasDimensions 
    ? `${photo.width} / ${photo.height}`
    : '1 / 1'; // Default to square

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden rounded-lg cursor-pointer transition duration-300 ease-in-out shadow-md ${
        isTouch 
          ? 'touch-manipulation active:scale-105 active:shadow-xl' 
          : 'transform hover:scale-105 hover:shadow-xl'
      }`}
      onMouseEnter={() => !isTouch && setIsHovered(true)}
      onMouseLeave={() => !isTouch && setIsHovered(false)}
      onClick={onClick}
    >
      {/* Image Container with proper aspect ratio */}
      <div 
        className="relative w-full bg-gray-100 dark:bg-gray-800"
        style={{ aspectRatio }}
      >
        {imageLoading && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700 animate-pulse">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <img
              src={ERROR_IMG_SRC}
              alt="Error loading image"
              className="w-16 h-16 opacity-50"
            />
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={photo?.title || 'Gallery image'}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              imageLoading ? 'opacity-0' : 'opacity-100'
            }`}
            loading="lazy"
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
        )}
      </div>
      
      {/* Hover Overlay - Touch-friendly */}
      <div
        className={`absolute inset-0 bg-black bg-opacity-80 flex flex-col justify-end p-4 transition duration-300 ease-in-out ${
          isTouch 
            ? 'opacity-0 active:opacity-100' 
            : isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <h3 className="text-white text-lg sm:text-xl mb-2">{photo?.title || 'Untitled'}</h3>
        {photo?.description && (
          <p className="text-gray-300 text-sm mb-3 line-clamp-2">{photo.description}</p>
        )}
        {/* Tags - Tailwind: flex flex-wrap gap-2 */}
        {photo?.tags && photo.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {photo.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-orange-500 bg-opacity-80 text-white text-xs rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Share and Download Buttons */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Share functionality would go here
            }}
            className="p-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-white hover:bg-opacity-30 transition-colors"
            title="Share image"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Download functionality would go here
              const link = document.createElement('a');
              link.href = photo?.url || '';
              link.download = `${photo?.title || 'image'}_${photo?.id}.jpg`;
              link.click();
            }}
            className="p-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-white hover:bg-opacity-30 transition-colors"
            title="Download image"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

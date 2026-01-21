import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DatabaseImage } from '../lib/supabase';

interface ImageCarouselProps {
  images: DatabaseImage[];
}

export function ImageCarousel({ images }: ImageCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 320; // Width of image + gap
      const currentScroll = scrollContainerRef.current.scrollLeft;
      const newScroll = direction === 'left' 
        ? currentScroll - scrollAmount 
        : currentScroll + scrollAmount;
      
      scrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="relative w-full bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-black mb-2">
            Recent Shoots
          </h2>
          <p className="text-gray-600">
            Explore my latest photography work
          </p>
        </div>

        {/* Scrollable Container */}
        <div className="relative">
          {/* Left Scroll Button */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-100 p-2 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 border border-gray-200"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5 text-black" />
          </button>

          {/* Right Scroll Button */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white hover:bg-gray-100 p-2 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:scale-105 border border-gray-200"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5 text-black" />
          </button>

          {/* Image Gallery */}
          <div 
            ref={scrollContainerRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth px-12"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {images.map((image) => (
              <div
                key={image.id}
                className="flex-none w-80 group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition duration-300 ease-in-out transform hover:scale-105">
                  {/* Aspect ratio container */}
                  <div className="aspect-square bg-gray-100">
                    <img
                      src={image.url}
                      alt={image.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out flex items-end justify-center z-10">
                      <div className="text-white p-4 text-center">
                        <h3 className="text-lg font-semibold mb-1">
                          {image.title}
                        </h3>
                        <p className="text-sm text-gray-200 line-clamp-2">
                          {image.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
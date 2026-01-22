import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useData } from '../contexts/DataContext';
import type { DatabaseImage } from '../lib/supabase';

interface HomePageProps {
  onImageClick: (imageId: string) => void;
  onNavigate?: (page: string) => void;
}

export function HomePage({ onImageClick }: HomePageProps) {
  const { images, loading: dataLoading } = useData();
  const [currentImageSet, setCurrentImageSet] = useState(0);

  // Filter portrait images from database
  const portraitImages = images.filter((img: DatabaseImage) => {
    // Consider portrait if height > width or if it's in portrait gallery
    return (img.height && img.width && img.height > img.width) || img.gallery === 'portraits';
  });

  // Create sets of 3 portrait images for rotation
  const createImageSets = () => {
    const sets = [];
    const shuffled = [...portraitImages].sort(() => Math.random() - 0.5);
    
    // Create as many full sets of 3 as possible
    for (let i = 0; i < shuffled.length; i += 3) {
      const set = shuffled.slice(i, i + 3);
      // If we have less than 3 images, fill from the beginning
      while (set.length < 3 && shuffled.length > 0) {
        const missingCount = 3 - set.length;
        const additionalImages = shuffled.slice(0, missingCount);
        set.push(...additionalImages);
      }
      sets.push(set);
    }
    
    // If we don't have enough portrait images, supplement with landscape images
    if (sets.length === 0 && images.length > 0) {
      const shuffledAll = [...images].sort(() => Math.random() - 0.5);
      const firstSet = shuffledAll.slice(0, 3);
      // Fill remaining slots if needed
      while (firstSet.length < 3 && shuffledAll.length > 0) {
        firstSet.push(shuffledAll[firstSet.length % shuffledAll.length]);
      }
      sets.push(firstSet.slice(0, 3));
    }
    
    return sets;
  };

  const imageSets = createImageSets();
  const currentSet = imageSets[currentImageSet] || [];

  // Debug logging
  console.log('Total portrait images:', portraitImages.length);
  console.log('Total image sets created:', imageSets.length);
  console.log('Current image set index:', currentImageSet);
  console.log('Current set images:', currentSet.map(img => ({ id: img.id, title: img.title, gallery: img.gallery })));
  console.log('All sets:', imageSets.map((set, index) => ({
    setIndex: index,
    imageCount: set.length,
    imageIds: set.map(img => img.id)
  })));

  // Only shuffle on initial load - no auto-rotation
  useEffect(() => {
    setCurrentImageSet(0);
  }, [images]);

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section - Photography Focus */}
      <div className="bg-white dark:bg-black px-4 sm:px-6 lg:px-8 w-full flex items-center justify-center mt-16" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <div className="w-full max-w-6xl mx-auto text-center">
          {/* Main Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl mb-6 text-black dark:text-white font-bold leading-tight">
            Capturing moments. Creating memories.
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Professional photography that tells your story through stunning visuals and creative composition.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/contact"
              className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-black dark:text-white border border-black dark:border-gray-600 py-3 px-8 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg text-lg font-medium"
            >
              Book Session
            </Link>
          </div>
        </div>
      </div>

      {/* Featured Gallery Section - Grid */}
      <div className="bg-white dark:bg-black py-16 px-4 sm:px-6 lg:px-8 w-full">
        <div className="w-full max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl mb-12 text-black dark:text-white text-center font-bold">
            Featured Gallery
          </h2>
          
          {/* Grid Layout */}
          {dataLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : currentSet.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {currentSet.map((image, index) => {
                // Force portrait aspect ratio for all images
                const aspectRatio = '3 / 4'; // Portrait ratio
                
                return (
                  <div
                    key={`${image.id}-${currentImageSet}-${index}`}
                    onClick={() => onImageClick(image.id)}
                    className="relative overflow-hidden rounded-lg cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-xl group"
                  >
                    <div 
                      className="relative w-full bg-gray-100 dark:bg-gray-800"
                      style={{ aspectRatio }}
                    >
                      <img
                        src={image.url}
                        alt={image.title}
                        className="w-full h-full object-cover"
                        style={{ objectPosition: 'center' }}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out flex items-end justify-center z-10">
                        <h3 className="text-white text-xl font-semibold p-4">
                          {image.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : null}

          {/* Navigation Controls */}
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setCurrentImageSet((prev) => (prev - 1 + imageSets.length) % imageSets.length)}
              disabled={imageSets.length <= 1}
              className="p-2 rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
              aria-label="Previous images"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="flex gap-2">
              {imageSets.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImageSet(index)}
                  className={`w-2 h-2 rounded-full transition duration-300 ${
                    index === currentImageSet 
                      ? 'bg-black dark:bg-white' 
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                  }`}
                  aria-label={`Go to image set ${index + 1}`}
                />
              ))}
            </div>
            
            <button
              onClick={() => setCurrentImageSet((prev) => (prev + 1) % imageSets.length)}
              disabled={imageSets.length <= 1}
              className="p-2 rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
              aria-label="Next images"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* About Preview Section */}
      <div className="bg-gray-50 dark:bg-gray-900 py-16 px-4 sm:px-6 lg:px-8 w-full">
        <div className="w-full max-w-6xl mx-auto text-center">
          {/* About Label */}
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 tracking-wide uppercase">
            About
          </p>
          
          <h2 className="text-3xl sm:text-4xl mb-6 text-black dark:text-white font-bold">
            Behind the Lens
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            With over a decade of experience in professional photography, I specialize in capturing 
            beauty of moments through landscape, portrait, and event photography. My work has been 
            featured in numerous publications and exhibitions worldwide.
          </p>
          <Link
            href="/about"
            className="text-black dark:text-white hover:text-gray-800 dark:hover:text-gray-200 text-lg inline-flex items-center gap-2 transition duration-300 font-medium"
          >
            Learn More
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

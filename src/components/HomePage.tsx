import { useState, useEffect } from 'react';
import { ImageCarousel } from './ImageCarousel';
import { getFeaturedImages } from '../services/dataService';
import { getSiteContent, CONTENT_SECTIONS } from '../services/contentService';
import { useData } from '../contexts/DataContext';
import { ArrowRight } from 'lucide-react';
import type { DatabaseImage } from '../lib/supabase';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onImageClick: (imageId: string) => void;
}

export function HomePage({ onNavigate, onImageClick }: HomePageProps) {
  const { images, loading: dataLoading } = useData();
  const [siteContent, setSiteContent] = useState<any>({});
  const [featuredImages, setFeaturedImages] = useState<DatabaseImage[]>([]);

  // Derive carousel images from centralized data
  const carouselImages = images.slice(0, 6);

  // Load featured images
  useEffect(() => {
    const loadFeaturedImages = async () => {
      try {
        const featured = await getFeaturedImages(6);
        setFeaturedImages(featured);
      } catch (error) {
      }
    };
    
    loadFeaturedImages();
  }, []);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const heroContent = await getSiteContent(CONTENT_SECTIONS.HOME_HERO);
        setSiteContent(heroContent || {});
      } catch (error) {
      }
    };

    loadContent();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Carousel */}
      {dataLoading ? (
        <div className="h-96 bg-gray-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : carouselImages.length > 0 ? (
        <ImageCarousel images={carouselImages} />
      ) : null}

      {/* CTA Section - Tailwind: bg-white py-16 px-4 */}
      <div className="bg-white py-16 px-4 sm:px-6 lg:px-8 w-full">
        <div className="w-full text-center">
          <h1 className="text-3xl sm:text-5xl mb-6 text-gray-900">
            {siteContent?.title || "Capturing Moments, Creating Memories"}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            {siteContent?.subtitle || "Professional photography that tells your story through stunning visuals and creative composition."}
          </p>
          {/* CTA Button - Tailwind: bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded */}
          <button
            onClick={() => onNavigate('galleries')}
            className="bg-black hover:bg-gray-800 text-white py-3 px-8 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg inline-flex items-center gap-2 text-lg"
          >
            View My Work
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Featured Work Section - Tailwind: bg-gray-50 py-16 px-4 */}
      <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8 w-full">
        <div className="w-full">
          <h2 className="text-3xl sm:text-4xl mb-8 text-gray-900 text-center">
            Featured Work
          </h2>
          
          {/* Grid - Tailwind: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 */}
          {dataLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : featuredImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredImages.map((image) => {
                // Calculate aspect ratio from image dimensions if available, otherwise use 4:3
                const aspectRatio = image.width && image.height 
                  ? `${image.width} / ${image.height}`
                  : '4 / 3';
                
                return (
                  <div
                    key={image.id}
                    onClick={() => onImageClick(image.id)}
                    className="relative overflow-hidden rounded-lg cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-xl group"
                  >
                    {/* Aspect ratio container */}
                    <div 
                      className="relative w-full bg-gray-100"
                      style={{ aspectRatio }}
                    >
                      <img
                        src={image.url}
                        alt={image.title}
                        className="w-full h-full object-cover"
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

          {/* View All Button */}
          <div className="text-center mt-12">
            <button
              onClick={() => onNavigate('galleries')}
              className="text-black hover:text-gray-800 text-lg inline-flex items-center gap-2 transition duration-300"
            >
              View All Galleries
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* About Preview Section */}
      <div className="bg-white py-16 px-4 sm:px-6 lg:px-8 w-full">
        <div className="w-full text-center">
          <h2 className="text-3xl sm:text-4xl mb-6 text-gray-900">
            About the Photographer
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            With over 10 years of experience in professional photography, I specialize
            in landscape, urban, and portrait photography. My work has been featured
            in numerous publications and exhibitions worldwide.
          </p>
          <button
            onClick={() => onNavigate('about')}
            className="text-black hover:text-gray-800 text-lg inline-flex items-center gap-2 transition duration-300"
          >
            Learn More
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

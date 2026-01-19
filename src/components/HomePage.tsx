import React, { useState, useEffect } from 'react';
import { ImageCarousel } from './ImageCarousel';
import { fetchCarouselImages, fetchGalleryImages, getFeaturedImages, Photo } from '../services/dataService';
import { ArrowRight } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: string) => void;
  onImageClick: (imageId: string) => void;
}

export function HomePage({ onNavigate, onImageClick }: HomePageProps) {
  const [carouselImages, setCarouselImages] = useState<Photo[]>([]);
  const [featuredImages, setFeaturedImages] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [carouselData, galleryData] = await Promise.all([
          fetchCarouselImages(),
          fetchGalleryImages()
        ]);
        
        setCarouselImages(carouselData);
        setFeaturedImages(getFeaturedImages(galleryData, 6));
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Carousel */}
      {loading ? (
        <div className="h-96 bg-gray-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      ) : carouselImages.length > 0 ? (
        <ImageCarousel images={carouselImages} />
      ) : (
        <div className="h-96 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 mb-4">No carousel images available</div>
            <p className="text-gray-500 text-sm">Upload images to see them here</p>
          </div>
        </div>
      )}

      {/* CTA Section - Tailwind: bg-white py-16 px-4 */}
      <div className="bg-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl mb-6 text-gray-900">
            Capturing Moments, Creating Memories
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Professional photography that tells your story through stunning visuals
            and creative composition.
          </p>
          {/* CTA Button - Tailwind: bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded */}
          <button
            onClick={() => onNavigate('galleries')}
            className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-8 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-lg inline-flex items-center gap-2 text-lg"
          >
            View My Work
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Featured Work Section - Tailwind: bg-gray-50 py-16 px-4 */}
      <div className="bg-gray-50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl mb-8 text-gray-900 text-center">
            Featured Work
          </h2>
          
          {/* Grid - Tailwind: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : featuredImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredImages.map((image) => (
                <div
                  key={image.id}
                  onClick={() => onImageClick(image.id)}
                  className="relative overflow-hidden rounded-lg cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-xl group"
                >
                  <img
                    src={image.src || image.url}
                    alt={image.title}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition duration-300 ease-in-out flex items-center justify-center">
                    <h3 className="text-white text-xl opacity-0 group-hover:opacity-100 transition duration-300">
                      {image.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">No featured images available</div>
              <p className="text-gray-500 text-sm mb-6">Upload images to see them here</p>
              <button
                onClick={() => onNavigate('galleries')}
                className="text-orange-500 hover:text-orange-600 underline"
              >
                Browse galleries
              </button>
            </div>
          )}

          {/* View All Button */}
          <div className="text-center mt-12">
            <button
              onClick={() => onNavigate('galleries')}
              className="text-orange-500 hover:text-orange-600 text-lg inline-flex items-center gap-2 transition duration-300"
            >
              View All Galleries
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* About Preview Section */}
      <div className="bg-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
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
            className="text-orange-500 hover:text-orange-600 text-lg inline-flex items-center gap-2 transition duration-300"
          >
            Learn More
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

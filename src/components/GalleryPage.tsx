import React, { useState, useEffect } from 'react';
import Masonry from 'react-responsive-masonry';
import { GalleryCard } from './GalleryCard';
import { fetchGalleryImages, fetchCategories, getImagesByCategory, Photo, Category } from '../services/dataService';
import { Grid, Grid3x3 } from 'lucide-react';

interface GalleryPageProps {
  onImageClick: (imageId: string) => void;
}

export function GalleryPage({ onImageClick }: GalleryPageProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [galleryImages, setGalleryImages] = useState<Photo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 12;

  const filteredImages = selectedCategory === 'all'
    ? galleryImages
    : getImagesByCategory(galleryImages, selectedCategory);

  const totalPages = Math.ceil(filteredImages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedImages = filteredImages.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [imagesData, categoriesData] = await Promise.all([
          fetchGalleryImages(),
          fetchCategories()
        ]);
        
        setGalleryImages(imagesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-white pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl mb-4 text-gray-900">Gallery</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore my collection of photography across various categories
          </p>
        </div>

        {/* Category Filter - Tailwind: flex flex-wrap justify-center gap-3 mb-12 */}
        {loading ? (
          <div className="flex justify-center gap-3 mb-12">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-20 h-10 bg-gray-200 animate-pulse rounded-full"></div>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-full transition duration-300 ease-in-out ${
                  selectedCategory === category.id
                    ? 'bg-orange-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name} ({category.count})
              </button>
            ))}
          </div>
        )}

        {/* Masonry Grid - Tailwind: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 */}
        {/* Using react-responsive-masonry for better layout */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : paginatedImages.length > 0 ? (
          <>
            <Masonry columnsCount={1} gutter="16px" className="sm:hidden">
              {paginatedImages.map((photo) => (
                <GalleryCard
                  key={photo.id}
                  photo={photo}
                  onClick={() => onImageClick(photo.id)}
                />
              ))}
            </Masonry>

            <Masonry columnsCount={2} gutter="16px" className="hidden sm:block lg:hidden">
              {paginatedImages.map((photo) => (
                <GalleryCard
                  key={photo.id}
                  photo={photo}
                  onClick={() => onImageClick(photo.id)}
                />
              ))}
            </Masonry>

            <Masonry columnsCount={3} gutter="16px" className="hidden lg:block xl:hidden">
              {paginatedImages.map((photo) => (
                <GalleryCard
                  key={photo.id}
                  photo={photo}
                  onClick={() => onImageClick(photo.id)}
                />
              ))}
            </Masonry>

            <Masonry columnsCount={4} gutter="16px" className="hidden xl:block">
              {paginatedImages.map((photo) => (
                <GalleryCard
                  key={photo.id}
                  photo={photo}
                  onClick={() => onImageClick(photo.id)}
                />
              ))}
            </Masonry>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">No images found</div>
            <p className="text-gray-500 text-sm">
              {selectedCategory === 'all' 
                ? "No images have been uploaded yet." 
                : `No images found in the "${selectedCategory}" category.`
              }
            </p>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-orange-500 hover:text-orange-600 underline mt-4"
              >
                View all images
              </button>
            )}
          </div>
        )}

        {/* Pagination - Tailwind: flex justify-center items-center gap-2 mt-12 */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
            >
              Previous
            </button>
            
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg transition duration-300 ${
                    currentPage === page
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
            >
              Next
            </button>
          </div>
        )}

        {/* Results Info */}
        <div className="text-center mt-8 text-gray-600">
          Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredImages.length)} of {filteredImages.length} images
        </div>
      </div>
    </div>
  );
}

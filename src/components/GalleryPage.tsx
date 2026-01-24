import { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';

interface GalleryPageProps {
  onImageClick: (imageId: string) => void;
}

export function GalleryPage({ onImageClick }: GalleryPageProps) {
  const { images, galleries, loading } = useData();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Filter images based on selected category
  const filteredImages = selectedCategory === 'all'
    ? images
    : images.filter(img => img.gallery === selectedCategory);

  const totalPages = Math.ceil(filteredImages.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedImages = filteredImages.slice(startIndex, startIndex + itemsPerPage);

  // Ensure currentPage is always within valid range
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    } else if (currentPage < 1 && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    // Reset to page 1 when category changes
    setCurrentPage(1);
  }, [selectedCategory]);

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-24 pb-16 px-4 sm:px-6 lg:px-8 w-full">
      <div className="w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl mb-4 text-gray-900 dark:text-white">Gallery</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
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
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full transition duration-300 ease-in-out ${
                selectedCategory === 'all'
                  ? 'bg-black text-white shadow-lg'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              All ({images.length})
            </button>
            {galleries.map((gallery) => (
              <button
                key={gallery.id}
                onClick={() => setSelectedCategory(gallery.id)}
                className={`px-4 py-2 rounded-full transition duration-300 ease-in-out ${
                  selectedCategory === gallery.id
                    ? 'bg-black text-white shadow-lg'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {gallery.name} ({gallery.count})
              </button>
            ))}
          </div>
        )}

        {/* Enhanced Masonry Grid - Mobile Optimized */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : paginatedImages.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {paginatedImages.map((image) => (
              <div
                key={image.id}
                onClick={() => onImageClick(image.id)}
                className="break-inside-avoid mb-4 cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 group"
              >
                <div className="relative overflow-hidden rounded-lg">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out flex items-end justify-center z-10">
                    <h3 className="text-white text-sm font-semibold p-2">{image.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-400 dark:text-gray-500 mb-4">No images found</div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {selectedCategory === 'all' 
                ? "No images have been uploaded yet." 
                : `No images found in the "${selectedCategory}" category.`
              }
            </p>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-black dark:text-white hover:text-gray-800 dark:hover:text-gray-200 underline mt-4"
              >
                View all images
              </button>
            )}
          </div>
        )}

        {/* Pagination - Tailwind: flex justify-center items-center gap-2 mt-12 */}
        {totalPages > 1 && filteredImages.length > 0 && (
          <div className="flex flex-col items-center gap-4 mt-12">
            {/* Page info */}
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredImages.length)} of {filteredImages.length} images
            </div>
            
            <div className="flex justify-center items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1 || totalPages === 0}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
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
                        ? 'bg-black text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition duration-300"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

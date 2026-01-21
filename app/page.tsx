/**
 * MIGRATION NOTE:
 * Source: src/App.tsx (home page section)
 * Destination: app/page.tsx
 * This page converts the home page from state-based routing to Next.js App Router.
 * The HomePage component logic is preserved exactly from the original implementation.
 * Any deviation is unintentional and should be flagged.
 */

'use client';

import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { HomePage } from '@/components/HomePage';
import { Lightbox } from '@/components/Lightbox';
import { useData } from '@/contexts/DataContext';
import { PageErrorBoundary, ComponentErrorBoundary } from '@/components/ErrorBoundary';

export default function Home() {
  const { images } = useData();
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const handleImageClick = (imageId: string) => {
    setSelectedImageId(imageId);
  };

  const handleCloseLightbox = () => {
    setSelectedImageId(null);
  };

  const selectedImage = selectedImageId
    ? images.find(img => img.id === selectedImageId)
    : null;

  const currentIndex = selectedImageId
    ? images.findIndex(img => img.id === selectedImageId)
    : -1;

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setSelectedImageId(images[currentIndex + 1].id);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setSelectedImageId(images[currentIndex - 1].id);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black w-full">
      {/* Navigation - show on all pages except when viewing single image in lightbox */}
      <ComponentErrorBoundary componentName="Navigation">
        {!selectedImage && <Navigation currentPage="home" />}
      </ComponentErrorBoundary>

      {/* Page Content */}
      <PageErrorBoundary context="home">
        <HomePage onImageClick={handleImageClick} />
      </PageErrorBoundary>

      {/* Lightbox Modal */}
      <ComponentErrorBoundary componentName="Lightbox">
        {selectedImage && (
          <Lightbox
            photo={selectedImage}
            images={images}
            currentIndex={currentIndex}
            onClose={handleCloseLightbox}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )}
      </ComponentErrorBoundary>
    </div>
  );
}

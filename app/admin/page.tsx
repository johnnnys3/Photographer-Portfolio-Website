/**
 * MIGRATION NOTE:
 * Source: src/App.tsx (admin page section)
 * Destination: app/admin/page.tsx
 * This page converts the admin page from state-based routing to Next.js App Router.
 * The admin authentication logic is preserved exactly from the original implementation.
 * Any deviation is unintentional and should be flagged.
 */

'use client';

import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { AdminDashboard } from '@/components/AdminDashboardNew';
import { AdminLogin } from '@/components/AdminLogin';
import { Lightbox } from '@/components/Lightbox';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { PageErrorBoundary, ComponentErrorBoundary } from '@/components/ErrorBoundary';

export default function Admin() {
  const { user, isAdmin, sessionValid } = useAuth();
  const { images } = useData();
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [requireAuth, setRequireAuth] = useState(true); // Always require auth for admin page

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

  // Admin login screen - check for valid admin session
  if (!user || !isAdmin || !sessionValid || requireAuth) {
    return <AdminLogin onLogin={() => setRequireAuth(false)} />;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black w-full">
      {/* Navigation - show on all pages except when viewing single image in lightbox */}
      <ComponentErrorBoundary componentName="Navigation">
        {!selectedImage && <Navigation currentPage="admin" />}
      </ComponentErrorBoundary>

      {/* Page Content */}
      <PageErrorBoundary context="admin">
        {user && isAdmin && sessionValid && <AdminDashboard />}
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

import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { HomePage } from './components/HomePage';
import { GalleryPage } from './components/GalleryPage';
import { AboutPage } from './components/AboutPage';
import { ContactPage } from './components/ContactPage';
import { AdminDashboard } from './components/AdminDashboardNew';
import { AdminLogin } from './components/AdminLogin';
import { Lightbox } from './components/Lightbox';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider, useData } from './contexts/DataContext';
import { ErrorBoundary, PageErrorBoundary, ComponentErrorBoundary } from './components/ErrorBoundary';
import { Lock } from 'lucide-react';

type Page = 'home' | 'galleries' | 'about' | 'contact' | 'admin';

function AppContent() {
  const { user, isAdmin, sessionValid } = useAuth();
  const { images } = useData();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [requireAuth, setRequireAuth] = useState(false);

  React.useEffect(() => {
    // Clear auth requirement when navigating away from admin
    if (currentPage !== 'admin') {
      setRequireAuth(false);
    }
  }, [currentPage]);

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

  const handleNavigate = (page: string) => {
    // Always require authentication when navigating to admin
    if (page === 'admin') {
      setRequireAuth(true);
    }
    setCurrentPage(page as Page);
  };

  // Don't show loading screen for admin - let login page handle auth state
  // Admin login screen will handle auth loading internally

  // Admin login screen - check for valid admin session
  if (currentPage === 'admin' && (!user || !isAdmin || !sessionValid || requireAuth)) {
    return <AdminLogin onLogin={() => setRequireAuth(false)} />;
  }

  return (
    <div className="min-h-screen bg-white w-full">
      {/* Navigation - show on all pages except when viewing single image in lightbox */}
      <ComponentErrorBoundary componentName="Navigation">
        {!selectedImage && (
          <Navigation currentPage={currentPage} onNavigate={handleNavigate} />
        )}
      </ComponentErrorBoundary>

      {/* Page Content */}
      <PageErrorBoundary context={currentPage}>
        {currentPage === 'home' && (
          <HomePage onNavigate={handleNavigate} onImageClick={handleImageClick} />
        )}
        {currentPage === 'galleries' && (
          <GalleryPage onImageClick={handleImageClick} />
        )}
        {currentPage === 'about' && (
          <AboutPage onNavigate={handleNavigate} />
        )}
        {currentPage === 'contact' && <ContactPage />}
        {currentPage === 'admin' && user && isAdmin && sessionValid && <AdminDashboard />}
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

      {/* Admin Access Button (Hidden Easter Egg) */}
      {currentPage === 'home' && (
        <button
          onClick={() => handleNavigate('admin')}
          className="fixed bottom-4 left-4 opacity-20 hover:opacity-100 transition duration-300 bg-gray-900 text-white p-2 rounded-full"
          aria-label="Admin access"
        >
          <Lock className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary
      context="Application Root"
      onError={() => {
      }}
    >
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

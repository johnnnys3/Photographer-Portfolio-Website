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
import { fetchImages } from './lib/storage';
import { Lock } from 'lucide-react';

type Page = 'home' | 'galleries' | 'about' | 'contact' | 'admin';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [images, setImages] = useState<any[]>([]);

  React.useEffect(() => {
    if (user) {
      fetchImages().then(setImages).catch(console.error);
    }
  }, [user]);

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

  // Show loading screen while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Admin login screen
  if (currentPage === 'admin' && !user) {
    return <AdminLogin onLogin={() => setCurrentPage('admin')} />;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - only show on non-admin pages */}
      {currentPage !== 'admin' && (
        <Navigation currentPage={currentPage} onNavigate={(page: string) => setCurrentPage(page as Page)} />
      )}

      {/* Page Content */}
      {currentPage === 'home' && (
        <HomePage onNavigate={(page: string) => setCurrentPage(page as Page)} onImageClick={handleImageClick} />
      )}
      {currentPage === 'galleries' && (
        <GalleryPage onImageClick={handleImageClick} />
      )}
      {currentPage === 'about' && (
        <AboutPage onNavigate={(page: string) => setCurrentPage(page as Page)} />
      )}
      {currentPage === 'contact' && <ContactPage />}
      {currentPage === 'admin' && user && <AdminDashboard />}

      {/* Lightbox Modal */}
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

      {/* Admin Access Button (Hidden Easter Egg) */}
      {currentPage === 'home' && (
        <button
          onClick={() => setCurrentPage('admin')}
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
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

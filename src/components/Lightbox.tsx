/**
 * MIGRATION NOTE:
 * Source: src/components/Lightbox.tsx
 * Destination: src/components/Lightbox.tsx (updated for Next.js)
 * This component needs 'use client' because it uses useState, useRef, touch interactions, and browser-only features.
 * The lightbox functionality is preserved exactly from the original implementation.
 * Any deviation is unintentional and should be flagged.
 */

'use client';

import React, { useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Share2 } from 'lucide-react';
import type { DatabaseImage } from '../lib/supabase';
import { useTouchInteraction, isTouchDevice } from '../lib/touchInteractions';
import { ShareDownloadPanel } from './ShareDownloadPanel';
import { shareManager } from '../lib/shareUtils';

interface LightboxProps {
  photo: DatabaseImage | null;
  images: DatabaseImage[];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function Lightbox({ photo, images, currentIndex, onClose, onNext, onPrevious }: LightboxProps) {
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;
  const isTouch = isTouchDevice();
  const lightboxRef = useRef<HTMLDivElement>(null);
  const [showSharePanel, setShowSharePanel] = useState(false);

  // Touch interactions for swipe navigation
  useTouchInteraction(
    lightboxRef as React.RefObject<HTMLElement>,
    { enableSwipe: true, swipeThreshold: 50 },
    (gesture) => {
      switch (gesture.type) {
        case 'swipeLeft':
          if (hasNext) onNext();
          break;
        case 'swipeRight':
          if (hasPrevious) onPrevious();
          break;
        case 'tap':
          // Tap on background closes lightbox
          if (gesture.target === lightboxRef.current) {
            onClose();
          }
          break;
      }
    }
  );

  // Prevent background scroll
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (!photo) return null;

  return (
    // Tailwind: fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center p-4 z-50
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center p-4 z-50"
      onClick={onClose}
    >
      {/* Share and Download Buttons */}
      <div className="absolute top-4 left-4 flex gap-2">
        <button
          onClick={() => setShowSharePanel(true)}
          className={`p-2 bg-black bg-opacity-50 rounded-full text-white transition duration-300 ${
            isTouch ? 'touch-manipulation active:scale-110' : 'hover:scale-110'
          }`}
          title="Share image"
        >
          <Share2 className="w-6 h-6" />
        </button>
        <button
          onClick={() => photo && shareManager.downloadImage(photo)}
          className={`p-2 bg-black bg-opacity-50 rounded-full text-white transition duration-300 ${
            isTouch ? 'touch-manipulation active:scale-110' : 'hover:scale-110'
          }`}
          title="Download image"
        >
          <Download className="w-6 h-6" />
        </button>
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className={`absolute top-4 right-4 text-white transition duration-300 p-2 bg-black bg-opacity-50 rounded-full ${
          isTouch ? 'touch-manipulation active:scale-110' : 'hover:text-black hover:scale-110'
        }`}
        aria-label="Close lightbox"
      >
        <X className="w-8 h-8" />
      </button>

      {/* Previous Button - Tailwind: absolute left-4 top-1/2 -translate-y-1/2 */}
      {hasPrevious && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrevious();
          }}
        className={`absolute left-4 top-1/2 -translate-y-1/2 text-white transition duration-300 p-3 bg-black bg-opacity-50 rounded-full ${
          isTouch ? 'touch-manipulation active:scale-110' : 'hover:text-black hover:scale-110'
        }`}
          aria-label="Previous image"
        >
          <ChevronLeft className="w-8 h-8 sm:w-10 sm:h-10" />
        </button>
      )}

      {/* Next Button - Tailwind: absolute right-4 top-1/2 -translate-y-1/2 */}
      {hasNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
        className={`absolute right-4 top-1/2 -translate-y-1/2 text-white transition duration-300 p-3 bg-black bg-opacity-50 rounded-full ${
          isTouch ? 'touch-manipulation active:scale-110' : 'hover:text-black hover:scale-110'
        }`}
          aria-label="Next image"
        >
          <ChevronRight className="w-8 h-8 sm:w-10 sm:h-10" />
        </button>
      )}

      {/* Content Container */}
      <div 
        className="relative max-w-7xl max-h-full flex flex-col md:flex-row gap-4 md:gap-8 items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="flex-1 flex items-center justify-center">
          <img
            src={photo.url}
            alt={photo.title || 'Gallery image'}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        </div>

        {/* Metadata Panel - Tailwind: bg-white p-6 rounded-lg max-w-md */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg max-w-md w-full md:w-96">
          <h2 className="text-2xl sm:text-3xl mb-3 text-gray-900 dark:text-white">{photo.title}</h2>
          <p className="text-gray-300 dark:text-gray-400 text-sm">
            {photo.gallery || 'Uncategorized'}
          </p>
          {/* Tags - Tailwind: flex flex-wrap gap-2 mb-4 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {photo.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-black text-white text-sm rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Additional Info */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4 text-sm text-gray-500 dark:text-gray-400">
            <p className="mb-2">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Gallery:</span>{' '}
              <span className="capitalize">{photo.gallery || 'Uncategorized'}</span>
            </p>
            <p>
              <span className="font-semibold text-gray-700 dark:text-gray-300">Dimensions:</span>{' '}
              {photo.width} × {photo.height}
            </p>
          </div>
        </div>
      </div>
      {/* Share Panel */}
      {showSharePanel && photo && (
        <ShareDownloadPanel
          image={photo}
          onClose={() => setShowSharePanel(false)}
        />
      )}
    </div>
  );
}

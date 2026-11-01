'use client';

import { useState } from 'react';
import { Navigation } from './Navigation';
import { Footer } from './Footer';
import { ProjectHeader } from './ProjectHeader';
import { ProjectGallery } from './ProjectGallery';
import { ProjectNav } from './ProjectNav';
import { Lightbox } from './Lightbox';
import type { DatabaseImage } from '../lib/supabase';

interface ProjectPageProps {
  number: string;
  title: string;
  category: string;
  year: string;
  description: string;
  images: DatabaseImage[];
  previous: { id: string; name: string } | null;
  next: { id: string; name: string } | null;
}

export function ProjectPage({
  number,
  title,
  category,
  year,
  description,
  images,
  previous,
  next,
}: ProjectPageProps) {
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const selectedImage = selectedImageId ? images.find((img) => img.id === selectedImageId) : null;
  const currentIndex = selectedImageId ? images.findIndex((img) => img.id === selectedImageId) : -1;

  const handleNext = () => {
    if (currentIndex < images.length - 1) setSelectedImageId(images[currentIndex + 1].id);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) setSelectedImageId(images[currentIndex - 1].id);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black w-full">
      {!selectedImage && <Navigation currentPage="galleries" />}

      <ProjectHeader number={number} title={title} category={category} year={year} description={description} />
      <ProjectGallery images={images} onImageClick={setSelectedImageId} />
      <ProjectNav previous={previous} next={next} />

      {!selectedImage && <Footer />}

      {selectedImage && (
        <Lightbox
          photo={selectedImage}
          images={images}
          currentIndex={currentIndex}
          onClose={() => setSelectedImageId(null)}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      )}
    </div>
  );
}

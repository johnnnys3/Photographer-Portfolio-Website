import React, { useState } from 'react';
import { Photo } from '../services/dataService';

interface GalleryCardProps {
  photo: Photo;
  onClick: () => void;
}

export function GalleryCard({ photo, onClick }: GalleryCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative overflow-hidden rounded-lg cursor-pointer transition duration-300 ease-in-out transform hover:scale-105 shadow-md hover:shadow-xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      {/* Image - Tailwind: w-full h-auto object-cover */}
      <img
        src={photo.src || photo.url}
        alt={photo.title}
        className="w-full h-auto object-cover"
        loading="lazy"
      />
      
      {/* Hover Overlay - Tailwind: absolute inset-0 bg-black bg-opacity-80 flex flex-col justify-end p-4 */}
      <div
        className={`absolute inset-0 bg-black bg-opacity-80 flex flex-col justify-end p-4 transition duration-300 ease-in-out ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <h3 className="text-white text-lg sm:text-xl mb-2">{photo.title}</h3>
        <p className="text-gray-300 text-sm mb-3">{photo.description}</p>
        {/* Tags - Tailwind: flex flex-wrap gap-2 */}
        <div className="flex flex-wrap gap-2">
          {photo.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-orange-500 bg-opacity-80 text-white text-xs rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import type { DatabaseImage } from '../lib/supabase';
import { GalleryCard } from './GalleryCard';

interface ResponsiveMasonryProps {
  images: DatabaseImage[];
  onImageClick: (id: string) => void;
  className?: string;
}

interface MasonryItem {
  id: string;
  element: React.ReactNode;
  height: number;
  aspectRatio: number;
}

export function ResponsiveMasonry({ images, onImageClick, className = '' }: ResponsiveMasonryProps) {
  const [columns, setColumns] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [itemHeights, setItemHeights] = useState<Map<string, number>>(new Map());

  // Breakpoints for column count
  const breakpoints = [
    { width: 640, columns: 2 },  // sm
    { width: 1024, columns: 3 }, // lg
    { width: 1280, columns: 4 }, // xl
  ];

  // Calculate column count based on container width
  const calculateColumns = (width: number) => {
    for (const breakpoint of breakpoints.reverse()) {
      if (width >= breakpoint.width) {
        return breakpoint.columns;
      }
    }
    return 1;
  };

  // Update container width and columns on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        setContainerWidth(width);
        setColumns(calculateColumns(width));
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Calculate item heights based on aspect ratios
  const getItemHeight = (image: DatabaseImage, columnWidth: number) => {
    if (image.width && image.height && image.width > 0 && image.height > 0) {
      const aspectRatio = image.width / image.height;
      return columnWidth / aspectRatio;
    }
    
    // Fallback heights based on gallery type
    const fallbackHeights: Record<string, number> = {
      'portraits': columnWidth * 1.33,  // 4:3 portrait
      'landscapes': columnWidth * 0.75, // 4:3 landscape
      'weddings': columnWidth * 0.75,
      'nature': columnWidth * 0.75,
      'urban': columnWidth * 0.75,
      'interior': columnWidth * 0.8,
    };
    
    return fallbackHeights[image.gallery] || columnWidth;
  };

  // Distribute items across columns
  const distributeItems = () => {
    const columnArrays: MasonryItem[][] = Array.from({ length: columns }, () => []);
    const columnHeights = new Array(columns).fill(0);
    
    const gutter = 16; // 16px gutter
    const columnWidth = columns > 0 ? (containerWidth - gutter * (columns - 1)) / columns : containerWidth;

    images.forEach((image) => {
      // Find the column with the least height
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      
      const itemHeight = getItemHeight(image, columnWidth);
      const masonryItem: MasonryItem = {
        id: image.id,
        element: (
          <div style={{ marginBottom: gutter }}>
            <GalleryCard
              photo={image}
              onClick={() => onImageClick(image.id)}
            />
          </div>
        ),
        height: itemHeight,
        aspectRatio: image.width && image.height ? image.width / image.height : 1,
      };
      
      columnArrays[shortestColumnIndex].push(masonryItem);
      columnHeights[shortestColumnIndex] += itemHeight + gutter;
    });

    return columnArrays;
  };

  const columnArrays = distributeItems();

  return (
    <div 
      ref={containerRef}
      className={`w-full ${className}`}
      style={{ display: 'flex', gap: '16px' }}
    >
      {columnArrays.map((column, columnIndex) => (
        <div
          key={columnIndex}
          className="flex-1"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {column.map((item) => (
            <div key={item.id}>
              {item.element}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// Alternative CSS Grid-based masonry for better performance
export function CSSGridMasonry({ images, onImageClick, className = '' }: ResponsiveMasonryProps) {
  const [gridStyle, setGridStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const updateGridStyle = () => {
      const width = window.innerWidth;
      let columns = 1;
      
      if (width >= 1280) columns = 4;      // xl
      else if (width >= 1024) columns = 3; // lg
      else if (width >= 640) columns = 2;  // sm
      
      setGridStyle({
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '16px',
        gridAutoFlow: 'dense',
      });
    };

    updateGridStyle();
    window.addEventListener('resize', updateGridStyle);
    return () => window.removeEventListener('resize', updateGridStyle);
  }, []);

  return (
    <div className={className} style={gridStyle}>
      {images.map((image) => (
        <div
          key={image.id}
          style={{
            // Use aspect ratio for better layout
            aspectRatio: image.width && image.height 
              ? `${image.width} / ${image.height}` 
              : image.gallery === 'portraits' ? '3/4' : '4/3',
            gridRowEnd: 'span 1',
          }}
        >
          <GalleryCard
            photo={image}
            onClick={() => onImageClick(image.id)}
          />
        </div>
      ))}
    </div>
  );
}

// Hybrid approach: CSS Grid with JavaScript optimization for mobile
export function HybridMasonry({ images, onImageClick, className = '' }: ResponsiveMasonryProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [gridColumns, setGridColumns] = useState(1);

  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;
      const mobile = width < 768; // md breakpoint
      
      setIsMobile(mobile);
      
      if (width >= 1280) setGridColumns(4);      // xl
      else if (width >= 1024) setGridColumns(3); // lg
      else if (width >= 640) setGridColumns(2);  // sm
      else setGridColumns(1);
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  // For mobile, use a simple single column layout
  if (isMobile) {
    return (
      <div className={`space-y-4 ${className}`}>
        {images.map((image) => (
          <GalleryCard
            key={image.id}
            photo={image}
            onClick={() => onImageClick(image.id)}
          />
        ))}
      </div>
    );
  }

  // For desktop, use CSS Grid
  return (
    <div 
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
        gap: '16px',
        gridAutoFlow: 'dense',
      }}
    >
      {images.map((image) => (
        <div
          key={image.id}
          style={{
            aspectRatio: image.width && image.height 
              ? `${image.width} / ${image.height}` 
              : image.gallery === 'portraits' ? '3/4' : '4/3',
            gridRowEnd: 'span 1',
          }}
        >
          <GalleryCard
            photo={image}
            onClick={() => onImageClick(image.id)}
          />
        </div>
      ))}
    </div>
  );
}

import type { DatabaseImage } from '../lib/supabase';

interface ProjectGalleryProps {
  images: DatabaseImage[];
  onImageClick: (imageId: string) => void;
}

type Pattern = 'full' | 'pair' | 'portrait' | 'whitespace';

interface Block {
  pattern: Pattern;
  images: DatabaseImage[];
}

const PATTERN_CYCLE: Pattern[] = ['full', 'pair', 'portrait', 'whitespace'];

function buildBlocks(images: DatabaseImage[]): Block[] {
  const blocks: Block[] = [];
  let i = 0;
  let cycleIndex = 0;

  while (i < images.length) {
    const pattern = PATTERN_CYCLE[cycleIndex % PATTERN_CYCLE.length];
    if (pattern === 'pair' && i + 1 < images.length) {
      blocks.push({ pattern, images: [images[i], images[i + 1]] });
      i += 2;
    } else {
      // Fall back to a single-image treatment when a pair can't be formed
      blocks.push({ pattern: pattern === 'pair' ? 'full' : pattern, images: [images[i]] });
      i += 1;
    }
    cycleIndex++;
  }

  return blocks;
}

function ratio(image: DatabaseImage) {
  return image.width && image.height ? `${image.width} / ${image.height}` : '4 / 3';
}

export function ProjectGallery({ images, onImageClick }: ProjectGalleryProps) {
  if (images.length === 0) return null;

  const blocks = buildBlocks(images);

  return (
    <div className="flex flex-col gap-10 lg:gap-16 py-16 px-6 lg:px-12">
      {blocks.map((block, index) => {
        if (block.pattern === 'pair') {
          const [a, b] = block.images;
          return (
            <div key={index} className="max-w-7xl mx-auto w-full grid grid-cols-1 sm:grid-cols-[3fr_2fr] gap-4 lg:gap-6">
              {[a, b].map((img) => (
                <button
                  key={img.id}
                  data-cursor="View"
                  onClick={() => onImageClick(img.id)}
                  className="group relative overflow-hidden bg-gray-100 dark:bg-gray-900 text-left"
                  style={{ aspectRatio: ratio(img) }}
                  aria-label={`View ${img.title}`}
                >
                  <img
                    src={img.url}
                    alt={img.title}
                    className="w-full h-full object-cover transition duration-700 ease-out group-hover:scale-105"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          );
        }

        const img = block.images[0];

        if (block.pattern === 'portrait') {
          return (
            <div key={index} className="max-w-3xl mx-auto w-full">
              <button
                data-cursor="View"
                onClick={() => onImageClick(img.id)}
                className="group relative block overflow-hidden bg-gray-100 dark:bg-gray-900 w-full text-left"
                style={{ aspectRatio: img.width && img.height ? ratio(img) : '3 / 4' }}
                aria-label={`View ${img.title}`}
              >
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-full object-cover transition duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
              </button>
            </div>
          );
        }

        if (block.pattern === 'whitespace') {
          return (
            <div key={index} className="max-w-7xl mx-auto w-full flex justify-center py-8">
              <button
                data-cursor="View"
                onClick={() => onImageClick(img.id)}
                className="group relative overflow-hidden bg-gray-100 dark:bg-gray-900 w-full max-w-sm text-left"
                style={{ aspectRatio: ratio(img) }}
                aria-label={`View ${img.title}`}
              >
                <img
                  src={img.url}
                  alt={img.title}
                  className="w-full h-full object-cover transition duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />
              </button>
            </div>
          );
        }

        // full-bleed
        return (
          <div key={index} className="max-w-7xl mx-auto w-full">
            <button
              data-cursor="View"
              onClick={() => onImageClick(img.id)}
              className="group relative block overflow-hidden bg-gray-100 dark:bg-gray-900 w-full text-left"
              style={{ aspectRatio: ratio(img) }}
              aria-label={`View ${img.title}`}
            >
              <img
                src={img.url}
                alt={img.title}
                className="w-full h-full object-cover transition duration-700 ease-out group-hover:scale-105"
                loading="lazy"
              />
            </button>
          </div>
        );
      })}
    </div>
  );
}

import React from 'react';
import { SearchResult } from '../lib/searchUtils';
import { highlightText } from '../lib/searchUtils';

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  onImageClick: (imageId: string) => void;
  loading?: boolean;
}

export function SearchResults({ results, query, onImageClick, loading = false }: SearchResultsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No images found</h3>
        <p className="text-gray-500 dark:text-gray-400">
          {query 
            ? `No results for "${query}". Try different keywords or filters.`
            : 'Enter a search term to find images.'
          }
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Search Results Header */}
      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-300">
          Found {results.length} result{results.length !== 1 ? 's' : ''}
          {query && ` for "${query}"`}
        </p>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {results.map(({ image, score, matches }) => (
          <SearchResultCard
            key={image.id}
            image={image}
            score={score}
            matches={matches}
            query={query}
            onClick={() => onImageClick(image.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface SearchResultCardProps {
  image: SearchResult['image'];
  score: SearchResult['score'];
  matches: SearchResult['matches'];
  query: string;
  onClick: () => void;
}

function SearchResultCard({ image, score, matches, query, onClick }: SearchResultCardProps) {
  const highlightedTitle = query ? highlightText(image.title || '', query) : image.title;
  const highlightedDescription = query ? highlightText(image.description || '', query) : image.description;

  return (
    <div className="relative group cursor-pointer" onClick={onClick}>
      {/* Score Badge */}
      {score > 0 && (
        <div className="absolute top-2 left-2 z-10 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
          {score}%
        </div>
      )}

      {/* Gallery Card */}
      <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
        {/* Image */}
        <div className="aspect-square bg-gray-100">
          <img
            src={image.url}
            alt={image.title || 'Search result'}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            {/* Title */}
            <h3 
              className="text-lg font-semibold mb-1"
              dangerouslySetInnerHTML={{ __html: highlightedTitle || '' }}
            />

            {/* Description */}
            {image.description && (
              <p 
                className="text-sm text-gray-300 line-clamp-2"
                dangerouslySetInnerHTML={{ __html: highlightedDescription || '' }}
              />
            )}

            {/* Tags */}
            {image.tags && image.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {image.tags.map((tag, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 text-xs rounded-full ${
                      matches.tags.includes(tag)
                        ? 'bg-orange-500 text-white'
                        : 'bg-white/20 text-white'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Match Indicators */}
            {query && (
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-300">
                {matches.title && <span className="text-orange-400">★ Title</span>}
                {matches.description && <span className="text-orange-400">★ Description</span>}
                {matches.tags.length > 0 && <span className="text-orange-400">★ {matches.tags.length} tag{matches.tags.length !== 1 ? 's' : ''}</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Search Stats Component
export function SearchStats() {
  const stats = React.useMemo(() => {
    // This would be calculated from the search engine
    return {
      totalImages: 0,
      indexedWords: 0,
      averageTagsPerImage: 0,
    };
  }, []);

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-2">Search Statistics</h3>
      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-gray-500">Total Images</p>
          <p className="font-semibold text-gray-900">{stats.totalImages.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-500">Indexed Words</p>
          <p className="font-semibold text-gray-900">{stats.indexedWords.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-gray-500">Avg Tags/Image</p>
          <p className="font-semibold text-gray-900">{stats.averageTagsPerImage.toFixed(1)}</p>
        </div>
      </div>
    </div>
  );
}

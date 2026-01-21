import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { SearchResults, SearchStats } from './SearchResults';
import { SearchResult, searchEngine } from '../lib/searchUtils';
import { useData } from '../contexts/DataContext';
import type { DatabaseImage } from '../lib/supabase';

interface SearchPageProps {
  onNavigate: (page: string) => void;
  onImageClick: (imageId: string) => void;
}

export function SearchPage({ onNavigate, onImageClick }: SearchPageProps) {
  const { images, galleries, loading } = useData();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [query, setQuery] = useState('');
  const [showStats, setShowStats] = useState(false);

  // Initialize search engine with images
  useEffect(() => {
    if (images.length > 0) {
      searchEngine.indexImages(images);
    }
  }, [images]);

  // Handle search
  const handleSearch = (results: SearchResult[]) => {
    setSearchResults(results);
  };

  // Get search query from URL on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('q');
    if (searchQuery) {
      setQuery(searchQuery);
      const results = searchEngine.search({ query: searchQuery });
      setSearchResults(results);
    }
  }, []);

  // Update URL when search changes
  useEffect(() => {
    const url = new URL(window.location.href);
    if (query) {
      url.searchParams.set('q', query);
    } else {
      url.searchParams.delete('q');
    }
    window.history.replaceState({}, '', url.toString());
  }, [query]);

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => onNavigate('galleries')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Gallery</span>
          </button>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">Search Images</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Find images by title, tags, or description
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar
            onSearch={handleSearch}
            images={images}
            galleries={galleries}
          />
        </div>

        {/* Search Actions */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {searchResults.length > 0 && (
              <p className="text-gray-600 dark:text-gray-300">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                {query && ` for "${query}"`}
              </p>
            )}
          </div>
          
          <button
            onClick={() => setShowStats(!showStats)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showStats
                ? 'bg-orange-100 text-orange-700'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Filter className="w-4 h-4" />
            {showStats ? 'Hide' : 'Show'} Stats
          </button>
        </div>

        {/* Search Stats */}
        {showStats && (
          <div className="mb-8">
            <SearchStats />
          </div>
        )}

        {/* Search Results */}
        <SearchResults
          results={searchResults}
          query={query}
          onImageClick={onImageClick}
          loading={loading}
        />

        {/* No Results State */}
        {!loading && searchResults.length === 0 && query === '' && images.length > 0 && (
          <div className="text-center py-16">
            <div className="text-gray-400 dark:text-gray-500 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Start Searching</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Enter keywords to search through {images.length} images
            </p>
            <div className="text-sm text-gray-400 dark:text-gray-500">
              <p>Try searching for:</p>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">portrait</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">landscape</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">wedding</span>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">nature</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * MIGRATION NOTE:
 * Source: src/components/SearchBar.tsx
 * Destination: src/components/SearchBar.tsx (updated for Next.js)
 * This component needs 'use client' because it uses useState, useRef, search functionality, and browser-only features.
 * The search functionality is preserved exactly from the original implementation.
 * Any deviation is unintentional and should be flagged.
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
import { searchEngine, SearchFilters, SearchResult } from '../lib/searchUtils';
import type { DatabaseImage } from '../lib/supabase';

interface SearchBarProps {
  onSearch: (results: SearchResult[]) => void;
  images: DatabaseImage[];
  galleries: Array<{ name: string; count: number }>;
}

export function SearchBar({ onSearch, images, galleries }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Partial<SearchFilters>>({
    tags: [],
    gallery: 'all',
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // Index images when they change
  useEffect(() => {
    searchEngine.indexImages(images);
  }, [images]);

  // Handle search input
  const handleInputChange = (value: string) => {
    setQuery(value);
    
    if (value.length >= 2) {
      const newSuggestions = searchEngine.getSuggestions(value);
      setSuggestions(newSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    performSearch(value);
  };

  // Perform search
  const performSearch = (searchQuery: string = query) => {
    const searchFilters: Partial<SearchFilters> = {
      query: searchQuery,
      tags: selectedTags,
      gallery: filters.gallery,
    };

    const results = searchEngine.search(searchFilters);
    onSearch(results);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    performSearch(suggestion);
  };

  // Handle tag selection
  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    performSearch(query);
  };

  // Handle gallery filter
  const handleGalleryChange = (gallery: string) => {
    setFilters(prev => ({ ...prev, gallery }));
    performSearch(query);
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    setSelectedTags([]);
    setFilters({ tags: [], gallery: 'all' });
    setShowSuggestions(false);
    onSearch([]);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get popular tags
  const popularTags = searchEngine.getPopularTags(8);

  return (
    <div ref={searchRef} className="w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <div className="flex items-center bg-white border border-gray-300 rounded-lg shadow-sm focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-200">
          <div className="flex-1 flex items-center">
            <Search className="w-5 h-5 text-gray-400 ml-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Search images by title, tags, or description..."
              className="w-full px-3 py-3 bg-transparent border-0 outline-none text-gray-900 placeholder-gray-500"
              onFocus={() => setShowSuggestions(true)}
            />
          </div>
          
          <div className="flex items-center gap-2 pr-3">
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-md transition-colors ${
                showFilters || selectedTags.length > 0 || filters.gallery !== 'all'
                  ? 'bg-orange-100 text-orange-600'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title="Search filters"
            >
              <Filter className="w-4 h-4" />
            </button>
            
            {/* Clear Button */}
            {(query || selectedTags.length > 0) && (
              <button
                onClick={handleClear}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <div className="max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <Search className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700">{suggestion}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
          {/* Gallery Filter */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Gallery</label>
            <div className="flex items-center gap-2">
              <select
                value={filters.gallery}
                onChange={(e) => handleGalleryChange(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Galleries</option>
                {galleries.map((gallery) => (
                  <option key={gallery.name} value={gallery.name}>
                    {gallery.name} ({gallery.count})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tags Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags ({selectedTags.length} selected)
            </label>
            
            {/* Popular Tags */}
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-2">Popular tags:</p>
              <div className="flex flex-wrap gap-2">
                {popularTags.map(({ tag, count }) => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag} ({count})
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => handleTagToggle(tag)}
                      className="text-orange-500 hover:text-orange-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

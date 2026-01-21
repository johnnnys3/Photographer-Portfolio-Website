/**
 * Search utilities for finding images by title, tags, and description
 */

import type { DatabaseImage } from './supabase';

export interface SearchFilters {
  query: string;
  tags: string[];
  gallery: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SearchResult {
  image: DatabaseImage;
  score: number;
  matches: {
    title: boolean;
    description: boolean;
    tags: string[];
  };
}

export class ImageSearchEngine {
  private images: DatabaseImage[] = [];
  private searchIndex: Map<string, Set<string>> = new Map();

  /**
   * Index images for fast searching
   */
  public indexImages(images: DatabaseImage[]) {
    this.images = images;
    this.searchIndex.clear();

    images.forEach((image) => {
      // Index title words
      if (image.title) {
        const words = this.tokenize(image.title.toLowerCase());
        words.forEach(word => {
          if (!this.searchIndex.has(word)) {
            this.searchIndex.set(word, new Set());
          }
          this.searchIndex.get(word)!.add(image.id);
        });
      }

      // Index description words
      if (image.description) {
        const words = this.tokenize(image.description.toLowerCase());
        words.forEach(word => {
          if (!this.searchIndex.has(word)) {
            this.searchIndex.set(word, new Set());
          }
          this.searchIndex.get(word)!.add(image.id);
        });
      }

      // Index tags
      if (image.tags) {
        image.tags.forEach(tag => {
          const normalizedTag = tag.toLowerCase();
          if (!this.searchIndex.has(normalizedTag)) {
            this.searchIndex.set(normalizedTag, new Set());
          }
          this.searchIndex.get(normalizedTag)!.add(image.id);
        });
      }
    });
  }

  /**
   * Tokenize text into searchable words
   */
  private tokenize(text: string): string[] {
    return text
      .split(/\s+/)
      .filter(word => word.length > 1)
      .map(word => word.replace(/[^\w]/g, ''));
  }

  /**
   * Search images with filters
   */
  public search(filters: Partial<SearchFilters>): SearchResult[] {
    const query = filters.query?.toLowerCase().trim() || '';
    const tags = filters.tags || [];
    const gallery = filters.gallery || '';
    const dateRange = filters.dateRange;

    let candidates = this.images;

    // Filter by gallery first
    if (gallery && gallery !== 'all') {
      candidates = candidates.filter(image => image.gallery === gallery);
    }

    // Filter by date range
    if (dateRange) {
      candidates = candidates.filter(image => {
        const uploadDate = new Date(image.uploaded_at);
        return uploadDate >= dateRange.start && uploadDate <= dateRange.end;
      });
    }

    // Filter by tags
    if (tags.length > 0) {
      candidates = candidates.filter(image => 
        tags.some(tag => image.tags?.includes(tag))
      );
    }

    // Text search
    if (query) {
      const queryWords = this.tokenize(query);
      const results: SearchResult[] = [];

      candidates.forEach(image => {
        const matches = this.getMatches(image, queryWords);
        const score = this.calculateScore(matches, queryWords);

        if (score > 0) {
          results.push({
            image,
            score,
            matches,
          });
        }
      });

      return results.sort((a, b) => b.score - a.score);
    }

    // Return filtered results without text search scoring
    return candidates.map(image => ({
      image,
      score: 0,
      matches: {
        title: false,
        description: false,
        tags: [],
      },
    }));
  }

  /**
   * Get search matches for an image
   */
  private getMatches(image: DatabaseImage, queryWords: string[]) {
    const matches = {
      title: false,
      description: false,
      tags: [] as string[],
    };

    // Check title matches
    if (image.title) {
      const titleWords = this.tokenize(image.title.toLowerCase());
      matches.title = queryWords.some(word => titleWords.includes(word));
    }

    // Check description matches
    if (image.description) {
      const descWords = this.tokenize(image.description.toLowerCase());
      matches.description = queryWords.some(word => descWords.includes(word));
    }

    // Check tag matches
    if (image.tags) {
      matches.tags = image.tags.filter(tag => 
        queryWords.some(word => tag.toLowerCase().includes(word))
      );
    }

    return matches;
  }

  /**
   * Calculate search relevance score
   */
  private calculateScore(matches: ReturnType<typeof this.getMatches>, queryWords: string[]): number {
    let score = 0;

    // Title matches are most important
    if (matches.title) {
      score += 10;
    }

    // Description matches are moderately important
    if (matches.description) {
      score += 5;
    }

    // Tag matches are important but less than title/description
    score += matches.tags.length * 3;

    // Bonus for exact matches
    if (matches.title && queryWords.length === 1) {
      score += 5;
    }

    return score;
  }

  /**
   * Get search suggestions based on partial query
   */
  public getSuggestions(partialQuery: string, limit: number = 5): string[] {
    const query = partialQuery.toLowerCase().trim();
    if (query.length < 2) return [];

    const suggestions = new Set<string>();

    // Find words that start with the query
    for (const [word] of this.searchIndex) {
      if (word.startsWith(query)) {
        suggestions.add(word);
      }
    }

    // Find words that contain the query
    for (const [word] of this.searchIndex) {
      if (word.includes(query) && !suggestions.has(word)) {
        suggestions.add(word);
      }
    }

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Get popular tags from indexed images
   */
  public getPopularTags(limit: number = 10): Array<{ tag: string; count: number }> {
    const tagCounts = new Map<string, number>();

    this.images.forEach(image => {
      if (image.tags) {
        image.tags.forEach(tag => {
          tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
        });
      }
    });

    return Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get search statistics
   */
  public getSearchStats() {
    return {
      totalImages: this.images.length,
      indexedWords: this.searchIndex.size,
      averageTagsPerImage: this.images.reduce((sum, img) => sum + (img.tags?.length || 0), 0) / this.images.length,
    };
  }
}

// Global search engine instance
export const searchEngine = new ImageSearchEngine();

/**
 * Utility functions for search
 */
export function highlightText(text: string, query: string): string {
  if (!query.trim()) return text;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

export function extractSearchTerms(filters: Partial<SearchFilters>): string[] {
  const terms: string[] = [];

  if (filters.query) {
    terms.push(...filters.query.split(/\s+/).filter(term => term.length > 0));
  }

  if (filters.tags) {
    terms.push(...filters.tags);
  }

  return terms;
}

export function createSearchUrl(filters: Partial<SearchFilters>): string {
  const params = new URLSearchParams();

  if (filters.query) {
    params.set('q', filters.query);
  }

  if (filters.tags && filters.tags.length > 0) {
    params.set('tags', filters.tags.join(','));
  }

  if (filters.gallery && filters.gallery !== 'all') {
    params.set('gallery', filters.gallery);
  }

  if (filters.dateRange) {
    params.set('start', filters.dateRange.start.toISOString());
    params.set('end', filters.dateRange.end.toISOString());
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

export function parseSearchUrl(searchParams: URLSearchParams): Partial<SearchFilters> {
  const filters: Partial<SearchFilters> = {};

  const query = searchParams.get('q');
  if (query) {
    filters.query = query;
  }

  const tags = searchParams.get('tags');
  if (tags) {
    filters.tags = tags.split(',').filter(tag => tag.trim());
  }

  const gallery = searchParams.get('gallery');
  if (gallery) {
    filters.gallery = gallery;
  }

  const start = searchParams.get('start');
  const end = searchParams.get('end');
  if (start && end) {
    filters.dateRange = {
      start: new Date(start),
      end: new Date(end),
    };
  }

  return filters;
}

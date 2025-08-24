import apiClient from './client';
import { IdeasResponse, SearchFilters } from '@/types';

export const searchApi = {
  // Search ideas
  searchIdeas: async (query: string, filters?: SearchFilters): Promise<IdeasResponse> => {
    const response = await apiClient.get('/api/search', {
      params: { q: query, ...filters }
    });
    return response.data;
  },

  // Get search suggestions
  getSearchSuggestions: async (query: string): Promise<string[]> => {
    const response = await apiClient.get('/api/search/suggestions', {
      params: { q: query }
    });
    return response.data.suggestions;
  },

  // Get trending searches
  getTrendingSearches: async (): Promise<string[]> => {
    const response = await apiClient.get('/api/search/trending');
    return response.data.searches;
  },

  // Get popular searches
  getPopularSearches: async (): Promise<string[]> => {
    const response = await apiClient.get('/api/search/popular');
    return response.data.searches;
  },
};

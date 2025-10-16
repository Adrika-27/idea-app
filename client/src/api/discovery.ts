import api from './client';
import type { 
  UserPreferences, 
  BookmarkCollection, 
  BookmarkCollectionItem,
  RecommendationResponse,
  TrendingResponse,
  IdeaFilters,
  PreferencesOptions,
  PaginatedResponse
} from '../types';

// User Preferences API
export const preferencesApi = {
  // Get user preferences
  getPreferences: async (): Promise<UserPreferences> => {
    const response = await api.get('/preferences');
    return response.data.data;
  },

  // Update user preferences
  updatePreferences: async (preferences: Partial<UserPreferences>): Promise<UserPreferences> => {
    const response = await api.put('/preferences', preferences);
    return response.data.data;
  },

  // Reset preferences to defaults
  resetPreferences: async (): Promise<void> => {
    await api.delete('/preferences');
  },

  // Get available options for preferences
  getOptions: async (): Promise<PreferencesOptions> => {
    const response = await api.get('/preferences/options');
    return response.data.data;
  }
};

// Recommendations API
export const recommendationsApi = {
  // Get AI-powered recommendations
  getRecommendations: async (params?: {
    limit?: number;
    category?: string;
    difficulty?: string;
    timeCommitment?: string;
  }): Promise<RecommendationResponse> => {
    const response = await api.get('/recommendations/ideas', { params });
    return response.data.data;
  },

  // Get trending topics and ideas
  getTrending: async (params?: {
    period?: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
    category?: string;
    limit?: number;
  }): Promise<TrendingResponse> => {
    const response = await api.get('/recommendations/trending', { params });
    return response.data.data;
  }
};

// Bookmark Collections API
export const collectionsApi = {
  // Get user's collections
  getCollections: async (): Promise<BookmarkCollection[]> => {
    const response = await api.get('/collections');
    return response.data.data;
  },

  // Create new collection
  createCollection: async (collection: {
    name: string;
    description?: string;
    isPublic?: boolean;
    tags?: string[];
    color?: string;
  }): Promise<BookmarkCollection> => {
    const response = await api.post('/collections', collection);
    return response.data.data;
  },

  // Update collection
  updateCollection: async (id: string, updates: Partial<BookmarkCollection>): Promise<BookmarkCollection> => {
    const response = await api.put(`/collections/${id}`, updates);
    return response.data.data;
  },

  // Delete collection
  deleteCollection: async (id: string): Promise<void> => {
    await api.delete(`/collections/${id}`);
  },

  // Add idea to collection
  addIdeaToCollection: async (collectionId: string, ideaId: string, notes?: string): Promise<BookmarkCollectionItem> => {
    const response = await api.post(`/collections/${collectionId}/ideas`, { ideaId, notes });
    return response.data.data;
  },

  // Remove idea from collection
  removeIdeaFromCollection: async (collectionId: string, ideaId: string): Promise<void> => {
    await api.delete(`/collections/${collectionId}/ideas/${ideaId}`);
  },

  // Get public collections
  getPublicCollections: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<PaginatedResponse<BookmarkCollection>> => {
    const response = await api.get('/collections/public', { params });
    return response.data.data;
  }
};

// Enhanced Ideas API (extending existing ideas API)
export const enhancedIdeasApi = {
  // Get ideas with enhanced filtering
  getIdeas: async (filters: IdeaFilters & {
    page?: number;
    limit?: number;
  } = {}): Promise<PaginatedResponse<any>> => {
    const params: any = {};
    
    if (filters.category) params.category = filters.category;
    if (filters.difficulty) params.difficulty = filters.difficulty;
    if (filters.timeCommitment) params.timeCommitment = filters.timeCommitment;
    if (filters.techStack?.length) params.techStack = filters.techStack.join(',');
    if (filters.tags?.length) params.tags = filters.tags.join(',');
    if (filters.search) params.search = filters.search;
    if (filters.sort) params.sort = filters.sort;
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;

    const response = await api.get('/ideas', { params });
    return response.data;
  },

  // Get trending ideas specifically
  getTrendingIdeas: async (params?: {
    period?: 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
    category?: string;
    limit?: number;
  }): Promise<any[]> => {
    const trendingData = await recommendationsApi.getTrending(params);
    return trendingData.ideas;
  }
};

// Bookmark enhancement (extending existing bookmarks)
export const enhancedBookmarksApi = {
  // Add bookmark with tags and notes
  addBookmark: async (ideaId: string, data?: {
    tags?: string[];
    notes?: string;
  }): Promise<void> => {
    // This would extend the existing bookmark API
    // For now, we'll use the regular bookmark API and then update
    const response = await api.post('/ideas/bookmark', { ideaId, ...data });
    return response.data;
  },

  // Update bookmark with tags and notes
  updateBookmark: async (ideaId: string, data: {
    tags?: string[];
    notes?: string;
  }): Promise<void> => {
    // This would be a new endpoint to update bookmark metadata
    const response = await api.put(`/ideas/${ideaId}/bookmark`, data);
    return response.data;
  }
};

export default {
  preferences: preferencesApi,
  recommendations: recommendationsApi,
  collections: collectionsApi,
  enhancedIdeas: enhancedIdeasApi,
  enhancedBookmarks: enhancedBookmarksApi
};
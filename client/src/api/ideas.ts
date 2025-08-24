import apiClient from './client';
import { Idea, IdeasResponse, IdeaFormData, SearchFilters, VoteType } from '@/types';

export const ideasApi = {
  // Get all ideas with filtering and pagination
  getIdeas: async (params?: SearchFilters): Promise<IdeasResponse> => {
    const normalized: any = { ...params };
    // Map client 'query' to server 'search' if provided
    if (normalized.query && !normalized.search) {
      normalized.search = normalized.query;
    }
    delete normalized.query;

    // Serialize tags array to comma-separated string as server expects 'tags' string
    if (Array.isArray(normalized.tags)) {
      normalized.tags = normalized.tags.join(',');
    }

    const response = await apiClient.get('/api/ideas', { params: normalized });
    return response.data;
  },

  // Get single idea
  getIdea: async (id: string): Promise<{ idea: Idea }> => {
    const response = await apiClient.get(`/api/ideas/${id}`);
    return response.data;
  },

  // Create new idea
  createIdea: async (data: IdeaFormData): Promise<{ idea: Idea; message: string }> => {
    const response = await apiClient.post('/api/ideas', data);
    return response.data;
  },

  // Update idea
  updateIdea: async (id: string, data: Partial<IdeaFormData>): Promise<{ idea: Idea; message: string }> => {
    const response = await apiClient.put(`/api/ideas/${id}`, data);
    return response.data;
  },

  // Delete idea
  deleteIdea: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/api/ideas/${id}`);
    return response.data;
  },

  // Vote on idea
  voteIdea: async (id: string, type: VoteType): Promise<{ voteScore: number; userVote: VoteType | null; message: string }> => {
    const response = await apiClient.post(`/api/ideas/${id}/vote`, { type });
    return response.data;
  },

  // Bookmark idea
  bookmarkIdea: async (id: string): Promise<{ isBookmarked: boolean; message: string }> => {
    const response = await apiClient.post(`/api/ideas/${id}/bookmark`);
    return response.data;
  },

  // Get user's ideas
  getUserIdeas: async (username: string, params?: { page?: number; limit?: number; status?: string }): Promise<IdeasResponse> => {
    const response = await apiClient.get(`/api/users/${username}/ideas`, { params });
    return response.data;
  },
};

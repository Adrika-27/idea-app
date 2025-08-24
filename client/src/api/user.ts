import apiClient from './client';
import { AuthUser } from '@/types';

export const userApi = {
  // Get user profile
  getUserProfile: async (username: string): Promise<{ user: AuthUser }> => {
    const response = await apiClient.get(`/api/users/${username}`);
    return response.data;
  },

  // Get user stats
  getUserStats: async (username: string): Promise<{
    totalIdeas: number;
    totalVotes: number;
    totalComments: number;
    totalViews: number;
    totalFollowers: number;
    totalFollowing: number;
  }> => {
    const response = await apiClient.get(`/api/users/${username}/stats`);
    return response.data;
  },

  // Update profile
  updateProfile: async (data: {
    bio?: string;
    location?: string;
    website?: string;
    avatar?: string;
  }): Promise<{ user: AuthUser; message: string }> => {
    const response = await apiClient.put('/api/users/profile', data);
    return response.data;
  },

  // Change password
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    const response = await apiClient.put('/api/users/password', data);
    return response.data;
  },

  // Follow/unfollow user
  followUser: async (username: string): Promise<{ isFollowing: boolean; message: string }> => {
    const response = await apiClient.post(`/api/users/${username}/follow`);
    return response.data;
  },

  // Get followers
  getFollowers: async (username: string, params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get(`/api/users/${username}/followers`, { params });
    return response.data;
  },

  // Get following
  getFollowing: async (username: string, params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get(`/api/users/${username}/following`, { params });
    return response.data;
  },

  // Get dashboard stats
  getDashboardStats: async (): Promise<{
    totalIdeas: number;
    totalVotes: number;
    totalComments: number;
    totalViews: number;
    recentActivity: any[];
  }> => {
    const response = await apiClient.get('/api/users/dashboard');
    return response.data;
  },

  // Get bookmarks
  getBookmarks: async (params?: { page?: number; limit?: number }) => {
    const response = await apiClient.get('/api/users/bookmarks', { params });
    return response.data;
  },
};

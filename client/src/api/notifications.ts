import apiClient from './client';
import { Notification } from '@/types';

export const notificationsApi = {
  // Get notifications
  getNotifications: async (params?: { 
    page?: number; 
    limit?: number; 
    unread?: boolean 
  }): Promise<{
    notifications: Notification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> => {
    const response = await apiClient.get('/api/notifications', { params });
    return response.data;
  },

  // Mark notification as read
  markAsRead: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.put(`/api/notifications/${id}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<{ message: string }> => {
    const response = await apiClient.put('/api/notifications/read-all');
    return response.data;
  },

  // Delete notification
  deleteNotification: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/api/notifications/${id}`);
    return response.data;
  },

  // Get notification stats
  getStats: async (): Promise<{
    total: number;
    unread: number;
  }> => {
    const response = await apiClient.get('/api/notifications/stats');
    return response.data;
  },
};

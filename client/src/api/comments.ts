import apiClient from './client';
import { Comment, CommentsResponse, CommentFormData, VoteType } from '@/types';

export const commentsApi = {
  // Get comments for an idea
  getComments: async (ideaId: string, params?: { page?: number; limit?: number; sort?: string }): Promise<CommentsResponse> => {
    const response = await apiClient.get('/api/comments', { params: { ideaId, ...params } });
    return response.data;
  },

  // Get replies for a comment
  getReplies: async (commentId: string, params?: { page?: number; limit?: number }): Promise<{ replies: Comment[]; pagination: any }> => {
    const response = await apiClient.get(`/api/comments/${commentId}/replies`, { params });
    return response.data;
  },

  // Create comment
  createComment: async (ideaId: string, data: CommentFormData): Promise<{ comment: Comment; message: string }> => {
    const response = await apiClient.post('/api/comments', { ideaId, ...data });
    return response.data;
  },

  // Update comment
  updateComment: async (id: string, content: string): Promise<{ comment: Comment; message: string }> => {
    const response = await apiClient.put(`/api/comments/${id}`, { content });
    return response.data;
  },

  // Delete comment
  deleteComment: async (id: string): Promise<{ message: string }> => {
    const response = await apiClient.delete(`/api/comments/${id}`);
    return response.data;
  },

  // Vote on comment
  voteComment: async (id: string, type: VoteType): Promise<{ voteScore: number; userVote: VoteType | null; message: string }> => {
    const response = await apiClient.post(`/api/comments/${id}/vote`, { type });
    return response.data;
  },
};

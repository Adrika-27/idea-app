import apiClient from './client';
import { AuthUser, LoginCredentials, RegisterCredentials, AuthTokens } from '@/types';

export const authApi = {
  // Register new user
  register: async (credentials: RegisterCredentials): Promise<{ user: AuthUser; tokens: AuthTokens }> => {
    const response = await apiClient.post('/api/auth/register', credentials);
    return response.data;
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<{ user: AuthUser; tokens: AuthTokens }> => {
    const response = await apiClient.post('/api/auth/login', credentials);
    return response.data;
  },

  // Logout user
  logout: async (): Promise<void> => {
    await apiClient.put('/api/auth/logout');
  },

  // Refresh tokens
  refreshTokens: async (refreshToken: string): Promise<{ tokens: AuthTokens }> => {
    const response = await apiClient.post('/api/auth/refresh', { refreshToken });
    return response.data;
  },

  // Get current user
  getCurrentUser: async (): Promise<{ user: AuthUser }> => {
    const response = await apiClient.get('/api/auth/me');
    return response.data;
  },

  // Verify email
  verifyEmail: async (token: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/auth/verify-email', { token });
    return response.data;
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/auth/reset-password', { token, password });
    return response.data;
  },

  // OAuth URLs
  getGoogleAuthUrl: (): string => {
    return `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`;
  },
};

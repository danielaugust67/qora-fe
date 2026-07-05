import apiClient from '@/services/apiClient';
import { AuthResponse, UpdateProfileData, User } from '../types';

export const authApi = {
  login: async (data: any): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },
  register: async (data: any): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },
  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },
  updateProfile: async (data: UpdateProfileData): Promise<User> => {
    const response = await apiClient.put('/auth/me', data);
    return response.data;
  }
};

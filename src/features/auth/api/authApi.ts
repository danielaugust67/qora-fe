import apiClient from '@/services/apiClient';
import { AuthResponse, User } from '../types';

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
  }
};

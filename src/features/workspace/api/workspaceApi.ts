import apiClient from '@/services/apiClient';
import { Workspace, CreateWorkspaceData } from '../types';

export const workspaceApi = {
  getWorkspaces: async (): Promise<Workspace[]> => {
    const response = await apiClient.get('/workspaces');
    return response.data;
  },
  createWorkspace: async (data: CreateWorkspaceData): Promise<Workspace> => {
    const response = await apiClient.post('/workspaces', data);
    return response.data;
  }
};

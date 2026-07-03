import apiClient from '@/services/apiClient';
import { Project, CreateProjectData } from '../types';

export const projectApi = {
  getProjects: async (workspaceId: string): Promise<Project[]> => {
    const response = await apiClient.get(`/workspaces/${workspaceId}/projects`);
    return response.data;
  },
  createProject: async (data: CreateProjectData): Promise<Project> => {
    const response = await apiClient.post('/projects', data);
    return response.data;
  }
};

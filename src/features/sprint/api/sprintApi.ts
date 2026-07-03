import apiClient from '@/services/apiClient';
import { Sprint, CreateSprintData } from '../types';

export const sprintApi = {
  getSprints: async (projectId: string): Promise<Sprint[]> => {
    const response = await apiClient.get(`/projects/${projectId}/sprints`);
    return response.data;
  },
  
  createSprint: async (projectId: string, data: CreateSprintData): Promise<Sprint> => {
    const response = await apiClient.post(`/projects/${projectId}/sprints`, data);
    return response.data;
  },
  
  updateStatus: async (projectId: string, sprintId: string, status: string): Promise<void> => {
    await apiClient.put(`/projects/${projectId}/sprints/${sprintId}/status`, { status });
  },

  assignTaskToSprint: async (taskId: string, sprintId: string | null): Promise<void> => {
    await apiClient.put(`/tasks/${taskId}/sprint`, { sprint_id: sprintId });
  }
};

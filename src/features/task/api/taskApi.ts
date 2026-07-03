import apiClient from '@/services/apiClient';
import { Task, TaskComment, TaskAttachment, CreateTaskData, UpdateTaskData } from '../types';

export const taskApi = {
  getTasks: async (projectId: string): Promise<Task[]> => {
    const response = await apiClient.get(`/projects/${projectId}/tasks`);
    return response.data;
  },
  
  createTask: async (projectId: string, data: CreateTaskData): Promise<Task> => {
    const response = await apiClient.post(`/projects/${projectId}/tasks`, data);
    return response.data;
  },
  
  updateStatus: async (taskId: string, status: string): Promise<void> => {
    await apiClient.put(`/tasks/${taskId}/status`, { status });
  },

  updateTask: async (taskId: string, data: UpdateTaskData): Promise<Task> => {
    const response = await apiClient.put(`/tasks/${taskId}`, data);
    return response.data;
  },

  deleteTask: async (taskId: string): Promise<void> => {
    await apiClient.delete(`/tasks/${taskId}`);
  },

  getComments: async (taskId: string): Promise<TaskComment[]> => {
    const response = await apiClient.get(`/tasks/${taskId}/comments`);
    return response.data;
  },

  addComment: async (taskId: string, content: string): Promise<TaskComment> => {
    const response = await apiClient.post(`/tasks/${taskId}/comments`, { content });
    return response.data;
  },

  getAttachments: async (taskId: string): Promise<TaskAttachment[]> => {
    const response = await apiClient.get(`/tasks/${taskId}/attachments`);
    return response.data;
  },

  uploadAttachment: async (taskId: string, file: File): Promise<TaskAttachment> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(`/tasks/${taskId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};

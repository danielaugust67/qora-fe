import apiClient from '@/services/apiClient';
import { Bug, CreateBugData } from '../types';

const appendIfPresent = (formData: FormData, key: string, value: string | File | undefined) => {
  if (value !== undefined && value !== '') {
    formData.append(key, value);
  }
};

export const bugApi = {
  getProjectBugs: async (projectId: string): Promise<Bug[]> => {
    const response = await apiClient.get(`/projects/${projectId}/bugs`);
    return response.data;
  },

  getTaskBugs: async (taskId: string): Promise<Bug[]> => {
    const response = await apiClient.get(`/tasks/${taskId}/bugs`);
    return response.data;
  },

  createBug: async (taskId: string, data: CreateBugData): Promise<Bug> => {
    const formData = new FormData();
    appendIfPresent(formData, 'test_case_id', data.test_case_id);
    appendIfPresent(formData, 'title', data.title);
    appendIfPresent(formData, 'description', data.description);
    appendIfPresent(formData, 'severity', data.severity);
    appendIfPresent(formData, 'priority', data.priority);
    appendIfPresent(formData, 'environment', data.environment);
    appendIfPresent(formData, 'browser', data.browser);
    appendIfPresent(formData, 'device', data.device);
    appendIfPresent(formData, 'steps_to_reproduce', data.steps_to_reproduce);
    appendIfPresent(formData, 'expected_result', data.expected_result);
    appendIfPresent(formData, 'actual_result', data.actual_result);
    appendIfPresent(formData, 'screenshot', data.screenshot);

    const response = await apiClient.post(`/tasks/${taskId}/bugs`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateStatus: async (bugId: string, status: string): Promise<void> => {
    await apiClient.put(`/bugs/${bugId}/status`, { status });
  },

  deleteBug: async (bugId: string): Promise<void> => {
    await apiClient.delete(`/bugs/${bugId}`);
  },
};

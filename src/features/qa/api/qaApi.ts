import apiClient from '@/services/apiClient';
import { TestCase, CreateTestCaseData, ExecuteTestCaseData, TestExecution } from '../types';

export const qaApi = {
  getTestCases: async (projectId: string): Promise<TestCase[]> => {
    const response = await apiClient.get(`/projects/${projectId}/test-cases`);
    return response.data;
  },

  getTaskTestCases: async (taskId: string): Promise<TestCase[]> => {
    const response = await apiClient.get(`/tasks/${taskId}/test-cases`);
    return response.data;
  },

  getTestCaseDetail: async (testCaseId: string): Promise<TestCase> => {
    const response = await apiClient.get(`/test-cases/${testCaseId}`);
    return response.data;
  },

  createTestCase: async (taskId: string, data: CreateTestCaseData): Promise<TestCase> => {
    const response = await apiClient.post(`/tasks/${taskId}/test-cases`, data);
    return response.data;
  },

  updateTestCase: async (testCaseId: string, data: Omit<CreateTestCaseData, 'steps'>): Promise<TestCase> => {
    const response = await apiClient.put(`/test-cases/${testCaseId}`, data);
    return response.data;
  },

  deleteTestCase: async (testCaseId: string): Promise<void> => {
    await apiClient.delete(`/test-cases/${testCaseId}`);
  },

  executeTestCase: async (testCaseId: string, data: ExecuteTestCaseData): Promise<TestExecution> => {
    const response = await apiClient.post(`/test-cases/${testCaseId}/executions`, data);
    return response.data;
  }
};

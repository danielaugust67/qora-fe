import apiClient from '@/services/apiClient';
import {
  AppInfo,
  AutomationSettings,
  DashboardSummary,
  NavItem,
  NotificationItem,
  PlanInfo,
  ProjectMember,
  SavedFilter,
  TeamMember,
  UserSettings,
} from '../types';

export const navigationApi = {
  getSettings: async (): Promise<UserSettings> => {
    const response = await apiClient.get('/settings');
    return response.data;
  },

  updateSettings: async (data: Pick<UserSettings, 'compact_rows' | 'email_digest'>): Promise<UserSettings> => {
    const response = await apiClient.put('/settings', data);
    return response.data;
  },

  getNotifications: async (): Promise<NotificationItem[]> => {
    const response = await apiClient.get('/notifications');
    return response.data;
  },

  createNotification: async (data: { title: string; detail?: string }): Promise<NotificationItem> => {
    const response = await apiClient.post('/notifications', data);
    return response.data;
  },

  markNotificationRead: async (notificationId: string): Promise<void> => {
    await apiClient.put(`/notifications/${notificationId}/read`);
  },

  getRecent: async (): Promise<NavItem[]> => {
    const response = await apiClient.get('/recent');
    return response.data;
  },

  upsertRecent: async (data: { title: string; path: string; type?: string }): Promise<NavItem> => {
    const response = await apiClient.post('/recent', data);
    return response.data;
  },

  deleteRecent: async (itemId: string): Promise<void> => {
    await apiClient.delete(`/recent/${itemId}`);
  },

  getStarred: async (): Promise<NavItem[]> => {
    const response = await apiClient.get('/starred');
    return response.data;
  },

  createStarred: async (data: { title: string; path: string; type?: string }): Promise<NavItem> => {
    const response = await apiClient.post('/starred', data);
    return response.data;
  },

  deleteStarred: async (itemId: string): Promise<void> => {
    await apiClient.delete(`/starred/${itemId}`);
  },

  getFilters: async (): Promise<SavedFilter[]> => {
    const response = await apiClient.get('/filters');
    return response.data;
  },

  createFilter: async (data: { name: string; query?: string }): Promise<SavedFilter> => {
    const response = await apiClient.post('/filters', data);
    return response.data;
  },

  deleteFilter: async (filterId: string): Promise<void> => {
    await apiClient.delete(`/filters/${filterId}`);
  },

  getTeamMembers: async (): Promise<TeamMember[]> => {
    const response = await apiClient.get('/teams');
    return response.data;
  },

  createTeamMember: async (data: { name: string; email?: string; role?: string }): Promise<TeamMember> => {
    const response = await apiClient.post('/teams', data);
    return response.data;
  },

  deleteTeamMember: async (memberId: string): Promise<void> => {
    await apiClient.delete(`/teams/${memberId}`);
  },

  getApps: async (): Promise<AppInfo[]> => {
    const response = await apiClient.get('/apps');
    return response.data;
  },

  getPlans: async (): Promise<PlanInfo[]> => {
    const response = await apiClient.get('/plans');
    return response.data;
  },

  getDashboardSummary: async (projectId: string): Promise<DashboardSummary> => {
    const response = await apiClient.get(`/projects/${projectId}/dashboard`);
    return response.data;
  },

  getProjectMembers: async (projectId: string): Promise<ProjectMember[]> => {
    const response = await apiClient.get(`/projects/${projectId}/members`);
    return response.data;
  },

  createProjectMember: async (
    projectId: string,
    data: { name?: string; email: string; role?: string },
  ): Promise<ProjectMember> => {
    const response = await apiClient.post(`/projects/${projectId}/members`, data);
    return response.data;
  },

  deleteProjectMember: async (projectId: string, memberId: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/members/${memberId}`);
  },
  updateProjectMemberRole: async (projectId: string, memberId: string, role: string): Promise<void> => {
    await apiClient.put(`/projects/${projectId}/members/${memberId}/role`, { role });
  },

  getAutomationSettings: async (projectId: string): Promise<AutomationSettings> => {
    const response = await apiClient.get(`/projects/${projectId}/automation`);
    return response.data;
  },

  updateAutomationSettings: async (
    projectId: string,
    data: Pick<AutomationSettings, 'auto_move_done' | 'auto_bug_notify'>,
  ): Promise<AutomationSettings> => {
    const response = await apiClient.put(`/projects/${projectId}/automation`, data);
    return response.data;
  },
};

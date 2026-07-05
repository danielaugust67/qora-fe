import apiClient from '@/services/apiClient';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  detail: string;
  is_read: boolean;
  link: string;
  created_at: string;
}

export const notificationApi = {
  getMyNotifications: async (): Promise<Notification[]> => {
    const response = await apiClient.get('/notifications');
    return response.data;
  },
  
  markAsRead: async (id: string): Promise<void> => {
    await apiClient.put(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.put(`/notifications/read-all`);
  }
};

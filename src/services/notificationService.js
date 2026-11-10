import { apiClient } from './apiClient';

export const notificationService = {
  getMyNotifications: async () => {
    return await apiClient.get('/notifications');
  },

  markAsRead: async (id) => {
    return await apiClient.put(`/notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    return await apiClient.put('/notifications/read-all');
  },

  clearAllNotifications: async () => {
    return await apiClient.delete('/notifications');
  },
};

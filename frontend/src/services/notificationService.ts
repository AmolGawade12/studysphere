import { apiRequest } from './api';
import { mockDb, MockNotification } from './mockDb';

export const notificationService = {
  getAll: async () => {
    try {
      return await apiRequest('/notifications/');
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_MOCK') {
        return mockDb.getNotifications();
      }
      throw err;
    }
  },

  markAsRead: async (id: number) => {
    try {
      return await apiRequest(`/notifications/${id}/read/`, {
        method: 'PUT'
      });
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_MOCK') {
        const notifications = mockDb.getNotifications();
        const idx = notifications.findIndex(n => n.id === id);
        if (idx !== -1) {
          notifications[idx].read = true;
          mockDb.saveNotifications(notifications);
          return notifications[idx];
        }
        throw new Error('Notification not found');
      }
      throw err;
    }
  },

  markAllAsRead: async () => {
    try {
      // Endpoint is PUT /api/notifications/read-all/
      return await apiRequest('/notifications/read-all/', {
        method: 'PUT'
      });
    } catch (err: any) {
      if (err.message === 'FALLBACK_TO_MOCK') {
        const notifications = mockDb.getNotifications();
        notifications.forEach(n => n.read = true);
        mockDb.saveNotifications(notifications);
        return { message: 'All notifications marked as read' };
      }
      throw err;
    }
  }
};
export default notificationService;

import http from "./http";

export interface Notification {
  _id: string;
  recipient: string;
  type: "task_assigned" | "task_updated" | "task_completed" | "workspace_added" | "task_created" | "workspace_updated";
  task: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    taskTitle?: string;
    previousStatus?: string;
    newStatus?: string;
    assignedBy?: string;
    workspaceName?: string;
    workspaceId?: string;
    addedBy?: string;
    addedUsers?: Array<{ id: string; name: string }>;
    createdBy?: string;
  };
}

export const getUserNotifications = async (userId: string, unreadOnly?: boolean) => {
  try {
    const response = await http.get(`/notifications/user/${userId}`, {
      params: { unreadOnly }
    });
    return response.data.notifications as Notification[];
  } catch (error) {

    throw error;
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const response = await http.patch(`/notifications/${notificationId}/read`);
    return response.data.notification as Notification;
  } catch (error) {

    throw error;
  }
};

export const markAllNotificationsAsRead = async (userId: string) => {
  try {
    const response = await http.patch(`/notifications/user/${userId}/read-all`);
    return response.data;
  } catch (error) {

    throw error;
  }
};

export const getUnreadNotificationCount = async (userId: string) => {
  try {
    const response = await http.get(`/notifications/user/${userId}/unread-count`);
    return response.data.unreadCount as number;
  } catch (error) {

    throw error;
  }
};

export const deleteNotification = async (notificationId: string) => {
  try {
    const response = await http.delete(`/notifications/${notificationId}`);
    return response.data;
  } catch (error) {

    throw error;
  }
};
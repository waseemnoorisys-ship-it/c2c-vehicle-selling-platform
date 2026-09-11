import api from "./axios";

export const notificationApi = {
  getMyNotifications: async (page = 1, limit = 20, unread = undefined) => {
    const response = await api.post("/notifications/mine", { page, limit, unread });
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.post("/notifications/read", { id });
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.post("/notifications/read-all", {});
    return response.data;
  },
};

export default notificationApi;

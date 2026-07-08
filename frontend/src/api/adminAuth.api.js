import api from "./axios";

export const adminLoginApi = (data) => api.post("/admin/auth/login", data);

export const adminRefreshTokenApi = (data) =>
  api.post("/admin/auth/refresh-token", data);

export const adminLogoutApi = (data) => api.post("/admin/auth/logout", data);

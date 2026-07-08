import axios from "axios";
import useAuthStore from "../store/useAuthStore";

const api = axios.create({
  baseURL: "/api/v1",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const url = original?.url || "";
    const isAuthRoute =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh-token") ||
      url.includes("/admin/auth/login") ||
      url.includes("/admin/auth/refresh-token");

    if (error.response?.status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true;
      try {
        const { refreshToken, isAdmin, setTokens } = useAuthStore.getState();
        const refreshPath = isAdmin
          ? "/api/v1/admin/auth/refresh-token"
          : "/api/v1/auth/refresh-token";
        const { data } = await axios.post(refreshPath, { refreshToken });
        setTokens(data.data.accessToken, data.data.refreshToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch {
        const wasAdmin = useAuthStore.getState().isAdmin;
        useAuthStore.getState().logout();
        window.location.href = wasAdmin ? "/admin/login" : "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

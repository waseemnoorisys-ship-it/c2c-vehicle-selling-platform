import axios from "axios";
import useAuthStore from "../store/useAuthStore";

const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  const isLocalHost =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");

  if (envUrl) {
    if (!isLocalHost && envUrl.includes("localhost")) {
      return "https://c2c-vehicle-selling-platform.onrender.com/api/v1";
    }
    return envUrl;
  }

  return isLocalHost
    ? "http://localhost:5000/api/v1"
    : "https://c2c-vehicle-selling-platform.onrender.com/api/v1";
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }
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
          ? "/admin/auth/refresh-token"
          : "/auth/refresh-token";
        const { data } = await api.post(refreshPath, { refreshToken });
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

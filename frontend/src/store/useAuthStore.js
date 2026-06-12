import { create } from "zustand";
import { persist } from "zustand/middleware";

// WHY persist? We store tokens in localStorage so user stays logged in on refresh.
// In production you may move to httpOnly cookies. This is fine for now.
const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setUser: (user) => set({ user }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),

      logout: () =>
        set({ user: null, accessToken: null, refreshToken: null }),
    }),
    {
      name: "c2c-auth", // localStorage key
    }
  )
);

export default useAuthStore;
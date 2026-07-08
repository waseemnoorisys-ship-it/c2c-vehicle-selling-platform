import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAdmin: false,

      setUser: (user) => set({ user }),

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),

      setAuth: (user, accessToken, refreshToken, isAdmin = false) =>
        set({ user, accessToken, refreshToken, isAdmin }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAdmin: false,
        }),
    }),
    {
      name: "c2c-auth",
    }
  )
);

export default useAuthStore;

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface User {
  userId: string;
  email: string;
  role: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: () => boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: true,

      isAdmin: () => {
        const user = get().user;
        return user !== null && user.role >= 10;
      },

      setUser: (user) => set({ user }),
      setToken: (token) => set({ token }),

      login: (user, token) => {
        set({ user, token, isLoading: false });
      },

      logout: () => {
        set({ user: null, token: null, isLoading: false });
        // 清除 localStorage
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
        }
      },

      checkAuth: () => {
        if (typeof window === "undefined") {
          set({ isLoading: false });
          return;
        }

        try {
          const token = localStorage.getItem("auth_token");
          const userStr = localStorage.getItem("auth_user");

          if (token && userStr) {
            const user = JSON.parse(userStr) as User;
            set({ user, token, isLoading: false });
          } else {
            set({ user: null, token: null, isLoading: false });
          }
        } catch {
          set({ user: null, token: null, isLoading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
    },
  ),
);

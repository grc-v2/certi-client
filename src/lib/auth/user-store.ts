import { create } from "zustand";

import type { AuthUserInfo, CurrentUserInfo } from "@/features/identity/types/auth";

export type AuthUser = AuthUserInfo | CurrentUserInfo;

interface AuthState {
  user: AuthUser | null;
  permissions: string[];
  setSession: (user: AuthUser, permissions: string[]) => void;
  setUser: (user: AuthUser | null) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  permissions: [],
  setSession: (user, permissions) => set({ user, permissions }),
  setUser: (user) => set({ user }),
  clear: () => set({ user: null, permissions: [] }),
}));

export const authStore = {
  get: () => useAuthStore.getState(),
  setSession: (user: AuthUser, permissions: string[]) =>
    useAuthStore.getState().setSession(user, permissions),
  setUser: (user: AuthUser | null) => useAuthStore.getState().setUser(user),
  clear: () => useAuthStore.getState().clear(),
};

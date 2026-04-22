import { create } from "zustand";

interface TokenState {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  clear: () => void;
}

export const useTokenStore = create<TokenState>((set) => ({
  accessToken: null,
  setAccessToken: (token) => set({ accessToken: token }),
  clear: () => set({ accessToken: null }),
}));

export const tokenStore = {
  get: () => useTokenStore.getState().accessToken,
  set: (token: string | null) => useTokenStore.getState().setAccessToken(token),
  clear: () => useTokenStore.getState().clear(),
};

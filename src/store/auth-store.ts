import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'
import { setClientTokens, clearClientTokens } from '@/lib/api/client'

// Flat user object stored in Zustand / localStorage
export interface AuthUser {
  id: number
  email: string
  username: string
  fullName: string
  avatarUrl: string | null
  roles: string[]  // role codes: 'ADMIN', 'USER', etc.
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  setUser: (user: AuthUser | null) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  logout: () => void
  isAdmin: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => {
        set({ user, isAuthenticated: !!user })
        if (user?.roles) {
          Cookies.set('user_role', user.roles.join(','), { expires: 1, path: '/' })
        }
      },
      setTokens: (accessToken, refreshToken) => {
        const roles = get().user?.roles
        setClientTokens(accessToken, refreshToken, roles)
      },
      logout: () => {
        clearClientTokens()
        set({ user: null, isAuthenticated: false })
      },
      isAdmin: () => get().user?.roles?.includes('ADMIN') ?? false,
    }),
    { name: 'auth-storage', partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }) }
  )
)

import axios, { AxiosError } from 'axios'
import { API_BASE_URL } from '@/lib/constants'
import { emitSessionExpired } from '@/lib/auth/session-events'
import Cookies from 'js-cookie'

// Module-level token — set immediately on login/refresh, survives across requests
let _accessToken: string | null = null
let _refreshToken: string | null = null

export function setClientTokens(access: string, refresh: string, roles?: string[]) {
  _accessToken = access
  _refreshToken = refresh
  Cookies.set('access_token', access, { expires: 1, path: '/' })
  Cookies.set('refresh_token', refresh, { expires: 30, path: '/' })
  if (roles) {
    Cookies.set('user_role', roles.join(','), { expires: 1, path: '/' })
  }
}

export function clearClientTokens() {
  _accessToken = null
  _refreshToken = null
  Cookies.remove('access_token', { path: '/' })
  Cookies.remove('refresh_token', { path: '/' })
  Cookies.remove('user_role', { path: '/' })
}

// On page load, hydrate memory from cookies so existing sessions work
if (typeof window !== 'undefined') {
  _accessToken = Cookies.get('access_token') ?? null
  _refreshToken = Cookies.get('refresh_token') ?? null
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = _accessToken ?? Cookies.get('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Unwrap standard envelope: { metadata, data } → response.data = data
apiClient.interceptors.response.use((response) => {
  if (response.data && 'metadata' in response.data && 'data' in response.data) {
    response.data = response.data.data
  }
  return response
})

let isRefreshing = false
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void }> = []

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error)
    else prom.resolve(token)
  })
  failedQueue = []
}

// Endpoints that should never trigger the refresh flow on 401 — failing to log in
// or refresh shouldn't recursively attempt another refresh.
const AUTH_BYPASS_PATHS = [
  '/api/v1/auth/login',
  '/api/v1/auth/refresh',
  '/api/v1/auth/register',
]
const isAuthBypassRequest = (url?: string) =>
  !!url && AUTH_BYPASS_PATHS.some((p) => url.includes(p))

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean }
    const status = error.response?.status

    if (status !== 401 || !originalRequest || originalRequest._retry || isAuthBypassRequest(originalRequest.url)) {
      return Promise.reject(error)
    }

    // If we don't have a refresh token at all, there's nothing to try — surface
    // the session-expired event immediately and reject the original request.
    const refreshToken = _refreshToken ?? Cookies.get('refresh_token')
    if (!refreshToken) {
      clearClientTokens()
      emitSessionExpired()
      return Promise.reject(error)
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${token}`
        return apiClient(originalRequest)
      })
    }

    originalRequest._retry = true
    isRefreshing = true
    try {
      const { data } = await apiClient.post('/api/v1/auth/refresh', { refreshToken })
      const newAccess = data.tokens?.accessToken ?? data.accessToken
      const newRefresh = data.tokens?.refreshToken ?? data.refreshToken ?? _refreshToken ?? ''
      setClientTokens(newAccess, newRefresh)
      processQueue(null, newAccess)
      if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${newAccess}`
      return apiClient(originalRequest)
    } catch (err) {
      // Refresh failed — refresh token is dead. Reject queued requests, clear
      // local tokens, and let SessionGuard handle navigation/logout/toast.
      processQueue(err as AxiosError, null)
      clearClientTokens()
      emitSessionExpired()
      return Promise.reject(err)
    } finally {
      isRefreshing = false
    }
  }
)

export default apiClient

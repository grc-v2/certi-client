import axios, { AxiosError } from 'axios'
import { API_BASE_URL } from '@/lib/constants'
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

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean }
    if (error.response?.status === 401 && !originalRequest._retry) {
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
        const refreshToken = _refreshToken ?? Cookies.get('refresh_token')
        const { data } = await apiClient.post('/api/v1/auth/refresh', { refreshToken })
        const newAccess = data.tokens?.accessToken ?? data.accessToken
        const newRefresh = data.tokens?.refreshToken ?? data.refreshToken ?? _refreshToken ?? ''
        setClientTokens(newAccess, newRefresh)
        processQueue(null, newAccess)
        if (originalRequest.headers) originalRequest.headers.Authorization = `Bearer ${newAccess}`
        return apiClient(originalRequest)
      } catch (err) {
        processQueue(err as AxiosError, null)
        clearClientTokens()
        window.location.href = '/login'
        return Promise.reject(err)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient

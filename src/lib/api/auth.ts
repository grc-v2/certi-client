import apiClient from './client'

export interface LoginRequest { username: string; password: string }
export interface RegisterRequest { email: string; password: string; fullName: string }
export interface RegisterResponse { message: string; userId: string }

export interface RoleInfo { id: number; code: string; name: string; isPrimary: boolean }

export interface LoginUserInfo {
  id: number; email: string; username: string; fullName: string
  avatar: string | null; roles: RoleInfo[]
}

export interface TokenInfo {
  accessToken: string; refreshToken: string; tokenType: string; expiresIn: number
}

export interface LoginResponse {
  user: LoginUserInfo
  tokens: TokenInfo
  permissions: string[]
}

export interface UserInfo {
  id: number; email: string; username: string; fullName: string
  avatarUrl: string | null; phone?: string; status: string
  emailVerified: boolean; roles: RoleInfo[]
}

export interface UserResponse {
  user: UserInfo
  permissions: string[]
}

export const authApi = {
  login: (data: LoginRequest) => apiClient.post<LoginResponse>('/api/v1/auth/login', data).then(r => r.data),
  register: (data: RegisterRequest) => apiClient.post<RegisterResponse>('/api/v1/auth/register', data).then(r => r.data),
  logout: () => apiClient.post('/api/v1/auth/logout'),
  getCurrentUser: () => apiClient.get<UserResponse>('/api/v1/auth/current').then(r => r.data),
  verifyEmail: (token: string) => apiClient.get('/api/v1/auth/verify-email', { params: { token } }),
  refreshToken: (refreshToken: string) => apiClient.post<LoginResponse>('/api/v1/auth/refresh', { refreshToken }).then(r => r.data),
  getOauthUrl: (provider: string, redirectUri: string) =>
    apiClient.get<{ url: string; state: string }>(`/api/v1/auth/oauth/authorize/${provider}`, { params: { redirectUri } }).then(r => r.data),
}

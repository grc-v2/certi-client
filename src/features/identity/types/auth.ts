export interface RoleInfo {
  id: number;
  code: string;
  name: string;
  isPrimary: boolean;
}

export interface AuthUserInfo {
  id: number;
  email: string;
  username: string;
  fullName: string;
  avatar?: string | null;
  roles: RoleInfo[];
}

export interface CurrentUserInfo {
  id: number;
  email: string;
  username: string;
  fullName: string;
  avatarUrl?: string | null;
  phone?: string | null;
  status: string;
  emailVerified: boolean;
  roles: RoleInfo[];
}

export interface TokenInfo {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface LoginResponse {
  user: AuthUserInfo;
  tokens: TokenInfo;
  permissions: string[];
}

export interface CurrentUserResponse {
  user: CurrentUserInfo;
  permissions: string[];
}

export interface RegisterResponse {
  id: number;
  email: string;
  username: string;
  fullName: string;
  avatarUrl?: string | null;
  phone?: string | null;
  status: string;
  emailVerified: boolean;
  roles: RoleInfo[];
  createdAt: string;
}

export interface RefreshResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresIn: number;
}

export interface OAuthAuthorizeResponse {
  url: string;
  state: string;
}

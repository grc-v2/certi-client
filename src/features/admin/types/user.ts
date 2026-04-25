export type UserStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "LOCKED";

export interface UserSummary {
  id: number;
  email: string;
  fullName: string;
  username: string;
  status: UserStatus;
  roleCodes: string[];
  registrationDate: string;
  lastLoginDate: string | null;
}

export interface UserDetail extends UserSummary {
  phone?: string | null;
  avatarUrl?: string | null;
  emailVerified?: boolean;
  lastPasswordChangeDate?: string | null;
  permissions?: string[];
}

export interface UpdateUserInput {
  email?: string;
  fullName?: string;
  phone?: string;
  roleCode?: string;
  status?: UserStatus;
}

export interface UserFilter {
  search?: string;
  roleCode?: string;
  status?: UserStatus | "";
  registrationDateFrom?: string;
  registrationDateTo?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface BulkOperationError {
  userId: number;
  reason: string;
}

export interface BulkOperationResult {
  successCount: number;
  failedCount: number;
  errors: BulkOperationError[];
}

export interface UserSession {
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: string;
  lastAccessedAt?: string;
  [key: string]: unknown;
}

export type NotificationCategory =
  | "ACCOUNT"
  | "STUDY_PLAN"
  | "MOCK_EXAM"
  | "PROGRESS"
  | "SOCIAL"
  | "MARKETING"
  | "SYSTEM"
  | string;

export type NotificationPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT" | string;

export interface NotificationDto {
  id: number;
  templateKey: string | null;
  title: string;
  body: string;
  icon: string | null;
  actionUrl: string | null;
  imageUrl: string | null;
  category: NotificationCategory;
  priority: NotificationPriority;
  channelsTargeted: string[] | null;
  channelsDelivered: string[] | null;
  isRead: boolean;
  isClicked: boolean;
  createdAt: string;
  readAt: string | null;
}

export interface NotificationListParams {
  category?: NotificationCategory;
  isRead?: boolean;
  page?: number;
  size?: number;
}

export interface NotificationPage {
  content: NotificationDto[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface UnreadCountResponse {
  count: number;
}

export interface MarkAllReadResponse {
  updated: number;
}

export interface CategoryPreference {
  email: boolean;
  push: boolean;
  in_app: boolean;
}

export interface NotificationPreferenceDto {
  userId: number;
  globalEnabled: boolean;
  emailEnabled: boolean;
  pushEnabled: boolean;
  inAppEnabled: boolean;
  categoryPreferences: Record<string, CategoryPreference> | null;
  quietHoursStart: string | null;
  quietHoursEnd: string | null;
  timezone: string | null;
  preferredDigestDay: string | null;
  emailAddress: string | null;
  digestFrequency: string | null;
  unsubscribeToken: string | null;
}

export interface UpdatePreferencesPayload {
  globalEnabled?: boolean;
  emailEnabled?: boolean;
  pushEnabled?: boolean;
  inAppEnabled?: boolean;
  categoryPreferences?: Record<string, CategoryPreference>;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
  timezone?: string | null;
  preferredDigestDay?: string | null;
  emailAddress?: string | null;
  digestFrequency?: string | null;
}

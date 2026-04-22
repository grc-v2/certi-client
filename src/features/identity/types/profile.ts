export interface ProfileResponse {
  userId: number;
  email: string;
  username: string;
  fullName: string;
  avatarUrl?: string | null;
  displayName?: string | null;
  bio?: string | null;
  timezone?: string | null;
  preferredLanguage?: string | null;
  professionalInfo?: Record<string, unknown> | null;
  learningPreferences?: Record<string, unknown> | null;
  completenessScore: number;
  updatedAt: string;
}

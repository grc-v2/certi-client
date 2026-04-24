import apiClient from './client'

export interface ProfessionalInfo {
  jobTitle?: string
  company?: string
  yearsOfExperience?: number
  industry?: string
}

export interface LearningPreferences {
  dailyGoalMinutes?: number
  notificationEnabled?: boolean
  preferredStudyTime?: string
  difficultyPreference?: string
}

export interface ProfileResponse {
  userId: number
  email: string
  username: string
  fullName: string
  avatarUrl: string | null
  displayName: string
  bio: string | null
  timezone: string | null
  preferredLanguage: string | null
  professionalInfo: ProfessionalInfo
  learningPreferences: LearningPreferences
  completenessScore: number
  updatedAt: string | null
}

export interface UpdateProfileRequest {
  displayName?: string
  bio?: string
  timezone?: string
  preferredLanguage?: string
  professionalInfo?: ProfessionalInfo
  learningPreferences?: LearningPreferences
}

export const profileApi = {
  getMyProfile: () => apiClient.get<ProfileResponse>('/api/v1/profile/me').then(r => r.data),
  updateMyProfile: (data: UpdateProfileRequest) =>
    apiClient.put<ProfileResponse>('/api/v1/profile/me', data).then(r => r.data),
  uploadAvatar: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post<{ avatarUrl: string }>('/api/v1/profile/me/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data)
  },
  getUserProfile: (userId: string | number) =>
    apiClient.get<ProfileResponse>(`/api/v1/profile/${userId}`).then(r => r.data),
}

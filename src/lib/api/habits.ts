import apiClient from './client'

// ── Habits ──────────────────────────────────────────────────────────────────────
// Daily good-habit tracker. A habit is DAILY or WEEKLY (on chosen weekdays), with an
// optional reminder time that the backend turns into an in-app notification. Backed by
// /api/v1/habits; a per-day "check-in" confirms the habit was performed.

export type HabitFrequency = 'DAILY' | 'WEEKLY'
export type Weekday =
  | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY'

export interface HabitResponse {
  id: number
  name: string
  color?: string | null
  frequency: HabitFrequency
  weekdays: Weekday[]
  reminderTime?: string | null // "HH:mm"
  active: boolean
  orderIndex: number
  dueToday: boolean
  checkedInToday: boolean
  currentStreak: number
  createdAt?: string
  updatedAt?: string
}

/** Create/update payload. On update, omitted fields are unchanged; `reminderTime: ''` clears it. */
export interface HabitPayload {
  name?: string
  color?: string | null
  frequency?: HabitFrequency
  weekdays?: Weekday[]
  reminderTime?: string | null
  active?: boolean
  orderIndex?: number
}

export const habitsApi = {
  list: () =>
    apiClient.get<HabitResponse[]>('/api/v1/habits').then(r => r.data),
  create: (data: HabitPayload) =>
    apiClient.post<HabitResponse>('/api/v1/habits', data).then(r => r.data),
  update: (id: number, data: HabitPayload) =>
    apiClient.patch<HabitResponse>(`/api/v1/habits/${id}`, data).then(r => r.data),
  remove: (id: number) =>
    apiClient.delete(`/api/v1/habits/${id}`).then(r => r.data),
  checkin: (id: number, date?: string) =>
    apiClient.post<HabitResponse>(`/api/v1/habits/${id}/checkin`, null, { params: date ? { date } : {} }).then(r => r.data),
  uncheckin: (id: number, date?: string) =>
    apiClient.delete<HabitResponse>(`/api/v1/habits/${id}/checkin`, { params: date ? { date } : {} }).then(r => r.data),
  history: (id: number, from: string, to: string) =>
    apiClient.get<string[]>(`/api/v1/habits/${id}/history`, { params: { from, to } }).then(r => r.data),
}

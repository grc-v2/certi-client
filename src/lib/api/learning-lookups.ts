import apiClient from './client'

export interface LookupItem {
  value: string
  label: string
}

export interface QuestionLookupsResponse {
  types: LookupItem[]
  difficulties: LookupItem[]
  statuses: LookupItem[]
}

export const learningLookupsApi = {
  getQuestionLookups: () =>
    apiClient.get<QuestionLookupsResponse>('/api/v1/learning/lookups/questions').then(r => r.data),
}

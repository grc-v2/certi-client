import apiClient from './client'

export interface LookupItem {
  value: string
  label: string
}

export interface PostLookupsResponse {
  statuses: LookupItem[]
  contentTypes: LookupItem[]
  difficulties: LookupItem[]
  tagCategories: LookupItem[]
}

export const engagementLookupsApi = {
  getPostLookups: () =>
    apiClient.get<PostLookupsResponse>('/api/v1/engagement/lookups/posts').then(r => r.data),
}

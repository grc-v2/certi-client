import apiClient from './client'

export interface LookupItem {
  value: string
  label: string
  metadata?: Record<string, any>
}

export interface LookupsResponse {
  constants: {
    commonStatuses: LookupItem[]
    certificationStatuses: LookupItem[]
    certificationLevels: LookupItem[]
    certificationDifficultyLevels: LookupItem[]
    providerStatuses: LookupItem[]
    examTypes: LookupItem[]
    examStatuses: LookupItem[]
    questionTypes: LookupItem[]
    questionDifficulties: LookupItem[]
    questionStatuses: LookupItem[]
    questionBankStatuses: LookupItem[]
    sessionModes: LookupItem[]
    sessionStatuses: LookupItem[]
    resultStatuses: LookupItem[]
    reportTypes: LookupItem[]
    reportStatuses: LookupItem[]
    relationTypes: LookupItem[]
    postStatuses: LookupItem[]
    postContentTypes: LookupItem[]
    postDifficultyLevels: LookupItem[]
    postTagCategories: LookupItem[]
    voteTypes: LookupItem[]
  }
  catalogs: {
    providers: LookupItem[]
    certifications: LookupItem[]
    certificationDomains: LookupItem[]
    questionTags: LookupItem[]
    blogTags: LookupItem[]
  }
}

export const lookupsApi = {
  getLookups: (includeInactive = false) =>
    apiClient.get<LookupsResponse>('/api/v1/lookups', { params: { includeInactive } }).then(r => r.data),
}

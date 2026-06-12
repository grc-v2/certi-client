import apiClient from './client'

export interface FlashcardOption {
  id: number
  content: string
  orderIndex: number
  isCorrect: boolean
}

export interface FlashcardQuestion {
  id: number
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'MULTIPLE_RESPONSE' | 'TRUE_FALSE'
  content: string
  explanation: string | null
  referenceUrl: string | null
  difficulty: string | null
  points: number | null
  domainId: number | null
  domainName: string | null
  options: FlashcardOption[]
}

export interface FlashcardRequest {
  certificationId: number
  domainIds?: number[]
  difficulties?: string[]
  count?: number
}

export const flashcardApi = {
  fetch: (data: FlashcardRequest) =>
    apiClient.post<FlashcardQuestion[]>('/api/v1/questions/flashcard', data).then(r => r.data),
}

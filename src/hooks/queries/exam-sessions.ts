import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import {
  examSessionsApi,
  type StartSessionResponse,
  type AnswerRequest,
  type AnswerFeedbackResponse,
  type ExamResultResponse,
} from '@/lib/api/exam-sessions'
import { keys } from '@/lib/query-keys'

// ── Session-scoped mutations ───────────────────────────────────────────────────
// Bound to a single in-progress session. They don't touch the active-session list,
// so they carry no invalidation — just transport + the caller's callbacks.

export function useSubmitAnswer(
  sessionId: string,
  options?: Omit<UseMutationOptions<AnswerFeedbackResponse, Error, AnswerRequest>, 'mutationFn'>,
) {
  return useMutation({ ...options, mutationFn: (data: AnswerRequest) => examSessionsApi.submitAnswer(sessionId, data) })
}

export function useCompleteSession(
  sessionId: string,
  options?: Omit<UseMutationOptions<ExamResultResponse, Error, void>, 'mutationFn'>,
) {
  return useMutation({ ...options, mutationFn: () => examSessionsApi.completeSession(sessionId) })
}

export function useTimeoutSession(
  sessionId: string,
  options?: Omit<UseMutationOptions<ExamResultResponse, Error, void>, 'mutationFn'>,
) {
  return useMutation({ ...options, mutationFn: () => examSessionsApi.timeoutSession(sessionId) })
}

export function usePauseSession(
  sessionId: string,
  options?: Omit<UseMutationOptions<unknown, Error, { timeSpentSeconds?: number }>, 'mutationFn'>,
) {
  return useMutation<unknown, Error, { timeSpentSeconds?: number }>({
    ...options,
    mutationFn: (data) => examSessionsApi.pauseSession(sessionId, data),
  })
}

export function useResumePlay(
  sessionId: string,
  options?: Omit<UseMutationOptions<unknown, Error, void>, 'mutationFn'>,
) {
  return useMutation<unknown, Error, void>({ ...options, mutationFn: () => examSessionsApi.resumePlay(sessionId) })
}

type StartPracticeArgs = Parameters<typeof examSessionsApi.startPractice>[0]
type StartMutationOptions<TVars> = Omit<UseMutationOptions<StartSessionResponse, Error, TVars>, 'mutationFn'>

/** The current user's active (resumable) exam sessions. */
export function useActiveSession() {
  return useQuery({
    queryKey: keys.examSessions.active(),
    queryFn: examSessionsApi.getActive,
    refetchOnWindowFocus: true,
  })
}

/**
 * Starts an EXAM session. Owns its own cache invalidation (busts every exam-session query);
 * callers pass their own `onSuccess`/`onError` for navigation, persistence, and toasts.
 */
export function useStartExam(options?: StartMutationOptions<number>) {
  const queryClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: (examId: number) => examSessionsApi.startExam(examId),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: keys.examSessions.all })
      options?.onSuccess?.(...args)
    },
  })
}

/** Starts a PRACTICE session. Same invalidation contract as {@link useStartExam}. */
export function useStartPractice(options?: StartMutationOptions<StartPracticeArgs>) {
  const queryClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: (data: StartPracticeArgs) => examSessionsApi.startPractice(data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: keys.examSessions.all })
      options?.onSuccess?.(...args)
    },
  })
}

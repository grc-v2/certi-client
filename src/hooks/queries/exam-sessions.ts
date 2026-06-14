import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { examSessionsApi, type StartSessionResponse } from '@/lib/api/exam-sessions'
import { keys } from '@/lib/query-keys'

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

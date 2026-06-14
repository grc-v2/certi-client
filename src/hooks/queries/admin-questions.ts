import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { adminQuestionsApi, type QuestionCreateRequest } from '@/lib/api/questions-admin'
import { keys } from '@/lib/query-keys'

export type AdminQuestionsListParams = {
  page: number; search: string; type: string; difficulty: string; status: string; certFilter: string; domainFilter: string
}

/** Paginated, filtered admin question list. `search` should already be debounced by the caller. */
export function useAdminQuestions(params: AdminQuestionsListParams) {
  return useQuery({
    queryKey: keys.adminQuestions.list(params),
    queryFn: () => adminQuestionsApi.search({
      keyword: params.search || undefined,
      type: params.type || undefined,
      difficulty: params.difficulty || undefined,
      status: params.status || undefined,
      certificationId: params.certFilter ? Number(params.certFilter) : undefined,
      domainId: params.domainFilter ? Number(params.domainFilter) : undefined,
      page: params.page,
      size: 15,
    }),
  })
}

// Each mutation busts every admin-questions query and forwards the caller's callbacks
// (toasts / dialog resets stay in the component).
type QuestionMutationOptions<TVars> = Omit<UseMutationOptions<unknown, Error, TVars>, 'mutationFn'>

function useInvalidatingQuestionMutation<TVars>(
  mutationFn: (vars: TVars) => Promise<unknown>,
  options?: QuestionMutationOptions<TVars>,
) {
  const queryClient = useQueryClient()
  return useMutation<unknown, Error, TVars>({
    ...options,
    mutationFn,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: keys.adminQuestions.all })
      options?.onSuccess?.(...args)
    },
  })
}

export const useCreateQuestion = (options?: QuestionMutationOptions<QuestionCreateRequest>) =>
  useInvalidatingQuestionMutation((data: QuestionCreateRequest) => adminQuestionsApi.create(data), options)

export const useUpdateQuestion = (options?: QuestionMutationOptions<{ id: number; data: QuestionCreateRequest }>) =>
  useInvalidatingQuestionMutation(({ id, data }) => adminQuestionsApi.update(id, data), options)

export const useDeleteQuestion = (options?: QuestionMutationOptions<number>) =>
  useInvalidatingQuestionMutation((id: number) => adminQuestionsApi.delete(id), options)

export const useUpdateQuestionStatus = (options?: QuestionMutationOptions<{ id: number; status: string }>) =>
  useInvalidatingQuestionMutation(({ id, status }) => adminQuestionsApi.updateStatus(id, status), options)

/** Sequentially applies a status to many questions, then invalidates once. */
export const useBulkUpdateQuestionStatus = (options?: QuestionMutationOptions<{ ids: number[]; status: string }>) =>
  useInvalidatingQuestionMutation(async ({ ids, status }) => {
    for (const id of ids) await adminQuestionsApi.updateStatus(id, status)
  }, options)

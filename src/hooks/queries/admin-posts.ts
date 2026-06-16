import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { postsApi } from '@/lib/api/posts'
import { keys } from '@/lib/query-keys'

export type AdminPostsListParams = { page: number; search: string; status: string }

/** Paginated, filtered admin post list. `search` should already be debounced by the caller. */
export function useAdminPosts(params: AdminPostsListParams) {
  return useQuery({
    queryKey: keys.adminPosts.list(params),
    queryFn: () => postsApi.adminGetAll({
      keyword: params.search || undefined,
      status: params.status || undefined,
      page: params.page,
      size: 15,
    }),
  })
}

// Each mutation busts every admin-posts query and forwards the caller's callbacks.
type PostMutationOptions<TVars> = Omit<UseMutationOptions<unknown, Error, TVars>, 'mutationFn'>

function useInvalidatingPostMutation<TVars>(
  mutationFn: (vars: TVars) => Promise<unknown>,
  options?: PostMutationOptions<TVars>,
) {
  const queryClient = useQueryClient()
  return useMutation<unknown, Error, TVars>({
    ...options,
    mutationFn,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: keys.adminPosts.all })
      options?.onSuccess?.(...args)
    },
  })
}

export const useFeaturePost = (options?: PostMutationOptions<{ id: number; featured: boolean }>) =>
  useInvalidatingPostMutation(({ id, featured }) => postsApi.adminFeature(id, featured), options)

export const usePinPost = (options?: PostMutationOptions<{ id: number; pinned: boolean }>) =>
  useInvalidatingPostMutation(({ id, pinned }) => postsApi.adminPin(id, pinned), options)

export const usePublishPost = (options?: PostMutationOptions<number>) =>
  useInvalidatingPostMutation((id: number) => postsApi.adminPublish(id), options)

export const useArchivePost = (options?: PostMutationOptions<number>) =>
  useInvalidatingPostMutation((id: number) => postsApi.adminArchive(id), options)

export const useDeletePost = (options?: PostMutationOptions<number>) =>
  useInvalidatingPostMutation((id: number) => postsApi.adminDelete(id), options)

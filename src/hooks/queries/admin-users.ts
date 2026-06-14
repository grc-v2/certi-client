import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { adminApi, type AdminUserUpdateRequest } from '@/lib/api/admin'
import { keys } from '@/lib/query-keys'

export type AdminUsersListParams = { page: number; search: string; status: string; role: string; sortBy: string }

/** Paginated, filtered admin user list. `search` should already be debounced by the caller. */
export function useAdminUsers(params: AdminUsersListParams) {
  return useQuery({
    queryKey: keys.adminUsers.list(params),
    queryFn: () => adminApi.listUsers({
      search: params.search || undefined,
      status: params.status || undefined,
      role: params.role || undefined,
      sort: params.sortBy || undefined,
      page: params.page,
      size: 15,
    }),
  })
}

// Each mutation owns the cache invalidation (busts every admin-users query) and forwards the
// caller's callbacks, so toasts / dialog resets / selection clearing stay in the component.
type UserMutationOptions<TVars> = Omit<UseMutationOptions<unknown, Error, TVars>, 'mutationFn'>

function useInvalidatingUserMutation<TVars>(
  mutationFn: (vars: TVars) => Promise<unknown>,
  options?: UserMutationOptions<TVars>,
) {
  const queryClient = useQueryClient()
  return useMutation<unknown, Error, TVars>({
    ...options,
    mutationFn,
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: keys.adminUsers.all })
      options?.onSuccess?.(...args)
    },
  })
}

export const useActivateUser = (options?: UserMutationOptions<string>) =>
  useInvalidatingUserMutation((id: string) => adminApi.activateUser(id), options)

export const useDeactivateUser = (options?: UserMutationOptions<string>) =>
  useInvalidatingUserMutation((id: string) => adminApi.deactivateUser(id), options)

export const useDeleteUser = (options?: UserMutationOptions<string>) =>
  useInvalidatingUserMutation((id: string) => adminApi.deleteUser(id), options)

export const useUpdateUser = (options?: UserMutationOptions<{ id: string; data: AdminUserUpdateRequest }>) =>
  useInvalidatingUserMutation(({ id, data }) => adminApi.updateUser(id, data), options)

export const useBulkActivateUsers = (options?: UserMutationOptions<string[]>) =>
  useInvalidatingUserMutation((userIds: string[]) => adminApi.bulkActivate(userIds), options)

export const useBulkDeactivateUsers = (options?: UserMutationOptions<string[]>) =>
  useInvalidatingUserMutation((userIds: string[]) => adminApi.bulkDeactivate(userIds), options)

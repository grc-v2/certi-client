import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import {
  trackerApi,
  type CreateTaskPayload,
  type ReorderTaskItem,
  type TaskResponse,
  type UpdateTaskPayload,
} from '@/lib/api/tracker'
import { keys } from '@/lib/query-keys'

/** The current user's todo tasks (all statuses), ordered for the board. */
export function useTasks() {
  return useQuery({
    queryKey: keys.tracker.tasks(),
    queryFn: trackerApi.listTasks,
  })
}

export function useCreateTask(
  options?: Omit<UseMutationOptions<TaskResponse, Error, CreateTaskPayload>, 'mutationFn'>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: (data: CreateTaskPayload) => trackerApi.createTask(data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: keys.tracker.tasks() })
      options?.onSuccess?.(...args)
    },
  })
}

export function useUpdateTask(
  options?: Omit<UseMutationOptions<TaskResponse, Error, { id: number; data: UpdateTaskPayload }>, 'mutationFn'>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: ({ id, data }: { id: number; data: UpdateTaskPayload }) => trackerApi.updateTask(id, data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: keys.tracker.tasks() })
      options?.onSuccess?.(...args)
    },
  })
}

export function useDeleteTask(
  options?: Omit<UseMutationOptions<unknown, Error, number>, 'mutationFn'>,
) {
  const queryClient = useQueryClient()
  return useMutation<unknown, Error, number>({
    ...options,
    mutationFn: (id: number) => trackerApi.deleteTask(id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: keys.tracker.tasks() })
      options?.onSuccess?.(...args)
    },
  })
}

/**
 * Persist a drag rearrangement, updating the cached list optimistically so the
 * board doesn't flash back to the old order before the server confirms.
 */
export function useReorderTasks() {
  const queryClient = useQueryClient()
  return useMutation<unknown, Error, ReorderTaskItem[], { prev?: TaskResponse[] }>({
    mutationFn: (items: ReorderTaskItem[]) => trackerApi.reorderTasks(items),
    onMutate: async (items) => {
      await queryClient.cancelQueries({ queryKey: keys.tracker.tasks() })
      const prev = queryClient.getQueryData<TaskResponse[]>(keys.tracker.tasks())
      if (prev) {
        const patch = new Map(items.map((i) => [i.id, i]))
        const next = prev.map((t) => {
          const it = patch.get(t.id)
          return it ? { ...t, status: it.status, orderIndex: it.orderIndex } : t
        })
        queryClient.setQueryData(keys.tracker.tasks(), next)
      }
      return { prev }
    },
    onError: (_e, _items, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(keys.tracker.tasks(), ctx.prev)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: keys.tracker.tasks() })
    },
  })
}

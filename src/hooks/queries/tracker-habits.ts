import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { habitsApi, type HabitPayload, type HabitResponse } from '@/lib/api/habits'
import { keys } from '@/lib/query-keys'

/** The current user's habits with today's status (dueToday, checkedInToday, currentStreak). */
export function useHabits() {
  return useQuery({
    queryKey: keys.tracker.habits(),
    queryFn: habitsApi.list,
  })
}

export function useCreateHabit(
  options?: Omit<UseMutationOptions<HabitResponse, Error, HabitPayload>, 'mutationFn'>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: (data: HabitPayload) => habitsApi.create(data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: keys.tracker.habits() })
      options?.onSuccess?.(...args)
    },
  })
}

export function useUpdateHabit(
  options?: Omit<UseMutationOptions<HabitResponse, Error, { id: number; data: HabitPayload }>, 'mutationFn'>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: ({ id, data }: { id: number; data: HabitPayload }) => habitsApi.update(id, data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: keys.tracker.habits() })
      options?.onSuccess?.(...args)
    },
  })
}

export function useDeleteHabit(
  options?: Omit<UseMutationOptions<unknown, Error, number>, 'mutationFn'>,
) {
  const queryClient = useQueryClient()
  return useMutation<unknown, Error, number>({
    ...options,
    mutationFn: (id: number) => habitsApi.remove(id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: keys.tracker.habits() })
      options?.onSuccess?.(...args)
    },
  })
}

/** Toggle today's check-in for a habit. Pass the habit and whether it is currently done. */
export function useToggleHabitCheckin(
  options?: Omit<UseMutationOptions<HabitResponse, Error, { id: number; done: boolean; date?: string }>, 'mutationFn'>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: ({ id, done, date }: { id: number; done: boolean; date?: string }) =>
      done ? habitsApi.uncheckin(id, date) : habitsApi.checkin(id, date),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: keys.tracker.habits() })
      queryClient.invalidateQueries({ queryKey: keys.tracker.habitHistory(args[1].id) })
      options?.onSuccess?.(...args)
    },
  })
}

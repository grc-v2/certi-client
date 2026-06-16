import { useMutation, useQueryClient } from '@tanstack/react-query'
import { trackerApi } from '@/lib/api/tracker'
import { keys } from '@/lib/query-keys'

/** Reset the user's tracker content (tasks, resources, collections); keeps settings. */
export function useResetTrackerData() {
  const queryClient = useQueryClient()
  return useMutation<unknown, Error, void>({
    mutationFn: () => trackerApi.resetData(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.tracker.all })
    },
  })
}

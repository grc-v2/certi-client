import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { trackerApi, type PomodoroPreset, type PomodoroSettingResponse } from '@/lib/api/tracker'
import { keys } from '@/lib/query-keys'

/** The current user's Pomodoro preset (defaults to CLASSIC server-side). */
export function usePomodoroSetting() {
  return useQuery({
    queryKey: keys.tracker.pomodoro(),
    queryFn: trackerApi.getPomodoroSetting,
  })
}

export function useUpdatePomodoroSetting() {
  const queryClient = useQueryClient()
  return useMutation<PomodoroSettingResponse, Error, PomodoroPreset>({
    mutationFn: (preset: PomodoroPreset) => trackerApi.updatePomodoroSetting(preset),
    onSuccess: (data) => {
      queryClient.setQueryData(keys.tracker.pomodoro(), data)
    },
  })
}

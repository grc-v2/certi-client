import { useQuery } from '@tanstack/react-query'
import { learningLookupsApi } from '@/lib/api/learning-lookups'

export function useLearningQuestionLookups() {
  const query = useQuery({
    queryKey: ['learning-lookups', 'questions'],
    queryFn: () => learningLookupsApi.getQuestionLookups(),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  })

  const types = query.data?.types || []
  const difficulties = query.data?.difficulties || []
  const statuses = query.data?.statuses || []

  const getLabel = (group: 'types' | 'difficulties' | 'statuses', value: string) => {
    const list = group === 'types' ? types : group === 'difficulties' ? difficulties : statuses
    const item = list.find(opt => opt.value === value)
    return item ? item.label : value
  }

  return {
    ...query,
    types,
    difficulties,
    statuses,
    getLabel,
  }
}

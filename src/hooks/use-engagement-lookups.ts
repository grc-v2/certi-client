import { useQuery } from '@tanstack/react-query'
import { engagementLookupsApi } from '@/lib/api/engagement-lookups'

export function useEngagementPostLookups() {
  const query = useQuery({
    queryKey: ['engagement-lookups', 'posts'],
    queryFn: () => engagementLookupsApi.getPostLookups(),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  })

  const statuses = query.data?.statuses || []
  const contentTypes = query.data?.contentTypes || []
  const difficulties = query.data?.difficulties || []
  const tagCategories = query.data?.tagCategories || []

  const getLabel = (group: 'statuses' | 'contentTypes' | 'difficulties' | 'tagCategories', value: string) => {
    const list = group === 'statuses' ? statuses : group === 'contentTypes' ? contentTypes : group === 'difficulties' ? difficulties : tagCategories
    const item = list.find(opt => opt.value === value)
    return item ? item.label : value
  }

  return {
    ...query,
    statuses,
    contentTypes,
    difficulties,
    tagCategories,
    getLabel,
  }
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { trackerApi, type CollectionResponse } from '@/lib/api/tracker'
import { keys } from '@/lib/query-keys'

/** The current user's Resource Hub collections, alphabetical. */
export function useCollections() {
  return useQuery({
    queryKey: keys.tracker.collections(),
    queryFn: trackerApi.listCollections,
  })
}

export function useCreateCollection() {
  const queryClient = useQueryClient()
  return useMutation<CollectionResponse, Error, string>({
    mutationFn: (name: string) => trackerApi.createCollection(name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.tracker.collections() }),
  })
}

export function useRenameCollection() {
  const queryClient = useQueryClient()
  return useMutation<CollectionResponse, Error, { id: number; name: string }>({
    mutationFn: ({ id, name }) => trackerApi.renameCollection(id, name),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.tracker.collections() }),
  })
}

export function useDeleteCollection() {
  const queryClient = useQueryClient()
  return useMutation<unknown, Error, number>({
    mutationFn: (id: number) => trackerApi.deleteCollection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.tracker.collections() })
      queryClient.invalidateQueries({ queryKey: keys.tracker.resources() })
    },
  })
}

/** Assign a resource to a collection (or detach with null). */
export function useSetResourceCollection() {
  const queryClient = useQueryClient()
  return useMutation<unknown, Error, { id: number; collectionId: number | null }>({
    mutationFn: ({ id, collectionId }) => trackerApi.setResourceCollection(id, collectionId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.tracker.resources() }),
  })
}

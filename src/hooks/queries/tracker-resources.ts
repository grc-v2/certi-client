import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import {
  trackerApi,
  type CreateResourcePayload,
  type ResourceResponse,
  type UpdateResourcePayload,
} from '@/lib/api/tracker'
import { keys } from '@/lib/query-keys'

/** The current user's Resource Hub items (notes + links), newest first. */
export function useResources() {
  return useQuery({
    queryKey: keys.tracker.resources(),
    queryFn: trackerApi.listResources,
  })
}

/** Add a note or link. Link kind + title are resolved server-side. */
export function useCreateResource(
  options?: Omit<UseMutationOptions<ResourceResponse, Error, CreateResourcePayload>, 'mutationFn'>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: (data: CreateResourcePayload) => trackerApi.createResource(data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: keys.tracker.resources() })
      options?.onSuccess?.(...args)
    },
  })
}

export function useUpdateResource(
  options?: Omit<UseMutationOptions<ResourceResponse, Error, { id: number; data: UpdateResourcePayload }>, 'mutationFn'>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: ({ id, data }: { id: number; data: UpdateResourcePayload }) => trackerApi.updateResource(id, data),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: keys.tracker.resources() })
      options?.onSuccess?.(...args)
    },
  })
}

export function useDeleteResource(
  options?: Omit<UseMutationOptions<unknown, Error, number>, 'mutationFn'>,
) {
  const queryClient = useQueryClient()
  return useMutation<unknown, Error, number>({
    ...options,
    mutationFn: (id: number) => trackerApi.deleteResource(id),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: keys.tracker.resources() })
      options?.onSuccess?.(...args)
    },
  })
}

/** Upload a PDF/ebook into the Resource Hub. */
export function useUploadResourcePdf(
  options?: Omit<UseMutationOptions<ResourceResponse, Error, { file: File; collectionId?: number | null }>, 'mutationFn'>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: ({ file, collectionId }: { file: File; collectionId?: number | null }) =>
      trackerApi.uploadResourcePdf(file, collectionId),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: keys.tracker.resources() })
      options?.onSuccess?.(...args)
    },
  })
}

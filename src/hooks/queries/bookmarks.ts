import { useMutation, useQuery, useQueryClient, type UseMutationOptions } from '@tanstack/react-query'
import { postsApi, type BookmarkResponse } from '@/lib/api/posts'
import { keys } from '@/lib/query-keys'

/** The current user's bookmarked posts. `search` should already be debounced by the caller. */
export function useBookmarks(params: { search: string; page: number; size: number }) {
  return useQuery({
    queryKey: keys.bookmarks.list(params),
    queryFn: () => postsApi.getBookmarks(params.page, params.size),
    placeholderData: (prev) => prev,
  })
}

/**
 * Toggle a post's bookmark. The backend endpoint adds the bookmark if absent and
 * removes it if present, returning the created `BookmarkResponse` (or nothing on removal).
 */
export function useToggleBookmark(options?: Omit<UseMutationOptions<BookmarkResponse, Error, number>, 'mutationFn'>) {
  const queryClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: (postId: number) => postsApi.toggleBookmark(postId),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: keys.bookmarks.all })
      options?.onSuccess?.(...args)
    },
  })
}

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

/** Bookmark a post (toggle endpoint). Returns the created `BookmarkResponse`. */
export function useBookmarkPost(options?: Omit<UseMutationOptions<BookmarkResponse, Error, number>, 'mutationFn'>) {
  const queryClient = useQueryClient()
  return useMutation({
    ...options,
    mutationFn: (postId: number) => postsApi.bookmarkPost(postId),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: keys.bookmarks.all })
      options?.onSuccess?.(...args)
    },
  })
}

/** Remove a post's bookmark. */
export function useRemoveBookmark(options?: Omit<UseMutationOptions<unknown, Error, number>, 'mutationFn'>) {
  const queryClient = useQueryClient()
  return useMutation<unknown, Error, number>({
    ...options,
    mutationFn: (postId: number) => postsApi.removeBookmark(postId),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: keys.bookmarks.all })
      options?.onSuccess?.(...args)
    },
  })
}

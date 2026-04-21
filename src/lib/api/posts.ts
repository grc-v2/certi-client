import apiClient from './client'
import type { PageDto } from './certifications'

export interface PostResponse {
  id: number; slug: string; title: string; subtitle?: string; excerpt?: string
  contentType: string; difficultyLevel?: string; status: string; featured: boolean; pinned: boolean
  authorId: number
  tags: TagResponse[]
  commentsCount: number; viewsCount: number; likesCount: number
  readingTimeMinutes?: number
  publishedAt: string
}

export interface PostDetailResponse extends PostResponse {
  content: string; contentHtml: string
  seoTitle?: string; seoDescription?: string; seoKeywords?: string
  tableOfContents?: string
  wordCount?: number; bookmarkCount?: number
  category?: string; seriesName?: string; seriesOrder?: number
}

export interface TagResponse {
  id: number; name: string; slug: string
}

export interface BookmarkResponse {
  // Bookmark fields
  id: number          // bookmark ID
  postId: number
  userId: number
  createdAt: string
  updatedAt: string
  // Merged post fields
  title: string
  slug: string
  excerpt?: string
  authorId: number
  status: string
  publishedAt: string
  viewsCount: number
  likesCount: number
  commentsCount: number
  readingTimeMinutes?: number
  tags: TagResponse[]
  contentType: string
  difficultyLevel?: string
  subtitle?: string
  pinned: boolean
  featured: boolean
  category?: string
}

export interface CommentResponse {
  id: string; content: string; authorId: string; authorName: string
  authorAvatar?: string; createdAt: string; replies?: CommentResponse[]
}

export const postsApi = {
  search: (params?: Record<string, unknown>) =>
    apiClient.get<PageDto<PostResponse>>('/api/v1/posts', { params }).then(r => r.data),
  getFeatured: (page = 0, size = 10) =>
    apiClient.get<PageDto<PostResponse>>('/api/v1/posts/featured', { params: { page, size } }).then(r => r.data),
  getTrending: (page = 0, size = 10) =>
    apiClient.get<PageDto<PostResponse>>('/api/v1/posts/trending', { params: { page, size } }).then(r => r.data),
  getBySlug: (slug: string) =>
    apiClient.get<PostDetailResponse>(`/api/v1/posts/${slug}`).then(r => r.data),
  getByAuthor: (authorId: string | number, page = 0, size = 10) =>
    apiClient.get<PageDto<PostResponse>>(`/api/v1/posts/author/${authorId}`, { params: { page, size } }).then(r => r.data),
  create: (data: unknown) => apiClient.post<PostResponse>('/api/v1/posts', data).then(r => r.data),
  update: (id: number, data: unknown) => apiClient.put<PostResponse>(`/api/v1/posts/${id}`, data).then(r => r.data),
  delete: (id: number) => apiClient.delete(`/api/v1/posts/${id}`),
  publish: (id: number) => apiClient.post<PostResponse>(`/api/v1/posts/${id}/publish`).then(r => r.data),
  archive: (id: number) => apiClient.post<PostResponse>(`/api/v1/posts/${id}/archive`).then(r => r.data),
  submitReview: (id: number) => apiClient.post<PostResponse>(`/api/v1/posts/${id}/submit-review`).then(r => r.data),
  // Comments
  getComments: (postId: number) =>
    apiClient.get<CommentResponse[]>(`/api/v1/posts/${postId}/comments`).then(r => r.data),
  getCommentsPaginated: (postId: number, page = 0, size = 20) =>
    apiClient.get<PageDto<CommentResponse>>(`/api/v1/posts/${postId}/comments/paginated`, { params: { page, size } }).then(r => r.data),
  addComment: (postId: number, data: { content: string }) =>
    apiClient.post<CommentResponse>(`/api/v1/posts/${postId}/comments`, data).then(r => r.data),
  updateComment: (postId: number, commentId: string, data: { content: string }) =>
    apiClient.put<CommentResponse>(`/api/v1/posts/${postId}/comments/${commentId}`, data).then(r => r.data),
  deleteComment: (postId: number, commentId: string) =>
    apiClient.delete(`/api/v1/posts/${postId}/comments/${commentId}`),
  addReply: (postId: number, commentId: string, data: { content: string }) =>
    apiClient.post<CommentResponse>(`/api/v1/posts/${postId}/comments/${commentId}/replies`, data).then(r => r.data),
  // Bookmarks
  getBookmarks: (page = 0, size = 12) =>
    apiClient.get<PageDto<BookmarkResponse>>('/api/v1/bookmarks', { params: { page, size } }).then(r => r.data),
  bookmarkPost: (postId: number) =>
    apiClient.post<BookmarkResponse>(`/api/v1/bookmarks/posts/${postId}`).then(r => r.data),
  // Tags
  searchTags: (params?: Record<string, unknown>) =>
    apiClient.get<PageDto<TagResponse>>('/api/v1/tags', { params }).then(r => r.data),
  getTagBySlug: (slug: string) =>
    apiClient.get<TagResponse>(`/api/v1/tags/${slug}`).then(r => r.data),
  getPostsByTag: (slug: string, page = 0, size = 10) =>
    apiClient.get<PageDto<PostResponse>>(`/api/v1/tags/${slug}/posts`, { params: { page, size } }).then(r => r.data),
  createTag: (data: unknown) => apiClient.post<TagResponse>('/api/v1/tags', data).then(r => r.data),
  // Admin
  adminGetAll: (params?: Record<string, unknown>) =>
    apiClient.get<PageDto<PostResponse>>('/api/v1/admin/posts', { params }).then(r => r.data),
  adminFeature: (id: number, featured: boolean) =>
    apiClient.post(`/api/v1/admin/posts/${id}/feature`, null, { params: { featured } }).then(r => r.data),
  adminPin: (id: number, pinned: boolean) =>
    apiClient.post(`/api/v1/admin/posts/${id}/pin`, null, { params: { pinned } }).then(r => r.data),
}

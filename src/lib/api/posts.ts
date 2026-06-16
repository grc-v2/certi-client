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
  id: number; name: string; slug: string; postCount?: number
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
  id: number; content: string; authorId: number; authorName: string
  authorAvatar?: string; createdAt: string; replies?: CommentResponse[]
}

export interface PostSearchParams {
  keyword?: string
  status?: string
  contentType?: string
  difficultyLevel?: string
  featured?: boolean
  pinned?: boolean
  page?: number
  size?: number
  sortBy?: string
  sortDirection?: 'ASC' | 'DESC'
}

export interface PostRequest {
  title: string
  subtitle?: string
  excerpt?: string
  content: string
  contentHtml?: string
  contentType?: string
  difficultyLevel?: string
  status?: string
  tagIds?: number[]
  tags?: string[]
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
  category?: string
  seriesName?: string
  seriesOrder?: number
}

export interface TagSearchParams {
  keyword?: string
  page?: number
  size?: number
  sortBy?: string
  sortDirection?: 'ASC' | 'DESC'
}

export interface TagRequest {
  name: string
  slug?: string
}

export const postsApi = {
  search: (params?: PostSearchParams) =>
    apiClient.get<PageDto<PostResponse>>('/api/v1/posts', { params }).then(r => r.data),
  getFeatured: (page = 0, size = 10) =>
    apiClient.get<PageDto<PostResponse>>('/api/v1/posts/featured', { params: { page, size } }).then(r => r.data),
  getTrending: (page = 0, size = 10) =>
    apiClient.get<PageDto<PostResponse>>('/api/v1/posts/trending', { params: { page, size } }).then(r => r.data),
  getBySlug: (slug: string) =>
    apiClient.get<PostDetailResponse>(`/api/v1/posts/${slug}`).then(r => r.data),
  getByAuthor: (authorId: string | number, page = 0, size = 10) =>
    apiClient.get<PageDto<PostResponse>>(`/api/v1/posts/author/${authorId}`, { params: { page, size } }).then(r => r.data),
  create: (data: PostRequest) => apiClient.post<PostResponse>('/api/v1/posts', data).then(r => r.data),
  update: (id: number, data: PostRequest) => apiClient.put<PostResponse>(`/api/v1/posts/${id}`, data).then(r => r.data),
  delete: (id: number) => apiClient.delete(`/api/v1/posts/${id}`),
  publish: (id: number) => apiClient.post<PostResponse>(`/api/v1/posts/${id}/publish`).then(r => r.data),
  archive: (id: number) => apiClient.post<PostResponse>(`/api/v1/posts/${id}/archive`).then(r => r.data),
  submitReview: (id: number) => apiClient.post<PostResponse>(`/api/v1/posts/${id}/submit-review`).then(r => r.data),
  // Comments
  getComments: (postId: number) =>
    apiClient.get<CommentResponse[]>(`/api/v1/posts/${postId}/comments`).then(r => r.data),
  addComment: (postId: number, data: { content: string }) =>
    apiClient.post<CommentResponse>(`/api/v1/posts/${postId}/comments`, { content: data.content }).then(r => r.data),
  addReply: (postId: number, commentId: number, data: { content: string }) =>
    apiClient.post<CommentResponse>(`/api/v1/posts/${postId}/comments`, { content: data.content, parentId: commentId }).then(r => r.data),
  updateComment: (postId: number, commentId: number, data: { content: string }) =>
    apiClient.put<CommentResponse>(`/api/v1/posts/${postId}/comments/${commentId}`, { content: data.content }).then(r => r.data),
  deleteComment: (postId: number, commentId: number) =>
    apiClient.delete(`/api/v1/posts/${postId}/comments/${commentId}`).then(r => r.data),
  // Bookmarks — backend POST toggles add/remove
  getBookmarks: (page = 0, size = 12) =>
    apiClient.get<PageDto<BookmarkResponse>>('/api/v1/bookmarks', { params: { page, size } }).then(r => r.data),
  toggleBookmark: (postId: number) =>
    apiClient.post<BookmarkResponse>(`/api/v1/bookmarks/posts/${postId}`).then(r => r.data),
  // Tags
  searchTags: (params?: TagSearchParams) =>
    apiClient.get<PageDto<TagResponse>>('/api/v1/tags', { params }).then(r => r.data),
  getTagBySlug: (slug: string) =>
    apiClient.get<TagResponse>(`/api/v1/tags/${slug}`).then(r => r.data),
  getPostsByTag: (slug: string, page = 0, size = 10) =>
    apiClient.get<PageDto<PostResponse>>(`/api/v1/tags/${slug}/posts`, { params: { page, size } }).then(r => r.data),
  createTag: (data: TagRequest) => apiClient.post<TagResponse>('/api/v1/tags', data).then(r => r.data),
  // Admin
  adminGetAll: (params?: PostSearchParams) =>
    apiClient.get<PageDto<PostResponse>>('/api/v1/admin/posts', { params }).then(r => r.data),
  adminFeature: (id: number, featured: boolean) =>
    apiClient.post(`/api/v1/admin/posts/${id}/feature`, null, { params: { featured } }).then(r => r.data),
  adminPin: (id: number, pinned: boolean) =>
    apiClient.post(`/api/v1/admin/posts/${id}/pin`, null, { params: { pinned } }).then(r => r.data),
  // Admin moderation — bypass author-ownership checks (any post)
  adminPublish: (id: number) =>
    apiClient.post<PostResponse>(`/api/v1/admin/posts/${id}/publish`).then(r => r.data),
  adminArchive: (id: number) =>
    apiClient.post<PostResponse>(`/api/v1/admin/posts/${id}/archive`).then(r => r.data),
  adminDelete: (id: number) => apiClient.delete(`/api/v1/admin/posts/${id}`),
}

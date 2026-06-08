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
  id: string; content: string; authorId: string; authorName: string
  authorAvatar?: string; createdAt: string; replies?: CommentResponse[]
}

// Local memory cache for mock comments to make addition/deletion look realistic
const _mockComments: Record<number, CommentResponse[]> = {}

function getOrCreateMockComments(postId: number): CommentResponse[] {
  if (!_mockComments[postId]) {
    _mockComments[postId] = [
      {
        id: 'comment-1',
        content: 'Bài viết rất hữu ích! Tài liệu tham khảo cực kỳ chi tiết.',
        authorId: '100',
        authorName: 'Hoàng Nguyễn',
        authorAvatar: undefined,
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        replies: [
          {
            id: 'comment-1-reply-1',
            content: 'Cảm ơn bạn! Rất vui vì bài viết giúp ích được cho bạn.',
            authorId: '101',
            authorName: 'Minh Trần',
            authorAvatar: undefined,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          }
        ]
      },
      {
        id: 'comment-2',
        content: 'Mình đang ôn luyện chứng chỉ này, có ai muốn lập nhóm học chung không?',
        authorId: '102',
        authorName: 'Thanh Phạm',
        authorAvatar: undefined,
        createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        replies: []
      }
    ]
  }
  return _mockComments[postId]
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
  // Comments (Offline Mock Implementation to prevent backend 404 errors)
  getComments: (postId: number) => {
    return Promise.resolve(getOrCreateMockComments(postId))
  },
  getCommentsPaginated: (postId: number, page = 0, size = 20) => {
    const list = getOrCreateMockComments(postId)
    return Promise.resolve({
      content: list.slice(page * size, (page + 1) * size),
      totalElements: list.length,
      totalPages: Math.ceil(list.length / size),
      pageNumber: page,
      pageSize: size,
      last: (page + 1) * size >= list.length,
      first: page === 0,
      empty: list.length === 0
    })
  },
  addComment: (postId: number, data: { content: string }) => {
    const list = getOrCreateMockComments(postId)
    const newComment: CommentResponse = {
      id: `comment-mock-${Date.now()}`,
      content: data.content,
      authorId: '999',
      authorName: 'Bạn (Học viên)',
      authorAvatar: undefined,
      createdAt: new Date().toISOString(),
      replies: []
    }
    list.unshift(newComment)
    return Promise.resolve(newComment)
  },
  updateComment: (postId: number, commentId: string, data: { content: string }) => {
    const list = getOrCreateMockComments(postId)
    const comment = list.find(c => c.id === commentId)
    if (comment) {
      comment.content = data.content
      return Promise.resolve(comment)
    }
    return Promise.reject(new Error('Comment not found'))
  },
  deleteComment: (postId: number, commentId: string) => {
    const list = getOrCreateMockComments(postId)
    const idx = list.findIndex(c => c.id === commentId)
    if (idx !== -1) {
      list.splice(idx, 1)
      return Promise.resolve()
    }
    // Also check replies
    for (const c of list) {
      const rIdx = c.replies?.findIndex(r => r.id === commentId) ?? -1
      if (rIdx !== -1) {
        c.replies?.splice(rIdx, 1)
        return Promise.resolve()
      }
    }
    return Promise.resolve()
  },
  addReply: (postId: number, commentId: string, data: { content: string }) => {
    const list = getOrCreateMockComments(postId)
    const comment = list.find(c => c.id === commentId)
    if (comment) {
      const newReply: CommentResponse = {
        id: `reply-mock-${Date.now()}`,
        content: data.content,
        authorId: '999',
        authorName: 'Bạn (Học viên)',
        authorAvatar: undefined,
        createdAt: new Date().toISOString()
      }
      if (!comment.replies) comment.replies = []
      comment.replies.push(newReply)
      return Promise.resolve(newReply)
    }
    return Promise.reject(new Error('Parent comment not found'))
  },
  // Bookmarks
  getBookmarks: (page = 0, size = 12) =>
    apiClient.get<PageDto<BookmarkResponse>>('/api/v1/bookmarks', { params: { page, size } }).then(r => r.data),
  bookmarkPost: (postId: number) =>
    apiClient.post<BookmarkResponse>(`/api/v1/bookmarks/posts/${postId}`).then(r => r.data),
  removeBookmark: (postId: number) =>
    apiClient.post(`/api/v1/bookmarks/posts/${postId}`).then(r => r.data),
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
}

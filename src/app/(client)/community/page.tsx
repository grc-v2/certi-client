'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import {
  MessageSquare, Bookmark, BookmarkCheck, TrendingUp, Star, Pin, Search,
  Plus, Tag, Clock, User as UserIcon, ChevronLeft, ChevronRight,
  Eye, Heart, Flame
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { postsApi, type PostResponse } from '@/lib/api/posts'
import { formatRelativeTime, cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/use-debounce'

const PAGE_SIZE = 10

const CONTENT_TYPE_COLORS: Record<string, string> = {
  ARTICLE: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
  QUESTION: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400',
  EXPERIENCE: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400',
  GUIDE: 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400',
  TIP: 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400',
}

const CONTENT_TYPE_LABELS: Record<string, string> = {
  ARTICLE: 'Bài viết', QUESTION: 'Câu hỏi', EXPERIENCE: 'Kinh nghiệm',
  GUIDE: 'Hướng dẫn', TIP: 'Mẹo hay',
}

// ── Pagination component ──────────────────────────────────────────────────────

function Pagination({
  page, totalPages, totalElements, pageSize, onPageChange,
}: {
  page: number; totalPages: number; totalElements: number; pageSize: number; onPageChange: (p: number) => void
}) {
  if (totalPages <= 1) return null

  const from = page * pageSize + 1
  const to = Math.min((page + 1) * pageSize, totalElements)

  // Build page number list with ellipsis
  const getPageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i)
    const pages: (number | '...')[] = []
    if (page <= 3) {
      pages.push(0, 1, 2, 3, 4, '...', totalPages - 1)
    } else if (page >= totalPages - 4) {
      pages.push(0, '...', totalPages - 5, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1)
    } else {
      pages.push(0, '...', page - 1, page, page + 1, '...', totalPages - 1)
    }
    return pages
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
      <p className="text-sm text-slate-500 dark:text-slate-400 order-2 sm:order-1">
        Hiển thị <span className="font-medium text-slate-700 dark:text-slate-200">{from}–{to}</span> trong tổng số <span className="font-medium text-slate-700 dark:text-slate-200">{totalElements}</span> bài viết
      </p>
      <div className="flex items-center gap-1 order-1 sm:order-2">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors text-slate-600 dark:text-slate-300"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Trước</span>
        </button>

        {getPageNumbers().map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-slate-400 select-none">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={cn(
                'w-8 h-8 text-sm rounded-lg transition-colors cursor-pointer',
                p === page
                  ? 'bg-[#0A66C2] text-white font-medium'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
              )}
            >
              {(p as number) + 1}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages - 1}
          className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors text-slate-600 dark:text-slate-300"
        >
          <span className="hidden sm:inline">Sau</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ── PostCard ──────────────────────────────────────────────────────────────────

function PostCard({ post }: { post: PostResponse }) {
  const queryClient = useQueryClient()
  const [bookmarkId, setBookmarkId] = useState<number | null>(null)
  const isBookmarked = bookmarkId !== null

  const addMutation = useMutation({
    mutationFn: () => postsApi.bookmarkPost(post.id),
    onSuccess: (data) => {
      setBookmarkId(data.id)
      toast.success('Đã lưu bài viết')
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    },
    onError: () => toast.error('Không thể lưu bài viết'),
  })
  const removeMutation = useMutation({
    mutationFn: () => postsApi.removeBookmark(bookmarkId!),
    onSuccess: () => {
      setBookmarkId(null)
      toast.success('Đã bỏ lưu')
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    },
    onError: () => toast.error('Không thể bỏ lưu'),
  })

  const isPending = addMutation.isPending || removeMutation.isPending
  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isPending) return
    isBookmarked ? removeMutation.mutate() : addMutation.mutate()
  }

  return (
    <Card className="border-slate-200 dark:border-slate-700 hover:border-[#0A66C2]/30 hover:shadow-sm transition-all duration-200">
      <CardContent className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="text-xs bg-[#0A66C2]/10 text-[#0A66C2]">
                <UserIcon className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <Link href={`/profile/${post.authorId}`} className="text-sm font-medium text-slate-900 dark:text-white hover:text-[#0A66C2] cursor-pointer transition-colors truncate block">
                #{post.authorId}
              </Link>
              <p className="text-xs text-slate-400">{formatRelativeTime(post.publishedAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {post.pinned && <Pin className="w-3.5 h-3.5 text-orange-500" />}
            {post.featured && <Star className="w-3.5 h-3.5 text-yellow-500" />}
            {post.contentType && (
              <Badge className={cn('text-xs', CONTENT_TYPE_COLORS[post.contentType] ?? 'bg-slate-100 text-slate-600')}>
                {CONTENT_TYPE_LABELS[post.contentType] ?? post.contentType}
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <Link href={`/community/${post.slug}`} className="block group cursor-pointer">
          <h2 className="font-semibold text-slate-900 dark:text-white group-hover:text-[#0A66C2] transition-colors line-clamp-2 leading-snug">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">{post.excerpt}</p>
          )}
        </Link>

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {post.tags.slice(0, 4).map(tag => (
              <Link key={tag.id} href={`/tags/${tag.slug}`} className="cursor-pointer">
                <Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] transition-colors cursor-pointer">
                  <Tag className="w-2.5 h-2.5 mr-1" />{tag.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <Link href={`/community/${post.slug}#comments`} className="flex items-center gap-1 hover:text-[#0A66C2] cursor-pointer transition-colors">
              <MessageSquare className="w-3.5 h-3.5" />{post.commentsCount}
            </Link>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />{post.viewsCount}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5" />{post.likesCount}
            </span>
          </div>
          <button
            onClick={handleBookmark}
            disabled={isPending}
            title={isBookmarked ? 'Bỏ lưu' : 'Lưu bài viết'}
            className={cn(
              'p-1.5 rounded-lg cursor-pointer transition-colors',
              isBookmarked
                ? 'text-[#0A66C2] bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20'
                : 'text-slate-400 hover:text-[#0A66C2] hover:bg-slate-100 dark:hover:bg-slate-800'
            )}
          >
            {isBookmarked
              ? <BookmarkCheck className="w-4 h-4" />
              : <Bookmark className="w-4 h-4" />
            }
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function PostSkeleton() {
  return (
    <div className="space-y-4">
      {Array(PAGE_SIZE).fill(0).map((_, i) => (
        <Card key={i} className="border-slate-200 dark:border-slate-700">
          <CardContent className="p-5 space-y-3 animate-pulse">
            <div className="flex gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/4" />
                <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded w-1/5" />
              </div>
            </div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CommunityPage() {
  const [tab, setTab] = useState<'latest' | 'trending' | 'featured'>('latest')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const debouncedSearch = useDebounce(search, 400)

  const handleTabChange = (v: string) => { setTab(v as typeof tab); setPage(0) }
  const handleSearchChange = (v: string) => { setSearch(v); setPage(0) }

  const latestQuery = useQuery({
    queryKey: ['posts', 'latest', debouncedSearch, page],
    queryFn: () => postsApi.search({ keyword: debouncedSearch || undefined, page, size: PAGE_SIZE, sortBy: 'publishedAt', sortDirection: 'DESC' }),
    enabled: tab === 'latest',
    placeholderData: (prev) => prev,
  })
  const trendingQuery = useQuery({
    queryKey: ['posts', 'trending', page],
    queryFn: () => postsApi.getTrending(page, PAGE_SIZE),
    enabled: tab === 'trending',
    placeholderData: (prev) => prev,
  })
  const featuredQuery = useQuery({
    queryKey: ['posts', 'featured', page],
    queryFn: () => postsApi.getFeatured(page, PAGE_SIZE),
    enabled: tab === 'featured',
    placeholderData: (prev) => prev,
  })

  const activePostQuery = tab === 'trending' ? trendingQuery : tab === 'featured' ? featuredQuery : latestQuery
  const data = activePostQuery.data
  const posts = activePostQuery.data?.content ?? []
  const isFetching = activePostQuery.isFetching && !activePostQuery.isPlaceholderData

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Cộng đồng</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Chia sẻ kiến thức, kinh nghiệm thi cử</p>
        </div>
        <Link href="/community/create">
          <Button className="bg-[#0A66C2] hover:bg-[#084E96] text-white cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Viết bài
          </Button>
        </Link>
      </div>

      {/* Search + Tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Tìm kiếm bài viết, câu hỏi..."
            value={search}
            onChange={e => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={tab} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="latest" className="cursor-pointer">
              <Clock className="w-3.5 h-3.5 mr-1.5" />Mới nhất
            </TabsTrigger>
            <TabsTrigger value="trending" className="cursor-pointer">
              <TrendingUp className="w-3.5 h-3.5 mr-1.5" />Trending
            </TabsTrigger>
            <TabsTrigger value="featured" className="cursor-pointer">
              <Flame className="w-3.5 h-3.5 mr-1.5" />Nổi bật
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      {isFetching ? (
        <PostSkeleton />
      ) : posts.length > 0 ? (
        <div className={cn('space-y-4 transition-opacity duration-150', activePostQuery.isPlaceholderData && 'opacity-60')}>
          {posts.map(post => <PostCard key={post.id} post={post} />)}
        </div>
      ) : (
        <div className="text-center py-16 text-slate-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Chưa có bài viết nào</p>
          <p className="text-sm mt-1">Hãy là người đầu tiên chia sẻ!</p>
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={data.totalPages}
          totalElements={data.totalElements}
          pageSize={PAGE_SIZE}
          onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
        />
      )}
    </div>
  )
}

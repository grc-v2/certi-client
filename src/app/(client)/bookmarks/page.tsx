'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import {
  Bookmark, BookmarkX, Search, Tag, Clock, Eye, Heart,
  MessageSquare, Pin, Star, ChevronLeft, ChevronRight, ExternalLink
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { postsApi, type BookmarkResponse } from '@/lib/api/posts'
import { formatRelativeTime, cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/use-debounce'
import { QUERY_KEYS } from '@/lib/constants'

const PAGE_SIZE = 12

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

// ── Pagination ────────────────────────────────────────────────────────────────

function Pagination({
  page, totalPages, totalElements, pageSize, onPageChange,
}: {
  page: number; totalPages: number; totalElements: number; pageSize: number; onPageChange: (p: number) => void
}) {
  if (totalPages <= 1) return null

  const from = page * pageSize + 1
  const to = Math.min((page + 1) * pageSize, totalElements)

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

// ── BookmarkCard ──────────────────────────────────────────────────────────────

function BookmarkCard({ item, onRemove, removing }: {
  item: BookmarkResponse; onRemove: (postId: number) => void; removing: boolean
}) {
  return (
    <Card className="border-slate-200 dark:border-slate-700 hover:border-[#0A66C2]/30 hover:shadow-sm transition-all duration-200">
      <CardContent className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {item.pinned && <Pin className="w-3.5 h-3.5 text-orange-500" />}
            {item.featured && <Star className="w-3.5 h-3.5 text-yellow-500" />}
            {item.contentType && (
              <Badge className={cn('text-xs', CONTENT_TYPE_COLORS[item.contentType] ?? 'bg-slate-100 text-slate-600')}>
                {CONTENT_TYPE_LABELS[item.contentType] ?? item.contentType}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Link href={`/community/${item.slug}`} target="_blank">
              <button className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" title="Mở bài viết">
                <ExternalLink className="w-4 h-4" />
              </button>
            </Link>
            <button
              onClick={() => onRemove(item.postId)}
              disabled={removing}
              title="Bỏ lưu"
              className="p-1.5 text-slate-400 hover:text-red-500 cursor-pointer transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
            >
              <BookmarkX className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <Link href={`/community/${item.slug}`} className="block group cursor-pointer">
          <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-[#0A66C2] transition-colors line-clamp-2 leading-snug">
            {item.title}
          </h3>
          {item.excerpt && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">{item.excerpt}</p>
          )}
        </Link>

        {/* Tags */}
        {item.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {item.tags.slice(0, 4).map(tag => (
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
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />{formatRelativeTime(item.publishedAt)}
            </span>
            {item.readingTimeMinutes && (
              <span>{item.readingTimeMinutes} phút đọc</span>
            )}
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{item.viewsCount}</span>
            <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{item.likesCount}</span>
            <Link href={`/community/${item.slug}#comments`} className="flex items-center gap-1 hover:text-[#0A66C2] cursor-pointer transition-colors">
              <MessageSquare className="w-3.5 h-3.5" />{item.commentsCount}
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function BookmarkSkeleton() {
  return (
    <div className="space-y-3">
      {Array(6).fill(0).map((_, i) => (
        <Card key={i} className="border-slate-200 dark:border-slate-700">
          <CardContent className="p-5 space-y-3 animate-pulse">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BookmarksPage() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const debouncedSearch = useDebounce(search, 400)

  const handleSearchChange = (v: string) => { setSearch(v); setPage(0) }

  const { data, isLoading, isFetching, isPlaceholderData } = useQuery({
    queryKey: [...QUERY_KEYS.BOOKMARKS, debouncedSearch, page],
    queryFn: () => postsApi.getBookmarks(page, PAGE_SIZE),
    placeholderData: (prev) => prev,
  })

  const removeMutation = useMutation({
    mutationFn: (postId: number) => postsApi.bookmarkPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BOOKMARKS })
      toast.success('Đã bỏ lưu bài viết')
    },
    onError: () => toast.error('Không thể bỏ lưu'),
  })

  const bookmarks = data?.content ?? []
  const total = data?.totalElements ?? 0

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-[#0A66C2]" />
            Bài viết đã lưu
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{total} bài viết</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input
          placeholder="Tìm kiếm bài viết đã lưu..."
          value={search}
          onChange={e => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* List */}
      {isLoading ? (
        <BookmarkSkeleton />
      ) : bookmarks.length > 0 ? (
        <>
          <div className={cn('space-y-3 transition-opacity duration-150', isPlaceholderData && isFetching && 'opacity-60')}>
            {bookmarks.map((item: BookmarkResponse) => (
              <BookmarkCard
                key={item.id}
                item={item}
                onRemove={(id) => removeMutation.mutate(id)}
                removing={removeMutation.isPending}
              />
            ))}
          </div>

          {data && (
            <Pagination
              page={page}
              totalPages={data.totalPages}
              totalElements={data.totalElements}
              pageSize={PAGE_SIZE}
              onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            />
          )}
        </>
      ) : (
        <div className="text-center py-16 text-slate-500">
          <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-30" />
          {debouncedSearch ? (
            <>
              <p className="font-medium">Không tìm thấy kết quả</p>
              <p className="text-sm mt-1">Thử tìm kiếm với từ khóa khác</p>
            </>
          ) : (
            <>
              <p className="font-medium">Chưa có bài viết nào được lưu</p>
              <p className="text-sm mt-1">Nhấn biểu tượng bookmark trên bài viết để lưu lại</p>
              <Link href="/community">
                <Button className="mt-4 bg-[#0A66C2] hover:bg-[#084E96] text-white cursor-pointer">
                  Khám phá cộng đồng
                </Button>
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  )
}

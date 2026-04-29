'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Star, Pin, Eye, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { postsApi, type PostResponse } from '@/lib/api/posts'
import { formatRelativeTime, cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/use-debounce'
import Link from 'next/link'

export default function AdminPostsPage() {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const debouncedSearch = useDebounce(search, 400)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-posts', page, debouncedSearch, statusFilter],
    queryFn: () => postsApi.adminGetAll({ keyword: debouncedSearch || undefined, status: statusFilter || undefined, page, size: 15 }),
  })

  const featureMutation = useMutation({
    mutationFn: ({ id, featured }: { id: number; featured: boolean }) => postsApi.adminFeature(id, featured),
    onSuccess: () => { toast.success('Đã cập nhật'); queryClient.invalidateQueries({ queryKey: ['admin-posts'] }) },
  })
  const pinMutation = useMutation({
    mutationFn: ({ id, pinned }: { id: number; pinned: boolean }) => postsApi.adminPin(id, pinned),
    onSuccess: () => { toast.success('Đã cập nhật'); queryClient.invalidateQueries({ queryKey: ['admin-posts'] }) },
  })

  const posts = data?.content ?? []
  const totalPages = data?.totalPages ?? 0
  const total = data?.totalElements ?? 0

  const STATUS_COLORS: Record<string, string> = {
    PUBLISHED: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400',
    DRAFT: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    PENDING_REVIEW: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400',
    ARCHIVED: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400',
  }
  const STATUS_LABELS: Record<string, string> = {
    PUBLISHED: 'Đã đăng', DRAFT: 'Nháp', PENDING_REVIEW: 'Chờ duyệt', ARCHIVED: 'Lưu trữ',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-[#0A66C2]" />Quản lý bài viết
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{total} bài viết</p>
      </div>

      <Card className="border-slate-200 dark:border-slate-700">
        <CardContent className="p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Tìm bài viết..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? '')}>
            <SelectTrigger className="w-full sm:w-40 cursor-pointer"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tất cả</SelectItem>
              <SelectItem value="PUBLISHED">Đã đăng</SelectItem>
              <SelectItem value="PENDING_REVIEW">Chờ duyệt</SelectItem>
              <SelectItem value="DRAFT">Nháp</SelectItem>
              <SelectItem value="ARCHIVED">Lưu trữ</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="p-3 text-left font-medium text-slate-500">Bài viết</th>
                  <th className="p-3 text-left font-medium text-slate-500 hidden sm:table-cell">Tác giả</th>
                  <th className="p-3 text-left font-medium text-slate-500">Trạng thái</th>
                  <th className="p-3 text-left font-medium text-slate-500 hidden md:table-cell">Ngày đăng</th>
                  <th className="p-3 text-left font-medium text-slate-500">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array(6).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50">
                      {[1,2,3,4,5].map(j => <td key={j} className="p-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></td>)}
                    </tr>
                  ))
                ) : posts.map((post: PostResponse) => (
                  <tr key={post.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 max-w-xs">
                      <div className="flex items-center gap-2">
                        {post.pinned && <Pin className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />}
                        {post.featured && <Star className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />}
                        <p className="font-medium text-slate-900 dark:text-white line-clamp-1">{post.title}</p>
                      </div>
                    </td>
                    <td className="p-3 text-slate-500 hidden sm:table-cell text-xs">#{post.authorId}</td>
                    <td className="p-3">
                      <Badge className={cn('text-xs', STATUS_COLORS[post.status] ?? 'bg-slate-100 text-slate-600')}>
                        {STATUS_LABELS[post.status] ?? post.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-slate-400 hidden md:table-cell text-xs">{formatRelativeTime(post.publishedAt)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/community/${post.slug}`} target="_blank">
                          <button className="p-1.5 text-slate-400 hover:text-[#0A66C2] cursor-pointer transition-colors rounded hover:bg-[#0A66C2]/10" title="Xem bài viết">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => featureMutation.mutate({ id: post.id, featured: !post.featured })}
                          className={cn('p-1.5 cursor-pointer transition-colors rounded', post.featured ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' : 'text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-950/20')}
                          title={post.featured ? 'Bỏ nổi bật' : 'Đánh dấu nổi bật'}
                        >
                          <Star className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => pinMutation.mutate({ id: post.id, pinned: !post.pinned })}
                          className={cn('p-1.5 cursor-pointer transition-colors rounded', post.pinned ? 'text-orange-500 bg-orange-50 dark:bg-orange-950/20' : 'text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20')}
                          title={post.pinned ? 'Bỏ ghim' : 'Ghim bài viết'}
                        >
                          <Pin className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500">Trang {page + 1} / {totalPages || 1}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="cursor-pointer"><ChevronLeft className="w-4 h-4" /></Button>
              <Button size="sm" variant="outline" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="cursor-pointer"><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

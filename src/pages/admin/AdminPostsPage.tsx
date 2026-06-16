'use client'
import { useState } from 'react'
import {
  useAdminPosts, useFeaturePost, usePinPost, usePublishPost, useArchivePost, useDeletePost,
} from '@/hooks/queries/admin-posts'
import {
  Search,
  Star,
  Pin,
  Eye,
  FileText,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Archive,
  Trash2,
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { type PostResponse } from '@/lib/api/posts'
import { formatRelativeTime } from '@/lib/utils'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/use-debounce'
import { Link } from 'react-router-dom'
import { useLookups } from '@/hooks/use-lookups'
import { StatusPill } from '@/layouts/AdminLayout'

type ConfirmType = 'publish' | 'archive' | 'delete'
type ConfirmTarget = { type: ConfirmType; post: PostResponse }

const CONFIRM_COPY: Record<
  ConfirmType,
  { title: string; description: (title: string) => string; cta: string; tone: 'brand' | 'hard' }
> = {
  publish: {
    title: 'Duyệt và publish bài viết',
    description: title => `Publish bài viết "${title}"? Người dùng sẽ thấy được bài này.`,
    cta: 'Publish',
    tone: 'brand',
  },
  archive: {
    title: 'Lưu trữ bài viết',
    description: title =>
      `Lưu trữ bài viết "${title}"? Bài sẽ bị ẩn khỏi trang cộng đồng nhưng vẫn giữ trong DB.`,
    cta: 'Lưu trữ',
    tone: 'hard',
  },
  delete: {
    title: 'Xoá bài viết',
    description: title =>
      `Xoá bài viết "${title}"? Hành động không thể hoàn tác.`,
    cta: 'Xoá',
    tone: 'hard',
  },
}

export default function AdminPostsPage() {
  const { getOptions, getLabel } = useLookups()
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const debouncedSearch = useDebounce(search, 400)

  const { data, isLoading } = useAdminPosts({ page, search: debouncedSearch, status: statusFilter })

  const featureMutation = useFeaturePost({
    onSuccess: () => { toast.success('Đã cập nhật') },
  })
  const pinMutation = usePinPost({
    onSuccess: () => { toast.success('Đã cập nhật') },
  })
  const publishMutation = usePublishPost({
    onSuccess: () => { toast.success('Đã publish bài viết'); setConfirm(null) },
    onError: () => toast.error('Không thể publish'),
  })
  const archiveMutation = useArchivePost({
    onSuccess: () => { toast.success('Đã lưu trữ'); setConfirm(null) },
    onError: () => toast.error('Không thể lưu trữ'),
  })
  const deleteMutation = useDeletePost({
    onSuccess: () => { toast.success('Đã xoá'); setConfirm(null) },
    onError: () => toast.error('Không thể xoá'),
  })

  const [confirm, setConfirm] = useState<ConfirmTarget | null>(null)
  const isMutating = publishMutation.isPending || archiveMutation.isPending || deleteMutation.isPending

  function runConfirm() {
    if (!confirm) return
    const id = confirm.post.id
    if (confirm.type === 'publish') publishMutation.mutate(id)
    else if (confirm.type === 'archive') archiveMutation.mutate(id)
    else deleteMutation.mutate(id)
  }

  const posts = data?.content ?? []
  const totalPages = data?.totalPages ?? 0
  const total = data?.totalElements ?? 0

  return (
    <div className="col" style={{ gap: 20 }}>
      {/* Header */}
      <div className="row enter" style={{ alignItems: 'flex-start', gap: 12 }}>
        <div>
          <span className="eyebrow">Quản trị</span>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-ink)', marginTop: 6 }}>
            <span className="row" style={{ alignItems: 'center', gap: 8 }}>
              <FileText size={22} style={{ color: 'var(--color-accent)' }} />
              Quản lý bài viết
            </span>
          </h1>
          <p style={{ color: 'var(--color-ink-faint)', fontSize: 13.5, marginTop: 4 }}>{total} bài viết</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface rounded-[var(--radius-card)] border border-line enter enter-1" style={{ padding: '14px 16px' }}>
        <div className="row" style={{ gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="row" style={{ alignItems: 'center', gap: 8, flex: 1, minWidth: 180, background: 'var(--color-surface-muted)', borderRadius: 'var(--radius-inner)', padding: '7px 12px', border: '1px solid var(--color-line)' }}>
            <Search size={14} style={{ color: 'var(--color-ink-faint)', flexShrink: 0 }} />
            <input
              placeholder="Tìm bài viết..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, color: 'var(--color-ink)', width: '100%', fontFamily: 'var(--font-sans)' }}
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? '')}>
            <SelectTrigger className="w-full sm:w-40 cursor-pointer"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tất cả</SelectItem>
              {getOptions('constants.postStatuses').map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{getLabel('constants.postStatuses', opt.value)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-[var(--radius-card)] border border-line enter enter-2" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: 13.5, borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Bài viết', 'Tác giả', 'Trạng thái', 'Ngày đăng', 'Thao tác'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--color-ink-faint)', background: 'var(--color-surface-muted)', borderBottom: '1px solid var(--color-line)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(6).fill(0).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--color-line)' }}>
                    {[1,2,3,4,5].map(j => <td key={j} style={{ padding: '12px 14px' }}><div style={{ height: 14, background: 'var(--color-surface-hover)', borderRadius: 6 }} /></td>)}
                  </tr>
                ))
              ) : posts.map((post: PostResponse) => (
                <PostRow
                  key={post.id}
                  post={post}
                  onFeature={() => featureMutation.mutate({ id: post.id, featured: !post.featured })}
                  onPin={() => pinMutation.mutate({ id: post.id, pinned: !post.pinned })}
                  onPublish={() => setConfirm({ type: 'publish', post })}
                  onArchive={() => setConfirm({ type: 'archive', post })}
                  onDelete={() => setConfirm({ type: 'delete', post })}
                />
              ))}
            </tbody>
          </table>
        </div>
        <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderTop: '1px solid var(--color-line)' }}>
          <p style={{ fontSize: 13, color: 'var(--color-ink-faint)' }}>Trang {page + 1} / {totalPages || 1}</p>
          <div className="row" style={{ gap: 8 }}>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}><ChevronLeft size={15} /></Button>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}><ChevronRight size={15} /></Button>
          </div>
        </div>
      </div>

      {/* Confirm dialog */}
      <Dialog open={!!confirm} onOpenChange={() => setConfirm(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{confirm ? CONFIRM_COPY[confirm.type].title : ''}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            {confirm ? CONFIRM_COPY[confirm.type].description(confirm.post.title) : ''}
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirm(null)} className="cursor-pointer">
              Hủy
            </Button>
            <Button
              className={
                confirm && CONFIRM_COPY[confirm.type].tone === 'hard'
                  ? 'bg-red-600 hover:bg-red-700 text-white cursor-pointer'
                  : 'bg-accent hover:bg-zinc-800 text-white cursor-pointer'
              }
              disabled={isMutating}
              onClick={runConfirm}
            >
              {isMutating ? 'Đang xử lý...' : confirm ? CONFIRM_COPY[confirm.type].cta : ''}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PostRow({ post, onFeature, onPin, onPublish, onArchive, onDelete }: {
  post: PostResponse
  onFeature: () => void
  onPin: () => void
  onPublish: () => void
  onArchive: () => void
  onDelete: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const canPublish = post.status !== 'PUBLISHED' && post.status !== 'ARCHIVED'
  const canArchive = post.status === 'PUBLISHED'

  return (
    <tr
      style={{ borderBottom: '1px solid var(--color-line)', background: hovered ? 'var(--color-surface-muted)' : 'transparent', transition: 'background .12s' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td style={{ padding: '10px 14px', maxWidth: 280 }}>
        <div className="row" style={{ alignItems: 'center', gap: 6 }}>
          {post.pinned && <Pin size={13} style={{ color: 'var(--color-ink-soft)', flexShrink: 0 }} />}
          {post.featured && <Star size={13} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />}
          <p style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--color-ink)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</p>
        </div>
      </td>
      <td style={{ padding: '10px 14px' }}>
        <span className="codechip" style={{ fontSize: 11 }}>#{post.authorId}</span>
      </td>
      <td style={{ padding: '10px 14px' }}>
        <StatusPill status={post.status} />
      </td>
      <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--color-ink-faint)' }}>{formatRelativeTime(post.publishedAt)}</td>
      <td style={{ padding: '10px 14px' }}>
        <div className="row" style={{ alignItems: 'center', gap: 4 }}>
          <Link to={`/blog/${post.slug}`} target="_blank">
            <button className="iconbtn" style={{ width: 30, height: 30 }} title="Xem bài viết">
              <Eye size={14} />
            </button>
          </Link>
          <button
            onClick={onFeature}
            className="iconbtn"
            style={{ width: 30, height: 30, color: post.featured ? 'var(--color-accent)' : 'var(--color-ink-faint)' }}
            title={post.featured ? 'Bỏ nổi bật' : 'Đánh dấu nổi bật'}
          >
            <Star size={14} />
          </button>
          <button
            onClick={onPin}
            className="iconbtn"
            style={{ width: 30, height: 30, color: post.pinned ? 'var(--color-ink-soft)' : 'var(--color-ink-faint)' }}
            title={post.pinned ? 'Bỏ ghim' : 'Ghim bài viết'}
          >
            <Pin size={14} />
          </button>
          {canPublish && (
            <button
              onClick={onPublish}
              className="iconbtn"
              style={{ width: 30, height: 30, color: 'var(--color-accent)' }}
              title="Duyệt & publish"
            >
              <CheckCircle2 size={14} />
            </button>
          )}
          {canArchive && (
            <button
              onClick={onArchive}
              className="iconbtn"
              style={{ width: 30, height: 30, color: 'var(--color-ink-faint)' }}
              title="Lưu trữ"
            >
              <Archive size={14} />
            </button>
          )}
          <button
            onClick={onDelete}
            className="iconbtn"
            style={{ width: 30, height: 30, color: '#ef4444' }}
            title="Xoá"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}

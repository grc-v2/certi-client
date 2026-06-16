'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  useAdminUsers, useActivateUser, useDeactivateUser, useDeleteUser,
  useUpdateUser, useBulkActivateUsers, useBulkDeactivateUsers,
} from '@/hooks/queries/admin-users'
import { Search, UserCheck, UserX, Trash2, Eye, Users, ChevronLeft, ChevronRight, Shield, ArrowUpDown, LogOut, Edit2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { adminApi, type UserSummaryResponse, type UserDetailResponse } from '@/lib/api/admin'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/use-debounce'
import { StatusPill, RolePill } from '@/layouts/AdminLayout'

export default function AdminUsersPage() {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [sortBy, setSortBy] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [detailUser, setDetailUser] = useState<UserDetailResponse | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ type: 'delete' | 'deactivate' | 'activate'; id: string; name: string } | null>(null)
  const [editUser, setEditUser] = useState<UserDetailResponse | null>(null)
  const [editForm, setEditForm] = useState({ fullName: '', bio: '' })
  const debouncedSearch = useDebounce(search, 400)

  const { data, isLoading } = useAdminUsers({
    page, search: debouncedSearch, status: statusFilter, role: roleFilter, sortBy,
  })

  const activateMutation = useActivateUser({
    onSuccess: () => { toast.success('Đã kích hoạt người dùng'); setConfirmAction(null) },
  })
  const deactivateMutation = useDeactivateUser({
    onSuccess: () => { toast.success('Đã vô hiệu hóa'); setConfirmAction(null) },
  })
  const deleteMutation = useDeleteUser({
    onSuccess: () => { toast.success('Đã xóa người dùng'); setConfirmAction(null) },
  })
  const updateMutation = useUpdateUser({
    onSuccess: () => { toast.success('Đã cập nhật'); setEditUser(null) },
    onError: () => toast.error('Không thể cập nhật'),
  })
  const bulkActivateMutation = useBulkActivateUsers({
    onSuccess: () => { toast.success(`Đã kích hoạt ${selectedIds.length} người dùng`); setSelectedIds([]) },
  })
  const bulkDeactivateMutation = useBulkDeactivateUsers({
    onSuccess: () => { toast.success(`Đã vô hiệu hóa ${selectedIds.length} người dùng`); setSelectedIds([]) },
  })

  const users = data?.content ?? []
  const totalPages = data?.totalPages ?? 0
  const total = data?.totalElements ?? 0

  const toggleSelect = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleAll = () => setSelectedIds(selectedIds.length === users.length ? [] : users.map((u: UserSummaryResponse) => u.id))

  return (
    <div className="col" style={{ gap: 20 }}>
      {/* Header */}
      <div className="row enter" style={{ alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <span className="eyebrow">Quản trị</span>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-ink)', marginTop: 6 }}>
            <span className="row" style={{ alignItems: 'center', gap: 8 }}>
              <Users size={22} style={{ color: 'var(--color-accent)' }} />
              Quản lý người dùng
            </span>
          </h1>
          <p style={{ color: 'var(--color-ink-faint)', fontSize: 13.5, marginTop: 4 }}>{total} người dùng</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card enter enter-1" style={{ padding: '14px 16px' }}>
        <div className="row" style={{ gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div className="row" style={{ alignItems: 'center', gap: 8, flex: 1, minWidth: 180, background: 'var(--color-surface-muted)', borderRadius: 'var(--radius-inner)', padding: '7px 12px', border: '1px solid var(--color-line)' }}>
            <Search size={14} style={{ color: 'var(--color-ink-faint)', flexShrink: 0 }} />
            <input
              placeholder="Tìm theo tên, email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, color: 'var(--color-ink)', width: '100%', fontFamily: 'var(--font-sans)' }}
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? '')}>
            <SelectTrigger className="w-full sm:w-36 cursor-pointer"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tất cả</SelectItem>
              <SelectItem value="ACTIVE">Hoạt động</SelectItem>
              <SelectItem value="INACTIVE">Vô hiệu</SelectItem>
            </SelectContent>
          </Select>
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v ?? '')}>
            <SelectTrigger className="w-full sm:w-32 cursor-pointer">
              <Shield className="w-3.5 h-3.5 mr-1.5 text-zinc-400" />
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tất cả</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="USER">User</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v ?? '')}>
            <SelectTrigger className="w-full sm:w-40 cursor-pointer">
              <ArrowUpDown className="w-3.5 h-3.5 mr-1.5 text-zinc-400" />
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Mặc định</SelectItem>
              <SelectItem value="fullName,asc">Tên A-Z</SelectItem>
              <SelectItem value="fullName,desc">Tên Z-A</SelectItem>
              <SelectItem value="registrationDate,desc">Mới nhất</SelectItem>
              <SelectItem value="registrationDate,asc">Cũ nhất</SelectItem>
            </SelectContent>
          </Select>
          {selectedIds.length > 0 && (
            <div className="row" style={{ gap: 8 }}>
              <button
                className="btn3d sm"
                onClick={() => bulkActivateMutation.mutate(selectedIds)}
                disabled={bulkActivateMutation.isPending}
              >
                <UserCheck size={13} />Kích hoạt ({selectedIds.length})
              </button>
              <button
                className="btn3d ghost sm"
                onClick={() => bulkDeactivateMutation.mutate(selectedIds)}
                disabled={bulkDeactivateMutation.isPending}
                style={{ color: '#dc2626' }}
              >
                <UserX size={13} />Vô hiệu ({selectedIds.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card enter enter-2" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: 13.5, borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '10px 14px', textAlign: 'left', width: 40, background: 'var(--color-surface-muted)', borderBottom: '1px solid var(--color-line)' }}>
                  <Checkbox
                    checked={selectedIds.length === users.length && users.length > 0}
                    onCheckedChange={toggleAll}
                    className="cursor-pointer"
                  />
                </th>
                {['Người dùng', 'Role', 'Ngày đăng ký', 'Trạng thái', 'Thao tác'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--color-ink-faint)', background: 'var(--color-surface-muted)', borderBottom: '1px solid var(--color-line)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--color-line)' }}>
                    {[1,2,3,4,5,6].map(j => (
                      <td key={j} style={{ padding: '12px 14px' }}>
                        <div style={{ height: 14, background: 'var(--color-surface-hover)', borderRadius: 6 }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.map((user: UserSummaryResponse) => (
                <UserRow
                  key={user.id}
                  user={user}
                  selected={selectedIds.includes(user.id)}
                  onToggle={() => toggleSelect(user.id)}
                  onView={async () => { const d = await adminApi.getUserById(user.id); setDetailUser(d) }}
                  onDeactivate={() => setConfirmAction({ type: 'deactivate', id: user.id, name: user.fullName })}
                  onActivate={() => setConfirmAction({ type: 'activate', id: user.id, name: user.fullName })}
                  onDelete={() => setConfirmAction({ type: 'delete', id: user.id, name: user.fullName })}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderTop: '1px solid var(--color-line)' }}>
          <p style={{ fontSize: 13, color: 'var(--color-ink-faint)' }}>Trang {page + 1} / {totalPages || 1}</p>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn3d ghost sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>
              <ChevronLeft size={15} />
            </button>
            <button className="btn3d ghost sm" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!detailUser} onOpenChange={() => setDetailUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Chi tiết người dùng</DialogTitle></DialogHeader>
          {detailUser && (
            <Tabs defaultValue="info">
              <TabsList className="w-full">
                <TabsTrigger value="info" className="flex-1 cursor-pointer">Thông tin</TabsTrigger>
                <TabsTrigger value="sessions" className="flex-1 cursor-pointer">Phiên đăng nhập</TabsTrigger>
              </TabsList>
              <TabsContent value="info" className="space-y-4 mt-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={detailUser.avatarUrl ?? undefined} />
                    <AvatarFallback className="bg-accent text-white">{detailUser.fullName?.slice(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-white">{detailUser.fullName}</p>
                    <p className="text-sm text-zinc-500">{detailUser.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2"><span className="text-zinc-500">Role:</span> <RolePill role={detailUser.roleCode} /></div>
                  <div className="flex items-center gap-2"><span className="text-zinc-500">Trạng thái:</span> <StatusPill status={detailUser.status} /></div>
                  <div><span className="text-zinc-500">Bài viết:</span> <span className="font-medium">{detailUser.postCount}</span></div>
                  <div><span className="text-zinc-500">Chứng chỉ:</span> <span className="font-medium">{detailUser.certificationCount}</span></div>
                </div>
                {detailUser.bio && <div><p className="text-sm text-zinc-500 font-medium">Giới thiệu:</p><p className="text-sm mt-0.5">{detailUser.bio}</p></div>}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="cursor-pointer" onClick={() => {
                    setEditUser(detailUser)
                    setEditForm({ fullName: detailUser.fullName, bio: detailUser.bio ?? '' })
                    setDetailUser(null)
                  }}>
                    <Edit2 className="w-3.5 h-3.5 mr-1.5" />Chỉnh sửa
                  </Button>
                  <Button size="sm" onClick={() => { adminApi.forceLogoutAllSessions(detailUser.id); toast.success('Đã đăng xuất tất cả phiên') }} variant="outline" className="cursor-pointer text-red-600 border-red-300">
                    <LogOut className="w-3.5 h-3.5 mr-1.5" />Đăng xuất tất cả
                  </Button>
                </div>
              </TabsContent>
              <TabsContent value="sessions" className="mt-4">
                <SessionsList userId={detailUser.id} />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit user dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Chỉnh sửa người dùng</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <Label htmlFor="edit-name">Tên</Label>
              <Input id="edit-name" value={editForm.fullName} onChange={e => setEditForm(f => ({ ...f, fullName: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="edit-bio">Giới thiệu</Label>
              <Input id="edit-bio" value={editForm.bio} onChange={e => setEditForm(f => ({ ...f, bio: e.target.value }))} />
            </div>
            <Button
              className="w-full bg-accent hover:bg-zinc-800 text-white cursor-pointer"
              disabled={updateMutation.isPending}
              onClick={() => editUser && updateMutation.mutate({ id: editUser.id, data: editForm })}
            >
              {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog */}
      <Dialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {confirmAction?.type === 'delete' ? 'Xóa người dùng' :
               confirmAction?.type === 'deactivate' ? 'Vô hiệu hóa người dùng' : 'Kích hoạt người dùng'}
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            {confirmAction?.type === 'delete'
              ? `Bạn có chắc chắn muốn xóa người dùng "${confirmAction?.name}"? Hành động này không thể hoàn tác.`
              : confirmAction?.type === 'deactivate'
              ? `Vô hiệu hóa người dùng "${confirmAction?.name}"?`
              : `Kích hoạt lại người dùng "${confirmAction?.name}"?`}
          </p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmAction(null)} className="cursor-pointer">Hủy</Button>
            <Button
              className={`cursor-pointer ${confirmAction?.type === 'activate' ? 'bg-[#22C55E] hover:bg-[#16A34A] text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
              disabled={deleteMutation.isPending || deactivateMutation.isPending || activateMutation.isPending}
              onClick={() => {
                if (!confirmAction) return
                if (confirmAction.type === 'delete') deleteMutation.mutate(confirmAction.id)
                else if (confirmAction.type === 'deactivate') deactivateMutation.mutate(confirmAction.id)
                else activateMutation.mutate(confirmAction.id)
              }}
            >
              {confirmAction?.type === 'delete' ? 'Xóa' : confirmAction?.type === 'deactivate' ? 'Vô hiệu hóa' : 'Kích hoạt'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function UserRow({ user, selected, onToggle, onView, onDeactivate, onActivate, onDelete }: {
  user: UserSummaryResponse
  selected: boolean
  onToggle: () => void
  onView: () => void
  onDeactivate: () => void
  onActivate: () => void
  onDelete: () => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <tr
      style={{ borderBottom: '1px solid var(--color-line)', background: hovered ? 'var(--color-surface-muted)' : 'transparent', transition: 'background .12s' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td style={{ padding: '10px 14px' }}>
        <Checkbox checked={selected} onCheckedChange={onToggle} className="cursor-pointer" />
      </td>
      <td style={{ padding: '10px 14px' }}>
        <div className="row" style={{ alignItems: 'center', gap: 10 }}>
          <div
            className="itile"
            style={{ width: 32, height: 32, background: 'var(--color-accent-soft)', color: 'var(--color-accent)', fontWeight: 700, fontSize: 11, flexShrink: 0, fontFamily: 'var(--font-mono)' }}
          >
            {user.fullName?.slice(0,2).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--color-ink)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.fullName}</p>
            <p style={{ fontSize: 11.5, color: 'var(--color-ink-faint)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
          </div>
        </div>
      </td>
      <td style={{ padding: '10px 14px' }}>
        <RolePill role={user.roleCode} />
      </td>
      <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--color-ink-faint)' }}>
        {formatDate(user.registrationDate)}
      </td>
      <td style={{ padding: '10px 14px' }}>
        <StatusPill status={user.status} />
      </td>
      <td style={{ padding: '10px 14px' }}>
        <div className="row" style={{ alignItems: 'center', gap: 4 }}>
          <button onClick={onView} className="iconbtn" style={{ width: 30, height: 30 }} title="Xem chi tiết">
            <Eye size={14} />
          </button>
          {user.status === 'ACTIVE' ? (
            <button onClick={onDeactivate} className="iconbtn" style={{ width: 30, height: 30, color: '#dc2626' }} title="Vô hiệu hóa">
              <UserX size={14} />
            </button>
          ) : (
            <button onClick={onActivate} className="iconbtn" style={{ width: 30, height: 30, color: 'var(--color-accent)' }} title="Kích hoạt">
              <UserCheck size={14} />
            </button>
          )}
          <button onClick={onDelete} className="iconbtn" style={{ width: 30, height: 30, color: '#dc2626' }} title="Xóa">
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}

function SessionsList({ userId }: { userId: string }) {
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['admin-user-sessions', userId],
    queryFn: () => adminApi.getActiveSessions(userId),
  })

  const sessionList = sessions ?? []

  if (isLoading) return <div className="space-y-2">{Array(3).fill(0).map((_, i) => <div key={i} className="h-10 bg-zinc-200 dark:bg-zinc-700 rounded animate-pulse" />)}</div>

  if (sessionList.length === 0) return <p className="text-center py-6 text-zinc-500 text-sm">Không có phiên hoạt động</p>

  return (
    <div className="space-y-2">
      {sessionList.map((s) => {
        const sessionId = s.sessionId ?? s.id
        return (
          <div key={sessionId} className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 text-sm">
            <div className="min-w-0 flex-1">
              <p className="text-zinc-700 dark:text-zinc-300 truncate text-xs">{s.userAgent ?? 'Unknown device'}</p>
              <p className="text-zinc-400 text-xs mt-0.5">{s.ipAddress} - {formatDate(s.createdAt)}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer text-red-600 border-red-300 flex-shrink-0 ml-2"
              onClick={() => {
                adminApi.forceLogoutSession(userId, sessionId)
                toast.success('Đã đăng xuất phiên')
              }}
            >
              <LogOut className="w-3 h-3" />
            </Button>
          </div>
        )
      })}
    </div>
  )
}

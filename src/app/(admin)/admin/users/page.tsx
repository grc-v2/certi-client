'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, UserCheck, UserX, Trash2, Eye, Users, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { adminApi, type UserSummaryResponse, type UserDetailResponse } from '@/lib/api/admin'
import { formatDate, cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/use-debounce'

export default function AdminUsersPage() {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [detailUser, setDetailUser] = useState<UserDetailResponse | null>(null)
  const debouncedSearch = useDebounce(search, 400)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, debouncedSearch, statusFilter],
    queryFn: () => adminApi.listUsers({ search: debouncedSearch || undefined, status: statusFilter || undefined, page, size: 15 }),
  })

  const activateMutation = useMutation({
    mutationFn: (id: string) => adminApi.activateUser(id),
    onSuccess: () => { toast.success('Đã kích hoạt người dùng'); queryClient.invalidateQueries({ queryKey: ['admin-users'] }) },
  })
  const deactivateMutation = useMutation({
    mutationFn: (id: string) => adminApi.deactivateUser(id),
    onSuccess: () => { toast.success('Đã vô hiệu hóa'); queryClient.invalidateQueries({ queryKey: ['admin-users'] }) },
  })
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => { toast.success('Đã xóa người dùng'); queryClient.invalidateQueries({ queryKey: ['admin-users'] }) },
  })
  const bulkActivateMutation = useMutation({
    mutationFn: () => adminApi.bulkActivate(selectedIds),
    onSuccess: () => { toast.success(`Đã kích hoạt ${selectedIds.length} người dùng`); setSelectedIds([]); queryClient.invalidateQueries({ queryKey: ['admin-users'] }) },
  })
  const bulkDeactivateMutation = useMutation({
    mutationFn: () => adminApi.bulkDeactivate(selectedIds),
    onSuccess: () => { toast.success(`Đã vô hiệu hóa ${selectedIds.length} người dùng`); setSelectedIds([]); queryClient.invalidateQueries({ queryKey: ['admin-users'] }) },
  })

  const users = data?.content ?? []
  const totalPages = data?.totalPages ?? 0
  const total = data?.totalElements ?? 0

  const toggleSelect = (id: string) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleAll = () => setSelectedIds(selectedIds.length === users.length ? [] : users.map(u => u.id))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-[#0A66C2]" />Quản lý người dùng
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{total} người dùng</p>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardContent className="p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Tìm theo tên, email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? '')}>
            <SelectTrigger className="w-full sm:w-36 cursor-pointer"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tất cả</SelectItem>
              <SelectItem value="ACTIVE">Hoạt động</SelectItem>
              <SelectItem value="INACTIVE">Vô hiệu</SelectItem>
            </SelectContent>
          </Select>
          {selectedIds.length > 0 && (
            <div className="flex gap-2">
              <Button size="sm" onClick={() => bulkActivateMutation.mutate()} disabled={bulkActivateMutation.isPending} className="bg-[#22C55E] hover:bg-[#16A34A] text-white cursor-pointer">
                <UserCheck className="w-3.5 h-3.5 mr-1.5" />Kích hoạt ({selectedIds.length})
              </Button>
              <Button size="sm" variant="outline" onClick={() => bulkDeactivateMutation.mutate()} disabled={bulkDeactivateMutation.isPending} className="cursor-pointer text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-950/20">
                <UserX className="w-3.5 h-3.5 mr-1.5" />Vô hiệu ({selectedIds.length})
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="p-3 text-left w-10">
                    <Checkbox
                      checked={selectedIds.length === users.length && users.length > 0}
                      onCheckedChange={toggleAll}
                      className="cursor-pointer"
                    />
                  </th>
                  <th className="p-3 text-left font-medium text-slate-500 dark:text-slate-400">Người dùng</th>
                  <th className="p-3 text-left font-medium text-slate-500 dark:text-slate-400 hidden sm:table-cell">Role</th>
                  <th className="p-3 text-left font-medium text-slate-500 dark:text-slate-400 hidden md:table-cell">Ngày đăng ký</th>
                  <th className="p-3 text-left font-medium text-slate-500 dark:text-slate-400">Trạng thái</th>
                  <th className="p-3 text-left font-medium text-slate-500 dark:text-slate-400">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array(8).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50">
                      {[1,2,3,4,5,6].map(j => (
                        <td key={j} className="p-3">
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : users.map(user => (
                  <tr key={user.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3">
                      <Checkbox checked={selectedIds.includes(user.id)} onCheckedChange={() => toggleSelect(user.id)} className="cursor-pointer" />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className="text-xs bg-[#0A66C2]/10 text-[#0A66C2]">{user.fullName?.slice(0,2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white truncate">{user.fullName}</p>
                          <p className="text-xs text-slate-400 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 hidden sm:table-cell">
                      <Badge variant="secondary" className="text-xs">{user.roleCode}</Badge>
                    </td>
                    <td className="p-3 text-slate-500 hidden md:table-cell text-xs">{formatDate(user.registrationDate)}</td>
                    <td className="p-3">
                      <Badge className={cn('text-xs', user.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400')}>
                        {user.status === 'ACTIVE' ? 'Hoạt động' : 'Vô hiệu'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={async () => { const d = await adminApi.getUserById(user.id); setDetailUser(d) }}
                          className="p-1.5 text-slate-400 hover:text-[#0A66C2] cursor-pointer transition-colors rounded hover:bg-[#0A66C2]/10"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {user.status === 'ACTIVE' ? (
                          <button
                            onClick={() => deactivateMutation.mutate(user.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 cursor-pointer transition-colors rounded hover:bg-red-50 dark:hover:bg-red-950/20"
                            title="Vô hiệu hóa"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => activateMutation.mutate(user.id)}
                            className="p-1.5 text-slate-400 hover:text-[#22C55E] cursor-pointer transition-colors rounded hover:bg-green-50 dark:hover:bg-green-950/20"
                            title="Kích hoạt"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => { if (confirm('Xóa người dùng này?')) deleteMutation.mutate(user.id) }}
                          className="p-1.5 text-slate-400 hover:text-red-500 cursor-pointer transition-colors rounded hover:bg-red-50 dark:hover:bg-red-950/20"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500">Trang {page + 1} / {totalPages || 1}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="cursor-pointer">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog open={!!detailUser} onOpenChange={() => setDetailUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Chi tiết người dùng</DialogTitle></DialogHeader>
          {detailUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={detailUser.avatarUrl ?? undefined} />
                  <AvatarFallback className="bg-[#0A66C2] text-white">{detailUser.fullName?.slice(0,2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">{detailUser.fullName}</p>
                  <p className="text-sm text-slate-500">{detailUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-slate-500">Role:</span> <Badge variant="secondary">{detailUser.roleCode}</Badge></div>
                <div><span className="text-slate-500">Trạng thái:</span> <Badge className={cn(detailUser.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>{detailUser.status}</Badge></div>
                <div><span className="text-slate-500">Bài viết:</span> <span className="font-medium">{detailUser.postCount}</span></div>
                <div><span className="text-slate-500">Chứng chỉ:</span> <span className="font-medium">{detailUser.certificationCount}</span></div>
              </div>
              {detailUser.bio && <div><p className="text-sm text-slate-500 font-medium">Giới thiệu:</p><p className="text-sm mt-0.5">{detailUser.bio}</p></div>}
              <div className="flex gap-2 pt-2">
                <Button size="sm" onClick={() => { adminApi.forceLogoutAllSessions(detailUser.id); toast.success('Đã đăng xuất tất cả phiên') }} variant="outline" className="cursor-pointer text-red-600 border-red-300">
                  Đăng xuất tất cả phiên
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

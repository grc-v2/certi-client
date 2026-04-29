'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Plus, Trash2, GraduationCap, ChevronLeft, ChevronRight, Power, Eye, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { certificationsApi, type CertificationResponse } from '@/lib/api/certifications'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useForm, Controller } from 'react-hook-form'
import { useDebounce } from '@/hooks/use-debounce'
import Link from 'next/link'

type CertForm = {
  name: string; provider: string; level: string; description: string
  passingScore: number; totalQuestions: number; durationMinutes: number; price: number
}

export default function AdminCertificationsPage() {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCert, setEditingCert] = useState<CertificationResponse | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<CertificationResponse | null>(null)
  const debouncedSearch = useDebounce(search, 400)
  const queryClient = useQueryClient()

  const form = useForm<CertForm>({
    defaultValues: { name: '', provider: '', level: '', description: '', passingScore: 70, totalQuestions: 65, durationMinutes: 130, price: 0 },
  })

  const { data, isLoading } = useQuery({
    queryKey: ['admin-certifications', page, debouncedSearch],
    queryFn: () => certificationsApi.search({ keyword: debouncedSearch || undefined, page, size: 15 }),
  })

  const createMutation = useMutation({
    mutationFn: (data: CertForm) => certificationsApi.create(data),
    onSuccess: () => { toast.success('Đã tạo chứng chỉ'); closeDialog(); queryClient.invalidateQueries({ queryKey: ['admin-certifications'] }) },
    onError: () => toast.error('Không thể tạo chứng chỉ'),
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: CertForm }) => certificationsApi.update(id, data),
    onSuccess: () => { toast.success('Đã cập nhật'); closeDialog(); queryClient.invalidateQueries({ queryKey: ['admin-certifications'] }) },
    onError: () => toast.error('Không thể cập nhật'),
  })
  const deleteMutation = useMutation({
    mutationFn: (id: number) => certificationsApi.delete(id),
    onSuccess: () => { toast.success('Đã xóa'); setConfirmDelete(null); queryClient.invalidateQueries({ queryKey: ['admin-certifications'] }) },
  })
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => certificationsApi.updateStatus(id, status),
    onSuccess: () => { toast.success('Đã cập nhật trạng thái'); queryClient.invalidateQueries({ queryKey: ['admin-certifications'] }) },
  })

  const certs = data?.content ?? []
  const totalPages = data?.totalPages ?? 0
  const total = data?.totalElements ?? 0

  const STATUS_COLORS: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400',
    INACTIVE: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    DRAFT: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400',
  }

  function openCreate() {
    setEditingCert(null)
    form.reset({ name: '', provider: '', level: '', description: '', passingScore: 70, totalQuestions: 65, durationMinutes: 130, price: 0 })
    setDialogOpen(true)
  }

  function openEdit(cert: CertificationResponse) {
    setEditingCert(cert)
    form.reset({
      name: cert.name, provider: cert.provider, level: cert.level,
      description: cert.description ?? '', passingScore: cert.passingScore ?? 70,
      totalQuestions: cert.totalQuestions ?? 65, durationMinutes: cert.durationMinutes ?? 130,
      price: cert.price ?? 0,
    })
    setDialogOpen(true)
  }

  function closeDialog() {
    setDialogOpen(false)
    setEditingCert(null)
    form.reset()
  }

  function onSubmit(data: CertForm) {
    if (editingCert) updateMutation.mutate({ id: editingCert.id, data })
    else createMutation.mutate(data)
  }

  const nextStatus = (s: string) => {
    if (s === 'DRAFT') return 'ACTIVE'
    if (s === 'ACTIVE') return 'INACTIVE'
    return 'ACTIVE'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-[#0A66C2]" />Quản lý chứng chỉ
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{total} chứng chỉ</p>
        </div>
        <Button onClick={openCreate} className="bg-[#0A66C2] hover:bg-[#084E96] text-white cursor-pointer">
          <Plus className="w-4 h-4 mr-2" />Thêm chứng chỉ
        </Button>
      </div>

      <Card className="border-slate-200 dark:border-slate-700">
        <CardContent className="p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Tìm chứng chỉ..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 dark:border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="p-3 text-left font-medium text-slate-500">Chứng chỉ</th>
                  <th className="p-3 text-left font-medium text-slate-500 hidden sm:table-cell">Provider</th>
                  <th className="p-3 text-left font-medium text-slate-500 hidden md:table-cell">Cấp độ</th>
                  <th className="p-3 text-left font-medium text-slate-500">Trạng thái</th>
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
                ) : certs.map((cert: CertificationResponse) => (
                  <tr key={cert.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="w-4 h-4 text-[#0A66C2]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white line-clamp-1">{cert.name}</p>
                          <p className="text-xs text-slate-400">{cert.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-slate-500 hidden sm:table-cell text-xs">{cert.provider}</td>
                    <td className="p-3 hidden md:table-cell">
                      <Badge variant="secondary" className="text-xs">{cert.level}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={cn('text-xs', STATUS_COLORS[cert.status] ?? 'bg-slate-100 text-slate-600')}>{cert.status}</Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/certifications/${cert.id}`}>
                          <button className="p-1.5 text-slate-400 hover:text-[#0A66C2] cursor-pointer transition-colors rounded hover:bg-[#0A66C2]/10" title="Chi tiết">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <button onClick={() => openEdit(cert)} className="p-1.5 text-slate-400 hover:text-[#0A66C2] cursor-pointer transition-colors rounded hover:bg-[#0A66C2]/10" title="Sửa">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => statusMutation.mutate({ id: cert.id, status: nextStatus(cert.status) })}
                          className={cn('p-1.5 cursor-pointer transition-colors rounded', cert.status === 'ACTIVE' ? 'text-[#22C55E] hover:bg-green-50' : 'text-slate-400 hover:text-[#22C55E] hover:bg-green-50 dark:hover:bg-green-950/20')}
                          title={`Chuyển sang ${nextStatus(cert.status)}`}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(cert)}
                          className="p-1.5 text-slate-400 hover:text-red-500 cursor-pointer transition-colors rounded hover:bg-red-50 dark:hover:bg-red-950/20"
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
          <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500">Trang {page + 1} / {totalPages || 1}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="cursor-pointer"><ChevronLeft className="w-4 h-4" /></Button>
              <Button size="sm" variant="outline" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="cursor-pointer"><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={() => closeDialog()}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editingCert ? 'Sửa chứng chỉ' : 'Thêm chứng chỉ mới'}</DialogTitle></DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div><Label htmlFor="name">Tên chứng chỉ *</Label><Input id="name" {...form.register('name', { required: true })} placeholder="AWS Certified Solutions Architect" /></div>
            <div><Label htmlFor="provider">Nhà cung cấp *</Label><Input id="provider" {...form.register('provider', { required: true })} placeholder="Amazon Web Services" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cấp độ</Label>
                <Controller name="level" control={form.control} render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="cursor-pointer"><SelectValue placeholder="Chọn cấp độ" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BEGINNER">Beginner</SelectItem>
                      <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                      <SelectItem value="ADVANCED">Advanced</SelectItem>
                      <SelectItem value="EXPERT">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                )} />
              </div>
              <div><Label htmlFor="passingScore">Điểm đạt (%)</Label><Input id="passingScore" type="number" {...form.register('passingScore', { valueAsNumber: true })} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label htmlFor="totalQuestions">Số câu hỏi</Label><Input id="totalQuestions" type="number" {...form.register('totalQuestions', { valueAsNumber: true })} /></div>
              <div><Label htmlFor="durationMinutes">Thời gian (phút)</Label><Input id="durationMinutes" type="number" {...form.register('durationMinutes', { valueAsNumber: true })} /></div>
              <div><Label htmlFor="price">Giá ($)</Label><Input id="price" type="number" {...form.register('price', { valueAsNumber: true })} /></div>
            </div>
            <div><Label htmlFor="description">Mô tả</Label><Textarea id="description" {...form.register('description')} placeholder="Mô tả về chứng chỉ" rows={3} /></div>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full bg-[#0A66C2] hover:bg-[#084E96] text-white cursor-pointer">
              {(createMutation.isPending || updateMutation.isPending) ? 'Đang lưu...' : editingCert ? 'Cập nhật' : 'Tạo chứng chỉ'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Xóa chứng chỉ</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600 dark:text-slate-300">Bạn có chắc chắn muốn xóa &quot;{confirmDelete?.name}&quot;? Hành động này không thể hoàn tác.</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDelete(null)} className="cursor-pointer">Hủy</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white cursor-pointer" disabled={deleteMutation.isPending} onClick={() => confirmDelete && deleteMutation.mutate(confirmDelete.id)}>
              {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

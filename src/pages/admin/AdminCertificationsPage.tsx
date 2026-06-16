'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Plus, Trash2, GraduationCap, ChevronLeft, ChevronRight, Power, Eye, Edit2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { certificationsApi, type CertificationResponse } from '@/lib/api/certifications'
import { toast } from 'sonner'
import { useForm, Controller } from 'react-hook-form'
import { useDebounce } from '@/hooks/use-debounce'
import { Link } from 'react-router-dom'

type CertForm = {
  name: string; provider: string; level: string; description: string
  passingScore: number; totalQuestions: number; durationMinutes: number; price: number
}

function CertStatusPill({ status }: { status: string }) {
  if (status === 'ACTIVE') return <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700">Active</span>
  if (status === 'DRAFT') return <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700">Draft</span>
  return <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-surface-muted text-ink-soft">Inactive</span>
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
    <div className="col" style={{ gap: 20 }}>
      {/* Header */}
      <div className="row enter" style={{ alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <span className="eyebrow">Quản trị</span>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-ink)', marginTop: 6 }}>
            <span className="row" style={{ alignItems: 'center', gap: 8 }}>
              <GraduationCap size={22} style={{ color: 'var(--color-accent)' }} />
              Quản lý chứng chỉ
            </span>
          </h1>
          <p style={{ color: 'var(--color-ink-faint)', fontSize: 13.5, marginTop: 4 }}>{total} chứng chỉ</p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus size={15} />Thêm chứng chỉ
        </Button>
      </div>

      {/* Filter bar */}
      <div className="bg-surface rounded-[var(--radius-card)] border border-line enter enter-1" style={{ padding: '14px 16px' }}>
        <div className="row" style={{ gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="row" style={{ alignItems: 'center', gap: 8, flex: 1, minWidth: 180, background: 'var(--color-surface-muted)', borderRadius: 'var(--radius-inner)', padding: '7px 12px', border: '1px solid var(--color-line)' }}>
            <Search size={14} style={{ color: 'var(--color-ink-faint)', flexShrink: 0 }} />
            <input
              placeholder="Tìm chứng chỉ..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, color: 'var(--color-ink)', width: '100%', fontFamily: 'var(--font-sans)' }}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-[var(--radius-card)] border border-line enter enter-2" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: 13.5, borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Chứng chỉ', 'Provider', 'Cấp độ', 'Trạng thái', 'Thao tác'].map(h => (
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
              ) : certs.map((cert: CertificationResponse) => (
                <CertRow
                  key={cert.id}
                  cert={cert}
                  onEdit={() => openEdit(cert)}
                  onToggleStatus={() => statusMutation.mutate({ id: cert.id, status: nextStatus(cert.status) })}
                  onDelete={() => setConfirmDelete(cert)}
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
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full bg-accent hover:bg-zinc-800 text-white cursor-pointer">
              {(createMutation.isPending || updateMutation.isPending) ? 'Đang lưu...' : editingCert ? 'Cập nhật' : 'Tạo chứng chỉ'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Xóa chứng chỉ</DialogTitle></DialogHeader>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">Bạn có chắc chắn muốn xóa &quot;{confirmDelete?.name}&quot;? Hành động này không thể hoàn tác.</p>
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

function CertRow({ cert, onEdit, onToggleStatus, onDelete }: {
  cert: CertificationResponse
  onEdit: () => void
  onToggleStatus: () => void
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
        <div className="row" style={{ alignItems: 'center', gap: 10 }}>
          <div className="itile" style={{ width: 34, height: 34, background: 'var(--color-accent-soft)', color: 'var(--color-accent)', flexShrink: 0 }}>
            <GraduationCap size={16} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--color-ink)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cert.name}</p>
            <span className="codechip" style={{ fontSize: 10.5 }}>{cert.code}</span>
          </div>
        </div>
      </td>
      <td style={{ padding: '10px 14px', fontSize: 12.5, color: 'var(--color-ink-soft)' }}>{cert.provider}</td>
      <td style={{ padding: '10px 14px' }}>
        <span className="codechip" style={{ fontSize: 11 }}>{cert.level}</span>
      </td>
      <td style={{ padding: '10px 14px' }}>
        <CertStatusPill status={cert.status} />
      </td>
      <td style={{ padding: '10px 14px' }}>
        <div className="row" style={{ alignItems: 'center', gap: 4 }}>
          <Link to={`/admin/certifications/${cert.id}`}>
            <button className="iconbtn" style={{ width: 30, height: 30 }} title="Chi tiết">
              <Eye size={14} />
            </button>
          </Link>
          <button onClick={onEdit} className="iconbtn" style={{ width: 30, height: 30 }} title="Sửa">
            <Edit2 size={14} />
          </button>
          <button onClick={onToggleStatus} className="iconbtn" style={{ width: 30, height: 30, color: cert.status === 'ACTIVE' ? 'var(--color-accent)' : 'var(--color-ink-faint)' }} title="Đổi trạng thái">
            <Power size={14} />
          </button>
          <button onClick={onDelete} className="iconbtn" style={{ width: 30, height: 30, color: '#ef4444' }} title="Xóa">
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}

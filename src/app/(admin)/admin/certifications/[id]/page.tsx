'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  GraduationCap, ChevronLeft, Plus, Edit2, Trash2, Layers, AlertCircle, BookOpen,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import {
  certificationsApi, type CertificationDetailResponse, type CertificationDomainResponse,
} from '@/lib/api/certifications'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'

type DomainForm = { name: string; code: string; description: string; weightPercentage: number; displayOrder: number }

export default function CertificationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [domainDialogOpen, setDomainDialogOpen] = useState(false)
  const [editingDomain, setEditingDomain] = useState<CertificationDomainResponse | null>(null)
  const [confirmDeleteDomain, setConfirmDeleteDomain] = useState<CertificationDomainResponse | null>(null)

  const form = useForm<DomainForm>({
    defaultValues: { name: '', code: '', description: '', weightPercentage: 10, displayOrder: 1 },
  })

  const { data: cert, isLoading } = useQuery({
    queryKey: ['admin-certification-detail', id],
    queryFn: () => certificationsApi.getById(id),
  })

  const createDomainMutation = useMutation({
    mutationFn: (data: DomainForm) => certificationsApi.createDomain(id, data),
    onSuccess: () => { toast.success('Đã thêm domain'); closeDomainDialog(); queryClient.invalidateQueries({ queryKey: ['admin-certification-detail', id] }) },
    onError: () => toast.error('Không thể thêm domain'),
  })
  const updateDomainMutation = useMutation({
    mutationFn: ({ domainId, data }: { domainId: number; data: DomainForm }) => certificationsApi.updateDomain(domainId, data),
    onSuccess: () => { toast.success('Đã cập nhật domain'); closeDomainDialog(); queryClient.invalidateQueries({ queryKey: ['admin-certification-detail', id] }) },
    onError: () => toast.error('Không thể cập nhật'),
  })
  const deleteDomainMutation = useMutation({
    mutationFn: (domainId: number) => certificationsApi.deleteDomain(domainId),
    onSuccess: () => { toast.success('Đã xóa domain'); setConfirmDeleteDomain(null); queryClient.invalidateQueries({ queryKey: ['admin-certification-detail', id] }) },
  })

  const domains = cert?.domains ?? []
  const totalWeight = domains.reduce((sum, d) => sum + d.weightPercentage, 0)
  const weightValid = totalWeight === 100

  function openCreateDomain() {
    setEditingDomain(null)
    form.reset({ name: '', code: '', description: '', weightPercentage: 10, displayOrder: domains.length + 1 })
    setDomainDialogOpen(true)
  }

  function openEditDomain(domain: CertificationDomainResponse) {
    setEditingDomain(domain)
    form.reset({
      name: domain.name, code: domain.code, description: domain.description ?? '',
      weightPercentage: domain.weightPercentage, displayOrder: domain.displayOrder,
    })
    setDomainDialogOpen(true)
  }

  function closeDomainDialog() {
    setDomainDialogOpen(false)
    setEditingDomain(null)
    form.reset()
  }

  function onSubmitDomain(data: DomainForm) {
    if (editingDomain) updateDomainMutation.mutate({ domainId: editingDomain.id, data })
    else createDomainMutation.mutate(data)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
        <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
      </div>
    )
  }

  if (!cert) return <p className="text-center py-12 text-slate-500">Không tìm thấy chứng chỉ</p>

  const STATUS_COLORS: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400',
    INACTIVE: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    DRAFT: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/certifications">
          <Button variant="outline" size="sm" className="cursor-pointer"><ChevronLeft className="w-4 h-4 mr-1" />Quay lại</Button>
        </Link>
      </div>

      {/* Cert info */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#0A66C2]/10 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-6 h-6 text-[#0A66C2]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{cert.name}</h1>
                <Badge className={cn('text-xs', STATUS_COLORS[cert.status])}>{cert.status}</Badge>
              </div>
              <p className="text-sm text-slate-500 mt-1">{cert.provider} - {cert.code}</p>
              {cert.description && <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">{cert.description}</p>}
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-500">
                {cert.totalQuestions && <span>Câu hỏi: <strong className="text-slate-700 dark:text-slate-300">{cert.totalQuestions}</strong></span>}
                {cert.durationMinutes && <span>Thời gian: <strong className="text-slate-700 dark:text-slate-300">{cert.durationMinutes} phút</strong></span>}
                {cert.passingScore && <span>Điểm đạt: <strong className="text-slate-700 dark:text-slate-300">{cert.passingScore}%</strong></span>}
                {cert.price != null && <span>Giá: <strong className="text-slate-700 dark:text-slate-300">${cert.price}</strong></span>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Domains */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0A66C2]" />Domains ({domains.length})
          </CardTitle>
          <Button size="sm" onClick={openCreateDomain} className="bg-[#0A66C2] hover:bg-[#084E96] text-white cursor-pointer">
            <Plus className="w-3.5 h-3.5 mr-1.5" />Thêm domain
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Weight indicator */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-500">Tổng trọng số</span>
              <span className={cn('font-medium', weightValid ? 'text-green-600' : 'text-red-600')}>{totalWeight}%</span>
            </div>
            <Progress value={totalWeight} className="h-2" />
            {!weightValid && totalWeight > 0 && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />Tổng trọng số phải bằng 100%
              </p>
            )}
          </div>

          {domains.length === 0 ? (
            <p className="text-center py-8 text-slate-500 text-sm">Chưa có domain nào</p>
          ) : (
            <div className="space-y-2">
              {domains.sort((a, b) => a.displayOrder - b.displayOrder).map(domain => (
                <div key={domain.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 group">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 w-6">#{domain.displayOrder}</span>
                      <p className="font-medium text-sm text-slate-900 dark:text-white">{domain.name}</p>
                      <Badge variant="secondary" className="text-xs">{domain.code}</Badge>
                      <Badge variant="secondary" className="text-xs">{domain.weightPercentage}%</Badge>
                    </div>
                    {domain.description && <p className="text-xs text-slate-500 mt-0.5 ml-8">{domain.description}</p>}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditDomain(domain)} className="p-1.5 text-slate-400 hover:text-[#0A66C2] cursor-pointer transition-colors rounded hover:bg-[#0A66C2]/10">
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setConfirmDeleteDomain(domain)} className="p-1.5 text-slate-400 hover:text-red-500 cursor-pointer transition-colors rounded hover:bg-red-50 dark:hover:bg-red-950/20">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exams */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#0A66C2]" />Bài thi ({cert.exams?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {(cert.exams?.length ?? 0) === 0 ? (
            <p className="text-center py-8 text-slate-500 text-sm">Chưa có bài thi nào</p>
          ) : (
            <div className="space-y-2">
              {cert.exams.map(exam => (
                <div key={exam.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm text-slate-900 dark:text-white">{exam.title}</p>
                    <div className="flex gap-3 mt-1 text-xs text-slate-500">
                      <span>{exam.totalQuestions} câu</span>
                      <span>{exam.durationMinutes} phút</span>
                      <span>Đạt: {exam.passingScore}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{exam.type}</Badge>
                    <Badge className={cn('text-xs', exam.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600')}>{exam.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Domain create/edit dialog */}
      <Dialog open={domainDialogOpen} onOpenChange={() => closeDomainDialog()}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editingDomain ? 'Sửa domain' : 'Thêm domain mới'}</DialogTitle></DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmitDomain)} className="space-y-4 pt-2">
            <div><Label htmlFor="d-name">Tên domain *</Label><Input id="d-name" {...form.register('name', { required: true })} placeholder="Cloud Concepts" /></div>
            <div><Label htmlFor="d-code">Mã *</Label><Input id="d-code" {...form.register('code', { required: true })} placeholder="CLF-D1" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label htmlFor="d-weight">Trọng số (%)</Label><Input id="d-weight" type="number" {...form.register('weightPercentage', { valueAsNumber: true })} /></div>
              <div><Label htmlFor="d-order">Thứ tự</Label><Input id="d-order" type="number" {...form.register('displayOrder', { valueAsNumber: true })} /></div>
            </div>
            <div><Label htmlFor="d-desc">Mô tả</Label><Textarea id="d-desc" {...form.register('description')} placeholder="Mô tả domain" rows={2} /></div>
            <Button type="submit" disabled={createDomainMutation.isPending || updateDomainMutation.isPending} className="w-full bg-[#0A66C2] hover:bg-[#084E96] text-white cursor-pointer">
              {(createDomainMutation.isPending || updateDomainMutation.isPending) ? 'Đang lưu...' : editingDomain ? 'Cập nhật' : 'Thêm domain'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete domain confirmation */}
      <Dialog open={!!confirmDeleteDomain} onOpenChange={() => setConfirmDeleteDomain(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Xóa domain</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600 dark:text-slate-300">Xóa domain &quot;{confirmDeleteDomain?.name}&quot;?</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDeleteDomain(null)} className="cursor-pointer">Hủy</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white cursor-pointer" disabled={deleteDomainMutation.isPending} onClick={() => confirmDeleteDomain && deleteDomainMutation.mutate(confirmDeleteDomain.id)}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

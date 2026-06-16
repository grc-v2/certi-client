'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import {
  GraduationCap,
  ChevronLeft,
  Plus,
  Edit2,
  Trash2,
  Layers,
  AlertCircle,
  BookOpen,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  certificationsApi,
  type CertificationDomainResponse,
} from '@/lib/api/certifications'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'

type DomainForm = {
  name: string
  code: string
  description: string
  weightPercentage: number
  displayOrder: number
}

function CertStatusPill({ status }: { status: string }) {
  if (status === 'ACTIVE') return <span className="pill brand">Active</span>
  if (status === 'DRAFT') return <span className="pill gold">Draft</span>
  return (
    <span
      className="pill"
      style={{ background: 'var(--color-surface-hover)', color: 'var(--color-ink-faint)' }}
    >
      {status}
    </span>
  )
}

function ExamStatusPill({ status }: { status: string }) {
  if (status === 'ACTIVE') return <span className="pill brand" style={{ fontSize: 11 }}>Active</span>
  return (
    <span
      className="pill"
      style={{ background: 'var(--color-surface-hover)', color: 'var(--color-ink-faint)', fontSize: 11 }}
    >
      {status}
    </span>
  )
}

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
    onSuccess: () => {
      toast.success('Đã thêm domain')
      closeDomainDialog()
      queryClient.invalidateQueries({ queryKey: ['admin-certification-detail', id] })
    },
    onError: () => toast.error('Không thể thêm domain'),
  })
  const updateDomainMutation = useMutation({
    mutationFn: ({ domainId, data }: { domainId: number; data: DomainForm }) =>
      certificationsApi.updateDomain(domainId, data),
    onSuccess: () => {
      toast.success('Đã cập nhật domain')
      closeDomainDialog()
      queryClient.invalidateQueries({ queryKey: ['admin-certification-detail', id] })
    },
    onError: () => toast.error('Không thể cập nhật'),
  })
  const deleteDomainMutation = useMutation({
    mutationFn: (domainId: number) => certificationsApi.deleteDomain(domainId),
    onSuccess: () => {
      toast.success('Đã xóa domain')
      setConfirmDeleteDomain(null)
      queryClient.invalidateQueries({ queryKey: ['admin-certification-detail', id] })
    },
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
      name: domain.name,
      code: domain.code,
      description: domain.description ?? '',
      weightPercentage: domain.weightPercentage,
      displayOrder: domain.displayOrder,
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
      <div className="col" style={{ gap: 16 }}>
        <div style={{ height: 28, width: 220, background: 'var(--color-surface-hover)', borderRadius: 8 }} />
        <div style={{ height: 120, background: 'var(--color-surface-hover)', borderRadius: 12 }} />
        <div style={{ height: 220, background: 'var(--color-surface-hover)', borderRadius: 12 }} />
      </div>
    )
  }

  if (!cert) {
    return (
      <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-ink-faint)' }}>
        Không tìm thấy chứng chỉ
      </p>
    )
  }

  return (
    <div className="col" style={{ gap: 20 }}>
      {/* Header */}
      <div
        className="row enter"
        style={{ alignItems: 'center', gap: 10, flexWrap: 'wrap' }}
      >
        <Link to="/admin/certifications">
          <button
            className="btn3d ghost sm"
            style={{ padding: '6px 10px', fontSize: 12.5 }}
          >
            <ChevronLeft size={14} />
            Quay lại
          </button>
        </Link>
      </div>

      {/* Cert info */}
      <div className="card enter enter-1" style={{ padding: 20 }}>
        <div className="row" style={{ alignItems: 'flex-start', gap: 14 }}>
          <div
            className="itile"
            style={{ width: 48, height: 48, background: 'var(--color-accent-soft)', color: 'var(--color-accent)', flexShrink: 0 }}
          >
            <GraduationCap size={22} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="row" style={{ alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-ink)', margin: 0 }}>
                {cert.name}
              </h1>
              <CertStatusPill status={cert.status} />
            </div>
            <p style={{ fontSize: 13, color: 'var(--color-ink-faint)', margin: '4px 0 0' }}>
              {cert.provider} · {cert.code}
            </p>
            {cert.description && (
              <p
                style={{
                  fontSize: 13.5,
                  color: 'var(--color-ink-soft)',
                  margin: '8px 0 0',
                  lineHeight: 1.55,
                }}
              >
                {cert.description}
              </p>
            )}
            <div
              className="row"
              style={{ gap: 16, marginTop: 10, flexWrap: 'wrap', fontSize: 12.5, color: 'var(--color-ink-faint)' }}
            >
              {cert.totalQuestions != null && (
                <span>
                  Câu hỏi:{' '}
                  <strong style={{ color: 'var(--color-ink-soft)' }}>{cert.totalQuestions}</strong>
                </span>
              )}
              {cert.durationMinutes != null && (
                <span>
                  Thời gian:{' '}
                  <strong style={{ color: 'var(--color-ink-soft)' }}>{cert.durationMinutes} phút</strong>
                </span>
              )}
              {cert.passingScore != null && (
                <span>
                  Điểm đạt:{' '}
                  <strong style={{ color: 'var(--color-ink-soft)' }}>{cert.passingScore}%</strong>
                </span>
              )}
              {cert.price != null && (
                <span>
                  Giá:{' '}
                  <strong style={{ color: 'var(--color-ink-soft)' }}>${cert.price}</strong>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Domains */}
      <div className="card enter enter-2" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          className="row"
          style={{
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: '1px solid var(--color-line)',
          }}
        >
          <div className="row" style={{ alignItems: 'center', gap: 8 }}>
            <Layers size={16} style={{ color: 'var(--color-accent)' }} />
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-ink)' }}>
              Domains ({domains.length})
            </span>
          </div>
          <button className="btn3d sm" onClick={openCreateDomain}>
            <Plus size={14} />
            Thêm domain
          </button>
        </div>

        <div style={{ padding: 14 }}>
          {/* Weight indicator */}
          <div style={{ marginBottom: 12 }}>
            <div
              className="row"
              style={{ justifyContent: 'space-between', marginBottom: 4 }}
            >
              <span style={{ fontSize: 12, color: 'var(--color-ink-faint)' }}>Tổng trọng số</span>
              <span
                className="mono tnum"
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: weightValid ? 'var(--color-accent)' : '#dc2626',
                }}
              >
                {totalWeight}%
              </span>
            </div>
            <div className="track">
              <i
                style={{
                  width: `${Math.min(totalWeight, 100)}%`,
                  background: weightValid ? 'var(--color-accent)' : 'var(--color-accent)',
                }}
              />
            </div>
            {!weightValid && totalWeight > 0 && (
              <p
                className="row"
                style={{
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11.5,
                  color: '#dc2626',
                  marginTop: 6,
                }}
              >
                <AlertCircle size={12} />
                Tổng trọng số phải bằng 100%
              </p>
            )}
          </div>

          {domains.length === 0 ? (
            <p
              style={{
                textAlign: 'center',
                padding: '30px 0',
                color: 'var(--color-ink-faint)',
                fontSize: 13,
              }}
            >
              Chưa có domain nào
            </p>
          ) : (
            <div className="col" style={{ gap: 6 }}>
              {[...domains]
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map(domain => (
                  <DomainRow
                    key={domain.id}
                    domain={domain}
                    onEdit={() => openEditDomain(domain)}
                    onDelete={() => setConfirmDeleteDomain(domain)}
                  />
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Exams */}
      <div className="card enter enter-3" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          className="row"
          style={{
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: '1px solid var(--color-line)',
          }}
        >
          <div className="row" style={{ alignItems: 'center', gap: 8 }}>
            <BookOpen size={16} style={{ color: 'var(--color-accent)' }} />
            <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-ink)' }}>
              Bài thi ({cert.exams?.length ?? 0})
            </span>
          </div>
        </div>
        <div style={{ padding: 14 }}>
          {(cert.exams?.length ?? 0) === 0 ? (
            <p
              style={{
                textAlign: 'center',
                padding: '30px 0',
                color: 'var(--color-ink-faint)',
                fontSize: 13,
              }}
            >
              Chưa có bài thi nào
            </p>
          ) : (
            <div className="col" style={{ gap: 6 }}>
              {cert.exams.map(exam => (
                <div
                  key={exam.id}
                  className="row"
                  style={{
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    background: 'var(--color-surface-muted)',
                    borderRadius: 'var(--radius-inner)',
                    gap: 10,
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p
                      style={{
                        fontWeight: 600,
                        fontSize: 13.5,
                        color: 'var(--color-ink)',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {exam.title}
                    </p>
                    <div
                      className="row"
                      style={{ gap: 10, marginTop: 2, fontSize: 11.5, color: 'var(--color-ink-faint)' }}
                    >
                      <span>{exam.totalQuestions} câu</span>
                      <span>{exam.durationMinutes} phút</span>
                      <span>Đạt: {exam.passingScore}%</span>
                    </div>
                  </div>
                  <div className="row" style={{ alignItems: 'center', gap: 6 }}>
                    <span className="codechip" style={{ fontSize: 10.5 }}>
                      {exam.type}
                    </span>
                    <ExamStatusPill status={exam.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Domain create/edit dialog */}
      <Dialog open={domainDialogOpen} onOpenChange={() => closeDomainDialog()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingDomain ? 'Sửa domain' : 'Thêm domain mới'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmitDomain)} className="space-y-4 pt-2">
            <div>
              <Label htmlFor="d-name">Tên domain *</Label>
              <Input id="d-name" {...form.register('name', { required: true })} placeholder="Cloud Concepts" />
            </div>
            <div>
              <Label htmlFor="d-code">Mã *</Label>
              <Input id="d-code" {...form.register('code', { required: true })} placeholder="CLF-D1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="d-weight">Trọng số (%)</Label>
                <Input
                  id="d-weight"
                  type="number"
                  {...form.register('weightPercentage', { valueAsNumber: true })}
                />
              </div>
              <div>
                <Label htmlFor="d-order">Thứ tự</Label>
                <Input
                  id="d-order"
                  type="number"
                  {...form.register('displayOrder', { valueAsNumber: true })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="d-desc">Mô tả</Label>
              <Textarea id="d-desc" {...form.register('description')} placeholder="Mô tả domain" rows={2} />
            </div>
            <Button
              type="submit"
              disabled={createDomainMutation.isPending || updateDomainMutation.isPending}
              className="w-full bg-accent hover:bg-zinc-800 text-white cursor-pointer"
            >
              {createDomainMutation.isPending || updateDomainMutation.isPending
                ? 'Đang lưu...'
                : editingDomain
                  ? 'Cập nhật'
                  : 'Thêm domain'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete domain confirmation */}
      <Dialog
        open={!!confirmDeleteDomain}
        onOpenChange={() => setConfirmDeleteDomain(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Xóa domain</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Xóa domain &quot;{confirmDeleteDomain?.name}&quot;?
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDeleteDomain(null)}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              disabled={deleteDomainMutation.isPending}
              onClick={() =>
                confirmDeleteDomain && deleteDomainMutation.mutate(confirmDeleteDomain.id)
              }
            >
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function DomainRow({
  domain,
  onEdit,
  onDelete,
}: {
  domain: CertificationDomainResponse
  onEdit: () => void
  onDelete: () => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="row"
      style={{
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 12px',
        background: 'var(--color-surface-muted)',
        borderRadius: 'var(--radius-inner)',
        gap: 10,
        transition: 'background .12s',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="row" style={{ alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span
            className="mono tnum"
            style={{
              fontSize: 11,
              color: 'var(--color-ink-faint)',
              minWidth: 22,
              textAlign: 'right',
            }}
          >
            #{domain.displayOrder}
          </span>
          <p
            style={{
              fontWeight: 600,
              fontSize: 13.5,
              color: 'var(--color-ink)',
              margin: 0,
            }}
          >
            {domain.name}
          </p>
          <span className="codechip" style={{ fontSize: 10.5 }}>
            {domain.code}
          </span>
          <span className="codechip" style={{ fontSize: 10.5 }}>
            {domain.weightPercentage}%
          </span>
        </div>
        {domain.description && (
          <p
            style={{
              fontSize: 12,
              color: 'var(--color-ink-faint)',
              margin: '4px 0 0',
              paddingLeft: 28,
            }}
          >
            {domain.description}
          </p>
        )}
      </div>
      <div
        className="row"
        style={{
          gap: 4,
          opacity: hovered ? 1 : 0.4,
          transition: 'opacity .15s',
        }}
      >
        <button onClick={onEdit} className="iconbtn" style={{ width: 28, height: 28 }} title="Sửa">
          <Edit2 size={13} />
        </button>
        <button
          onClick={onDelete}
          className="iconbtn"
          style={{ width: 28, height: 28, color: '#dc2626' }}
          title="Xóa"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

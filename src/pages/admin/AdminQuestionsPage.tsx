'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search, Plus, Trash2, ChevronLeft, ChevronRight, Eye, Edit2,
  Sparkles, CheckCircle2, XCircle, Power,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { certificationsApi, type CertificationResponse } from '@/lib/api/certifications'
import {
  adminQuestionsApi,
  type AdminQuestionResponse,
  type QuestionCreateRequest,
  type QuestionOptionRequest,
} from '@/lib/api/questions-admin'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/use-debounce'
import { useLookups } from '@/hooks/use-lookups'

const DEFAULT_OPTION: QuestionOptionRequest = { content: '', isCorrect: false, orderIndex: 0 }

function DiffPill({ diff }: { diff: string }) {
  if (diff === 'EASY') return <span className="pill easy">Dễ</span>
  if (diff === 'MEDIUM') return <span className="pill medium">Trung bình</span>
  if (diff === 'HARD') return <span className="pill hard">Khó</span>
  return <span className="pill" style={{ background: 'var(--surface-3)', color: 'var(--ink-3)' }}>{diff}</span>
}

function QStatusPill({ status }: { status: string }) {
  if (status === 'ACTIVE') return <span className="pill brand">Active</span>
  if (status === 'INACTIVE') return <span className="pill hard">Inactive</span>
  return <span className="pill" style={{ background: 'var(--surface-3)', color: 'var(--ink-3)' }}>Draft</span>
}

export default function AdminQuestionsPage() {
  const { getOptions, getLabel } = useLookups()
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [diffFilter, setDiffFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [certFilter, setCertFilter] = useState('')
  const [domainFilter, setDomainFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<AdminQuestionResponse | null>(null)
  const [previewQuestion, setPreviewQuestion] = useState<AdminQuestionResponse | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<AdminQuestionResponse | null>(null)
  const [bulkStatusDialog, setBulkStatusDialog] = useState(false)
  const [bulkStatus, setBulkStatus] = useState('')

  const [formData, setFormData] = useState<QuestionCreateRequest>({
    domainId: 0, type: 'SINGLE_CHOICE', content: '', explanation: '', difficulty: 'MEDIUM',
    points: 1, timeLimitSeconds: 60, referenceUrl: '', options: [
      { content: '', isCorrect: true, orderIndex: 0 },
      { content: '', isCorrect: false, orderIndex: 1 },
    ],
  })

  const debouncedSearch = useDebounce(search, 400)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-questions', page, debouncedSearch, typeFilter, diffFilter, statusFilter, certFilter, domainFilter],
    queryFn: () => adminQuestionsApi.search({
      keyword: debouncedSearch || undefined,
      type: typeFilter || undefined,
      difficulty: diffFilter || undefined,
      status: statusFilter || undefined,
      certificationId: certFilter ? Number(certFilter) : undefined,
      domainId: domainFilter ? Number(domainFilter) : undefined,
      page, size: 15,
    }),
  })

  const { data: certsData } = useQuery({
    queryKey: ['certifications-for-filter'],
    queryFn: () => certificationsApi.search({ size: 100 }),
  })

  const { data: domainsData } = useQuery({
    queryKey: ['domains-for-filter', certFilter],
    queryFn: () => certificationsApi.getById(certFilter),
    enabled: !!certFilter,
  })

  const createMutation = useMutation({
    mutationFn: (data: QuestionCreateRequest) => adminQuestionsApi.create(data),
    onSuccess: () => { toast.success('Đã tạo câu hỏi'); closeDialog(); queryClient.invalidateQueries({ queryKey: ['admin-questions'] }) },
    onError: () => toast.error('Không thể tạo câu hỏi'),
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: QuestionCreateRequest }) => adminQuestionsApi.update(id, data),
    onSuccess: () => { toast.success('Đã cập nhật'); closeDialog(); queryClient.invalidateQueries({ queryKey: ['admin-questions'] }) },
    onError: () => toast.error('Không thể cập nhật'),
  })
  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminQuestionsApi.delete(id),
    onSuccess: () => { toast.success('Đã xóa'); setConfirmDelete(null); queryClient.invalidateQueries({ queryKey: ['admin-questions'] }) },
  })
  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => adminQuestionsApi.updateStatus(id, status),
    onSuccess: () => { toast.success('Đã cập nhật trạng thái'); queryClient.invalidateQueries({ queryKey: ['admin-questions'] }) },
  })

  const questions = data?.content ?? []
  const totalPages = data?.totalPages ?? 0
  const total = data?.totalElements ?? 0
  const certs = certsData?.content ?? []
  const domains = domainsData?.domains ?? []

  const toggleSelect = (id: number) => setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  const toggleAll = () => setSelectedIds(selectedIds.length === questions.length ? [] : questions.map(q => q.id))

  function openCreate() {
    setEditingQuestion(null)
    setFormData({
      domainId: 0, type: 'SINGLE_CHOICE', content: '', explanation: '', difficulty: 'MEDIUM',
      points: 1, timeLimitSeconds: 60, referenceUrl: '', options: [
        { content: '', isCorrect: true, orderIndex: 0 },
        { content: '', isCorrect: false, orderIndex: 1 },
      ],
    })
    setDialogOpen(true)
  }

  function openEdit(q: AdminQuestionResponse) {
    setEditingQuestion(q)
    setFormData({
      domainId: q.domainId ?? 0, type: q.type, content: q.content,
      explanation: q.explanation ?? '', difficulty: q.difficulty,
      points: q.points ?? 1, timeLimitSeconds: q.timeLimitSeconds ?? 60,
      referenceUrl: q.referenceUrl ?? '',
      options: q.options.map(o => ({ content: o.content, isCorrect: o.isCorrect ?? false, orderIndex: o.orderIndex })),
    })
    setDialogOpen(true)
  }

  function closeDialog() {
    setDialogOpen(false)
    setEditingQuestion(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.content.trim()) { toast.error('Nhập nội dung câu hỏi'); return }
    if (formData.options.length < 2) { toast.error('Cần ít nhất 2 đáp án'); return }
    if (!formData.options.some(o => o.isCorrect)) { toast.error('Cần ít nhất 1 đáp án đúng'); return }
    if (!formData.domainId) { toast.error('Chọn domain'); return }
    if (editingQuestion) updateMutation.mutate({ id: editingQuestion.id, data: formData })
    else createMutation.mutate(formData)
  }

  function addOption() {
    setFormData(f => ({ ...f, options: [...f.options, { ...DEFAULT_OPTION, orderIndex: f.options.length }] }))
  }

  function removeOption(idx: number) {
    setFormData(f => ({ ...f, options: f.options.filter((_, i) => i !== idx).map((o, i) => ({ ...o, orderIndex: i })) }))
  }

  function updateOption(idx: number, updates: Partial<QuestionOptionRequest>) {
    setFormData(f => ({
      ...f,
      options: f.options.map((o, i) => {
        if (i !== idx) return f.type === 'SINGLE_CHOICE' && updates.isCorrect ? { ...o, isCorrect: false } : o
        return { ...o, ...updates }
      }),
    }))
  }

  async function handleBulkStatus() {
    if (!bulkStatus || selectedIds.length === 0) return
    for (const id of selectedIds) {
      await adminQuestionsApi.updateStatus(id, bulkStatus)
    }
    toast.success(`Đã cập nhật ${selectedIds.length} câu hỏi`)
    setSelectedIds([])
    setBulkStatusDialog(false)
    queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
  }

  return (
    <div className="col" style={{ gap: 20 }}>
      {/* Header */}
      <div className="row enter" style={{ alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <span className="eyebrow">Quản trị</span>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', marginTop: 6 }}>
            <span className="row" style={{ alignItems: 'center', gap: 8 }}>
              <Sparkles size={22} style={{ color: 'var(--violet)' }} />
              Ngân hàng câu hỏi
            </span>
          </h1>
          <p style={{ color: 'var(--ink-3)', fontSize: 13.5, marginTop: 4 }}>{total} câu hỏi</p>
        </div>
        <button className="btn3d sm" onClick={openCreate}>
          <Plus size={15} />Thêm câu hỏi
        </button>
      </div>

      {/* Filters */}
      <div className="card enter enter-1" style={{ padding: '14px 16px' }}>
        <div className="col" style={{ gap: 12 }}>
          <div className="row" style={{ alignItems: 'center', gap: 8, background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: '7px 12px', border: '1px solid var(--border)' }}>
            <Search size={14} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
            <input
              placeholder="Tìm câu hỏi..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, color: 'var(--ink)', width: '100%', fontFamily: 'var(--font-body)' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
            <Select value={certFilter || 'all'} onValueChange={v => { setCertFilter(v === 'all' ? '' : v); setDomainFilter('') }}>
              <SelectTrigger className="cursor-pointer"><SelectValue placeholder="Chứng chỉ" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-slate-500 italic">Tất cả chứng chỉ</SelectItem>
                {certs.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={domainFilter || 'all'} onValueChange={v => setDomainFilter(v === 'all' ? '' : v)} disabled={!certFilter || domains.length === 0}>
              <SelectTrigger className="cursor-pointer"><SelectValue placeholder="Domain" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-slate-500 italic">Tất cả domain</SelectItem>
                {domains.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={typeFilter || 'all'} onValueChange={v => setTypeFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="cursor-pointer"><SelectValue placeholder="Loại" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-slate-500 italic">Tất cả loại</SelectItem>
                {getOptions('constants.questionTypes').map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{getLabel('constants.questionTypes', opt.value)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={diffFilter || 'all'} onValueChange={v => setDiffFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="cursor-pointer"><SelectValue placeholder="Độ khó" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-slate-500 italic">Tất cả độ khó</SelectItem>
                {getOptions('constants.questionDifficulties').map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{getLabel('constants.questionDifficulties', opt.value)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter || 'all'} onValueChange={v => setStatusFilter(v === 'all' ? '' : v)}>
              <SelectTrigger className="cursor-pointer"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-slate-500 italic">Tất cả trạng thái</SelectItem>
                {getOptions('constants.questionStatuses').map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{getLabel('constants.questionStatuses', opt.value)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedIds.length > 0 && (
            <div className="row" style={{ gap: 8, paddingTop: 4, borderTop: '1px solid var(--border)' }}>
              <button className="btn3d ghost sm" onClick={() => setBulkStatusDialog(true)}>
                <Power size={13} />Đổi trạng thái ({selectedIds.length})
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
                <th style={{ padding: '10px 14px', textAlign: 'left', width: 40, background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                  <Checkbox checked={selectedIds.length === questions.length && questions.length > 0} onCheckedChange={toggleAll} className="cursor-pointer" />
                </th>
                {['Câu hỏi', 'Loại', 'Độ khó', 'Trạng thái', 'Thao tác'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--ink-3)', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(8).fill(0).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                    {[1,2,3,4,5,6].map(j => <td key={j} style={{ padding: '12px 14px' }}><div style={{ height: 14, background: 'var(--surface-3)', borderRadius: 6 }} /></td>)}
                  </tr>
                ))
              ) : questions.map((q: AdminQuestionResponse) => (
                <QRow
                  key={q.id}
                  q={q}
                  selected={selectedIds.includes(q.id)}
                  onToggle={() => toggleSelect(q.id)}
                  onPreview={() => setPreviewQuestion(q)}
                  onEdit={() => openEdit(q)}
                  onToggleStatus={() => statusMutation.mutate({ id: q.id, status: q.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })}
                  onDelete={() => setConfirmDelete(q)}
                  getLabel={getLabel}
                />
              ))}
            </tbody>
          </table>
        </div>
        <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderTop: '1px solid var(--border)' }}>
          <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>Trang {page + 1} / {totalPages || 1}</p>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn3d ghost sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}><ChevronLeft size={15} /></button>
            <button className="btn3d ghost sm" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}><ChevronRight size={15} /></button>
          </div>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={() => closeDialog()}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingQuestion ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Loại câu hỏi *</Label>
                <Select value={formData.type} onValueChange={v => setFormData(f => ({ ...f, type: v ?? 'SINGLE_CHOICE' }))}>
                  <SelectTrigger className="cursor-pointer"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {getOptions('constants.questionTypes').map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{getLabel('constants.questionTypes', opt.value)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Độ khó *</Label>
                <Select value={formData.difficulty} onValueChange={v => setFormData(f => ({ ...f, difficulty: v ?? 'MEDIUM' }))}>
                  <SelectTrigger className="cursor-pointer"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {getOptions('constants.questionDifficulties').map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{getLabel('constants.questionDifficulties', opt.value)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Domain *</Label>
              <DomainSelector
                certs={certs}
                value={formData.domainId}
                onChange={v => setFormData(f => ({ ...f, domainId: v }))}
              />
            </div>
            <div>
              <Label htmlFor="q-content">Nội dung câu hỏi *</Label>
              <Textarea id="q-content" value={formData.content} onChange={e => setFormData(f => ({ ...f, content: e.target.value }))} rows={3} placeholder="Nhập nội dung câu hỏi..." />
            </div>
            <div>
              <Label htmlFor="q-explanation">Giải thích</Label>
              <Textarea id="q-explanation" value={formData.explanation} onChange={e => setFormData(f => ({ ...f, explanation: e.target.value }))} rows={2} placeholder="Giải thích đáp án đúng..." />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><Label htmlFor="q-points">Điểm</Label><Input id="q-points" type="number" value={formData.points ?? 1} onChange={e => setFormData(f => ({ ...f, points: Number(e.target.value) }))} /></div>
              <div><Label htmlFor="q-time">Thời gian (giây)</Label><Input id="q-time" type="number" value={formData.timeLimitSeconds ?? 60} onChange={e => setFormData(f => ({ ...f, timeLimitSeconds: Number(e.target.value) }))} /></div>
              <div><Label htmlFor="q-ref">Tham khảo</Label><Input id="q-ref" value={formData.referenceUrl ?? ''} onChange={e => setFormData(f => ({ ...f, referenceUrl: e.target.value }))} placeholder="URL" /></div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Đáp án ({formData.options.length})</Label>
                <Button type="button" size="sm" variant="outline" onClick={addOption} className="cursor-pointer" disabled={formData.options.length >= 10}>
                  <Plus className="w-3 h-3 mr-1" />Thêm
                </Button>
              </div>
              <div className="space-y-2">
                {formData.options.map((opt, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                    <button
                      type="button"
                      onClick={() => updateOption(idx, { isCorrect: !opt.isCorrect })}
                      className={cn('mt-1.5 p-1 rounded cursor-pointer transition-colors', opt.isCorrect ? 'text-green-600 bg-green-100 dark:bg-green-950/30' : 'text-slate-400 hover:text-green-500')}
                    >
                      {opt.isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </button>
                    <Input
                      className="flex-1"
                      placeholder={`Đáp án ${String.fromCharCode(65 + idx)}`}
                      value={opt.content}
                      onChange={e => updateOption(idx, { content: e.target.value })}
                    />
                    {formData.options.length > 2 && (
                      <button type="button" onClick={() => removeOption(idx)} className="mt-1.5 p-1 text-slate-400 hover:text-red-500 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full bg-primary hover:bg-slate-800 text-white cursor-pointer">
              {(createMutation.isPending || updateMutation.isPending) ? 'Đang lưu...' : editingQuestion ? 'Cập nhật' : 'Tạo câu hỏi'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewQuestion} onOpenChange={() => setPreviewQuestion(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Xem trước câu hỏi</DialogTitle></DialogHeader>
          {previewQuestion && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="codechip">{getLabel('constants.questionTypes', previewQuestion.type)}</span>
                <DiffPill diff={previewQuestion.difficulty} />
                <QStatusPill status={previewQuestion.status} />
                {previewQuestion.domainName && <span className="codechip">{previewQuestion.domainName}</span>}
              </div>
              <p className="text-slate-900 dark:text-white font-medium">{previewQuestion.content}</p>
              <div className="space-y-2">
                {previewQuestion.options.map((opt, idx) => (
                  <div key={opt.id} className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border',
                    opt.isCorrect ? 'border-green-300 bg-green-50 dark:bg-green-950/20 dark:border-green-800' : 'border-slate-200 dark:border-slate-700'
                  )}>
                    <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-medium flex-shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-sm flex-1">{opt.content}</span>
                    {opt.isCorrect && <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />}
                  </div>
                ))}
              </div>
              {previewQuestion.explanation && (
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-1">Giải thích</p>
                  <p className="text-sm text-blue-800 dark:text-blue-300">{previewQuestion.explanation}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Xóa câu hỏi</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-600 dark:text-slate-300">Xóa câu hỏi này? Hành động không thể hoàn tác.</p>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDelete(null)} className="cursor-pointer">Hủy</Button>
            <Button className="bg-red-600 hover:bg-red-700 text-white cursor-pointer" disabled={deleteMutation.isPending} onClick={() => confirmDelete && deleteMutation.mutate(confirmDelete.id)}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk status dialog */}
      <Dialog open={bulkStatusDialog} onOpenChange={() => setBulkStatusDialog(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Đổi trạng thái hàng loạt</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-500">{selectedIds.length} câu hỏi đã chọn</p>
          <Select value={bulkStatus} onValueChange={v => setBulkStatus(v ?? '')}>
            <SelectTrigger className="cursor-pointer"><SelectValue placeholder="Chọn trạng thái" /></SelectTrigger>
            <SelectContent>
              {getOptions('constants.questionStatuses').map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{getLabel('constants.questionStatuses', opt.value)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setBulkStatusDialog(false)} className="cursor-pointer">Hủy</Button>
            <Button className="bg-primary hover:bg-slate-800 text-white cursor-pointer" disabled={!bulkStatus} onClick={handleBulkStatus}>
              Áp dụng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function QRow({ q, selected, onToggle, onPreview, onEdit, onToggleStatus, onDelete, getLabel }: {
  q: AdminQuestionResponse
  selected: boolean
  onToggle: () => void
  onPreview: () => void
  onEdit: () => void
  onToggleStatus: () => void
  onDelete: () => void
  getLabel: (ns: string, v: string) => string
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <tr
      style={{ borderBottom: '1px solid var(--border)', background: hovered ? 'var(--surface-2)' : 'transparent', transition: 'background .12s' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td style={{ padding: '10px 14px' }}>
        <Checkbox checked={selected} onCheckedChange={onToggle} className="cursor-pointer" />
      </td>
      <td style={{ padding: '10px 14px', maxWidth: 300 }}>
        <p style={{ fontSize: 13.5, color: 'var(--ink)', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{q.content}</p>
        <div className="row" style={{ gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
          {q.domainName && <span className="codechip" style={{ fontSize: 11 }}>{q.domainName}</span>}
          {q.questionCode && <span className="codechip" style={{ fontSize: 11 }}>#{q.questionCode}</span>}
        </div>
      </td>
      <td style={{ padding: '10px 14px' }}>
        <span className="codechip" style={{ fontSize: 11 }}>{getLabel('constants.questionTypes', q.type)}</span>
      </td>
      <td style={{ padding: '10px 14px' }}>
        <DiffPill diff={q.difficulty} />
      </td>
      <td style={{ padding: '10px 14px' }}>
        <QStatusPill status={q.status} />
      </td>
      <td style={{ padding: '10px 14px' }}>
        <div className="row" style={{ alignItems: 'center', gap: 4 }}>
          <button onClick={onPreview} className="iconbtn" style={{ width: 30, height: 30 }} title="Xem">
            <Eye size={14} />
          </button>
          <button onClick={onEdit} className="iconbtn" style={{ width: 30, height: 30 }} title="Sửa">
            <Edit2 size={14} />
          </button>
          <button onClick={onToggleStatus} className="iconbtn" style={{ width: 30, height: 30, color: q.status === 'ACTIVE' ? 'var(--brand)' : 'var(--ink-3)' }} title="Bật/tắt">
            <Power size={14} />
          </button>
          <button onClick={onDelete} className="iconbtn" style={{ width: 30, height: 30, color: 'var(--hard)' }} title="Xóa">
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}

function DomainSelector({ certs, value, onChange }: { certs: CertificationResponse[]; value: number; onChange: (v: number) => void }) {
  const [certId, setCertId] = useState('')

  const { data: certDetail } = useQuery({
    queryKey: ['cert-domains-selector', certId],
    queryFn: () => certificationsApi.getById(certId),
    enabled: !!certId,
  })

  const domains = certDetail?.domains ?? []

  return (
    <div className="grid grid-cols-2 gap-2">
      <Select value={certId} onValueChange={v => { setCertId(v ?? ''); onChange(0) }}>
        <SelectTrigger className="cursor-pointer"><SelectValue placeholder="Chọn chứng chỉ" /></SelectTrigger>
        <SelectContent>
          {certs.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={value ? String(value) : ''} onValueChange={v => onChange(Number(v))}>
        <SelectTrigger className="cursor-pointer"><SelectValue placeholder="Chọn domain" /></SelectTrigger>
        <SelectContent>
          {domains.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}

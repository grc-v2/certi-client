'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search, Plus, Trash2, ChevronLeft, ChevronRight, Eye, Edit2,
  HelpCircle, CheckCircle2, XCircle, Power,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { certificationsApi, type CertificationResponse, type CertificationDomainResponse } from '@/lib/api/certifications'
import {
  adminQuestionsApi,
  type AdminQuestionResponse,
  type QuestionCreateRequest,
  type QuestionOptionRequest,
} from '@/lib/api/questions-admin'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/use-debounce'

const TYPES: Record<string, string> = { SINGLE_CHOICE: 'Một đáp án', MULTIPLE_CHOICE: 'Nhiều đáp án', TRUE_FALSE: 'Đúng/Sai' }
const DIFFICULTIES: Record<string, string> = { EASY: 'Dễ', MEDIUM: 'Trung bình', HARD: 'Khó' }
const STATUSES: Record<string, string> = { DRAFT: 'Nháp', ACTIVE: 'Hoạt động', INACTIVE: 'Ẩn' }
const DIFF_COLORS: Record<string, string> = {
  EASY: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400',
  MEDIUM: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400',
  HARD: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400',
}
const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  ACTIVE: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400',
  INACTIVE: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400',
}

const DEFAULT_OPTION: QuestionOptionRequest = { content: '', isCorrect: false, orderIndex: 0 }

export default function AdminQuestionsPage() {
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

  // Form state
  const [formData, setFormData] = useState<QuestionCreateRequest>({
    domainId: 0, type: 'SINGLE_CHOICE', content: '', explanation: '', difficulty: 'MEDIUM',
    points: 1, timeLimitSeconds: 60, referenceUrl: '', options: [
      { content: '', isCorrect: true, orderIndex: 0 },
      { content: '', isCorrect: false, orderIndex: 1 },
    ],
  })

  const debouncedSearch = useDebounce(search, 400)
  const queryClient = useQueryClient()

  // Queries
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

  // Mutations
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-[#0A66C2]" />Ngân hàng câu hỏi
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{total} câu hỏi</p>
        </div>
        <Button onClick={openCreate} className="bg-[#0A66C2] hover:bg-[#084E96] text-white cursor-pointer">
          <Plus className="w-4 h-4 mr-2" />Thêm câu hỏi
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Tìm câu hỏi..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={certFilter} onValueChange={v => { setCertFilter(v ?? ''); setDomainFilter('') }}>
              <SelectTrigger className="w-full sm:w-48 cursor-pointer"><SelectValue placeholder="Chứng chỉ" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả</SelectItem>
                {certs.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
            {certFilter && domains.length > 0 && (
              <Select value={domainFilter} onValueChange={v => setDomainFilter(v ?? '')}>
                <SelectTrigger className="w-full sm:w-44 cursor-pointer"><SelectValue placeholder="Domain" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tất cả</SelectItem>
                  {domains.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <Select value={typeFilter} onValueChange={v => setTypeFilter(v ?? '')}>
              <SelectTrigger className="w-full sm:w-40 cursor-pointer"><SelectValue placeholder="Loại" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả</SelectItem>
                {Object.entries(TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={diffFilter} onValueChange={v => setDiffFilter(v ?? '')}>
              <SelectTrigger className="w-full sm:w-36 cursor-pointer"><SelectValue placeholder="Độ khó" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả</SelectItem>
                {Object.entries(DIFFICULTIES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={v => setStatusFilter(v ?? '')}>
              <SelectTrigger className="w-full sm:w-36 cursor-pointer"><SelectValue placeholder="Trạng thái" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Tất cả</SelectItem>
                {Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
            {selectedIds.length > 0 && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setBulkStatusDialog(true)} className="cursor-pointer">
                  <Power className="w-3.5 h-3.5 mr-1.5" />Đổi trạng thái ({selectedIds.length})
                </Button>
              </div>
            )}
          </div>
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
                    <Checkbox checked={selectedIds.length === questions.length && questions.length > 0} onCheckedChange={toggleAll} className="cursor-pointer" />
                  </th>
                  <th className="p-3 text-left font-medium text-slate-500">Câu hỏi</th>
                  <th className="p-3 text-left font-medium text-slate-500 hidden sm:table-cell">Loại</th>
                  <th className="p-3 text-left font-medium text-slate-500 hidden md:table-cell">Độ khó</th>
                  <th className="p-3 text-left font-medium text-slate-500">Trạng thái</th>
                  <th className="p-3 text-left font-medium text-slate-500">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array(8).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50">
                      {[1,2,3,4,5,6].map(j => <td key={j} className="p-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></td>)}
                    </tr>
                  ))
                ) : questions.map(q => (
                  <tr key={q.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3">
                      <Checkbox checked={selectedIds.includes(q.id)} onCheckedChange={() => toggleSelect(q.id)} className="cursor-pointer" />
                    </td>
                    <td className="p-3 max-w-xs">
                      <p className="text-slate-900 dark:text-white line-clamp-2 text-sm">{q.content}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        {q.domainName && <span className="text-xs text-slate-400">{q.domainName}</span>}
                        {q.questionCode && <span className="text-xs text-slate-400">#{q.questionCode}</span>}
                      </div>
                    </td>
                    <td className="p-3 hidden sm:table-cell">
                      <Badge variant="secondary" className="text-xs">{TYPES[q.type] ?? q.type}</Badge>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <Badge className={cn('text-xs', DIFF_COLORS[q.difficulty])}>{DIFFICULTIES[q.difficulty] ?? q.difficulty}</Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={cn('text-xs', STATUS_COLORS[q.status])}>{STATUSES[q.status] ?? q.status}</Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setPreviewQuestion(q)} className="p-1.5 text-slate-400 hover:text-[#0A66C2] cursor-pointer transition-colors rounded hover:bg-[#0A66C2]/10" title="Xem">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => openEdit(q)} className="p-1.5 text-slate-400 hover:text-[#0A66C2] cursor-pointer transition-colors rounded hover:bg-[#0A66C2]/10" title="Sửa">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => statusMutation.mutate({ id: q.id, status: q.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' })}
                          className={cn('p-1.5 cursor-pointer transition-colors rounded', q.status === 'ACTIVE' ? 'text-green-500' : 'text-slate-400 hover:text-green-500 hover:bg-green-50')}
                          title="Bật/tắt"
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button onClick={() => setConfirmDelete(q)} className="p-1.5 text-slate-400 hover:text-red-500 cursor-pointer transition-colors rounded hover:bg-red-50 dark:hover:bg-red-950/20" title="Xóa">
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
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingQuestion ? 'Sửa câu hỏi' : 'Thêm câu hỏi mới'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Loại câu hỏi *</Label>
                <Select value={formData.type} onValueChange={v => setFormData(f => ({ ...f, type: v ?? 'SINGLE_CHOICE' }))}>
                  <SelectTrigger className="cursor-pointer"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Độ khó *</Label>
                <Select value={formData.difficulty} onValueChange={v => setFormData(f => ({ ...f, difficulty: v ?? 'MEDIUM' }))}>
                  <SelectTrigger className="cursor-pointer"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(DIFFICULTIES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
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

            {/* Options */}
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

            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="w-full bg-[#0A66C2] hover:bg-[#084E96] text-white cursor-pointer">
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
                <Badge variant="secondary" className="text-xs">{TYPES[previewQuestion.type]}</Badge>
                <Badge className={cn('text-xs', DIFF_COLORS[previewQuestion.difficulty])}>{DIFFICULTIES[previewQuestion.difficulty]}</Badge>
                <Badge className={cn('text-xs', STATUS_COLORS[previewQuestion.status])}>{STATUSES[previewQuestion.status]}</Badge>
                {previewQuestion.domainName && <Badge variant="secondary" className="text-xs">{previewQuestion.domainName}</Badge>}
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
              {Object.entries(STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setBulkStatusDialog(false)} className="cursor-pointer">Hủy</Button>
            <Button className="bg-[#0A66C2] hover:bg-[#084E96] text-white cursor-pointer" disabled={!bulkStatus} onClick={handleBulkStatus}>
              Áp dụng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Domain selector component - picks certification first, then domain
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

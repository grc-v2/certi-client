'use client'

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Eye,
  Layers,
  Plus,
  PlayCircle,
  Search,
  Trash2,
  UploadCloud,
} from 'lucide-react'
import { CoursePreviewDialog } from '@/components/admin/CoursePreviewDialog'
import { toast } from 'sonner'
import { Controller, useForm } from 'react-hook-form'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDebounce } from '@/hooks/use-debounce'
import {
  adminCoursesApi,
  type AdminCourseRequest,
} from '@/lib/api/admin-courses'
import { certificationsApi, type CertificationResponse } from '@/lib/api/certifications'
import type { CourseResponse } from '@/lib/api/courses'

type PublishedFilter = 'ALL' | 'PUBLISHED' | 'DRAFT'

type CourseForm = {
  certificationId: number | undefined
  name: string
  description: string
  instructor: string
  thumbnailUrl: string
  durationMinutes: number | undefined
}

const EMPTY_FORM: CourseForm = {
  certificationId: undefined,
  name: '',
  description: '',
  instructor: '',
  thumbnailUrl: '',
  durationMinutes: undefined,
}

const trimOrUndefined = (value?: string): string | undefined => {
  if (!value) return undefined
  const trimmed = value.trim()
  return trimmed.length === 0 ? undefined : trimmed
}

const toPayload = (form: CourseForm): AdminCourseRequest => ({
  certificationId: form.certificationId as number,
  name: form.name.trim(),
  description: trimOrUndefined(form.description),
  instructor: trimOrUndefined(form.instructor),
  thumbnailUrl: trimOrUndefined(form.thumbnailUrl),
  durationMinutes: form.durationMinutes,
})

function PublishedPill({ published }: { published?: boolean }) {
  return published ? (
    <span className="pill brand">Published</span>
  ) : (
    <span className="pill gold">Draft</span>
  )
}

export default function AdminCoursesListPage() {
  const queryClient = useQueryClient()

  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [certFilter, setCertFilter] = useState<string>('ALL')
  const [publishedFilter, setPublishedFilter] = useState<PublishedFilter>('ALL')

  const debouncedSearch = useDebounce(search, 400)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<CourseResponse | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<CourseResponse | null>(null)
  const [previewCourseId, setPreviewCourseId] = useState<number | null>(null)

  const form = useForm<CourseForm>({ defaultValues: EMPTY_FORM })

  const certificationsQuery = useQuery({
    queryKey: ['admin-courses-cert-picker'],
    queryFn: () => certificationsApi.search({ page: 0, size: 100, sortBy: 'name', sortDirection: 'ASC' }),
    staleTime: 5 * 60 * 1000,
  })

  const certifications = certificationsQuery.data?.content ?? []

  const coursesQuery = useQuery({
    queryKey: ['admin-courses-all', page, debouncedSearch, certFilter, publishedFilter],
    queryFn: () =>
      adminCoursesApi.search({
        certificationId: certFilter === 'ALL' ? undefined : Number(certFilter),
        search: debouncedSearch || undefined,
        published:
          publishedFilter === 'ALL' ? undefined : publishedFilter === 'PUBLISHED',
        page,
        size: 15,
        sortBy: 'createdAt',
        sortDirection: 'DESC',
      }),
  })

  const courses = coursesQuery.data?.content ?? []
  const totalPages = coursesQuery.data?.totalPages ?? 0
  const total = coursesQuery.data?.totalElements ?? 0

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin-courses-all'] })

  const createMutation = useMutation({
    mutationFn: (payload: AdminCourseRequest) => adminCoursesApi.create(payload),
    onSuccess: () => {
      toast.success('Đã tạo khoá học')
      closeDialog()
      invalidate()
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : 'Không thể tạo khoá học'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: AdminCourseRequest }) =>
      adminCoursesApi.update(id, payload),
    onSuccess: () => {
      toast.success('Đã cập nhật khoá học')
      closeDialog()
      invalidate()
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : 'Không thể cập nhật khoá học'),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminCoursesApi.remove(id),
    onSuccess: () => {
      toast.success('Đã xoá khoá học')
      setConfirmDelete(null)
      invalidate()
    },
    onError: () => toast.error('Không thể xoá khoá học'),
  })

  const publishMutation = useMutation({
    mutationFn: (id: number) => adminCoursesApi.publish(id),
    onSuccess: () => {
      toast.success('Đã publish khoá học')
      invalidate()
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : 'Không thể publish'),
  })

  const unpublishMutation = useMutation({
    mutationFn: (id: number) => adminCoursesApi.unpublish(id),
    onSuccess: () => {
      toast.success('Đã unpublish khoá học')
      invalidate()
    },
    onError: () => toast.error('Không thể unpublish'),
  })

  function openCreate() {
    setEditing(null)
    form.reset({
      ...EMPTY_FORM,
      certificationId:
        certFilter !== 'ALL' ? Number(certFilter) : certifications[0]?.id,
    })
    setDialogOpen(true)
  }

  function openEdit(course: CourseResponse) {
    setEditing(course)
    form.reset({
      certificationId: course.certificationId,
      name: course.name,
      description: course.description ?? '',
      instructor: course.instructor ?? '',
      thumbnailUrl: course.thumbnailUrl ?? '',
      durationMinutes: course.durationMinutes ?? undefined,
    })
    setDialogOpen(true)
  }

  function closeDialog() {
    setDialogOpen(false)
    setEditing(null)
    form.reset(EMPTY_FORM)
  }

  function onSubmit(values: CourseForm) {
    if (!values.certificationId) {
      toast.error('Vui lòng chọn chứng chỉ')
      return
    }
    if (!values.name.trim()) {
      toast.error('Tên khoá học là bắt buộc')
      return
    }
    const payload = toPayload(values)
    if (editing) updateMutation.mutate({ id: editing.id, payload })
    else createMutation.mutate(payload)
  }

  const isMutating =
    createMutation.isPending || updateMutation.isPending

  const togglingId = useMemo(() => {
    if (publishMutation.isPending) return publishMutation.variables
    if (unpublishMutation.isPending) return unpublishMutation.variables
    return undefined
  }, [
    publishMutation.isPending,
    publishMutation.variables,
    unpublishMutation.isPending,
    unpublishMutation.variables,
  ])

  return (
    <div className="col" style={{ gap: 20 }}>
      {/* Header */}
      <div
        className="row enter"
        style={{
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <span className="eyebrow">Quản trị</span>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: 'var(--ink)',
              marginTop: 6,
            }}
          >
            <span className="row" style={{ alignItems: 'center', gap: 8 }}>
              <BookOpen size={22} style={{ color: 'var(--brand)' }} />
              Quản lý khoá học
            </span>
          </h1>
          <p style={{ color: 'var(--ink-3)', fontSize: 13.5, marginTop: 4 }}>
            {total} khoá học
          </p>
        </div>
        <button
          className="btn3d sm"
          onClick={openCreate}
          disabled={certifications.length === 0}
        >
          <Plus size={15} />
          Thêm khoá học
        </button>
      </div>

      {/* Filter bar */}
      <div className="card enter enter-1" style={{ padding: '14px 16px' }}>
        <div
          className="row"
          style={{ gap: 12, alignItems: 'center', flexWrap: 'wrap' }}
        >
          <div
            className="row"
            style={{
              alignItems: 'center',
              gap: 8,
              flex: 1,
              minWidth: 220,
              background: 'var(--surface-2)',
              borderRadius: 'var(--radius-sm)',
              padding: '7px 12px',
              border: '1px solid var(--border)',
            }}
          >
            <Search size={14} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
            <input
              placeholder="Tìm khoá học theo tên..."
              value={search}
              onChange={e => {
                setSearch(e.target.value)
                setPage(0)
              }}
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: 13.5,
                color: 'var(--ink)',
                width: '100%',
                fontFamily: 'var(--font-body)',
              }}
            />
          </div>

          <div style={{ minWidth: 220 }}>
            <Select
              value={certFilter}
              onValueChange={value => {
                setCertFilter(value)
                setPage(0)
              }}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Chứng chỉ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả chứng chỉ</SelectItem>
                {certifications.map(cert => (
                  <SelectItem key={cert.id} value={String(cert.id)}>
                    {cert.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div style={{ minWidth: 160 }}>
            <Select
              value={publishedFilter}
              onValueChange={value => {
                setPublishedFilter(value as PublishedFilter)
                setPage(0)
              }}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        className="card enter enter-2"
        style={{ padding: 0, overflow: 'hidden' }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{ width: '100%', fontSize: 13.5, borderCollapse: 'collapse' }}
          >
            <thead>
              <tr>
                {[
                  'Khoá học',
                  'Chứng chỉ',
                  'Cấu trúc',
                  'Học viên',
                  'Trạng thái',
                  'Thao tác',
                ].map(h => (
                  <th
                    key={h}
                    style={{
                      padding: '10px 14px',
                      textAlign: 'left',
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: '.07em',
                      textTransform: 'uppercase',
                      color: 'var(--ink-3)',
                      background: 'var(--surface-2)',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coursesQuery.isLoading ? (
                Array(6)
                  .fill(0)
                  .map((_, i) => (
                    <tr
                      key={i}
                      style={{ borderBottom: '1px solid var(--border)' }}
                    >
                      {[1, 2, 3, 4, 5, 6].map(j => (
                        <td key={j} style={{ padding: '12px 14px' }}>
                          <div
                            style={{
                              height: 14,
                              background: 'var(--surface-3)',
                              borderRadius: 6,
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))
              ) : courses.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: '40px 14px',
                      textAlign: 'center',
                      color: 'var(--ink-3)',
                      fontSize: 13.5,
                    }}
                  >
                    Không có khoá học nào.{' '}
                    {certifications.length === 0
                      ? 'Bạn cần tạo chứng chỉ trước khi thêm khoá học.'
                      : 'Bấm "Thêm khoá học" để tạo mới.'}
                  </td>
                </tr>
              ) : (
                courses.map(course => (
                  <CourseRow
                    key={course.id}
                    course={course}
                    isToggling={togglingId === course.id}
                    onPreview={() => setPreviewCourseId(course.id)}
                    onEdit={() => openEdit(course)}
                    onTogglePublish={() =>
                      course.published
                        ? unpublishMutation.mutate(course.id)
                        : publishMutation.mutate(course.id)
                    }
                    onDelete={() => setConfirmDelete(course)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
        <div
          className="row"
          style={{
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 18px',
            borderTop: '1px solid var(--border)',
          }}
        >
          <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>
            Trang {page + 1} / {totalPages || 1}
          </p>
          <div className="row" style={{ gap: 8 }}>
            <button
              className="btn3d ghost sm"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              <ChevronLeft size={15} />
            </button>
            <button
              className="btn3d ghost sm"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={open => !open && closeDialog()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Sửa khoá học' : 'Thêm khoá học mới'}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 pt-2"
          >
            <div>
              <Label>Chứng chỉ *</Label>
              <Controller
                name="certificationId"
                control={form.control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    value={field.value ? String(field.value) : ''}
                    onValueChange={v => field.onChange(Number(v))}
                    disabled={!!editing}
                  >
                    <SelectTrigger className="cursor-pointer">
                      <SelectValue placeholder="Chọn chứng chỉ" />
                    </SelectTrigger>
                    <SelectContent>
                      {certifications.map(cert => (
                        <SelectItem key={cert.id} value={String(cert.id)}>
                          {cert.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div>
              <Label htmlFor="name">Tên khoá học *</Label>
              <Input
                id="name"
                placeholder="AWS Solutions Architect — Lộ trình toàn diện"
                {...form.register('name', { required: true })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="instructor">Giảng viên</Label>
                <Input id="instructor" {...form.register('instructor')} />
              </div>
              <div>
                <Label htmlFor="durationMinutes">Thời lượng (phút)</Label>
                <Input
                  id="durationMinutes"
                  type="number"
                  min={0}
                  {...form.register('durationMinutes', {
                    setValueAs: v =>
                      v === '' || v === null || v === undefined
                        ? undefined
                        : Number(v),
                  })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
              <Input id="thumbnailUrl" {...form.register('thumbnailUrl')} />
            </div>
            <div>
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                rows={3}
                {...form.register('description')}
              />
            </div>
            <Button
              type="submit"
              disabled={isMutating}
              className="w-full bg-primary hover:bg-slate-800 text-white cursor-pointer"
            >
              {isMutating
                ? 'Đang lưu...'
                : editing
                  ? 'Cập nhật'
                  : 'Tạo khoá học'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Preview */}
      <CoursePreviewDialog
        open={previewCourseId != null}
        onOpenChange={open => !open && setPreviewCourseId(null)}
        courseId={previewCourseId}
      />

      {/* Delete confirmation */}
      <Dialog
        open={!!confirmDelete}
        onOpenChange={() => setConfirmDelete(null)}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Xoá khoá học</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Bạn có chắc chắn muốn xoá &quot;{confirmDelete?.name}&quot;? Hành
            động này không thể hoàn tác.
          </p>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setConfirmDelete(null)}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              disabled={deleteMutation.isPending}
              onClick={() =>
                confirmDelete && deleteMutation.mutate(confirmDelete.id)
              }
            >
              {deleteMutation.isPending ? 'Đang xoá...' : 'Xoá'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CourseRow({
  course,
  isToggling,
  onPreview,
  onEdit,
  onTogglePublish,
  onDelete,
}: {
  course: CourseResponse
  isToggling: boolean
  onPreview: () => void
  onEdit: () => void
  onTogglePublish: () => void
  onDelete: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const totalModules = course.totalModules ?? course.modules?.length ?? 0
  const totalLessons =
    course.totalLessons ??
    (course.modules?.reduce((s, m) => s + (m.lessons?.length ?? 0), 0) ?? 0)

  return (
    <tr
      style={{
        borderBottom: '1px solid var(--border)',
        background: hovered ? 'var(--surface-2)' : 'transparent',
        transition: 'background .12s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td style={{ padding: '10px 14px' }}>
        <div className="row" style={{ alignItems: 'center', gap: 10 }}>
          <div
            className="itile"
            style={{
              width: 34,
              height: 34,
              background: 'var(--brand-soft, var(--surface-3))',
              color: 'var(--brand)',
              flexShrink: 0,
            }}
          >
            <BookOpen size={16} />
          </div>
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontWeight: 600,
                fontSize: 13.5,
                color: 'var(--ink)',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 320,
              }}
            >
              {course.name}
            </p>
            {course.instructor && (
              <span className="codechip" style={{ fontSize: 10.5 }}>
                {course.instructor}
              </span>
            )}
          </div>
        </div>
      </td>
      <td
        style={{ padding: '10px 14px', fontSize: 12.5, color: 'var(--ink-2)' }}
      >
        {course.certificationName}
      </td>
      <td style={{ padding: '10px 14px', fontSize: 12.5 }}>
        <span
          className="row"
          style={{ alignItems: 'center', gap: 6, color: 'var(--ink-2)' }}
        >
          <Layers size={13} /> {totalModules} modules
          <span style={{ color: 'var(--ink-3)' }}>·</span>
          <BookOpen size={13} /> {totalLessons} bài
        </span>
      </td>
      <td
        style={{ padding: '10px 14px', fontSize: 12.5, color: 'var(--ink-2)' }}
      >
        {course.enrolledCount ?? 0}
      </td>
      <td style={{ padding: '10px 14px' }}>
        <PublishedPill published={course.published} />
      </td>
      <td style={{ padding: '10px 14px' }}>
        <div className="row" style={{ alignItems: 'center', gap: 4 }}>
          <button
            onClick={onPreview}
            className="iconbtn"
            style={{ width: 30, height: 30, color: 'var(--brand)' }}
            title="Xem trước"
          >
            <PlayCircle size={14} />
          </button>
          <Link to={`/admin/certifications/${course.certificationId}/courses`}>
            <button
              className="iconbtn"
              style={{ width: 30, height: 30 }}
              title="Sửa nội dung (modules & bài học)"
            >
              <Eye size={14} />
            </button>
          </Link>
          <button
            onClick={onEdit}
            className="iconbtn"
            style={{ width: 30, height: 30 }}
            title="Sửa metadata"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={onTogglePublish}
            disabled={isToggling}
            className="iconbtn"
            style={{
              width: 30,
              height: 30,
              color: course.published ? 'var(--ink-3)' : 'var(--brand)',
              opacity: isToggling ? 0.5 : 1,
            }}
            title={course.published ? 'Unpublish' : 'Publish'}
          >
            <UploadCloud size={14} />
          </button>
          <button
            onClick={onDelete}
            className="iconbtn"
            style={{ width: 30, height: 30, color: 'var(--hard)' }}
            title="Xoá"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}

'use client'

import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Layers,
  Pencil,
  Plus,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  adminCoursesApi,
  type AdminCourseLessonRequest,
  type AdminCourseLessonType,
  type AdminCourseModuleRequest,
  type AdminCourseRequest,
} from '@/lib/api/admin-courses'
import { certificationsApi, type CertificationDetailResponse } from '@/lib/api/certifications'
import type { CourseModuleResponse, CourseResponse, CourseLessonSummary } from '@/lib/api/courses'
import { cn } from '@/lib/utils'

const LESSON_TYPES: AdminCourseLessonType[] = ['VIDEO', 'ARTICLE', 'QUIZ']

interface CourseFormState {
  name: string
  description: string
  instructor: string
  thumbnailUrl: string
  durationMinutes: string
}

interface ModuleFormState {
  title: string
  description: string
  orderIndex: string
}

interface LessonFormState {
  title: string
  description: string
  content: string
  videoUrl: string
  durationMinutes: string
  orderIndex: string
  lessonType: AdminCourseLessonType
}

const EMPTY_COURSE_FORM: CourseFormState = {
  name: '',
  description: '',
  instructor: '',
  thumbnailUrl: '',
  durationMinutes: '',
}

const EMPTY_MODULE_FORM: ModuleFormState = {
  title: '',
  description: '',
  orderIndex: '',
}

const EMPTY_LESSON_FORM: LessonFormState = {
  title: '',
  description: '',
  content: '',
  videoUrl: '',
  durationMinutes: '',
  orderIndex: '',
  lessonType: 'VIDEO',
}

const toIntOrUndefined = (value: string): number | undefined => {
  if (!value.trim()) return undefined
  const n = Number(value)
  return Number.isFinite(n) ? n : undefined
}

const trimOrUndefined = (value: string): string | undefined => {
  const trimmed = value.trim()
  return trimmed.length === 0 ? undefined : trimmed
}

const statusBadgeClass = (published?: boolean) =>
  published
    ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300'
    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-300'

const sortedModules = (modules: CourseModuleResponse[]) =>
  [...modules].sort((a, b) => a.orderIndex - b.orderIndex)

const sortedLessons = (lessons: CourseLessonSummary[]) =>
  [...lessons].sort((a, b) => a.orderIndex - b.orderIndex)

const toCoursePayload = (
  certificationId: number,
  form: CourseFormState
): AdminCourseRequest => ({
  certificationId,
  name: form.name.trim(),
  description: trimOrUndefined(form.description),
  instructor: trimOrUndefined(form.instructor),
  thumbnailUrl: trimOrUndefined(form.thumbnailUrl),
  durationMinutes: toIntOrUndefined(form.durationMinutes),
})

const toModulePayload = (form: ModuleFormState): AdminCourseModuleRequest => ({
  title: form.title.trim(),
  description: trimOrUndefined(form.description),
  orderIndex: toIntOrUndefined(form.orderIndex),
})

const toLessonPayload = (form: LessonFormState): AdminCourseLessonRequest => ({
  title: form.title.trim(),
  description: trimOrUndefined(form.description),
  content: trimOrUndefined(form.content),
  videoUrl: trimOrUndefined(form.videoUrl),
  durationMinutes: toIntOrUndefined(form.durationMinutes),
  orderIndex: toIntOrUndefined(form.orderIndex),
  lessonType: form.lessonType,
})

export default function AdminCoursesPage() {
  const { id } = useParams<{ id: string }>()
  const certificationId = Number(id)
  const queryClient = useQueryClient()

  const [expandedCourseIds, setExpandedCourseIds] = useState<Set<number>>(new Set())

  const [courseDialog, setCourseDialog] = useState<{
    open: boolean
    mode: 'create' | 'edit'
    courseId?: number
    form: CourseFormState
  }>({ open: false, mode: 'create', form: EMPTY_COURSE_FORM })

  const [moduleDialog, setModuleDialog] = useState<{
    open: boolean
    mode: 'create' | 'edit'
    courseId?: number
    moduleId?: number
    form: ModuleFormState
  }>({ open: false, mode: 'create', form: EMPTY_MODULE_FORM })

  const [lessonDialog, setLessonDialog] = useState<{
    open: boolean
    mode: 'create' | 'edit'
    courseId?: number
    moduleId?: number
    lessonId?: number
    form: LessonFormState
  }>({ open: false, mode: 'create', form: EMPTY_LESSON_FORM })

  const certQuery = useQuery<CertificationDetailResponse>({
    queryKey: ['admin-certification-detail', id],
    queryFn: () => certificationsApi.getById(id),
  })

  const coursesQuery = useQuery({
    queryKey: ['admin-courses', certificationId],
    enabled: Number.isFinite(certificationId),
    queryFn: () =>
      adminCoursesApi.search({
        certificationId,
        page: 0,
        size: 50,
        sortBy: 'createdAt',
        sortDirection: 'DESC',
      }),
  })

  const courses = useMemo<CourseResponse[]>(
    () => coursesQuery.data?.content ?? [],
    [coursesQuery.data]
  )

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ['admin-courses', certificationId] })

  const createCourse = useMutation({
    mutationFn: (payload: AdminCourseRequest) => adminCoursesApi.create(payload),
    onSuccess: () => {
      toast.success('Đã tạo khoá học')
      invalidate()
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : 'Không thể tạo khoá học'),
  })

  const updateCourse = useMutation({
    mutationFn: ({ courseId, payload }: { courseId: number; payload: AdminCourseRequest }) =>
      adminCoursesApi.update(courseId, payload),
    onSuccess: () => {
      toast.success('Đã cập nhật khoá học')
      invalidate()
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : 'Không thể cập nhật khoá học'),
  })

  const removeCourse = useMutation({
    mutationFn: (courseId: number) => adminCoursesApi.remove(courseId),
    onSuccess: () => {
      toast.success('Đã xoá khoá học')
      invalidate()
    },
    onError: () => toast.error('Không thể xoá khoá học'),
  })

  const publishCourse = useMutation({
    mutationFn: (courseId: number) => adminCoursesApi.publish(courseId),
    onSuccess: () => {
      toast.success('Đã publish khoá học')
      invalidate()
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : 'Không thể publish khoá học'),
  })

  const unpublishCourse = useMutation({
    mutationFn: (courseId: number) => adminCoursesApi.unpublish(courseId),
    onSuccess: () => {
      toast.success('Đã unpublish khoá học')
      invalidate()
    },
    onError: () => toast.error('Không thể unpublish khoá học'),
  })

  const createModule = useMutation({
    mutationFn: ({
      courseId,
      payload,
    }: {
      courseId: number
      payload: AdminCourseModuleRequest
    }) => adminCoursesApi.createModule(courseId, payload),
    onSuccess: () => {
      toast.success('Đã thêm module')
      invalidate()
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : 'Không thể tạo module'),
  })

  const updateModule = useMutation({
    mutationFn: ({
      courseId,
      moduleId,
      payload,
    }: {
      courseId: number
      moduleId: number
      payload: AdminCourseModuleRequest
    }) => adminCoursesApi.updateModule(courseId, moduleId, payload),
    onSuccess: () => {
      toast.success('Đã cập nhật module')
      invalidate()
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : 'Không thể cập nhật module'),
  })

  const removeModule = useMutation({
    mutationFn: ({ courseId, moduleId }: { courseId: number; moduleId: number }) =>
      adminCoursesApi.deleteModule(courseId, moduleId),
    onSuccess: () => {
      toast.success('Đã xoá module')
      invalidate()
    },
    onError: () => toast.error('Không thể xoá module'),
  })

  const createLesson = useMutation({
    mutationFn: ({
      courseId,
      moduleId,
      payload,
    }: {
      courseId: number
      moduleId: number
      payload: AdminCourseLessonRequest
    }) => adminCoursesApi.createLesson(courseId, moduleId, payload),
    onSuccess: () => {
      toast.success('Đã thêm bài học')
      invalidate()
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : 'Không thể tạo bài học'),
  })

  const updateLesson = useMutation({
    mutationFn: ({
      courseId,
      moduleId,
      lessonId,
      payload,
    }: {
      courseId: number
      moduleId: number
      lessonId: number
      payload: AdminCourseLessonRequest
    }) => adminCoursesApi.updateLesson(courseId, moduleId, lessonId, payload),
    onSuccess: () => {
      toast.success('Đã cập nhật bài học')
      invalidate()
    },
    onError: (e: unknown) =>
      toast.error(e instanceof Error ? e.message : 'Không thể cập nhật bài học'),
  })

  const removeLesson = useMutation({
    mutationFn: ({
      courseId,
      moduleId,
      lessonId,
    }: {
      courseId: number
      moduleId: number
      lessonId: number
    }) => adminCoursesApi.deleteLesson(courseId, moduleId, lessonId),
    onSuccess: () => {
      toast.success('Đã xoá bài học')
      invalidate()
    },
    onError: () => toast.error('Không thể xoá bài học'),
  })

  const toggleExpand = (courseId: number) => {
    setExpandedCourseIds(prev => {
      const next = new Set(prev)
      if (next.has(courseId)) next.delete(courseId)
      else next.add(courseId)
      return next
    })
  }

  const openCreateCourse = () =>
    setCourseDialog({ open: true, mode: 'create', form: EMPTY_COURSE_FORM })

  const openEditCourse = (course: CourseResponse) =>
    setCourseDialog({
      open: true,
      mode: 'edit',
      courseId: course.id,
      form: {
        name: course.name ?? '',
        description: course.description ?? '',
        instructor: course.instructor ?? '',
        thumbnailUrl: course.thumbnailUrl ?? '',
        durationMinutes: course.durationMinutes != null ? String(course.durationMinutes) : '',
      },
    })

  const submitCourseDialog = () => {
    if (!Number.isFinite(certificationId)) return
    if (!courseDialog.form.name.trim()) {
      toast.error('Tên khoá học là bắt buộc')
      return
    }
    const payload = toCoursePayload(certificationId, courseDialog.form)
    if (courseDialog.mode === 'create') {
      createCourse.mutate(payload, {
        onSuccess: () => setCourseDialog(c => ({ ...c, open: false })),
      })
    } else if (courseDialog.courseId != null) {
      updateCourse.mutate(
        { courseId: courseDialog.courseId, payload },
        { onSuccess: () => setCourseDialog(c => ({ ...c, open: false })) }
      )
    }
  }

  const openCreateModule = (courseId: number) =>
    setModuleDialog({
      open: true,
      mode: 'create',
      courseId,
      form: EMPTY_MODULE_FORM,
    })

  const openEditModule = (courseId: number, module: CourseModuleResponse) =>
    setModuleDialog({
      open: true,
      mode: 'edit',
      courseId,
      moduleId: module.id,
      form: {
        title: module.title ?? '',
        description: module.description ?? '',
        orderIndex: module.orderIndex != null ? String(module.orderIndex) : '',
      },
    })

  const submitModuleDialog = () => {
    if (!moduleDialog.form.title.trim() || moduleDialog.courseId == null) {
      toast.error('Tiêu đề module là bắt buộc')
      return
    }
    const payload = toModulePayload(moduleDialog.form)
    const courseId = moduleDialog.courseId
    if (moduleDialog.mode === 'create') {
      createModule.mutate(
        { courseId, payload },
        { onSuccess: () => setModuleDialog(c => ({ ...c, open: false })) }
      )
    } else if (moduleDialog.moduleId != null) {
      updateModule.mutate(
        { courseId, moduleId: moduleDialog.moduleId, payload },
        { onSuccess: () => setModuleDialog(c => ({ ...c, open: false })) }
      )
    }
  }

  const openCreateLesson = (courseId: number, moduleId: number) =>
    setLessonDialog({
      open: true,
      mode: 'create',
      courseId,
      moduleId,
      form: EMPTY_LESSON_FORM,
    })

  const openEditLesson = (
    courseId: number,
    moduleId: number,
    lesson: CourseLessonSummary
  ) =>
    setLessonDialog({
      open: true,
      mode: 'edit',
      courseId,
      moduleId,
      lessonId: lesson.id,
      form: {
        title: lesson.title ?? '',
        description: '',
        content: '',
        videoUrl: '',
        durationMinutes: lesson.durationMinutes != null ? String(lesson.durationMinutes) : '',
        orderIndex: lesson.orderIndex != null ? String(lesson.orderIndex) : '',
        lessonType: (lesson.type as AdminCourseLessonType) ?? 'ARTICLE',
      },
    })

  const submitLessonDialog = () => {
    if (
      !lessonDialog.form.title.trim() ||
      lessonDialog.courseId == null ||
      lessonDialog.moduleId == null
    ) {
      toast.error('Tiêu đề bài học là bắt buộc')
      return
    }
    const payload = toLessonPayload(lessonDialog.form)
    const courseId = lessonDialog.courseId
    const moduleId = lessonDialog.moduleId
    if (lessonDialog.mode === 'create') {
      createLesson.mutate(
        { courseId, moduleId, payload },
        { onSuccess: () => setLessonDialog(c => ({ ...c, open: false })) }
      )
    } else if (lessonDialog.lessonId != null) {
      updateLesson.mutate(
        { courseId, moduleId, lessonId: lessonDialog.lessonId, payload },
        { onSuccess: () => setLessonDialog(c => ({ ...c, open: false })) }
      )
    }
  }

  if (certQuery.isLoading) {
    return <div className="h-40 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
  }
  if (!certQuery.data) {
    return <p className="py-12 text-center text-slate-500">Không tìm thấy chứng chỉ</p>
  }

  const certification = certQuery.data

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to={`/admin/certifications/${id}`}>
          <Button variant="outline" size="sm" className="cursor-pointer">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Quay lại
          </Button>
        </Link>
      </div>

      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">
              Khoá học - {certification.name}
            </CardTitle>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Tạo, chỉnh sửa và publish khoá học (course/module/lesson) cho chứng chỉ này.
            </p>
          </div>
          <Button
            onClick={openCreateCourse}
            className="cursor-pointer bg-primary text-white hover:bg-slate-800"
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm khoá học
          </Button>
        </CardHeader>
      </Card>

      <div className="space-y-3">
        {coursesQuery.isLoading ? (
          <>
            <div className="h-32 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
            <div className="h-32 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700" />
          </>
        ) : courses.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
            Chưa có khoá học nào. Bấm "Thêm khoá học" để bắt đầu.
          </p>
        ) : (
          courses.map(course => {
            const expanded = expandedCourseIds.has(course.id)
            const modules = sortedModules(course.modules ?? [])
            const totalLessons = modules.reduce(
              (sum, m) => sum + (m.lessons?.length ?? 0),
              0
            )
            return (
              <Card key={course.id} className="border-slate-200 dark:border-slate-700">
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-slate-900 dark:text-white">
                        {course.name}
                      </p>
                      {course.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                          {course.description}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                        {course.instructor && (
                          <span className="rounded bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
                            {course.instructor}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Layers className="h-3 w-3" />
                          {modules.length} modules
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          {totalLessons} lessons
                        </span>
                        {course.durationMinutes != null && (
                          <span>{course.durationMinutes} phút</span>
                        )}
                      </div>
                    </div>
                    <Badge className={cn('border-0 text-[11px]', statusBadgeClass(course.published))}>
                      {course.published ? 'PUBLISHED' : 'DRAFT'}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleExpand(course.id)}
                      className="cursor-pointer"
                    >
                      {expanded ? (
                        <>
                          <ChevronUp className="mr-1 h-3.5 w-3.5" />
                          Thu gọn
                        </>
                      ) : (
                        <>
                          <ChevronDown className="mr-1 h-3.5 w-3.5" />
                          Modules & lessons
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditCourse(course)}
                      className="cursor-pointer"
                    >
                      <Pencil className="mr-1 h-3.5 w-3.5" />
                      Sửa
                    </Button>
                    {course.published ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => unpublishCourse.mutate(course.id)}
                        disabled={unpublishCourse.isPending}
                        className="cursor-pointer"
                      >
                        Unpublish
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => publishCourse.mutate(course.id)}
                        disabled={publishCourse.isPending}
                        className="cursor-pointer bg-primary text-white hover:bg-slate-800"
                      >
                        <UploadCloud className="mr-1 h-3.5 w-3.5" />
                        Publish
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (window.confirm(`Xoá khoá học "${course.name}"?`)) {
                          removeCourse.mutate(course.id)
                        }
                      }}
                      disabled={removeCourse.isPending}
                      className="cursor-pointer text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      Xoá
                    </Button>
                  </div>

                  {expanded && (
                    <div className="space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                          Modules
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openCreateModule(course.id)}
                          className="cursor-pointer"
                        >
                          <Plus className="mr-1 h-3.5 w-3.5" />
                          Thêm module
                        </Button>
                      </div>

                      {modules.length === 0 ? (
                        <p className="text-xs italic text-slate-400">
                          Chưa có module nào.
                        </p>
                      ) : (
                        modules.map(module => (
                          <div
                            key={module.id}
                            className="rounded bg-slate-50 p-3 dark:bg-slate-800/60"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-medium text-slate-800 dark:text-slate-200">
                                  #{module.orderIndex} {module.title}
                                </p>
                                {module.description && (
                                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                    {module.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEditModule(course.id, module)}
                                  className="cursor-pointer"
                                >
                                  <Pencil className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    if (window.confirm(`Xoá module "${module.title}"?`)) {
                                      removeModule.mutate({
                                        courseId: course.id,
                                        moduleId: module.id,
                                      })
                                    }
                                  }}
                                  className="cursor-pointer text-red-600 hover:text-red-700"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            <div className="mt-3 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                  Bài học
                                </p>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openCreateLesson(course.id, module.id)}
                                  className="cursor-pointer"
                                >
                                  <Plus className="mr-1 h-3 w-3" />
                                  Thêm bài
                                </Button>
                              </div>
                              {(module.lessons?.length ?? 0) === 0 ? (
                                <p className="text-xs italic text-slate-400">
                                  Chưa có bài học.
                                </p>
                              ) : (
                                sortedLessons(module.lessons).map(lesson => (
                                  <div
                                    key={lesson.id}
                                    className="flex items-center justify-between rounded border border-slate-200 bg-white px-2 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-900"
                                  >
                                    <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                                      #{lesson.orderIndex} {lesson.title}{' '}
                                      <span className="text-slate-400">
                                        ({lesson.type}, {lesson.durationMinutes ?? 0}m)
                                      </span>
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          openEditLesson(course.id, module.id, lesson)
                                        }
                                        className="cursor-pointer h-7 px-2"
                                      >
                                        <Pencil className="h-3 w-3" />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          if (
                                            window.confirm(
                                              `Xoá bài học "${lesson.title}"?`
                                            )
                                          ) {
                                            removeLesson.mutate({
                                              courseId: course.id,
                                              moduleId: module.id,
                                              lessonId: lesson.id,
                                            })
                                          }
                                        }}
                                        className="cursor-pointer text-red-600 hover:text-red-700 h-7 px-2"
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      <Dialog
        open={courseDialog.open}
        onOpenChange={(open: boolean) =>
          setCourseDialog(c => ({ ...c, open }))
        }
      >
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>
              {courseDialog.mode === 'create' ? 'Tạo khoá học' : 'Cập nhật khoá học'}
            </DialogTitle>
            <DialogDescription>
              Nhập thông tin cơ bản. Sau khi tạo có thể thêm modules và bài học.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="course-name">Tên khoá học *</Label>
              <Input
                id="course-name"
                value={courseDialog.form.name}
                onChange={e =>
                  setCourseDialog(c => ({
                    ...c,
                    form: { ...c.form, name: e.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="course-description">Mô tả</Label>
              <Textarea
                id="course-description"
                rows={3}
                value={courseDialog.form.description}
                onChange={e =>
                  setCourseDialog(c => ({
                    ...c,
                    form: { ...c.form, description: e.target.value },
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="course-instructor">Giảng viên</Label>
                <Input
                  id="course-instructor"
                  value={courseDialog.form.instructor}
                  onChange={e =>
                    setCourseDialog(c => ({
                      ...c,
                      form: { ...c.form, instructor: e.target.value },
                    }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="course-duration">Thời lượng (phút)</Label>
                <Input
                  id="course-duration"
                  type="number"
                  min={0}
                  value={courseDialog.form.durationMinutes}
                  onChange={e =>
                    setCourseDialog(c => ({
                      ...c,
                      form: { ...c.form, durationMinutes: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="course-thumbnail">Thumbnail URL</Label>
              <Input
                id="course-thumbnail"
                value={courseDialog.form.thumbnailUrl}
                onChange={e =>
                  setCourseDialog(c => ({
                    ...c,
                    form: { ...c.form, thumbnailUrl: e.target.value },
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCourseDialog(c => ({ ...c, open: false }))}
              className="cursor-pointer"
            >
              Huỷ
            </Button>
            <Button
              onClick={submitCourseDialog}
              disabled={createCourse.isPending || updateCourse.isPending}
              className="cursor-pointer bg-primary text-white hover:bg-slate-800"
            >
              {courseDialog.mode === 'create' ? 'Tạo' : 'Cập nhật'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={moduleDialog.open}
        onOpenChange={(open: boolean) =>
          setModuleDialog(c => ({ ...c, open }))
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {moduleDialog.mode === 'create' ? 'Thêm module' : 'Cập nhật module'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="module-title">Tiêu đề *</Label>
              <Input
                id="module-title"
                value={moduleDialog.form.title}
                onChange={e =>
                  setModuleDialog(c => ({
                    ...c,
                    form: { ...c.form, title: e.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="module-description">Mô tả</Label>
              <Textarea
                id="module-description"
                rows={2}
                value={moduleDialog.form.description}
                onChange={e =>
                  setModuleDialog(c => ({
                    ...c,
                    form: { ...c.form, description: e.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="module-order">Thứ tự (tuỳ chọn)</Label>
              <Input
                id="module-order"
                type="number"
                min={1}
                placeholder="Tự động nếu để trống"
                value={moduleDialog.form.orderIndex}
                onChange={e =>
                  setModuleDialog(c => ({
                    ...c,
                    form: { ...c.form, orderIndex: e.target.value },
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setModuleDialog(c => ({ ...c, open: false }))}
              className="cursor-pointer"
            >
              Huỷ
            </Button>
            <Button
              onClick={submitModuleDialog}
              disabled={createModule.isPending || updateModule.isPending}
              className="cursor-pointer bg-primary text-white hover:bg-slate-800"
            >
              {moduleDialog.mode === 'create' ? 'Tạo' : 'Cập nhật'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={lessonDialog.open}
        onOpenChange={(open: boolean) =>
          setLessonDialog(c => ({ ...c, open }))
        }
      >
        <DialogContent size="lg">
          <DialogHeader>
            <DialogTitle>
              {lessonDialog.mode === 'create' ? 'Thêm bài học' : 'Cập nhật bài học'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="lesson-title">Tiêu đề *</Label>
              <Input
                id="lesson-title"
                value={lessonDialog.form.title}
                onChange={e =>
                  setLessonDialog(c => ({
                    ...c,
                    form: { ...c.form, title: e.target.value },
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="lesson-type">Loại</Label>
                <Select
                  value={lessonDialog.form.lessonType}
                  onValueChange={(value: AdminCourseLessonType) =>
                    setLessonDialog(c => ({
                      ...c,
                      form: { ...c.form, lessonType: value },
                    }))
                  }
                >
                  <SelectTrigger id="lesson-type">
                    <SelectValue placeholder="Chọn loại" />
                  </SelectTrigger>
                  <SelectContent>
                    {LESSON_TYPES.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lesson-duration">Thời lượng (phút)</Label>
                <Input
                  id="lesson-duration"
                  type="number"
                  min={0}
                  value={lessonDialog.form.durationMinutes}
                  onChange={e =>
                    setLessonDialog(c => ({
                      ...c,
                      form: { ...c.form, durationMinutes: e.target.value },
                    }))
                  }
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lesson-description">Mô tả ngắn</Label>
              <Textarea
                id="lesson-description"
                rows={2}
                value={lessonDialog.form.description}
                onChange={e =>
                  setLessonDialog(c => ({
                    ...c,
                    form: { ...c.form, description: e.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lesson-video">Video URL</Label>
              <Input
                id="lesson-video"
                value={lessonDialog.form.videoUrl}
                onChange={e =>
                  setLessonDialog(c => ({
                    ...c,
                    form: { ...c.form, videoUrl: e.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lesson-content">Nội dung (Markdown/HTML)</Label>
              <Textarea
                id="lesson-content"
                rows={6}
                value={lessonDialog.form.content}
                onChange={e =>
                  setLessonDialog(c => ({
                    ...c,
                    form: { ...c.form, content: e.target.value },
                  }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lesson-order">Thứ tự (tuỳ chọn)</Label>
              <Input
                id="lesson-order"
                type="number"
                min={1}
                placeholder="Tự động nếu để trống"
                value={lessonDialog.form.orderIndex}
                onChange={e =>
                  setLessonDialog(c => ({
                    ...c,
                    form: { ...c.form, orderIndex: e.target.value },
                  }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setLessonDialog(c => ({ ...c, open: false }))}
              className="cursor-pointer"
            >
              Huỷ
            </Button>
            <Button
              onClick={submitLessonDialog}
              disabled={createLesson.isPending || updateLesson.isPending}
              className="cursor-pointer bg-primary text-white hover:bg-slate-800"
            >
              {lessonDialog.mode === 'create' ? 'Tạo' : 'Cập nhật'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

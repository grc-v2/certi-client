'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
  PlayCircle,
  Sparkles,
  UploadCloud,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { adminCoursesApi } from '@/lib/api/admin-courses'
import type {
  CourseLessonDetailResponse,
  CourseLessonSummary,
  CourseLessonType,
  CourseModuleResponse,
  CourseResponse,
} from '@/lib/api/courses'

function lessonTypeIcon(type?: CourseLessonType) {
  switch (type) {
    case 'VIDEO':
      return <PlayCircle size={14} />
    case 'QUIZ':
      return <Sparkles size={14} />
    case 'ARTICLE':
    default:
      return <BookOpen size={14} />
  }
}

function PublishBadge({ published }: { published?: boolean }) {
  return published ? (
    <span className="pill brand">Published</span>
  ) : (
    <span className="pill gold">Draft preview</span>
  )
}

function PreviewVideo({ url }: { url: string }) {
  // Detect YouTube/Vimeo embed; fall back to native video tag.
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]+)/
  )
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  const embedUrl = ytMatch
    ? `https://www.youtube.com/embed/${ytMatch[1]}`
    : vimeoMatch
      ? `https://player.vimeo.com/video/${vimeoMatch[1]}`
      : null

  if (embedUrl) {
    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingTop: '56.25%',
          borderRadius: 'var(--radius-sm)',
          overflow: 'hidden',
          background: '#000',
        }}
      >
        <iframe
          src={embedUrl}
          title="Lesson video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            border: 0,
          }}
        />
      </div>
    )
  }

  return (
    <video
      src={url}
      controls
      style={{
        width: '100%',
        borderRadius: 'var(--radius-sm)',
        background: '#000',
      }}
    />
  )
}

interface CoursePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  courseId: number | null
}

export function CoursePreviewDialog({
  open,
  onOpenChange,
  courseId,
}: CoursePreviewDialogProps) {
  const queryClient = useQueryClient()

  const courseQuery = useQuery({
    queryKey: ['admin-course-preview', courseId],
    queryFn: () => adminCoursesApi.getDetail(courseId as number),
    enabled: open && courseId != null,
  })

  const course = courseQuery.data

  const sortedModules = useMemo<CourseModuleResponse[]>(() => {
    if (!course?.modules) return []
    return [...course.modules].sort((a, b) => a.orderIndex - b.orderIndex)
  }, [course])

  const sortedLessons = (m: CourseModuleResponse): CourseLessonSummary[] =>
    [...(m.lessons ?? [])].sort((a, b) => a.orderIndex - b.orderIndex)

  const firstLesson = useMemo<
    | { moduleId: number; lesson: CourseLessonSummary }
    | null
  >(() => {
    for (const m of sortedModules) {
      const list = sortedLessons(m)
      if (list.length > 0) return { moduleId: m.id, lesson: list[0] }
    }
    return null
  }, [sortedModules])

  const [activeLesson, setActiveLesson] = useState<
    | { moduleId: number; lessonId: number }
    | null
  >(null)
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (!open) return
    if (!firstLesson) {
      setActiveLesson(null)
      setExpandedModules(new Set())
      return
    }
    setActiveLesson({
      moduleId: firstLesson.moduleId,
      lessonId: firstLesson.lesson.id,
    })
    setExpandedModules(new Set([firstLesson.moduleId]))
  }, [open, firstLesson])

  const lessonQuery = useQuery<CourseLessonDetailResponse>({
    queryKey: [
      'admin-course-preview-lesson',
      courseId,
      activeLesson?.moduleId,
      activeLesson?.lessonId,
    ],
    queryFn: () =>
      adminCoursesApi.getLessonDetail(
        courseId as number,
        activeLesson!.moduleId,
        activeLesson!.lessonId
      ),
    enabled: open && courseId != null && activeLesson != null,
  })

  const publishMutation = useMutation({
    mutationFn: (id: number) => adminCoursesApi.publish(id),
    onSuccess: updated => {
      toast.success('Đã publish khoá học')
      queryClient.invalidateQueries({ queryKey: ['admin-courses-all'] })
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] })
      queryClient.invalidateQueries({
        queryKey: ['admin-course-preview', updated.id],
      })
    },
    onError: (e: unknown) =>
      toast.error(
        e instanceof Error ? e.message : 'Không thể publish (cần ít nhất 1 module và 1 bài học)'
      ),
  })

  const totalModules = sortedModules.length
  const totalLessons = sortedModules.reduce(
    (sum, m) => sum + (m.lessons?.length ?? 0),
    0
  )
  const canPublish = totalModules > 0 && totalLessons > 0

  const toggleModule = (id: number) =>
    setExpandedModules(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="2xl"
        style={{ padding: 0, overflow: 'hidden', maxHeight: '90vh' }}
      >
        <DialogHeader
          style={{
            padding: '14px 18px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--surface-2)',
          }}
        >
          <DialogTitle>
            <span className="row" style={{ alignItems: 'center', gap: 10 }}>
              <BookOpen size={18} style={{ color: 'var(--brand)' }} />
              Xem trước khoá học
              {course && <PublishBadge published={course.published} />}
            </span>
          </DialogTitle>
        </DialogHeader>

        {courseQuery.isLoading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <p style={{ color: 'var(--ink-3)' }}>Đang tải khoá học...</p>
          </div>
        ) : !course ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <p style={{ color: 'var(--ink-3)' }}>Không tìm thấy khoá học.</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '300px 1fr',
              gap: 0,
              maxHeight: 'calc(90vh - 60px)',
              overflow: 'hidden',
            }}
          >
            {/* Left: curriculum sidebar */}
            <aside
              style={{
                borderRight: '1px solid var(--border)',
                background: 'var(--surface)',
                overflowY: 'auto',
                padding: 14,
              }}
            >
              <div className="col" style={{ gap: 8, marginBottom: 12 }}>
                <span className="eyebrow">Lộ trình</span>
                <p
                  style={{
                    fontSize: 12.5,
                    color: 'var(--ink-3)',
                    margin: 0,
                  }}
                >
                  {totalModules} modules · {totalLessons} bài
                </p>
              </div>

              {sortedModules.length === 0 ? (
                <p
                  style={{
                    fontSize: 12.5,
                    color: 'var(--ink-3)',
                    fontStyle: 'italic',
                  }}
                >
                  Chưa có module.
                </p>
              ) : (
                sortedModules.map(module => {
                  const expanded = expandedModules.has(module.id)
                  const lessons = sortedLessons(module)
                  return (
                    <div
                      key={module.id}
                      style={{ marginBottom: 8 }}
                    >
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="row"
                        style={{
                          width: '100%',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 8,
                          padding: '8px 10px',
                          background: 'var(--surface-2)',
                          border: '1px solid var(--border)',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: 'var(--ink)',
                        }}
                      >
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            minWidth: 0,
                          }}
                        >
                          <Layers
                            size={13}
                            style={{ color: 'var(--ink-3)', flexShrink: 0 }}
                          />
                          <span
                            style={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {module.orderIndex}. {module.title}
                          </span>
                        </span>
                        {expanded ? (
                          <ChevronUp size={14} />
                        ) : (
                          <ChevronDown size={14} />
                        )}
                      </button>
                      {expanded && (
                        <div
                          className="col"
                          style={{ marginTop: 4, gap: 2, paddingLeft: 4 }}
                        >
                          {lessons.length === 0 ? (
                            <p
                              style={{
                                fontSize: 11.5,
                                color: 'var(--ink-3)',
                                fontStyle: 'italic',
                                padding: '6px 10px',
                              }}
                            >
                              Chưa có bài học.
                            </p>
                          ) : (
                            lessons.map(lesson => {
                              const active =
                                activeLesson?.lessonId === lesson.id
                              return (
                                <button
                                  key={lesson.id}
                                  onClick={() =>
                                    setActiveLesson({
                                      moduleId: module.id,
                                      lessonId: lesson.id,
                                    })
                                  }
                                  className="row"
                                  style={{
                                    width: '100%',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '6px 10px',
                                    background: active
                                      ? 'var(--brand-soft, var(--surface-3))'
                                      : 'transparent',
                                    color: active ? 'var(--brand)' : 'var(--ink-2)',
                                    border: 'none',
                                    borderRadius: 'var(--radius-sm)',
                                    cursor: 'pointer',
                                    fontSize: 12.5,
                                    textAlign: 'left',
                                  }}
                                >
                                  {lessonTypeIcon(lesson.type)}
                                  <span
                                    style={{
                                      flex: 1,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    }}
                                  >
                                    {lesson.orderIndex}. {lesson.title}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: 10.5,
                                      color: 'var(--ink-3)',
                                      flexShrink: 0,
                                    }}
                                  >
                                    {lesson.durationMinutes ?? 0}m
                                  </span>
                                </button>
                              )
                            })
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </aside>

            {/* Right: lesson content */}
            <section
              style={{
                overflowY: 'auto',
                padding: 18,
                background: 'var(--paper)',
              }}
            >
              {/* Course header card */}
              <div
                className="card"
                style={{ padding: 16, marginBottom: 14 }}
              >
                <div
                  className="row"
                  style={{
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: 1, minWidth: 240 }}>
                    <span className="eyebrow">{course.certificationName}</span>
                    <h2
                      style={{
                        fontSize: 20,
                        fontWeight: 800,
                        color: 'var(--ink)',
                        margin: '4px 0 6px',
                      }}
                    >
                      {course.name}
                    </h2>
                    {course.description && (
                      <p
                        style={{
                          fontSize: 13.5,
                          color: 'var(--ink-2)',
                          margin: 0,
                          lineHeight: 1.55,
                        }}
                      >
                        {course.description}
                      </p>
                    )}
                    <div
                      className="row"
                      style={{
                        gap: 12,
                        marginTop: 10,
                        flexWrap: 'wrap',
                        color: 'var(--ink-3)',
                        fontSize: 12.5,
                      }}
                    >
                      {course.instructor && (
                        <span
                          className="row"
                          style={{ alignItems: 'center', gap: 4 }}
                        >
                          <User size={13} /> {course.instructor}
                        </span>
                      )}
                      <span
                        className="row"
                        style={{ alignItems: 'center', gap: 4 }}
                      >
                        <Layers size={13} /> {totalModules} modules
                      </span>
                      <span
                        className="row"
                        style={{ alignItems: 'center', gap: 4 }}
                      >
                        <BookOpen size={13} /> {totalLessons} bài
                      </span>
                      {course.durationMinutes != null && (
                        <span
                          className="row"
                          style={{ alignItems: 'center', gap: 4 }}
                        >
                          <Clock size={13} /> {course.durationMinutes} phút
                        </span>
                      )}
                    </div>
                  </div>
                  {course.thumbnailUrl && (
                    <img
                      src={course.thumbnailUrl}
                      alt={course.name}
                      style={{
                        width: 140,
                        height: 88,
                        objectFit: 'cover',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border)',
                      }}
                    />
                  )}
                </div>

                {!course.published && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: 10,
                      background: 'var(--surface-2)',
                      borderRadius: 'var(--radius-sm)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 10,
                      flexWrap: 'wrap',
                    }}
                  >
                    <p
                      style={{
                        fontSize: 12.5,
                        color: 'var(--ink-2)',
                        margin: 0,
                      }}
                    >
                      {canPublish
                        ? 'Khoá học đang ở trạng thái Draft. Bạn có thể publish ngay bây giờ.'
                        : 'Cần ít nhất 1 module và 1 bài học để có thể publish.'}
                    </p>
                    <Button
                      onClick={() => publishMutation.mutate(course.id)}
                      disabled={!canPublish || publishMutation.isPending}
                      className="cursor-pointer bg-primary text-white hover:bg-slate-800"
                      size="sm"
                    >
                      <UploadCloud className="mr-1 h-3.5 w-3.5" />
                      {publishMutation.isPending ? 'Đang publish...' : 'Publish ngay'}
                    </Button>
                  </div>
                )}
              </div>

              {/* Active lesson */}
              {activeLesson ? (
                lessonQuery.isLoading ? (
                  <p
                    style={{
                      color: 'var(--ink-3)',
                      fontSize: 13,
                      textAlign: 'center',
                      padding: 40,
                    }}
                  >
                    Đang tải nội dung bài học...
                  </p>
                ) : lessonQuery.data ? (
                  <LessonPreviewBody lesson={lessonQuery.data} />
                ) : (
                  <p
                    style={{
                      color: 'var(--ink-3)',
                      fontSize: 13,
                      textAlign: 'center',
                      padding: 40,
                    }}
                  >
                    Không tải được nội dung.
                  </p>
                )
              ) : (
                <p
                  style={{
                    color: 'var(--ink-3)',
                    fontSize: 13,
                    textAlign: 'center',
                    padding: 40,
                  }}
                >
                  Chọn một bài học ở thanh bên trái để xem trước.
                </p>
              )}
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function LessonPreviewBody({ lesson }: { lesson: CourseLessonDetailResponse }) {
  return (
    <article className="col" style={{ gap: 14 }}>
      <div>
        <span
          className="row"
          style={{
            alignItems: 'center',
            gap: 6,
            color: 'var(--ink-3)',
            fontSize: 11.5,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '.06em',
          }}
        >
          {lessonTypeIcon(lesson.type)}
          {lesson.type ?? 'ARTICLE'}
          <CheckCircle2
            size={12}
            style={{ marginLeft: 'auto', color: 'var(--easy, var(--brand))' }}
          />
        </span>
        <h3
          style={{
            fontSize: 17,
            fontWeight: 800,
            color: 'var(--ink)',
            margin: '4px 0 4px',
          }}
        >
          {lesson.title}
        </h3>
        {lesson.description && (
          <p
            style={{
              color: 'var(--ink-2)',
              fontSize: 13.5,
              lineHeight: 1.55,
              margin: 0,
            }}
          >
            {lesson.description}
          </p>
        )}
      </div>

      {lesson.videoUrl && <PreviewVideo url={lesson.videoUrl} />}

      {lesson.content && (
        <div
          className="card"
          style={{
            padding: 16,
            background: 'var(--surface)',
            fontSize: 14,
            color: 'var(--ink-2)',
            lineHeight: 1.65,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {lesson.content}
        </div>
      )}

      {!lesson.videoUrl && !lesson.content && (
        <p
          style={{
            color: 'var(--ink-3)',
            fontSize: 12.5,
            fontStyle: 'italic',
          }}
        >
          Bài học chưa có nội dung. Mở dialog "Sửa" để thêm nội dung.
        </p>
      )}
    </article>
  )
}

export type { CoursePreviewDialogProps }
export type CoursePreviewTarget = CourseResponse

import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, CheckCircle2, PlayCircle, BookOpen,
  ChevronLeft, ChevronRight, Menu, X,
} from 'lucide-react'
import { toast } from 'sonner'
import { coursesApi } from '@/lib/api/courses'

export default function CourseLearningPage() {
  const { id, lessonId } = useParams<{ id: string; lessonId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const courseId = Number(id)
  const currentLessonId = Number(lessonId)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data: course, isLoading: isLoadingCourse } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => coursesApi.getCourseById(courseId),
    enabled: !!courseId,
  })

  const { data: lesson, isLoading: isLoadingLesson } = useQuery({
    queryKey: ['course-lesson', courseId, currentLessonId],
    queryFn: () => coursesApi.getCourseLesson(courseId, currentLessonId),
    enabled: !!courseId && !!currentLessonId,
  })

  const { data: enrollments = [] } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: coursesApi.getMyEnrollments,
  })
  const enrollment = enrollments.find(e => e.courseId === courseId)

  const completeMutation = useMutation({
    mutationFn: () => coursesApi.markLessonComplete(courseId, currentLessonId),
    onSuccess: () => {
      toast.success('Đã hoàn thành bài học!')
      queryClient.invalidateQueries({ queryKey: ['course', courseId] })
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] })
      queryClient.invalidateQueries({ queryKey: ['course-lesson', courseId, currentLessonId] })
      if (lesson?.nextLessonId) {
        navigate(`/courses/${courseId}/learn/${lesson.nextLessonId}`)
      }
    },
  })

  if (isLoadingCourse || isLoadingLesson) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)' }}>
        <div className="col" style={{ alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, border: '3px solid var(--surface-3)', borderTopColor: 'var(--brand)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ color: 'var(--ink-2)', fontWeight: 500 }}>Đang tải bài học...</p>
        </div>
      </div>
    )
  }

  if (!course || !lesson) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: 'var(--paper)' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', marginBottom: 14 }}>Không tìm thấy nội dung</h2>
          <button className="btn3d" onClick={() => navigate(`/courses/${courseId}`)}>Quay lại khoá học</button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--paper)', overflow: 'hidden' }}>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,.5)' }}
        />
      )}

      {/* Curriculum sidebar */}
      <div style={{
        width: 288, flexShrink: 0, background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        transition: 'transform .3s',
        ...(typeof window !== 'undefined' && window.innerWidth < 900
          ? {
              position: 'fixed', insetY: 0, left: 0, top: 0, bottom: 0, zIndex: 50,
              transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
            }
          : {}),
      }}>
        {/* Sidebar header */}
        <div style={{
          height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 18px', borderBottom: '1px solid var(--border)', flexShrink: 0,
        }}>
          <Link
            to={`/courses/${courseId}`}
            className="row"
            style={{ gap: 8, alignItems: 'center', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)', textDecoration: 'none', minWidth: 0 }}
          >
            <ArrowLeft size={15} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{course.name}</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="iconbtn"
            style={{ width: 32, height: 32, flexShrink: 0 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Progress */}
        {enrollment && (
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', flexShrink: 0, background: 'var(--surface-2)' }}>
            <div className="row" style={{ justifyContent: 'space-between', fontSize: 11.5, marginBottom: 8 }}>
              <span style={{ color: 'var(--ink-3)', fontWeight: 600 }}>Tiến độ</span>
              <span className="mono" style={{ fontWeight: 700, color: 'var(--brand-deep)' }}>{enrollment.progressPercentage}%</span>
            </div>
            <div className="ch-track" style={{ height: 7 }}>
              <i style={{ width: `${enrollment.progressPercentage}%` }} />
            </div>
          </div>
        )}

        {/* Modules */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 0' }} className="scroll-area">
          {course.modules.slice().sort((a, b) => a.orderIndex - b.orderIndex).map((module, mIdx) => (
            <div key={module.id} style={{ marginBottom: 8 }}>
              <div style={{ padding: '8px 18px 6px' }}>
                <span className="eyebrow" style={{ display: 'block' }}>Phần {mIdx + 1}: {module.title}</span>
              </div>
              <div>
                {module.lessons?.slice().sort((a, b) => a.orderIndex - b.orderIndex).map((l, lIdx) => {
                  const isActive = l.id === currentLessonId
                  return (
                    <Link
                      key={l.id}
                      to={`/courses/${courseId}/learn/${l.id}`}
                      onClick={() => setSidebarOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10,
                        padding: '10px 18px', cursor: 'pointer', textDecoration: 'none',
                        borderLeft: `3px solid ${isActive ? 'var(--brand)' : 'transparent'}`,
                        background: isActive ? 'var(--brand-soft)' : 'transparent',
                        transition: 'background .12s',
                      }}
                      onMouseEnter={e => { if (!isActive) (e.currentTarget.style.background = 'var(--surface-2)') }}
                      onMouseLeave={e => { if (!isActive) (e.currentTarget.style.background = 'transparent') }}
                    >
                      <div style={{ flexShrink: 0, marginTop: 2 }}>
                        {l.isCompleted ? (
                          <CheckCircle2 size={15} style={{ color: 'var(--brand)' }} />
                        ) : l.type === 'VIDEO' ? (
                          <PlayCircle size={15} style={{ color: isActive ? 'var(--brand)' : 'var(--ink-3)' }} />
                        ) : (
                          <BookOpen size={15} style={{ color: isActive ? 'var(--brand)' : 'var(--ink-3)' }} />
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: 13, fontWeight: isActive ? 700 : 500, margin: 0,
                          color: isActive ? 'var(--brand-deep)' : 'var(--ink)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {lIdx + 1}. {l.title}
                        </p>
                        <p className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', margin: 0, marginTop: 2 }}>
                          {l.durationMinutes} phút
                        </p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%' }}>
        {/* Top bar */}
        <header style={{
          height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 22px', borderBottom: '1px solid var(--border)',
          background: 'color-mix(in srgb, var(--surface) 90%, transparent)',
          backdropFilter: 'blur(8px)', flexShrink: 0,
        }}>
          <div className="row" style={{ alignItems: 'center', gap: 12 }}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="iconbtn"
              style={{ display: 'none' }}
              id="learn-menu-btn"
            >
              <Menu size={18} />
            </button>
            <h1 style={{
              fontSize: 16, fontWeight: 700, color: 'var(--ink)', margin: 0,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 400,
            }}>
              {lesson.title}
            </h1>
          </div>
          {!lesson.isCompleted && (
            <button
              className="btn3d sm"
              onClick={() => completeMutation.mutate()}
              disabled={completeMutation.isPending}
            >
              <CheckCircle2 size={15} strokeWidth={2.4} />
              Hoàn thành
            </button>
          )}
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--surface)' }} className="scroll-area">
          <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 26px 48px' }}>
            {/* Video */}
            {lesson.type === 'VIDEO' && lesson.videoUrl && (
              <div style={{ width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: 'var(--radius)', overflow: 'hidden', marginBottom: 32 }}>
                <video
                  src={lesson.videoUrl}
                  controls
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
            )}

            {/* Lesson content */}
            <div
              className="prose"
              style={{ color: 'var(--ink)', lineHeight: 1.75 }}
              dangerouslySetInnerHTML={{ __html: lesson.content.replace(/\n/g, '<br/>') }}
            />

            {/* Mobile complete button */}
            {!lesson.isCompleted && (
              <div id="mobile-complete" style={{ paddingTop: 32, display: 'none' }}>
                <button
                  className="btn3d"
                  style={{ width: '100%' }}
                  onClick={() => completeMutation.mutate()}
                  disabled={completeMutation.isPending}
                >
                  <CheckCircle2 size={17} /> Đánh dấu hoàn thành
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Bottom navigation */}
        <footer style={{
          height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 22px', borderTop: '1px solid var(--border)',
          background: 'var(--surface)', flexShrink: 0,
        }}>
          <button
            className="btn3d ghost sm"
            disabled={!lesson.prevLessonId}
            onClick={() => navigate(`/courses/${courseId}/learn/${lesson.prevLessonId}`)}
          >
            <ChevronLeft size={16} /> Bài trước
          </button>
          <button
            className="btn3d sm"
            disabled={!lesson.nextLessonId}
            onClick={() => navigate(`/courses/${courseId}/learn/${lesson.nextLessonId}`)}
          >
            Bài tiếp <ChevronRight size={16} />
          </button>
        </footer>
      </div>
    </div>
  )
}

import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft, BookOpen, Clock, PlayCircle, Lock,
  CheckCircle2, AlertCircle, ChevronRight,
} from 'lucide-react'
import { toast } from 'sonner'
import { coursesApi } from '@/lib/api/courses'

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const courseId = Number(id)

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => coursesApi.getCourseById(courseId),
    enabled: !!courseId,
  })

  const { data: enrollments = [] } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: coursesApi.getMyEnrollments,
  })

  const enrollment = enrollments.find(e => e.courseId === courseId)
  const isEnrolled = !!enrollment

  const enrollMutation = useMutation({
    mutationFn: (cId: number) => coursesApi.enrollCourse(cId),
    onSuccess: () => {
      toast.success('Đăng ký khoá học thành công!')
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] })
      queryClient.invalidateQueries({ queryKey: ['course', courseId] })
    },
    onError: () => toast.error('Có lỗi xảy ra, vui lòng thử lại sau.'),
  })

  if (isLoading) {
    return (
      <div className="col" style={{ gap: 18 }}>
        <div style={{ height: 280, background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: 28, width: '40%', background: 'var(--surface-2)', borderRadius: 8, animation: 'pulse 1.5s ease-in-out infinite' }} />
        <div style={{ height: 16, width: '70%', background: 'var(--surface-2)', borderRadius: 6, animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="card" style={{ padding: 56, textAlign: 'center' }}>
        <AlertCircle size={40} style={{ color: 'var(--hard)', margin: '0 auto 14px' }} />
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', marginBottom: 12 }}>
          Không tìm thấy khoá học
        </h2>
        <button className="btn3d" onClick={() => navigate('/courses')}>
          Quay lại danh sách
        </button>
      </div>
    )
  }

  const orderedLessons = course.modules
    .slice().sort((a, b) => a.orderIndex - b.orderIndex)
    .flatMap(m => m.lessons.slice().sort((a, b) => a.orderIndex - b.orderIndex))
  const continueLessonId = orderedLessons.find(l => !l.isCompleted)?.id ?? orderedLessons[0]?.id

  return (
    <div className="col" style={{ gap: 22, paddingBottom: 32 }}>
      {/* Back */}
      <Link
        to="/courses"
        className="row"
        style={{ gap: 8, alignItems: 'center', fontSize: 13.5, fontWeight: 600, color: 'var(--ink-3)', textDecoration: 'none', width: 'fit-content' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-3)')}
      >
        <ArrowLeft size={16} /> Quay lại Khoá học
      </Link>

      {/* Hero */}
      <div className="card enter" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Thumbnail */}
        <div style={{ height: 220, position: 'relative', background: 'var(--surface-3)', overflow: 'hidden' }}>
          {course.thumbnailUrl ? (
            <img src={course.thumbnailUrl} alt={course.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={48} style={{ color: 'var(--ink-3)' }} />
            </div>
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.75) 0%, transparent 60%)' }} />

          <div style={{ position: 'absolute', bottom: 22, left: 26, right: 26 }}>
            <span className="codechip" style={{ marginBottom: 10, display: 'inline-block', background: 'rgba(255,255,255,.15)', color: '#fff', borderColor: 'rgba(255,255,255,.3)' }}>
              {course.certificationName}
            </span>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 6 }}>
              {course.name}
            </h1>
            {course.description && (
              <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.8)', lineHeight: 1.5, maxWidth: 600 }}>
                {course.description}
              </p>
            )}
          </div>
        </div>

        {/* Stats + CTA */}
        <div className="row" style={{ padding: '20px 26px', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div className="row" style={{ gap: 22, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="row" style={{ gap: 7, alignItems: 'center', fontSize: 13.5, color: 'var(--ink-2)' }}>
              <BookOpen size={17} style={{ color: 'var(--brand)' }} />
              <strong style={{ color: 'var(--ink)' }} className="mono">{course.totalLessons}</strong> bài học
            </span>
            <span className="row" style={{ gap: 7, alignItems: 'center', fontSize: 13.5, color: 'var(--ink-2)' }}>
              <Clock size={17} style={{ color: 'var(--brand)' }} />
              <strong style={{ color: 'var(--ink)' }} className="mono">{Math.round(course.durationMinutes / 60)}</strong> giờ
            </span>
          </div>

          {isEnrolled ? (
            <div className="row" style={{ gap: 14, alignItems: 'center', flex: '1 1 240px', minWidth: 0 }}>
              <div className="col" style={{ flex: 1, gap: 6 }}>
                <div className="row" style={{ justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-3)' }}>
                  <span>Tiến độ của bạn</span>
                  <span className="mono" style={{ fontWeight: 700, color: 'var(--brand-deep)' }}>{enrollment.progressPercentage}%</span>
                </div>
                <div className="ch-track" style={{ height: 8 }}>
                  <i style={{ width: `${enrollment.progressPercentage}%` }} />
                </div>
              </div>
              <button
                className="btn3d"
                onClick={() => continueLessonId && navigate(`/courses/${courseId}/learn/${continueLessonId}`)}
                disabled={!continueLessonId}
                style={{ flexShrink: 0 }}
              >
                Tiếp tục học <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <button
              className="btn3d"
              onClick={() => enrollMutation.mutate(course.id)}
              disabled={enrollMutation.isPending}
            >
              {enrollMutation.isPending ? 'Đang xử lý...' : 'Đăng ký học ngay'}
            </button>
          )}
        </div>
      </div>

      {/* Curriculum */}
      <div className="col" style={{ gap: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>Nội dung khoá học</h2>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {course.modules.slice().sort((a, b) => a.orderIndex - b.orderIndex).map((module, mIdx) => (
            <div key={module.id} style={{ borderTop: mIdx > 0 ? '1px solid var(--border)' : 'none' }}>
              {/* Module header */}
              <div style={{ padding: '16px 22px 12px', background: 'var(--surface-2)' }}>
                <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span className="eyebrow" style={{ marginBottom: 4, display: 'block' }}>Phần {mIdx + 1}</span>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>{module.title}</h3>
                    {module.description && (
                      <p style={{ fontSize: 12.5, color: 'var(--ink-3)', marginTop: 3 }}>{module.description}</p>
                    )}
                  </div>
                  <span className="codechip">{module.lessonsCount} bài</span>
                </div>
              </div>

              {/* Lessons list */}
              <div style={{ paddingLeft: 22, paddingRight: 22 }}>
                {module.lessons && module.lessons.length > 0 ? (
                  module.lessons.slice().sort((a, b) => a.orderIndex - b.orderIndex).map((l, lIdx) => {
                    const content = (
                      <div
                        className="row"
                        style={{
                          padding: '11px 0', alignItems: 'center', gap: 12,
                          borderTop: lIdx > 0 ? '1px solid var(--border)' : 'none',
                          cursor: isEnrolled ? 'pointer' : 'default',
                          transition: 'background .12s',
                        }}
                      >
                        <div style={{ flexShrink: 0 }}>
                          {l.isCompleted ? (
                            <CheckCircle2 size={17} style={{ color: 'var(--brand)' }} />
                          ) : l.type === 'VIDEO' ? (
                            <PlayCircle size={17} style={{ color: isEnrolled ? 'var(--ink-3)' : 'var(--border-2)' }} />
                          ) : (
                            <BookOpen size={17} style={{ color: isEnrolled ? 'var(--ink-3)' : 'var(--border-2)' }} />
                          )}
                        </div>
                        <span style={{
                          flex: 1, fontSize: 13.5, fontWeight: 500,
                          color: l.isCompleted ? 'var(--ink-3)' : isEnrolled ? 'var(--ink)' : 'var(--ink-2)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          Bài {lIdx + 1}: {l.title}
                        </span>
                        <div className="row" style={{ gap: 8, alignItems: 'center', flexShrink: 0 }}>
                          <span className="mono" style={{ fontSize: 12, color: 'var(--ink-3)' }}>{l.durationMinutes}ph</span>
                          {!isEnrolled && <Lock size={14} style={{ color: 'var(--border-2)' }} />}
                        </div>
                      </div>
                    )

                    return isEnrolled ? (
                      <Link
                        key={l.id}
                        to={`/courses/${courseId}/learn/${l.id}`}
                        style={{ display: 'block', textDecoration: 'none' }}
                        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = 'var(--surface-2)')}
                        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                      >
                        {content}
                      </Link>
                    ) : (
                      <div key={l.id}>{content}</div>
                    )
                  })
                ) : (
                  <p style={{ fontSize: 13, color: 'var(--ink-3)', padding: '12px 0', fontStyle: 'italic' }}>
                    Chưa có bài học nào trong phần này.
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

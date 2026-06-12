import { Link } from 'react-router-dom'
import { BookOpen, Clock, Users, ArrowRight, CheckCircle2 } from 'lucide-react'
import { type CourseResponse, type CourseEnrollmentResponse } from '@/lib/api/courses'

interface CourseCardProps {
  course: CourseResponse
  enrollment?: CourseEnrollmentResponse
  index?: number
}

export function CourseCard({ course, enrollment, index = 0 }: CourseCardProps) {
  const isEnrolled = !!enrollment
  const enterClass = `enter enter-${Math.min(index + 1, 5)}`

  return (
    <Link
      to={`/courses/${course.id}`}
      className={`card ${enterClass}`}
      style={{
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        textDecoration: 'none', transition: 'transform .12s, box-shadow .12s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-lg)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = 'none'
        ;(e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: 'relative', height: 160, background: 'var(--surface-3)', overflow: 'hidden', flexShrink: 0 }}>
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .5s', display: 'block' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={40} style={{ color: 'var(--ink-3)' }} />
          </div>
        )}

        {/* Gradient overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,.5), transparent)' }} />

        {isEnrolled && (
          <div style={{ position: 'absolute', top: 10, left: 10 }}>
            <span className="pill brand" style={{ padding: '3px 9px', fontSize: 10.5 }}>
              <CheckCircle2 size={11} strokeWidth={3} /> Đang học
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: '16px 18px 0' }}>
        <div style={{ marginBottom: 8 }}>
          <span className="codechip" style={{ fontSize: 11 }}>{course.certificationName}</span>
        </div>
        <h3 style={{
          fontSize: 16, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.35,
          marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {course.name}
        </h3>
        {course.description && (
          <p style={{
            fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.5, marginBottom: 12,
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
          }}>
            {course.description}
          </p>
        )}
        <div className="row" style={{ gap: 13, flexWrap: 'wrap' }}>
          <span className="row" style={{ gap: 5, alignItems: 'center', fontSize: 12, color: 'var(--ink-3)' }}>
            <BookOpen size={13} />
            <span className="mono">{course.totalLessons}</span> bài học
          </span>
          <span className="row" style={{ gap: 5, alignItems: 'center', fontSize: 12, color: 'var(--ink-3)' }}>
            <Clock size={13} />
            <span className="mono">{Math.round(course.durationMinutes / 60)}</span> giờ
          </span>
          {!isEnrolled && (
            <span className="row" style={{ gap: 5, alignItems: 'center', fontSize: 12, color: 'var(--ink-3)' }}>
              <Users size={13} />
              <span className="mono">{course.enrolledCount}</span>
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="row" style={{
        padding: '13px 18px', marginTop: 14, alignItems: 'center', justifyContent: 'space-between',
        gap: 10, borderTop: '1px solid var(--border)', background: 'var(--surface-2)',
      }}>
        {isEnrolled ? (
          <div className="col" style={{ gap: 6, flex: 1 }}>
            <div className="row" style={{ justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-3)' }}>
              <span>Tiến độ</span>
              <span className="mono" style={{ fontWeight: 700, color: 'var(--brand-deep)' }}>
                {enrollment.progressPercentage}%
              </span>
            </div>
            <div className="ch-track" style={{ height: 7 }}>
              <i style={{ width: `${enrollment.progressPercentage}%` }} />
            </div>
          </div>
        ) : (
          <button className="btn3d sm" style={{ flex: 1 }}>
            Xem khoá học <ArrowRight size={14} strokeWidth={2.4} />
          </button>
        )}
      </div>
    </Link>
  )
}

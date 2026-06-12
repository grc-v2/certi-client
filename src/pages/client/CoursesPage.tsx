import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, Search, Compass, BookMarked } from 'lucide-react'
import { CourseCard } from '@/components/course/CourseCard'
import { coursesApi } from '@/lib/api/courses'

type Tab = 'my-courses' | 'explore'

export default function CoursesPage() {
  const [tab, setTab] = useState<Tab>('my-courses')
  const [search, setSearch] = useState('')

  const { data: enrollments = [], isLoading: isLoadingEnrollments } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: coursesApi.getMyEnrollments,
  })

  const { data: allCourses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ['available-courses'],
    queryFn: () => coursesApi.getAvailableCourses(),
  })

  const filteredCourses = allCourses.filter(c =>
    !search.trim() ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.certificationName.toLowerCase().includes(search.toLowerCase())
  )

  const isLoading = tab === 'my-courses' ? isLoadingEnrollments : isLoadingCourses
  const TABS: { key: Tab; label: string; icon: typeof BookOpen }[] = [
    { key: 'my-courses', label: 'Khoá học của tôi', icon: BookMarked },
    { key: 'explore',    label: 'Khám phá',         icon: Compass    },
  ]

  return (
    <div className="col" style={{ gap: 20 }}>
      {/* Header */}
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <span className="eyebrow">Học tập</span>
          <h1 style={{ fontSize: 25, fontWeight: 800, color: 'var(--ink)', marginTop: 6 }}>Khoá học</h1>
          <p style={{ fontSize: 14, color: 'var(--ink-2)', marginTop: 6 }}>
            Học theo lộ trình bài bản — video, bài đọc và bài tập theo từng chứng chỉ.
          </p>
        </div>
      </div>

      {/* Search + Tabs toolbar */}
      <div className="card enter" style={{ padding: '14px 16px' }}>
        <div className="row" style={{ gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search */}
          <div className="row" style={{
            alignItems: 'center', gap: 9, padding: '0 13px', height: 42,
            borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)',
            border: '1px solid var(--border)', flex: '1 1 200px',
          }}>
            <Search size={17} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Tìm khoá học…"
              style={{
                border: 'none', background: 'transparent', outline: 'none',
                color: 'var(--ink)', fontSize: 13.5, width: '100%',
                fontFamily: 'var(--font-body)',
              }}
            />
          </div>

          {/* Tab switcher */}
          <div className="row" style={{ gap: 4, padding: 4, borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            {TABS.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="row"
                style={{
                  gap: 7, alignItems: 'center',
                  padding: '8px 14px', borderRadius: 9, border: 'none', cursor: 'pointer',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13,
                  background: tab === t.key ? 'var(--surface)' : 'transparent',
                  color: tab === t.key ? 'var(--ink)' : 'var(--ink-3)',
                  boxShadow: tab === t.key ? 'var(--shadow-sm)' : 'none',
                  transition: 'all .12s',
                }}
              >
                <t.icon size={15} strokeWidth={2} />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="card" style={{ height: 320 }}>
              <div style={{ height: 160, background: 'var(--surface-2)', borderRadius: 'var(--radius) var(--radius) 0 0', animation: 'pulse 1.5s ease-in-out infinite' }} />
              <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ height: 12, width: '40%', background: 'var(--surface-2)', borderRadius: 6, animation: 'pulse 1.5s ease-in-out infinite' }} />
                <div style={{ height: 16, width: '80%', background: 'var(--surface-2)', borderRadius: 6, animation: 'pulse 1.5s ease-in-out infinite' }} />
              </div>
            </div>
          ))}
        </div>
      ) : tab === 'my-courses' ? (
        enrollments.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {enrollments.map((enrollment, i) => (
              <CourseCard key={enrollment.id} course={enrollment.course} enrollment={enrollment} index={i} />
            ))}
          </div>
        ) : (
          <div className="card" style={{ padding: '56px 24px', textAlign: 'center', color: 'var(--ink-3)' }}>
            <div className="itile" style={{ width: 64, height: 64, background: 'var(--surface-2)', margin: '0 auto 16px' }}>
              <BookOpen size={30} style={{ color: 'var(--ink-3)' }} />
            </div>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink-2)', marginBottom: 8 }}>
              Bạn chưa tham gia khoá học nào
            </h3>
            <p style={{ fontSize: 13.5, color: 'var(--ink-3)', marginBottom: 20 }}>
              Khám phá các khoá học để bắt đầu hành trình học tập của bạn.
            </p>
            <button className="btn3d" onClick={() => setTab('explore')}>
              <Compass size={16} /> Khám phá khoá học
            </button>
          </div>
        )
      ) : filteredCourses.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {filteredCourses.map((course, i) => (
            <CourseCard key={course.id} course={course} index={i} />
          ))}
        </div>
      ) : (
        <div className="card" style={{ padding: 56, textAlign: 'center', color: 'var(--ink-3)' }}>
          <Search size={30} style={{ marginBottom: 10 }} />
          <p style={{ fontWeight: 600, color: 'var(--ink-2)' }}>Không tìm thấy khoá học phù hợp</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Thử thay đổi từ khóa tìm kiếm</p>
        </div>
      )}
    </div>
  )
}

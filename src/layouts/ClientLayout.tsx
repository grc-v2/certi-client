import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { TopNav } from '@/components/layout/top-nav'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { useAuthStore } from '@/store/auth-store'

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Tổng quan',
  '/certifications': 'Chứng chỉ',
  '/certifications/exam-history': 'Lịch sử thi',
  '/courses': 'Khoá học',
  '/practice': 'Luyện tập',
  '/practice/free': 'Luyện tập tự do',
  '/practice/exam': 'Thi thử',
  '/practice/exam-sim': 'Thi thử',
  '/practice/flashcard': 'Flashcard',
  '/practice/weakness': 'Khắc phục điểm yếu',
  '/community': 'Cộng đồng',
  '/bookmarks': 'Đã lưu',
  '/notifications': 'Thông báo',
}

function getTitle(pathname: string): string {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname]
  if (pathname.startsWith('/certifications/results/')) return 'Chi tiết kết quả'
  if (pathname.startsWith('/certifications/')) return 'Chi tiết chứng chỉ'
  if (pathname.startsWith('/courses/')) return 'Chi tiết khoá học'
  if (pathname.startsWith('/community/')) return 'Bài viết'
  if (pathname.startsWith('/profile/')) return 'Hồ sơ'
  return ''
}

export default function ClientLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isAuthenticated) {
      const target = `${location.pathname}${location.search}`
      navigate(`/login?redirect=${encodeURIComponent(target)}`, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  if (!isAuthenticated) return null

  const title = getTitle(location.pathname)

  return (
    <div className="shell">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main">
        <TopNav
          title={title}
          sidebarOpen={sidebarOpen}
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="content scroll-area">
          <div className="content-inner">
            <Outlet />
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  )
}

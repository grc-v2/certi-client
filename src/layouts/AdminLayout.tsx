import { useState, useEffect } from 'react'
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth-store'
import {
  LayoutDashboard, Users, GraduationCap, Sparkles, BookOpen,
  FileText, Bell, ClipboardList, Menu, X, Sun, Moon,
  ArrowLeft,
} from 'lucide-react'

const adminNavItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Tổng quan' },
  { href: '/admin/users', icon: Users, label: 'Học viên' },
  { href: '/admin/certifications', icon: GraduationCap, label: 'Chứng chỉ' },
  { href: '/admin/courses', icon: BookOpen, label: 'Khoá học' },
  { href: '/admin/questions', icon: Sparkles, label: 'Câu hỏi' },
  { href: '/admin/posts', icon: FileText, label: 'Bài viết' },
  { href: '/admin/notifications', icon: Bell, label: 'Thông báo' },
  { href: '/admin/audit', icon: ClipboardList, label: 'Nhật ký' },
]

const ROUTE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Tổng quan hệ thống',
  '/admin/users': 'Học viên',
  '/admin/certifications': 'Chứng chỉ',
  '/admin/courses': 'Khoá học',
  '/admin/questions': 'Ngân hàng đề',
  '/admin/posts': 'Bài viết',
  '/admin/notifications': 'Thông báo',
  '/admin/audit': 'Nhật ký hoạt động',
}

function getTitle(pathname: string): string {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname]
  for (const [key, val] of Object.entries(ROUTE_TITLES)) {
    if (pathname.startsWith(key + '/')) return val
  }
  return 'Admin'
}

export function StatusPill({ status }: { status: string }) {
  if (status === 'ACTIVE' || status === 'PUBLISHED') {
    return <span className="pill brand">{status === 'ACTIVE' ? 'Hoạt động' : 'Published'}</span>
  }
  if (status === 'INACTIVE' || status === 'BANNED') {
    return <span className="pill hard">{status === 'INACTIVE' ? 'Vô hiệu' : 'Banned'}</span>
  }
  if (status === 'PENDING_REVIEW' || status === 'IN_REVIEW' || status === 'PENDING') {
    return <span className="pill gold">{status === 'PENDING_REVIEW' ? 'Chờ duyệt' : status === 'IN_REVIEW' ? 'Đang duyệt' : 'Pending'}</span>
  }
  if (status === 'DRAFT') {
    return <span className="pill" style={{ background: 'var(--surface-3)', color: 'var(--ink-3)' }}>Draft</span>
  }
  return <span className="pill" style={{ background: 'var(--surface-3)', color: 'var(--ink-3)' }}>{status}</span>
}

export function RolePill({ role }: { role: string }) {
  if (role === 'ADMIN') {
    return <span className="pill violet">Admin</span>
  }
  return <span className="pill" style={{ background: 'var(--surface-3)', color: 'var(--ink-2)' }}>User</span>
}

export default function AdminLayout() {
  const { user, isAuthenticated, isAdmin } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const pathname = location.pathname
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  useEffect(() => {
    if (!isAuthenticated) {
      const target = `${location.pathname}${location.search}`
      navigate(`/login?redirect=${encodeURIComponent(target)}`, { replace: true })
    } else if (!isAdmin()) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, isAdmin, navigate, location])

  if (!isAuthenticated || !isAdmin()) return null

  const initials =
    user?.fullName
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'A'

  const title = getTitle(pathname)

  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark')
    setDark(isDark)
  }

  const SidebarContent = () => (
    <>
      {/* Brandmark */}
      <div className="brandmark">
        <div className="glyph">C</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: 'var(--ink)', letterSpacing: '-0.02em' }}>Certi Hub</div>
        </div>
        <span className="pill violet" style={{ fontSize: 10, padding: '2px 8px', letterSpacing: '.06em' }}>QUẢN TRỊ</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }} className="scroll-area">
        {adminNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`navlink${isActive ? ' active' : ''}`}
            >
              <item.icon size={18} strokeWidth={2} style={{ flexShrink: 0 }} />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Bottom warning + back link */}
      <div style={{ paddingTop: 14 }}>
        <div className="card" style={{ padding: '12px 14px', background: 'var(--gold-soft)', borderColor: 'var(--gold-deep)', marginBottom: 10 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--gold-deep)', marginBottom: 4 }}>Cẩn trọng</p>
          <p style={{ fontSize: 11, color: 'var(--ink-2)', lineHeight: 1.5 }}>Cẩn trọng khi thay đổi dữ liệu hệ thống.</p>
        </div>
        <Link
          to="/dashboard"
          className="navlink"
          style={{ justifyContent: 'center', gap: 8 }}
        >
          <ArrowLeft size={15} />
          <span style={{ fontSize: 13 }}>← Về giao diện học viên</span>
        </Link>
      </div>
    </>
  )

  return (
    <div className="shell">
      {/* Desktop sidebar */}
      <aside className="sidebar admin-sidebar" style={{ display: undefined }}>
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,.45)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile drawer — uses admin-sidebar class for theme but NOT .sidebar (which is hidden on mobile) */}
      <aside
        className="admin-sidebar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 60,
          width: 'var(--nav-w)',
          flexShrink: 0,
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          padding: '18px 14px',
          gap: 4,
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-110%)',
          transition: 'transform .25s cubic-bezier(.16,1,.3,1)',
        }}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="iconbtn"
          style={{ position: 'absolute', top: 14, right: 14, width: 32, height: 32 }}
        >
          <X size={16} />
        </button>
        <SidebarContent />
      </aside>

      <div className="main">
        {/* Topbar */}
        <div className="topbar">
          <button
            id="admin-menu-btn"
            className="iconbtn"
            style={{ width: 36, height: 36 }}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={18} />
          </button>
          <h2 style={{ flex: 1, fontSize: 18, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.02em' }}>{title}</h2>

          {/* Search */}
          <div
            className="admin-topbar-search row"
            style={{ alignItems: 'center', gap: 8, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '6px 12px', minWidth: 220 }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ color: 'var(--ink-3)', flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              placeholder="Tìm kiếm..."
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13.5, color: 'var(--ink)', width: '100%', fontFamily: 'var(--font-body)' }}
            />
          </div>

          {/* Bell */}
          <button className="iconbtn" style={{ width: 36, height: 36 }}>
            <Bell size={17} />
          </button>

          {/* Theme toggle */}
          <button className="iconbtn" style={{ width: 36, height: 36 }} onClick={toggleTheme}>
            {dark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* User avatar pill */}
          <div
            className="itile row"
            style={{ gap: 8, padding: '5px 10px 5px 5px', background: 'var(--violet-soft)', borderRadius: 'var(--radius-sm)', cursor: 'default' }}
          >
            <div
              className="itile"
              style={{ width: 28, height: 28, background: 'var(--violet)', color: '#fff', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12 }}
            >
              {initials}
            </div>
            <div className="col" style={{ gap: 0 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.2 }}>{user?.fullName}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--violet)' }}>Admin</span>
            </div>
          </div>
        </div>

        <div className="content scroll-area">
          <div className="content-inner">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}

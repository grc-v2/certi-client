import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, GraduationCap, Dumbbell, BarChart2,
  Users, Settings, LogOut, User, Zap, Trophy, BookOpen
} from 'lucide-react'
import { Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/store/auth-store'
import { useAppTheme } from '@/providers/theme-provider'

const NAV_ITEMS = [
  { href: '/dashboard',                   icon: LayoutDashboard, label: 'Tổng quan' },
  { href: '/certifications',              icon: GraduationCap,   label: 'Chứng chỉ' },
  { href: '/courses',                     icon: BookOpen,        label: 'Khoá học'   },
  { href: '/practice',                    icon: Dumbbell,        label: 'Luyện tập'  },
  { href: '/certifications/exam-history', icon: BarChart2,       label: 'Kết quả'   },
  { href: '/community',                   icon: Users,           label: 'Cộng đồng'  },
]

const NAV_PARENT: Record<string, string> = {
  '/certifications/exam-history': '/certifications/exam-history',
}

function isActive(pathname: string, href: string): boolean {
  if (href === '/certifications' && (pathname.startsWith('/certifications/exam-history') || pathname.startsWith('/certifications/results'))) return false
  if (href === '/certifications') return pathname === '/certifications' || (pathname.startsWith('/certifications/') && !pathname.startsWith('/certifications/exam-history') && !pathname.startsWith('/certifications/results'))
  return pathname === href || pathname.startsWith(href + '/')
}

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const pathname = location.pathname
  const navigate = useNavigate()
  const { resolvedTheme } = useAppTheme()
  const { user, logout, isAdmin } = useAuthStore()

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      logout()
      navigate('/login')
    },
  })

  const initials =
    user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

  const dropdownItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div className="px-1 py-1 min-w-[160px]">
          <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)', margin: 0 }}>{user?.fullName}</p>
          <p style={{ fontSize: 11, color: 'var(--ink-3)', margin: 0 }}>{user?.email}</p>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'profile',
      label: 'Trang cá nhân',
      icon: <User className="w-4 h-4" />,
      onClick: () => { navigate('/profile/me'); onClose() },
    },
    ...(isAdmin() ? [
      { type: 'divider' as const },
      {
        key: 'admin',
        label: <span style={{ color: 'var(--brand)', fontWeight: 600 }}>Admin Panel</span>,
        icon: <Settings className="w-4 h-4" style={{ color: 'var(--brand)' }} />,
        onClick: () => { navigate('/admin/dashboard'); onClose() },
      },
    ] : []),
    { type: 'divider' },
    {
      key: 'logout',
      label: <span style={{ color: 'var(--hard)', fontWeight: 600 }}>Đăng xuất</span>,
      icon: <LogOut className="w-4 h-4" style={{ color: 'var(--hard)' }} />,
      onClick: () => logoutMutation.mutate(),
    },
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 30,
            background: 'rgba(0,0,0,0.5)', display: 'block',
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className="sidebar"
        style={{
          transform: isOpen ? 'translateX(0)' : undefined,
          position: isOpen ? 'fixed' : undefined,
          top: isOpen ? 0 : undefined,
          bottom: isOpen ? 0 : undefined,
          left: isOpen ? 0 : undefined,
          zIndex: isOpen ? 40 : undefined,
        }}
      >
        {/* Brandmark */}
        <div className="brandmark">
          <div className="glyph">C</div>
          <div className="col" style={{ gap: 1 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: 'var(--ink)', letterSpacing: '-.02em' }}>
              Certi Hub
            </span>
            <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)' }}>Exam Prep</span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="col" style={{ gap: 3, flex: 1 }}>
          {NAV_ITEMS.map(item => {
            const active = isActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className={`navlink${active ? ' active' : ''}`}
                style={{ textDecoration: 'none' }}
              >
                <item.icon size={20} strokeWidth={active ? 2.3 : 2} />
                {item.label}
              </Link>
            )
          })}

          {isAdmin() && (
            <Link
              to="/admin/dashboard"
              onClick={onClose}
              className="navlink"
              style={{ textDecoration: 'none', marginTop: 4 }}
            >
              <Settings size={20} strokeWidth={2} />
              Quản trị
            </Link>
          )}
        </nav>

        {/* Daily goal + user at bottom */}
        <div className="col" style={{ gap: 8, marginTop: 'auto' }}>
          {/* XP goal card */}
          <div className="card" style={{ padding: '14px 14px', boxShadow: 'none', background: 'var(--surface-2)' }}>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}>
              <span className="eyebrow">Mục tiêu hôm nay</span>
              <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand-deep)' }}>
                80/100 XP
              </span>
            </div>
            <div className="ch-track" style={{ height: 8 }}>
              <i style={{ width: '80%' }} />
            </div>
            <div className="row" style={{ gap: 6, marginTop: 9, alignItems: 'center' }}>
              <Zap size={13} style={{ color: 'var(--gold)' }} />
              <span style={{ fontSize: 11.5, color: 'var(--ink-2)' }}>Còn 20 XP nữa là đạt!</span>
            </div>
          </div>

          {/* User profile */}
          <Dropdown menu={{ items: dropdownItems }} placement="topLeft" trigger={['click']}>
            <div className="navlink" style={{ cursor: 'pointer' }}>
              <div
                className="itile"
                style={{
                  width: 34, height: 34, background: 'var(--brand)', color: '#fff',
                  fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 14, borderRadius: 10,
                }}
              >
                {user?.avatarUrl
                  ? <img src={user.avatarUrl} alt={initials} style={{ width: '100%', height: '100%', borderRadius: 10, objectFit: 'cover' }} />
                  : initials
                }
              </div>
              <div className="col" style={{ minWidth: 0 }}>
                <span style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.fullName || 'Người dùng'}
                </span>
                <span style={{ fontSize: 11, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Trophy size={11} style={{ color: 'var(--gold)' }} /> Vàng
                </span>
              </div>
            </div>
          </Dropdown>
        </div>
      </aside>
    </>
  )
}

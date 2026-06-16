import { useNavigate, Link, useLocation } from 'react-router-dom'
import {
  Bell, Sun, Moon, LogOut, User, Settings, ChevronDown,
  LayoutDashboard, GraduationCap, Dumbbell, BarChart2, Newspaper, Library, Repeat,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/store/auth-store'
import { useAppTheme } from '@/providers/theme-provider'

interface NavLeaf { href: string; icon: LucideIcon; label: string }
interface NavGroup { label: string; icon: LucideIcon; children: NavLeaf[] }
type NavEntry = NavLeaf | NavGroup

const isGroup = (e: NavEntry): e is NavGroup => 'children' in e

// "Ôn thi" gom các mục liên quan của mục tiêu Mock exam (chứng chỉ → luyện tập → kết quả).
const NAV_ITEMS: NavEntry[] = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Tracker' },
  { href: '/habits',    icon: Repeat,          label: 'Thói quen' },
  {
    label: 'Ôn thi', icon: GraduationCap,
    children: [
      { href: '/certifications',              icon: GraduationCap, label: 'Chứng chỉ' },
      { href: '/practice',                    icon: Dumbbell,      label: 'Luyện tập' },
      { href: '/certifications/exam-history', icon: BarChart2,     label: 'Kết quả'   },
    ],
  },
  { href: '/resources', icon: Library,    label: 'Resources' },
  { href: '/blog',      icon: Newspaper,  label: 'Blog'      },
]

function isActive(pathname: string, href: string): boolean {
  if (href === '/certifications' && (pathname.startsWith('/certifications/exam-history') || pathname.startsWith('/certifications/results'))) return false
  if (href === '/certifications') return pathname === '/certifications' || (pathname.startsWith('/certifications/') && !pathname.startsWith('/certifications/exam-history') && !pathname.startsWith('/certifications/results'))
  return pathname === href || pathname.startsWith(href + '/')
}

const navButtonStyle: React.CSSProperties = {
  textDecoration: 'none', border: 'none', background: 'transparent',
  font: 'inherit', cursor: 'pointer',
}

interface TopNavProps {
  title?: string
}

export function TopNav({ title }: TopNavProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { resolvedTheme, setTheme } = useAppTheme()
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

  return (
    <header className="topbar">
      {/* Brandmark */}
      <Link to="/dashboard" className="brandmark" style={{ textDecoration: 'none', flexShrink: 0 }}>
        <div className="glyph">C</div>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 17, color: 'var(--color-ink)', letterSpacing: '-.02em' }}>
          Certi Hub
        </span>
      </Link>

      <div style={{ flex: 1 }} className="topbar-spacer" />

      {/* Primary nav — desktop, centered */}
      <nav className="topnav-links">
        {NAV_ITEMS.map(item => {
          if (isGroup(item)) {
            const active = item.children.some(c => isActive(pathname, c.href))
            return (
              <DropdownMenu key={item.label}>
                <DropdownMenuTrigger asChild>
                  <button className={`navlink${active ? ' active' : ''}`} style={navButtonStyle}>
                    <item.icon size={18} strokeWidth={active ? 2.3 : 2} />
                    {item.label}
                    <ChevronDown size={15} style={{ opacity: 0.6 }} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="min-w-[180px]">
                  {item.children.map(c => (
                    <DropdownMenuItem
                      key={c.href}
                      onClick={() => navigate(c.href)}
                      className={isActive(pathname, c.href) ? 'text-accent font-semibold' : ''}
                    >
                      <c.icon className="w-4 h-4" /> {c.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )
          }
          const active = isActive(pathname, item.href)
          return (
            <Link
              key={item.href}
              to={item.href}
              className={`navlink${active ? ' active' : ''}`}
              style={{ textDecoration: 'none' }}
            >
              <item.icon size={18} strokeWidth={active ? 2.3 : 2} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Page title — mobile only (nav lives in bottom-nav) */}
      {title && (
        <h2 className="topbar-title-mobile" style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-ink)', margin: 0, flex: 1, minWidth: 0 }}>
          {title}
        </h2>
      )}

      <div style={{ flex: 1 }} className="topbar-spacer" />

      {/* Actions */}
      <div className="row" style={{ gap: 9, alignItems: 'center', flexShrink: 0 }}>
        <Link to="/notifications" style={{ position: 'relative' }}>
          <button className="iconbtn" aria-label="Thông báo">
            <Bell size={19} />
            <span style={{
              position: 'absolute', top: 8, right: 9, width: 7, height: 7,
              borderRadius: '50%', background: '#ef4444', border: '2px solid var(--color-surface)',
            }} />
          </button>
        </Link>

        <button
          className="iconbtn"
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          aria-label="Đổi giao diện"
        >
          {resolvedTheme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="itile"
              aria-label="Tài khoản"
              style={{
                width: 40, height: 40, background: 'var(--color-accent)', color: '#fff',
                fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: 14, borderRadius: 10,
                border: 'none', cursor: 'pointer', overflow: 'hidden', flexShrink: 0,
              }}
            >
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt={initials} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initials}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="bottom" align="end" className="min-w-[200px]">
            <DropdownMenuLabel>
              <p className="font-bold text-[13px] text-ink">{user?.fullName || 'Người dùng'}</p>
              <p className="text-[11px] text-ink-faint">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile/me')}>
              <User className="w-4 h-4" /> Trang cá nhân
            </DropdownMenuItem>
            {isAdmin() && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/admin/dashboard')} className="text-accent font-semibold">
                  <Settings className="w-4 h-4" /> Quản trị
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logoutMutation.mutate()} className="text-red-500 font-semibold">
              <LogOut className="w-4 h-4" /> Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

import { useNavigate, Link } from 'react-router-dom'
import { Search, Bell, Sun, Moon, Menu, LogOut } from 'lucide-react'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/store/auth-store'
import { useAppTheme } from '@/providers/theme-provider'

interface TopNavProps {
  title?: string
  onMenuClick?: () => void
  sidebarOpen?: boolean
}

export function TopNav({ title, onMenuClick }: TopNavProps) {
  const navigate = useNavigate()
  const { resolvedTheme, setTheme } = useAppTheme()
  const { logout } = useAuthStore()

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      logout()
      navigate('/login')
    },
  })

  return (
    <header className="topbar">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuClick}
        className="iconbtn"
        aria-label="Mở menu"
        id="menu-btn"
      >
        <Menu size={20} />
      </button>

      {/* Title */}
      <div className="row" style={{ alignItems: 'center', gap: 11, flex: 1, minWidth: 0 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>
          {title}
        </h2>
      </div>

      {/* Search box — hidden on mobile */}
      <div
        className="row topbar-search"
        style={{
          alignItems: 'center', gap: 9, padding: '0 14px', height: 40,
          borderRadius: 'var(--radius-sm)', background: 'var(--surface-2)',
          border: '1px solid var(--border)', width: 280, maxWidth: '32vw',
        }}
      >
        <Search size={17} style={{ color: 'var(--ink-3)', flexShrink: 0 }} />
        <input
          placeholder="Tìm chứng chỉ, chủ đề…"
          style={{
            border: 'none', background: 'transparent', outline: 'none',
            color: 'var(--ink)', fontSize: 13.5, width: '100%',
            fontFamily: 'var(--font-body)',
          }}
        />
        <kbd className="mono" style={{ fontSize: 10.5, color: 'var(--ink-3)', border: '1px solid var(--border-2)', borderRadius: 5, padding: '1px 5px', flexShrink: 0 }}>
          ⌘K
        </kbd>
      </div>

      {/* Actions */}
      <div className="row" style={{ gap: 9, alignItems: 'center' }}>
        <Link to="/notifications" style={{ position: 'relative' }}>
          <button className="iconbtn" aria-label="Thông báo">
            <Bell size={19} />
            <span style={{
              position: 'absolute', top: 8, right: 9, width: 7, height: 7,
              borderRadius: '50%', background: 'var(--hard)', border: '2px solid var(--surface)',
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

        <button
          className="iconbtn"
          onClick={() => logoutMutation.mutate()}
          aria-label="Đăng xuất"
          title="Đăng xuất"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  )
}

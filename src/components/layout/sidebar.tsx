import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, GraduationCap,
  Bookmark, Bell, User, ChevronRight, X, BookOpen, FileText,
  Moon, Sun, LogOut, Settings
} from 'lucide-react'
import { Badge, Dropdown, Avatar } from 'antd'
import type { MenuProps } from 'antd'
import { useMutation } from '@tanstack/react-query'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/store/auth-store'
import { useAppTheme } from '@/providers/theme-provider'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', description: 'Tiến độ học tập' },
  { href: '/certifications', icon: GraduationCap, label: 'Chứng chỉ', description: 'Danh mục chứng chỉ' },
  { href: '/courses', icon: BookOpen, label: 'Khoá học', description: 'Khám phá và tham gia' },
  { href: '/community', icon: FileText, label: 'Cộng đồng', description: 'Bài viết & thảo luận' },
  { href: '/bookmarks', icon: Bookmark, label: 'Đã lưu', description: 'Bài viết đã bookmark' },
  { href: '/notifications', icon: Bell, label: 'Thông báo', description: 'Tin nhắn & cảnh báo', badge: '3' },
  { href: '/profile/me', icon: User, label: 'Trang cá nhân', description: 'Hồ sơ của bạn' },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation()
  const pathname = location.pathname
  const navigate = useNavigate()
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
    user?.fullName
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U'

  const dropdownItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: (
        <div className="px-1 py-1 min-w-[160px]">
          <p className="font-bold text-sm text-slate-900 dark:text-white truncate m-0">{user?.fullName}</p>
          <p className="text-xs text-slate-500 truncate m-0">{user?.email}</p>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' },
    {
      key: 'profile',
      label: 'Trang cá nhân',
      icon: <User className="w-4 h-4" />,
      onClick: () => { navigate('/profile/me'); onClose(); },
    },
    {
      key: 'settings',
      label: 'Cài đặt',
      icon: <Settings className="w-4 h-4" />,
      onClick: () => { navigate('/settings'); onClose(); },
    },
    ...(isAdmin()
      ? [
        { type: 'divider' as const },
        {
          key: 'admin',
          label: <span className="text-primary font-semibold">Admin Panel</span>,
          icon: <Settings className="w-4 h-4 text-primary" />,
          onClick: () => { navigate('/admin/dashboard'); onClose(); },
        },
      ]
      : []),
    { type: 'divider' },
    {
      key: 'logout',
      label: <span className="text-red-600 font-semibold">Đăng xuất</span>,
      icon: <LogOut className="w-4 h-4 text-red-600" />,
      onClick: () => logoutMutation.mutate(),
    },
  ]

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-4 left-4 bottom-4 z-40 w-64 rounded-2xl bg-white dark:bg-primary border border-slate-200 dark:border-slate-800 shadow-sm',
          'transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-[calc(100%+1rem)]'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 lg:hidden">
            <span className="font-semibold text-slate-900 dark:text-white">Menu</span>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors text-slate-600 dark:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-hide">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group no-underline',
                    isActive
                      ? 'bg-primary/10 text-primary dark:bg-cta/10 dark:text-cta'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive ? 'text-primary dark:text-cta' : 'text-slate-400')} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.label}</span>
                      {item.badge && (
                        <Badge
                          count={item.badge}
                          size="small"
                          color={item.badge === 'Mới' ? '#22C55E' : '#EF4444'}
                          style={{ fontSize: '9px', height: '14px', lineHeight: '14px', borderRadius: '4px' }}
                        />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 truncate m-0">{item.description}</p>
                  </div>
                  <ChevronRight
                    className={cn(
                      'w-3.5 h-3.5 transition-transform flex-shrink-0',
                      isActive ? 'text-primary dark:text-cta' : 'text-slate-300 group-hover:translate-x-0.5'
                    )}
                  />
                </Link>
              )
            })}
          </nav>

          <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
            <Dropdown menu={{ items: dropdownItems }} placement="topLeft" trigger={['click']}>
              <div className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors flex-1 min-w-0">
                <Avatar src={user?.avatarUrl ?? undefined} className="bg-primary flex-shrink-0" size={32}>
                  {initials}
                </Avatar>
                <div className="flex-1 min-w-0 pr-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate m-0">{user?.fullName || 'User'}</p>
                </div>
              </div>
            </Dropdown>

            <div className="flex items-center gap-1 flex-shrink-0">
              <Link to="/notifications" onClick={onClose} className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors text-slate-600 dark:text-slate-300">
                <Badge count={3} size="small" offset={[2, -2]}>
                  <Bell className="w-4 h-4 text-current" />
                </Badge>
              </Link>
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors text-slate-600 dark:text-slate-300"
                aria-label="Toggle theme"
              >
                <Sun className="hidden w-4 h-4 dark:block" />
                <Moon className="w-4 h-4 dark:hidden" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

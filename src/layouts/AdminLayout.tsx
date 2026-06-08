import { useState, useEffect } from 'react'
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth-store'
import {
  LayoutDashboard, Users, FileText, GraduationCap,
  Bell, FileSpreadsheet, ArrowLeft, HelpCircle, ChevronRight, X, Menu
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar } from 'antd'

const adminNavItems = [
  { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Tổng quan Admin', description: 'Thống kê hệ thống' },
  { href: '/admin/users', icon: Users, label: 'Quản lý Học viên', description: 'Danh sách và phân quyền' },
  { href: '/admin/certifications', icon: GraduationCap, label: 'Quản lý Chứng chỉ', description: 'Cấu hình lộ trình' },
  { href: '/admin/questions', icon: HelpCircle, label: 'Ngân hàng Câu hỏi', description: 'Kho đề thi & câu hỏi' },
  { href: '/admin/posts', icon: FileText, label: 'Quản lý Bài viết', description: 'Kiểm duyệt cộng đồng' },
  { href: '/admin/notifications', icon: Bell, label: 'Quản lý Thông báo', description: 'Thông báo hệ thống' },
  { href: '/admin/audit', icon: FileSpreadsheet, label: 'Nhật ký Audit', description: 'Giám sát hoạt động' },
]

export default function AdminLayout() {
  const { user, isAuthenticated, isAdmin } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const pathname = location.pathname
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      const target = `${location.pathname}${location.search}`
      navigate(`/login?redirect=${encodeURIComponent(target)}`, { replace: true })
    } else if (!isAdmin()) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, isAdmin, navigate, location])

  if (!isAuthenticated || !isAdmin()) {
    return null
  }

  const initials =
    user?.fullName
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'A'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Top Header - Matching Client TopNav styles */}
      <header className="fixed top-4 left-4 lg:left-[17.5rem] right-4 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl safe-area-top flex flex-col shadow-sm transition-all duration-300">
        <div className="h-14 flex items-center px-4 justify-between">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/dashboard" className="hidden lg:flex items-center gap-1 font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors no-underline">
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Về Client</span>
            </Link>
            <div className="hidden lg:block h-4 w-[1px] bg-slate-200 dark:bg-slate-700" />
            <span className="font-extrabold text-slate-900 dark:text-white tracking-tight">CertiMaster Admin</span>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-semibold hidden md:inline">Đang đăng nhập:</span>
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
              <Avatar src={user?.avatarUrl ?? undefined} className="bg-primary flex-shrink-0" size={24}>
                {initials}
              </Avatar>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200 hidden sm:inline">
                {user?.fullName} (ADMIN)
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Matching Client Sidebar styles */}
      <aside
        className={cn(
          'fixed top-4 left-4 bottom-4 z-40 w-64 rounded-2xl bg-white dark:bg-primary border border-slate-200 dark:border-slate-800 shadow-sm',
          'transition-transform duration-300 ease-in-out flex flex-col',
          'lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-[calc(100%+1rem)]'
        )}
      >
        <div className="flex items-center justify-between p-4 lg:hidden">
          <span className="font-semibold text-slate-900 dark:text-white">Admin Menu</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors text-slate-600 dark:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-hide mt-2 lg:mt-4">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
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
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate m-0">{item.description}</p>
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

        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800/50">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 m-0">Trang quản trị</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 m-0">Vui lòng cẩn trọng khi thực hiện thay đổi dữ liệu hệ thống.</p>
            <Link to="/dashboard">
              <button className="w-full mt-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-1 lg:hidden">
                <ArrowLeft className="w-3 h-3" /> Về Client
              </button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area - Matching Client Layout padding */}
      <main className="lg:pl-[17.5rem] pt-24 pb-6 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

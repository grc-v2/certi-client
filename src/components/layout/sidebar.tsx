'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, GraduationCap, BookOpen, Users2,
  Bookmark, Bell, User, ChevronRight, X, Target, FileText
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', description: 'Tiến độ học tập' },
  { href: '/certifications', icon: GraduationCap, label: 'Chứng chỉ', description: 'Danh mục chứng chỉ' },
  { href: '/learn', icon: Target, label: 'Học tập', description: 'Kế hoạch & thi thử' },
  { href: '/community', icon: FileText, label: 'Cộng đồng', description: 'Bài viết & thảo luận', badge: 'Mới' },
  { href: '/bookmarks', icon: Bookmark, label: 'Đã lưu', description: 'Bài viết đã bookmark' },
  { href: '/notifications', icon: Bell, label: 'Thông báo', description: 'Tin nhắn & cảnh báo', badge: '3' },
  { href: '/profile/me', icon: User, label: 'Trang cá nhân', description: 'Hồ sơ của bạn' },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname()

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
      <aside className={cn(
        'fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800',
        'transition-transform duration-300 ease-in-out',
        'lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 lg:hidden">
            <span className="font-semibold text-slate-900 dark:text-white">Menu</span>
            <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-hide">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-200 group',
                    isActive
                      ? 'bg-[#0A66C2]/10 text-[#0A66C2] dark:bg-[#0A66C2]/20'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive ? 'text-[#0A66C2]' : '')} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.label}</span>
                      {item.badge && (
                        <Badge className={cn('text-[10px] px-1.5 py-0 h-4', item.badge === 'Mới' ? 'bg-[#22C55E] text-white' : 'bg-red-500 text-white')}>
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate">{item.description}</p>
                  </div>
                  <ChevronRight className={cn('w-3.5 h-3.5 transition-transform flex-shrink-0', isActive ? 'text-[#0A66C2]' : 'text-slate-300 group-hover:translate-x-0.5')} />
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <div className="bg-gradient-to-r from-[#0A66C2]/10 to-[#22C55E]/10 rounded-xl p-3">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Streak hiện tại</p>
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-5 h-5 text-orange-500">🔥</div>
                <span className="text-lg font-bold text-[#0A66C2]">7 ngày</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Tiếp tục học để duy trì streak!</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}

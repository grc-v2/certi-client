import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, GraduationCap, FileText, Bell, User } from 'lucide-react'
import { Badge } from 'antd'
import { cn } from '@/lib/utils'

const items = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/certifications', icon: GraduationCap, label: 'Chứng chỉ' },
  { href: '/community', icon: FileText, label: 'Cộng đồng' },
  { href: '/notifications', icon: Bell, label: 'Thông báo', badge: 3 },
  { href: '/profile/me', icon: User, label: 'Hồ sơ' },
]

export function BottomNav() {
  const location = useLocation()
  const pathname = location.pathname

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex lg:hidden pb-safe">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-2 px-1 cursor-pointer transition-colors',
              isActive
                ? 'text-primary'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            )}
          >
            <div className="relative flex items-center justify-center">
              <Badge count={item.badge} size="small" offset={[5, -2]}>
                <item.icon className="w-5 h-5 text-current" />
              </Badge>
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

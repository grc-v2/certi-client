'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, GraduationCap, FileText, Bell, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const items = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/certifications', icon: GraduationCap, label: 'Chứng chỉ' },
  { href: '/community', icon: FileText, label: 'Cộng đồng' },
  { href: '/notifications', icon: Bell, label: 'Thông báo', badge: '3' },
  { href: '/profile/me', icon: User, label: 'Hồ sơ' },
]

export function BottomNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex lg:hidden pb-safe">
      {items.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
        return (
          <Link key={item.href} href={item.href} className={cn('flex-1 flex flex-col items-center gap-1 py-2 px-1 cursor-pointer transition-colors', isActive ? 'text-[#0A66C2]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200')}>
            <div className="relative">
              <item.icon className="w-5 h-5" />
              {item.badge && <Badge className="absolute -top-1.5 -right-1.5 w-4 h-4 p-0 flex items-center justify-center text-[9px] bg-red-500 text-white">{item.badge}</Badge>}
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

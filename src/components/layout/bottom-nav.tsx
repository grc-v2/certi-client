import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, GraduationCap, BookOpen, Dumbbell, Users } from 'lucide-react'

const ITEMS = [
  { href: '/dashboard',      icon: LayoutDashboard, label: 'Tổng quan'  },
  { href: '/certifications', icon: GraduationCap,   label: 'Chứng chỉ' },
  { href: '/courses',        icon: BookOpen,        label: 'Khoá học'   },
  { href: '/practice',       icon: Dumbbell,        label: 'Luyện tập'  },
  { href: '/community',      icon: Users,           label: 'Cộng đồng'  },
]

export function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav className="botnav">
      {ITEMS.map(item => {
        const active =
          pathname === item.href ||
          (item.href !== '/certifications' && pathname.startsWith(item.href + '/'))
        return (
          <Link key={item.href} to={item.href} className={active ? 'active' : ''}>
            <item.icon size={22} strokeWidth={active ? 2.4 : 2} />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

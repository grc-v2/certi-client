import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, GraduationCap, Library, Newspaper } from 'lucide-react'

const ITEMS = [
  { href: '/dashboard',      icon: LayoutDashboard, label: 'Tracker',  match: ['/dashboard'] },
  { href: '/certifications', icon: GraduationCap,   label: 'Ôn thi',   match: ['/certifications', '/practice'] },
  { href: '/resources',      icon: Library,         label: 'Resources', match: ['/resources'] },
  { href: '/blog',           icon: Newspaper,       label: 'Blog',     match: ['/blog', '/community'] },
]

export function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav className="botnav">
      {ITEMS.map(item => {
        const active = item.match.some(m => pathname === m || pathname.startsWith(m + '/'))
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

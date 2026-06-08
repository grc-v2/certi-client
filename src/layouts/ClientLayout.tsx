import { useState, useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { TopNav } from '@/components/layout/top-nav'
import { Sidebar } from '@/components/layout/sidebar'
import { BottomNav } from '@/components/layout/bottom-nav'
import { useAuthStore } from '@/store/auth-store'

export default function ClientLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  // Protect client routes — preserve full path + query string so login can
  // return the user to exactly where they were.
  useEffect(() => {
    if (!isAuthenticated) {
      const target = `${location.pathname}${location.search}`
      navigate(`/login?redirect=${encodeURIComponent(target)}`, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  if (!isAuthenticated) {
    return null // Or a loading spinner
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <TopNav sidebarOpen={sidebarOpen} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Content wrapper with sidebar padding on desktop and top navbar offset */}
      <main className="lg:pl-[17.5rem] pt-24 pb-20 lg:pb-6 min-h-screen">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
          <Outlet />
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

import { useEffect } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/auth-store'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Clock } from 'lucide-react'

export default function ExamLayout() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (!isAuthenticated) {
      const target = `${location.pathname}${location.search}`
      navigate(`/login?redirect=${encodeURIComponent(target)}`, { replace: true })
    }
  }, [isAuthenticated, navigate, location])

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col">
      {/* Focus Mode Header */}
      <header className="h-14 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4 sm:px-6 flex-shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="font-bold text-zinc-900 dark:text-white hidden sm:block">Chế độ thi</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            <Clock className="w-4 h-4 text-primary" />
            <span>Đang làm bài</span>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/certifications')}
            className="border-zinc-200 text-zinc-600 hover:bg-zinc-100 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Thoát
          </Button>
        </div>
      </header>

      {/* Main Exam Area */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}

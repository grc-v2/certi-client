import { useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/auth-store'

export default function AuthLayout() {
  const { isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A66C2]/10 via-slate-50 to-[#22C55E]/10 dark:from-[#0A66C2]/15 dark:via-slate-950 dark:to-slate-900 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 bg-[#0A66C2] rounded-2xl flex items-center justify-center shadow-lg shadow-[#0A66C2]/20">
            <span className="text-white font-extrabold text-xl">C</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            CertiMaster
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            Chinh phục chứng chỉ học tập chuyên sâu
          </p>
        </div>
        
        <Outlet />
      </div>
    </div>
  )
}

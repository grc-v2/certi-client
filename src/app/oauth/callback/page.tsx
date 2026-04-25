'use client'
import { Suspense, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/store/auth-store'

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-900">
      <div className="w-10 h-10 bg-[#0A66C2] rounded-xl flex items-center justify-center">
        <span className="text-white font-bold text-lg">C</span>
      </div>
      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Đang xử lý đăng nhập...</span>
      </div>
    </div>
  )
}

function OAuthCallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser, setTokens } = useAuthStore()
  const processed = useRef(false)

  useEffect(() => {
    if (processed.current) return
    processed.current = true

    const handleCallback = async () => {
      const error = searchParams.get('error')
      if (error) {
        toast.error('Đăng nhập thất bại: ' + (searchParams.get('error_description') ?? error))
        router.replace('/login')
        return
      }

      const accessToken = searchParams.get('accessToken')
      const refreshToken = searchParams.get('refreshToken')
      const returnedState = searchParams.get('state')

      if (!accessToken || !refreshToken) {
        toast.error('Phản hồi OAuth không hợp lệ')
        router.replace('/login')
        return
      }

      // CSRF state verification
      const savedState = sessionStorage.getItem('oauth_state')
      if (returnedState && savedState && returnedState !== savedState) {
        toast.error('Xác thực bảo mật thất bại. Vui lòng thử lại.')
        router.replace('/login')
        return
      }

      sessionStorage.removeItem('oauth_state')
      sessionStorage.removeItem('oauth_provider')

      try {
        setTokens(accessToken, refreshToken)
        const res = await authApi.getCurrentUser()
        setUser({
          id: res.user.id,
          email: res.user.email,
          username: res.user.username,
          fullName: res.user.fullName,
          avatarUrl: res.user.avatarUrl,
          roles: res.user.roles?.map(r => r.code) ?? [],
        })
        toast.success('Đăng nhập thành công!')
        const isAdmin = res.user.roles?.some(r => r.code === 'ADMIN')
        router.replace(isAdmin ? '/admin/dashboard' : '/dashboard')
      } catch {
        toast.error('Không thể lấy thông tin người dùng')
        router.replace('/login')
      }
    }

    handleCallback()
  }, [searchParams, router, setUser, setTokens])

  return <LoadingScreen />
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <OAuthCallbackHandler />
    </Suspense>
  )
}

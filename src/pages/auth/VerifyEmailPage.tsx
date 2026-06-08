'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle2, XCircle, Mail, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { authApi } from '@/lib/api/auth'

function VerifyEmailContent() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>(token ? 'idle' : 'idle')
  const [countdown, setCountdown] = useState(0)

  const verifyMutation = useMutation({
    mutationFn: authApi.verifyEmail,
    onSuccess: () => { setStatus('success'); setTimeout(() => navigate('/login'), 3000) },
    onError: () => setStatus('error'),
  })

  useEffect(() => {
    if (token) verifyMutation.mutate(token)
  }, [token])

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [countdown])

  if (token) {
    if (verifyMutation.isPending) return (
      <Card className="shadow-lg"><CardContent className="pt-8 pb-8 text-center space-y-4">
        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
        <p className="text-slate-600 dark:text-slate-300">Đang xác thực email...</p>
      </CardContent></Card>
    )
    if (status === 'success') return (
      <Card className="shadow-lg"><CardContent className="pt-8 pb-8 text-center space-y-4">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Xác thực thành công!</h2>
        <p className="text-slate-500">Đang chuyển hướng đến trang đăng nhập...</p>
      </CardContent></Card>
    )
    return (
      <Card className="shadow-lg"><CardContent className="pt-8 pb-8 text-center space-y-4">
        <XCircle className="w-16 h-16 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Xác thực thất bại</h2>
        <p className="text-slate-500">Liên kết không hợp lệ hoặc đã hết hạn.</p>
        <Button onClick={() => navigate('/login')} className="bg-primary hover:bg-slate-800 text-white cursor-pointer">Về trang đăng nhập</Button>
      </CardContent></Card>
    )
  }

  return (
    <Card className="shadow-lg">
      <CardHeader><CardTitle className="text-2xl font-bold text-center text-slate-900 dark:text-white">Xác thực email</CardTitle></CardHeader>
      <CardContent className="text-center space-y-6 pb-8">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
          <Mail className="w-10 h-10 text-primary" />
        </div>
        <div className="space-y-2">
          <p className="text-slate-700 dark:text-slate-200 font-medium">Kiểm tra hộp thư của bạn</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Chúng tôi đã gửi email xác thực. Nhấn vào liên kết trong email để kích hoạt tài khoản.</p>
        </div>
        <Button
          variant="outline"
          className="cursor-pointer"
          disabled={countdown > 0}
          onClick={() => { toast.info('Đã gửi lại email xác thực'); setCountdown(60) }}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại email'}
        </Button>
      </CardContent>
    </Card>
  )
}

export default function VerifyEmailPage() {
  return <Suspense><VerifyEmailContent /></Suspense>
}

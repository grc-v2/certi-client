'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { authApi } from '@/lib/api/auth'
import { cn } from '@/lib/utils'

const schema = z.object({
  fullName: z.string().min(2, 'Tên ít nhất 2 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu ít nhất 8 ký tự').regex(/[A-Z]/, 'Cần ít nhất 1 chữ hoa').regex(/[0-9]/, 'Cần ít nhất 1 số'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, { message: 'Mật khẩu không khớp', path: ['confirmPassword'] })
type RegisterForm = z.infer<typeof schema>

export default function RegisterPage() {
  const [showPwd, setShowPwd] = useState(false)
  const router = useRouter()
  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterForm>({ resolver: zodResolver(schema) })
  const pwd = watch('password', '')
  const strength = [pwd.length >= 8, /[A-Z]/.test(pwd), /[0-9]/.test(pwd), /[^A-Za-z0-9]/.test(pwd)].filter(Boolean).length

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.')
      router.push('/verify-email')
    },
    onError: () => toast.error('Email đã được sử dụng hoặc có lỗi xảy ra'),
  })

  return (
    <Card className="border-slate-200 dark:border-slate-700 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Tạo tài khoản</CardTitle>
        <CardDescription>Bắt đầu hành trình học chứng chỉ của bạn</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(d => mutation.mutate({ fullName: d.fullName, email: d.email, password: d.password }))} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Họ và tên</Label>
            <Input id="fullName" placeholder="Nguyễn Văn A" {...register('fullName')} className={cn(errors.fullName && 'border-red-500')} />
            {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" {...register('email')} className={cn(errors.email && 'border-red-500')} />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <div className="relative">
              <Input id="password" type={showPwd ? 'text' : 'password'} placeholder="••••••••" {...register('password')} className={cn('pr-10', errors.password && 'border-red-500')} />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {pwd && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1,2,3,4].map(i => (
                    <div key={i} className={cn('h-1 flex-1 rounded-full transition-colors', i <= strength ? strength <= 1 ? 'bg-red-500' : strength <= 2 ? 'bg-yellow-500' : strength <= 3 ? 'bg-blue-500' : 'bg-green-500' : 'bg-slate-200 dark:bg-slate-700')} />
                  ))}
                </div>
                <p className="text-xs text-slate-500">{['', 'Yếu', 'Trung bình', 'Mạnh', 'Rất mạnh'][strength]}</p>
              </div>
            )}
            {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
            <Input id="confirmPassword" type="password" placeholder="••••••••" {...register('confirmPassword')} className={cn(errors.confirmPassword && 'border-red-500')} />
            {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
          </div>
          <Button type="submit" className="w-full bg-[#0A66C2] hover:bg-[#084E96] text-white cursor-pointer transition-colors" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Đang tạo tài khoản...</span>
            ) : (
              <span className="flex items-center gap-2"><UserPlus className="w-4 h-4" />Tạo tài khoản</span>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-sm text-center">
        <p className="text-slate-500 dark:text-slate-400 w-full">
          Đã có tài khoản?{' '}
          <Link href="/login" className="text-[#0A66C2] hover:underline cursor-pointer font-medium">Đăng nhập</Link>
        </p>
      </CardFooter>
    </Card>
  )
}

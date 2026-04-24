'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, Search, Menu, X, Moon, Sun, LogOut, User, Settings, ChevronDown } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { authApi } from '@/lib/api/auth'
import { useAuthStore } from '@/store/auth-store'
import { cn } from '@/lib/utils'

interface TopNavProps {
  onMenuClick?: () => void
  sidebarOpen?: boolean
}

export function TopNav({ onMenuClick, sidebarOpen }: TopNavProps) {
  const { theme, setTheme } = useTheme()
  const { user, logout, isAdmin } = useAuthStore()
  const router = useRouter()
  const [searchOpen, setSearchOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => { logout(); router.push('/login') },
  })

  const initials = user?.fullName?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U'

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 safe-area-top flex flex-col">
    <div className="h-16 flex items-center px-4 gap-3">
      {/* Logo + menu toggle */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <button onClick={onMenuClick} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors lg:hidden">
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
        <Link href="/dashboard" className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 bg-[#0A66C2] rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="font-bold text-slate-900 dark:text-white hidden sm:block">CertiMaster</span>
        </Link>
      </div>

      {/* Search */}
      <div className={cn('flex-1 max-w-xl mx-auto', searchOpen ? 'block' : 'hidden sm:block')}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Tìm kiếm chứng chỉ, bài viết, tag..."
            className="pl-9 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-2 flex-shrink-0 ml-auto sm:ml-0">
        <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors sm:hidden">
          <Search className="w-5 h-5" />
        </button>

        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          aria-label="Toggle theme"
        >
          {mounted && (theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />)}
        </button>

        <Link href="/notifications" className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
          <Bell className="w-5 h-5" />
          <Badge className="absolute -top-0.5 -right-0.5 w-4 h-4 p-0 flex items-center justify-center text-[10px] bg-red-500 text-white border-white dark:border-slate-900 border-2">3</Badge>
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.avatarUrl ?? undefined} />
              <AvatarFallback className="bg-[#0A66C2] text-white text-xs">{initials}</AvatarFallback>
            </Avatar>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
              <p className="font-medium text-sm text-slate-900 dark:text-white truncate">{user?.fullName}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
            <DropdownMenuItem onClick={() => router.push('/profile/me')} className="cursor-pointer">
              <User className="w-4 h-4 mr-2" />Trang cá nhân
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
              <Settings className="w-4 h-4 mr-2" />Cài đặt
            </DropdownMenuItem>
            {isAdmin() && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/admin/dashboard')} className="text-[#0A66C2] cursor-pointer">
                  <Settings className="w-4 h-4 mr-2" />Admin Panel
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => logoutMutation.mutate()}
              className="text-red-600 cursor-pointer focus:text-red-600"
            >
              <LogOut className="w-4 h-4 mr-2" />Đăng xuất
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
    </header>
  )
}

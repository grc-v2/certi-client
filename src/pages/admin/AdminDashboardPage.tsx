'use client'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  Users, FileText, GraduationCap, HelpCircle, Bell,
  Plus, ArrowRight, UserCheck, ClipboardList,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { adminApi, type UserSummaryResponse } from '@/lib/api/admin'
import { postsApi, type PostResponse } from '@/lib/api/posts'
import { certificationsApi } from '@/lib/api/certifications'
import { adminQuestionsApi } from '@/lib/api/questions-admin'
import { cn, formatRelativeTime } from '@/lib/utils'

export default function AdminDashboardPage() {
  const { data: users } = useQuery({
    queryKey: ['admin-users-summary'],
    queryFn: () => adminApi.listUsers({ size: 5 }),
  })
  const { data: posts } = useQuery({
    queryKey: ['admin-posts-summary'],
    queryFn: () => postsApi.adminGetAll({ size: 5 }),
  })
  const { data: certifications } = useQuery({
    queryKey: ['certifications-summary'],
    queryFn: () => certificationsApi.search({ size: 1 }),
  })
  const { data: questions } = useQuery({
    queryKey: ['admin-questions-summary'],
    queryFn: () => adminQuestionsApi.search({ size: 1 }),
  })

  const stats = [
    { label: 'Người dùng', value: users?.totalElements ?? 0, icon: Users, color: 'text-primary', bg: 'bg-blue-50 dark:bg-blue-950/30', href: '/admin/users' },
    { label: 'Bài viết', value: posts?.totalElements ?? 0, icon: FileText, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30', href: '/admin/posts' },
    { label: 'Chứng chỉ', value: certifications?.totalElements ?? 0, icon: GraduationCap, color: 'text-[#22C55E]', bg: 'bg-green-50 dark:bg-green-950/30', href: '/admin/certifications' },
    { label: 'Câu hỏi', value: questions?.totalElements ?? 0, icon: HelpCircle, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30', href: '/admin/questions' },
  ]

  const recentUsers = users?.content ?? []
  const recentPosts = posts?.content ?? []

  const quickActions = [
    { label: 'Thêm chứng chỉ', icon: Plus, href: '/admin/certifications', color: 'text-primary' },
    { label: 'Thêm câu hỏi', icon: Plus, href: '/admin/questions', color: 'text-purple-500' },
    { label: 'Gửi thông báo', icon: Bell, href: '/admin/notifications', color: 'text-orange-500' },
    { label: 'Xem audit log', icon: ClipboardList, href: '/admin/audit', color: 'text-slate-600' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Tổng quan hệ thống CertiMaster</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Link key={i} to={s.href}>
            <Card className="border-slate-200 dark:border-slate-700 hover:border-primary/40 hover:shadow-sm transition-all cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{s.label}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{typeof s.value === 'number' ? s.value.toLocaleString('vi-VN') : s.value}</p>
                  </div>
                  <div className={cn('p-2 rounded-lg', s.bg)}>
                    <s.icon className={cn('w-5 h-5', s.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent users */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" />Người dùng mới
            </CardTitle>
            <Link to="/admin/users">
              <Button variant="ghost" size="sm" className="text-xs cursor-pointer">
                Xem tất cả<ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {recentUsers.length === 0 ? (
              <p className="text-center py-4 text-slate-500 text-sm">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-2">
                {recentUsers.map((u: UserSummaryResponse) => (
                  <div key={u.id} className="flex items-center justify-between py-2 text-sm">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 dark:text-white truncate">{u.fullName}</p>
                      <p className="text-xs text-slate-400 truncate">{u.email}</p>
                    </div>
                    <Badge className={cn('text-xs ml-2', u.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400' : 'bg-red-100 text-red-700')}>
                      {u.status === 'ACTIVE' ? 'Active' : u.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent posts */}
        <Card className="border-slate-200 dark:border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-500" />Bài viết mới
            </CardTitle>
            <Link to="/admin/posts">
              <Button variant="ghost" size="sm" className="text-xs cursor-pointer">
                Xem tất cả<ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="pt-0">
            {recentPosts.length === 0 ? (
              <p className="text-center py-4 text-slate-500 text-sm">Chưa có dữ liệu</p>
            ) : (
              <div className="space-y-2">
                {recentPosts.map((p: PostResponse) => (
                  <div key={p.id} className="flex items-center justify-between py-2 text-sm">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 dark:text-white truncate">{p.title}</p>
                      <p className="text-xs text-slate-400">{formatRelativeTime(p.publishedAt)}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs ml-2">{p.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Thao tác nhanh</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((action, i) => (
              <Link key={i} to={action.href}>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                  <action.icon className={cn('w-4 h-4', action.color)} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{action.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

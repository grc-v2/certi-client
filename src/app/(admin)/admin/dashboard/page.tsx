'use client'
import { useQuery } from '@tanstack/react-query'
import { Users, FileText, GraduationCap, TrendingUp, UserCheck, UserX, Star } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { adminApi } from '@/lib/api/admin'
import { postsApi } from '@/lib/api/posts'
import { certificationsApi } from '@/lib/api/certifications'
import { cn } from '@/lib/utils'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function AdminDashboardPage() {
  const { data: users } = useQuery({
    queryKey: ['admin-users-summary'],
    queryFn: () => adminApi.listUsers({ size: 1 }),
  })
  const { data: posts } = useQuery({
    queryKey: ['admin-posts-summary'],
    queryFn: () => postsApi.adminGetAll({ size: 1 }),
  })
  const { data: certifications } = useQuery({
    queryKey: ['certifications-summary'],
    queryFn: () => certificationsApi.search({ size: 1 }),
  })

  const stats = [
    { label: 'Tổng người dùng', value: users?.totalElements ?? 0, icon: Users, color: 'text-[#0A66C2]', bg: 'bg-blue-50 dark:bg-blue-950/30' },
    { label: 'Tổng bài viết', value: posts?.totalElements ?? 0, icon: FileText, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950/30' },
    { label: 'Chứng chỉ', value: certifications?.totalElements ?? 0, icon: GraduationCap, color: 'text-[#22C55E]', bg: 'bg-green-50 dark:bg-green-950/30' },
    { label: 'Tăng trưởng', value: '+12%', icon: TrendingUp, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950/30' },
  ]

  const mockChartData = [
    { month: 'T1', users: 120, posts: 45 },
    { month: 'T2', users: 180, posts: 62 },
    { month: 'T3', users: 220, posts: 78 },
    { month: 'T4', users: 300, posts: 95 },
    { month: 'T5', users: 380, posts: 110 },
    { month: 'T6', users: 450, posts: 135 },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Tổng quan hệ thống CertiMaster</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i} className="border-slate-200 dark:border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{s.label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{s.value.toLocaleString('vi-VN')}</p>
                </div>
                <div className={cn('p-2 rounded-lg', s.bg)}>
                  <s.icon className={cn('w-5 h-5', s.color)} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Tăng trưởng (6 tháng)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={mockChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94A3B8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94A3B8' }} />
              <Tooltip contentStyle={{ background: 'white', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="users" fill="#0A66C2" radius={[4, 4, 0, 0]} name="Người dùng" />
              <Bar dataKey="posts" fill="#22C55E" radius={[4, 4, 0, 0]} name="Bài viết" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

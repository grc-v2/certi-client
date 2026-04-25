'use client'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { progressApi, type ReadinessTrendEntry } from '@/lib/api/progress'

interface ReadinessTrendChartProps {
  certificationId?: number
}

export function ReadinessTrendChart({ certificationId }: ReadinessTrendChartProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['readiness-trend', certificationId],
    queryFn: () => progressApi.getReadinessTrend(certificationId!, 30),
    enabled: !!certificationId,
  })

  const chartData = (data ?? []).map((d: ReadinessTrendEntry) => ({
    date: d.date.slice(5), // MM-DD
    value: Math.round(d.value),
  }))

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#22C55E]" />
          Xu hướng sẵn sàng thi (30 ngày)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-48 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" />
        ) : chartData.length === 0 ? (
          <div className="h-48 flex items-center justify-center text-sm text-slate-400">Chưa có dữ liệu</div>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="readinessGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0A66C2" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0A66C2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-200 dark:text-slate-700" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} />
              <Tooltip
                contentStyle={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 8 }}
                formatter={(v) => [`${v}%`, 'Điểm sẵn sàng']}
              />
              <Area type="monotone" dataKey="value" stroke="#0A66C2" strokeWidth={2} fill="url(#readinessGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}

import { Flame, Star, Target, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface QuickStatsProps {
  streak?: number;
  xp?: number;
  accuracy?: number;
  timeSpent?: string;
  isLoading?: boolean;
}

export function QuickStats({ streak = 12, xp = 2450, accuracy = 78, timeSpent = "14h 30m", isLoading = false }: QuickStatsProps) {
  const stats = [
    {
      label: 'Streak',
      value: streak,
      unit: 'ngày',
      desc: 'Giữ vững phong độ!',
      icon: Flame,
      color: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-950/30',
      customClass: 'streak-card'
    },
    {
      label: 'Kinh nghiệm (XP)',
      value: xp,
      unit: 'XP',
      desc: 'Top 15% tuần này',
      icon: Star,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50 dark:bg-yellow-950/30',
      customClass: 'bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/60 border-slate-200/60 dark:border-slate-800'
    },
    {
      label: 'Độ chính xác',
      value: accuracy,
      unit: '%',
      desc: 'Tăng 4% so với tuần trước',
      icon: Target,
      color: 'text-green-500',
      bg: 'bg-green-50 dark:bg-green-950/30',
      customClass: 'bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/60 border-slate-200/60 dark:border-slate-800'
    },
    {
      label: 'Thời gian học',
      value: timeSpent,
      unit: '',
      desc: 'Tháng này',
      icon: Clock,
      color: 'text-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      customClass: 'bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/60 border-slate-200/60 dark:border-slate-800'
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card key={i} className={cn(
          "hover:shadow-xl hover:shadow-slate-200/40 dark:hover:shadow-black/25 hover:-translate-y-1 transition-all duration-300 border",
          stat.customClass
        )}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className={cn("text-[10px] font-bold uppercase tracking-wider", i === 0 ? "text-slate-500 dark:text-slate-300" : "text-slate-500 dark:text-slate-400")}>{stat.label}</p>
                <div className="flex items-baseline gap-1 pt-1">
                  {isLoading ? (
                    <div className="h-9 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                  ) : (
                    <>
                      <span className={cn(
                        "text-3xl sm:text-4xl font-black font-heading leading-none tracking-tight", 
                        i === 0 ? "bg-gradient-to-r from-orange-500 to-amber-500 dark:from-orange-400 dark:to-yellow-300 bg-clip-text text-transparent" : "text-slate-900 dark:text-white"
                      )}>
                        {stat.value}
                      </span>
                      {stat.unit && <span className={cn("text-xs font-semibold", "text-slate-500 dark:text-slate-400")}>{stat.unit}</span>}
                    </>
                  )}
                </div>
                <p className={cn("text-[10px] sm:text-[11px] font-semibold pt-1", i === 0 ? "text-green-600 dark:text-cta" : "text-slate-500 dark:text-slate-400")}>{stat.desc}</p>
              </div>
              <div className={cn('p-3 rounded-xl flex-shrink-0 transition-transform duration-300 hover:scale-110', stat.bg)}>
                <stat.icon className={cn('w-6 h-6', stat.color, i === 0 && 'animate-bounce drop-shadow-[0_0_10px_rgba(249,115,22,0.6)]')} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

'use client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HeatmapEntry, IntensityLevel } from '@/lib/api/progress'

const INTENSITY_COLOR: Record<IntensityLevel, string> = {
  NONE:      'bg-slate-100 dark:bg-slate-800',
  LOW:       'bg-[#0A66C2]/20',
  MEDIUM:    'bg-[#0A66C2]/45',
  HIGH:      'bg-[#0A66C2]/70',
  VERY_HIGH: 'bg-[#0A66C2]',
}

interface StudyHeatmapProps {
  data: HeatmapEntry[]
}

export function StudyHeatmap({ data }: StudyHeatmapProps) {
  const today = new Date()
  const days = Array.from({ length: 91 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (90 - i))
    const dateStr = d.toISOString().split('T')[0]
    const entry = data.find(e => e.date === dateStr)
    return {
      date: dateStr,
      activityCount: entry?.activityCount ?? 0,
      studyMinutes: entry?.studyMinutes ?? 0,
      intensityLevel: entry?.intensityLevel ?? 'NONE',
    }
  })

  const weeks: typeof days[] = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))

  const activeDays = data.filter(d => d.intensityLevel !== 'NONE').length

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#0A66C2]" />
          Hoạt động học tập (90 ngày)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 min-w-max">
            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-1">
                {week.map((day, di) => (
                  <div
                    key={di}
                    title={`${day.date}: ${day.activityCount} hoạt động, ${day.studyMinutes} phút`}
                    className={cn('w-3 h-3 rounded-sm cursor-default transition-colors', INTENSITY_COLOR[day.intensityLevel])}
                  />
                ))}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Ít</span>
              {(['NONE', 'LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'] as IntensityLevel[]).map(lvl => (
                <div key={lvl} className={cn('w-3 h-3 rounded-sm', INTENSITY_COLOR[lvl])} />
              ))}
              <span>Nhiều</span>
            </div>
            <p className="text-xs text-slate-500">{activeDays} ngày học</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

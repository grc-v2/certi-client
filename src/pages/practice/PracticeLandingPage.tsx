'use client'
import { Link } from 'react-router-dom'
import { Play, CheckCircle2, Layers, Zap, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const MODES = [
  {
    title: 'Luyện tập tự do',
    desc: 'Học theo tốc độ của bạn, không giới hạn thời gian. Có giải thích sau mỗi câu.',
    icon: Play,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    link: '/practice/free',
  },
  {
    title: 'Thi thử ngay',
    desc: 'Mô phỏng đúng kỳ thi thật: có đồng hồ đếm ngược, không feedback ngay.',
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    link: '/practice/exam',
    highlight: true,
  },
  {
    title: 'Flashcard',
    desc: 'Ôn tập nhanh các khái niệm, lật thẻ để xem đáp án.',
    icon: Layers,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10',
    link: '/practice/flashcard',
  },
  {
    title: 'Khắc phục điểm yếu',
    desc: 'Tự động chọn các chủ đề bạn đang yếu nhất dựa trên lịch sử.',
    icon: Zap,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    link: '/practice/weakness',
  },
]

export default function PracticeLandingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Chế độ luyện tập</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Chọn cách luyện tập phù hợp với mục tiêu của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MODES.map((mode) => (
          <Link key={mode.link} to={mode.link} className="group block">
            <Card className={cn(
              'border h-full transition-all duration-200 hover:-translate-y-0.5',
              mode.highlight
                ? 'border-emerald-400/40 bg-emerald-50/40 dark:bg-emerald-500/5 hover:border-emerald-500/60'
                : 'border-slate-200 dark:border-slate-800 hover:border-primary/40'
            )}>
              <CardContent className="p-5 flex items-start gap-4">
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', mode.bg)}>
                  <mode.icon className={cn('w-6 h-6', mode.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className={cn(
                      'font-bold text-base',
                      mode.highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'
                    )}>{mode.title}</h3>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{mode.desc}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

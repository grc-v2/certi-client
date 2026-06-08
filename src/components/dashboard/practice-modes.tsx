import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, CheckCircle2, Layers, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function PracticeModes() {
  const modes = [
    {
      title: 'Luyện tập tự do',
      desc: 'Học theo tốc độ của bạn',
      icon: Play,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      link: '/practice/free'
    },
    {
      title: 'Thi thử ngay',
      desc: 'Mô phỏng như thi thật',
      icon: CheckCircle2,
      color: 'text-cta',
      bg: 'bg-cta/10',
      link: '/practice/exam',
      highlight: true
    },
    {
      title: 'Flashcard',
      desc: 'Ôn tập nhanh khái niệm',
      icon: Layers,
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
      link: '/practice/flashcard'
    },
    {
      title: 'Khắc phục điểm yếu',
      desc: 'Tập trung vào câu sai',
      icon: Zap,
      color: 'text-orange-500',
      bg: 'bg-orange-500/10',
      link: '/practice/weakness'
    }
  ]

  return (
    <Card className="border-slate-200/60 dark:border-slate-800">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Zap className="w-4.5 h-4.5 text-warning" />
          Chế độ luyện tập
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {modes.map((mode, i) => (
            <Link key={i} to={mode.link} className={cn(
              "flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 group",
              mode.highlight 
                ? "border-cta/30 bg-cta/5 hover:bg-cta/10 hover:shadow-[0_0_15px_rgba(34,197,94,0.15)]" 
                : "border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/50"
            )}>
              <div className={cn("p-2.5 rounded-lg flex-shrink-0", mode.bg)}>
                <mode.icon className={cn("w-5 h-5", mode.color)} />
              </div>
              <div>
                <h4 className={cn("font-bold text-sm", mode.highlight ? "text-cta" : "text-slate-900 dark:text-slate-100")}>{mode.title}</h4>
                <p className="text-[11px] text-slate-500">{mode.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

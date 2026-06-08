import { ArrowRight, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

interface CertHeroProps {
  userName: string;
  progress?: number;
  certName?: string;
}

export function CertHero({ userName, progress = 65, certName = 'AWS Certified Solutions Architect' }: CertHeroProps) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="cert-hero rounded-2xl p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cta/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-primary/50 rounded-full blur-3xl pointer-events-none" />
      
      <div className="z-10 flex-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cta/10 border border-cta/20 mb-4 backdrop-blur-sm">
          <Target className="w-4 h-4 text-cta animate-pulse" />
          <span className="text-cta font-bold text-xs tracking-wider uppercase">Chương trình mục tiêu</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 font-heading bg-gradient-to-r from-slate-800 via-slate-600 to-slate-800 dark:from-white dark:via-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
          Chào {userName}!
        </h1>
        <p className="text-slate-600 dark:text-slate-300 text-base md:text-lg max-w-xl mb-8 font-sans leading-relaxed">
          Bạn đã hoàn thành <span className="text-cta font-bold">{progress}%</span> lộ trình chinh phục <strong className="text-slate-900 dark:text-white font-mono bg-slate-200 dark:bg-secondary/50 px-2 py-1 rounded">{certName}</strong>. Hãy tiếp tục duy trì ngọn lửa ôn luyện nhé!
        </p>
        <div className="flex flex-wrap gap-4">
          <Link to="/certifications">
            <Button className="bg-cta hover:bg-success text-primary px-8 py-6 rounded-xl text-lg font-bold transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] hover:shadow-[0_0_30px_rgba(74,222,128,0.5)] hover:-translate-y-1">
              Tiếp tục học
              <ArrowRight className="w-6 h-6 ml-2" />
            </Button>
          </Link>
          <Button variant="outline" className="border-slate-300 dark:border-secondary/50 text-slate-600 dark:text-slate-300 bg-slate-100/50 dark:bg-secondary/20 hover:bg-slate-200 dark:hover:bg-secondary hover:text-slate-900 dark:hover:text-white px-8 py-6 rounded-xl text-lg font-bold transition-all backdrop-blur-sm">
            Đổi mục tiêu
          </Button>
        </div>
      </div>

      <div className="z-10 flex-shrink-0 relative progress-ring" style={{ '--progress': progress, '--progress-size': '160px', width: '160px', height: '160px' } as any}>
        <svg className="w-40 h-40 transform -rotate-90">
          <circle
            className="text-slate-200 dark:text-secondary"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="80"
            cy="80"
          />
          <circle
            className="text-cta drop-shadow-[0_0_12px_rgba(34,197,94,0.6)] transition-all duration-1000 ease-out"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx="80"
            cy="80"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center flex-col">
          <span className="text-4xl font-heading font-black text-slate-900 dark:text-white tracking-tighter">{progress}%</span>
          <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400 mt-1">Readiness</span>
        </div>
      </div>
    </div>
  )
}

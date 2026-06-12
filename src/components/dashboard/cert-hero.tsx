import { ArrowRight, Target, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'

/**
 * Refreshed CertHero — worked example of the new design language applied to a
 * real component. Drop-in replacement for src/components/dashboard/cert-hero.tsx.
 *
 * Shows the new patterns:
 *   • `.codechip` for the cert code (mono)
 *   • `.pill .pill-brand` for the status chip
 *   • `.btn-3d` Duolingo-style pressable green CTA
 *   • `font-mono` (JetBrains Mono) for the big readiness number
 *   • headings auto-render in Be Vietnam Pro via the new `--font-heading`
 */
interface CertHeroProps {
  userName: string
  progress?: number
  certName?: string
  certCode?: string
}

export function CertHero({
                           userName,
                           progress = 72,
                           certName = 'AWS Certified Solutions Architect – Associate',
                           certCode = 'SAA-C03',
                         }: CertHeroProps) {
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (progress / 100) * circumference

  return (
      <div className="cert-hero rounded-3xl p-7 md:p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
        <div className="absolute -top-20 -right-16 w-72 h-72 rounded-full bg-cta/10 blur-3xl pointer-events-none" />

        <div className="z-10 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="codechip" style={{ fontSize: 12 }}>{certCode}</span>
            <span className="pill pill-brand"><Target className="w-3.5 h-3.5" />Chương trình mục tiêu</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-3 text-slate-900 dark:text-white">
            Chào {userName} 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base max-w-xl mb-7 leading-relaxed">
            Bạn đã hoàn thành <b className="font-mono text-cta">{progress}%</b> lộ trình chinh phục{' '}
            <strong className="text-slate-900 dark:text-white">{certName}</strong>. Tiếp tục duy trì phong độ nhé!
          </p>

          <div className="flex flex-wrap gap-3">
            <Link to="/certifications">
              <button className="btn-3d">
                Tiếp tục học
                <ArrowRight className="w-5 h-5" />
              </button>
            </Link>
            <Link to="/certifications">
              <button className="btn-3d btn-3d-ghost">Đổi mục tiêu</button>
            </Link>
          </div>
        </div>

        {/* Readiness ring */}
        <div className="z-10 flex-shrink-0 flex flex-col items-center gap-3">
          <div className="relative" style={{ width: 168, height: 168 }}>
            <svg className="w-full h-full -rotate-90">
              <circle
                  className="text-slate-200 dark:text-slate-800"
                  strokeWidth="13" stroke="currentColor" fill="transparent"
                  r={radius} cx="84" cy="84"
              />
              <circle
                  className="text-cta transition-all duration-1000 ease-out"
                  strokeWidth="13" strokeDasharray={circumference} strokeDashoffset={dashOffset}
                  strokeLinecap="round" stroke="currentColor" fill="transparent"
                  r={radius} cx="84" cy="84"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-mono font-bold text-slate-900 dark:text-white tracking-tight">
              {progress}<span className="text-xl">%</span>
            </span>
              <span className="eyebrow mt-1">Sẵn sàng</span>
            </div>
          </div>
          <span className="pill pill-brand" style={{ padding: '6px 12px' }}>
          <CheckCircle2 className="w-3.5 h-3.5" />Vượt ngưỡng đạt
        </span>
        </div>
      </div>
  )
}

import type { CSSProperties } from 'react'
import { Timer, Play, Pause, SkipForward, RotateCcw } from 'lucide-react'
import { BentoCard } from '@/components/tracker/bento-card'
import { usePomodoroSetting, useUpdatePomodoroSetting } from '@/hooks/queries/tracker-pomodoro'
import type { PomodoroPreset } from '@/lib/api/tracker'
import { usePomodoro } from './use-pomodoro'

const PRESETS: { id: PomodoroPreset; label: string }[] = [
  { id: 'CLASSIC', label: 'Cổ điển' },
  { id: 'DEEP', label: 'Chuyên sâu' },
]

interface PomodoroCardProps {
  className?: string
  style?: CSSProperties
}

export function PomodoroCard({ className, style }: PomodoroCardProps) {
  const { data: setting } = usePomodoroSetting()
  const updatePreset = useUpdatePomodoroSetting()

  const focusMinutes = setting?.focusMinutes ?? 25
  const breakMinutes = setting?.breakMinutes ?? 5
  const preset = setting?.preset ?? 'CLASSIC'

  const timer = usePomodoro(focusMinutes, breakMinutes)
  const isFocus = timer.phase === 'focus'
  const accent = isFocus ? 'var(--brand)' : 'var(--gold)'

  return (
    <BentoCard
      icon={Timer}
      title="Pomodoro"
      className={className}
      style={style}
      action={
        <div className="row" style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: 3, gap: 2 }}>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => updatePreset.mutate(p.id)}
              style={{
                padding: '5px 10px', borderRadius: 'var(--radius-xs)', border: 'none', cursor: 'pointer',
                fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                background: preset === p.id ? 'var(--surface)' : 'transparent',
                color: preset === p.id ? 'var(--ink)' : 'var(--ink-3)',
                boxShadow: preset === p.id ? 'var(--shadow-sm)' : 'none',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="col" style={{ alignItems: 'center', justifyContent: 'center', gap: 16, flex: 1, padding: '6px 0' }}>
        <ProgressRing progress={timer.progress} accent={accent}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', color: accent }}>
            {isFocus ? 'TẬP TRUNG' : 'NGHỈ'}
          </span>
          <span className="mono" style={{ fontSize: 32, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.1 }}>
            {formatTime(timer.secondsLeft)}
          </span>
        </ProgressRing>

        <div className="row" style={{ gap: 10, alignItems: 'center' }}>
          <button onClick={timer.reset} className="iconbtn" title="Đặt lại" style={roundBtn}>
            <RotateCcw size={17} />
          </button>
          <button onClick={timer.toggle} className="btn3d" style={{ padding: '11px 24px' }}>
            {timer.running ? <Pause size={17} /> : <Play size={17} />}
            {timer.running ? 'Tạm dừng' : 'Bắt đầu'}
          </button>
          <button onClick={timer.skip} className="iconbtn" title="Bỏ qua" style={roundBtn}>
            <SkipForward size={17} />
          </button>
        </div>

        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
          Tập trung {focusMinutes}′ · Nghỉ {breakMinutes}′
        </span>
      </div>
    </BentoCard>
  )
}

function ProgressRing({ progress, accent, children }: { progress: number; accent: string; children: React.ReactNode }) {
  const size = 168
  const stroke = 8
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c * (1 - Math.min(1, Math.max(0, progress)))
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={accent} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s linear' }}
        />
      </svg>
      <div className="col" style={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        {children}
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const roundBtn: CSSProperties = { width: 40, height: 40, borderRadius: '50%' }

export default PomodoroCard

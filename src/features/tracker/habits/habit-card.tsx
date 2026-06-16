import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { Repeat, Plus, Check, Flame, ArrowRight } from 'lucide-react'
import { BentoCard } from '@/components/tracker/bento-card'
import { useHabits, useToggleHabitCheckin } from '@/hooks/queries/tracker-habits'
import type { HabitResponse } from '@/lib/api/habits'
import { HabitDialog } from './habit-dialog'

interface HabitCardProps {
  className?: string
  style?: CSSProperties
}

export function HabitCard({ className, style }: HabitCardProps) {
  const { data: habits = [], isLoading } = useHabits()
  const toggle = useToggleHabitCheckin()
  const [dialogOpen, setDialogOpen] = useState(false)

  // Today's focus: habits due today, undone first then done.
  const dueToday = habits
    .filter((h) => h.active && h.dueToday)
    .sort((a, b) => Number(a.checkedInToday) - Number(b.checkedInToday))
  const doneCount = dueToday.filter((h) => h.checkedInToday).length

  return (
    <>
      <BentoCard
        icon={Repeat}
        title="Thói quen"
        className={className}
        style={style}
        action={
          <>
            <Link to="/habits" className="navlink" style={{ fontSize: 12.5, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4, color: 'var(--ink-3)' }}>
              Quản lý <ArrowRight size={13} />
            </Link>
            <button onClick={() => setDialogOpen(true)} className="btn3d sm" style={{ padding: '7px 12px' }}>
              <Plus size={15} /> Thêm
            </button>
          </>
        }
      >
        {isLoading ? (
          <div className="col" style={{ gap: 8 }}>
            {[0, 1, 2].map((i) => <div key={i} style={{ height: 44, background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)' }} className="animate-pulse" />)}
          </div>
        ) : dueToday.length === 0 ? (
          <EmptyState hasAny={habits.length > 0} onAdd={() => setDialogOpen(true)} />
        ) : (
          <div className="col" style={{ gap: 8, minHeight: 0 }}>
            <div className="row" style={{ justifyContent: 'space-between', fontSize: 12, color: 'var(--ink-3)' }}>
              <span>Hôm nay</span>
              <span style={{ fontWeight: 600, color: 'var(--ink-2)' }}>{doneCount}/{dueToday.length}</span>
            </div>
            <div className="col scroll-area" style={{ gap: 6, overflowY: 'auto', minHeight: 0 }}>
              {dueToday.map((h) => (
                <HabitRow
                  key={h.id}
                  habit={h}
                  pending={toggle.isPending}
                  onToggle={() => toggle.mutate({ id: h.id, done: h.checkedInToday })}
                />
              ))}
            </div>
          </div>
        )}
      </BentoCard>

      <HabitDialog open={dialogOpen} habit={null} onClose={() => setDialogOpen(false)} />
    </>
  )
}

function HabitRow({ habit, onToggle, pending }: { habit: HabitResponse; onToggle: () => void; pending: boolean }) {
  const done = habit.checkedInToday
  return (
    <div
      className="row"
      style={{
        alignItems: 'center', gap: 10, padding: '8px 10px',
        background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)',
      }}
    >
      <button
        onClick={onToggle}
        disabled={pending}
        aria-label={done ? 'Bỏ hoàn thành' : 'Đánh dấu hoàn thành'}
        style={{
          width: 24, height: 24, flexShrink: 0, borderRadius: '50%', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid ' + (done ? 'var(--color-accent)' : 'var(--border-2, var(--border))'),
          background: done ? 'var(--color-accent)' : 'transparent',
          color: '#fff', transition: 'all .15s',
        }}
      >
        {done && <Check size={14} strokeWidth={3} />}
      </button>
      <span
        style={{
          flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: 500,
          color: done ? 'var(--ink-3)' : 'var(--ink)',
          textDecoration: done ? 'line-through' : 'none',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}
      >
        {habit.name}
      </span>
      {habit.currentStreak > 0 && (
        <span className="row" style={{ alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 700, color: '#f97316', flexShrink: 0 }}>
          <Flame size={13} /> {habit.currentStreak}
        </span>
      )}
    </div>
  )
}

function EmptyState({ hasAny, onAdd }: { hasAny: boolean; onAdd: () => void }) {
  return (
    <div className="col" style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 120, color: 'var(--ink-3)', textAlign: 'center' }}>
      <Repeat size={26} style={{ opacity: 0.5 }} />
      <span style={{ fontSize: 12.5 }}>
        {hasAny ? 'Không có thói quen nào cần làm hôm nay 🎉' : 'Chưa có thói quen nào'}
      </span>
      {!hasAny && (
        <button onClick={onAdd} className="btn3d sm" style={{ padding: '6px 12px' }}>
          <Plus size={14} /> Tạo thói quen đầu tiên
        </button>
      )}
    </div>
  )
}

export default HabitCard

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Repeat, Plus, Flame, Check, Pencil, Clock } from 'lucide-react'
import { useHabits, useToggleHabitCheckin } from '@/hooks/queries/tracker-habits'
import { habitsApi, type HabitResponse } from '@/lib/api/habits'
import { keys } from '@/lib/query-keys'
import { HabitDialog, WEEKDAYS } from '@/features/tracker/habits/habit-dialog'

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/** Last 7 calendar days, oldest first, as { iso, label } where label is the weekday short name. */
function last7Days(): { iso: string; label: string }[] {
  const out: { iso: string; label: string }[] = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    // JS getDay(): 0=Sun..6=Sat → map to WEEKDAYS (Mon-first)
    const idx = (d.getDay() + 6) % 7
    out.push({ iso: isoDate(d), label: WEEKDAYS[idx].label })
  }
  return out
}

function frequencyLabel(h: HabitResponse): string {
  if (h.frequency === 'DAILY') return 'Hằng ngày'
  const labels = WEEKDAYS.filter((d) => h.weekdays.includes(d.value)).map((d) => d.label)
  return labels.length ? labels.join(' · ') : 'Theo thứ'
}

export default function HabitsPage() {
  const { data: habits = [], isLoading } = useHabits()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<HabitResponse | null>(null)

  function openCreate() {
    setEditing(null)
    setDialogOpen(true)
  }
  function openEdit(h: HabitResponse) {
    setEditing(h)
    setDialogOpen(true)
  }

  const active = habits.filter((h) => h.active)
  const inactive = habits.filter((h) => !h.active)

  return (
    <div className="col" style={{ gap: 16, maxWidth: 860, margin: '0 auto', width: '100%' }}>
      <header className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div className="row" style={{ alignItems: 'center', gap: 12 }}>
          <span className="itile" style={{ width: 40, height: 40, background: 'var(--color-accent-soft)', color: 'var(--color-accent-ink)' }}>
            <Repeat size={21} />
          </span>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-ink)' }}>Thói quen</h1>
            <p style={{ fontSize: 12.5, color: 'var(--color-ink-faint)', marginTop: 2 }}>
              Xây dựng thói quen tốt mỗi ngày và giữ chuỗi.
            </p>
          </div>
        </div>
        <button onClick={openCreate} className="btn3d sm" style={{ padding: '8px 14px' }}>
          <Plus size={16} /> Thêm thói quen
        </button>
      </header>

      {isLoading ? (
        <div className="col" style={{ gap: 10 }}>
          {[0, 1, 2].map((i) => <div key={i} style={{ height: 76, background: 'var(--surface-2)', borderRadius: 'var(--radius-lg)' }} className="animate-pulse" />)}
        </div>
      ) : habits.length === 0 ? (
        <div className="card col" style={{ alignItems: 'center', justifyContent: 'center', gap: 10, padding: '48px 24px', textAlign: 'center' }}>
          <Repeat size={32} style={{ opacity: 0.5, color: 'var(--ink-3)' }} />
          <p style={{ fontSize: 14, color: 'var(--ink-2)', fontWeight: 600 }}>Chưa có thói quen nào</p>
          <p style={{ fontSize: 12.5, color: 'var(--ink-3)' }}>Bắt đầu bằng một thói quen nhỏ, dễ duy trì.</p>
          <button onClick={openCreate} className="btn3d sm" style={{ padding: '8px 14px', marginTop: 4 }}>
            <Plus size={15} /> Tạo thói quen đầu tiên
          </button>
        </div>
      ) : (
        <div className="col" style={{ gap: 10 }}>
          {active.map((h) => <HabitRow key={h.id} habit={h} onEdit={() => openEdit(h)} />)}
          {inactive.length > 0 && (
            <>
              <p className="eyebrow" style={{ marginTop: 8 }}>Tạm dừng</p>
              {inactive.map((h) => <HabitRow key={h.id} habit={h} onEdit={() => openEdit(h)} />)}
            </>
          )}
        </div>
      )}

      <HabitDialog open={dialogOpen} habit={editing} onClose={() => setDialogOpen(false)} />
    </div>
  )
}

function HabitRow({ habit, onEdit }: { habit: HabitResponse; onEdit: () => void }) {
  const toggle = useToggleHabitCheckin()
  const days = last7Days()
  const { data: history = [] } = useQuery({
    queryKey: keys.tracker.habitHistory(habit.id),
    queryFn: () => habitsApi.history(habit.id, days[0].iso, days[6].iso),
  })
  const doneSet = new Set(history)
  const done = habit.checkedInToday

  return (
    <div
      className="card row"
      style={{
        alignItems: 'center', gap: 14, padding: '14px 16px', opacity: habit.active ? 1 : 0.6,
      }}
    >
      {/* Today toggle */}
      <button
        onClick={() => toggle.mutate({ id: habit.id, done })}
        disabled={toggle.isPending || !habit.dueToday}
        title={!habit.dueToday ? 'Hôm nay không đến lịch' : done ? 'Bỏ hoàn thành' : 'Hoàn thành hôm nay'}
        style={{
          width: 30, height: 30, flexShrink: 0, borderRadius: '50%',
          cursor: habit.dueToday ? 'pointer' : 'not-allowed',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          border: '2px solid ' + (done ? 'var(--color-accent)' : 'var(--border-2, var(--border))'),
          background: done ? 'var(--color-accent)' : 'transparent', color: '#fff',
          opacity: habit.dueToday ? 1 : 0.4,
        }}
      >
        {done && <Check size={16} strokeWidth={3} />}
      </button>

      {/* Name + meta */}
      <div className="col" style={{ flex: 1, minWidth: 0, gap: 3 }}>
        <span style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {habit.name}
        </span>
        <span className="row" style={{ gap: 10, fontSize: 12, color: 'var(--ink-3)', flexWrap: 'wrap' }}>
          <span>{frequencyLabel(habit)}</span>
          {habit.reminderTime && (
            <span className="row" style={{ gap: 3, alignItems: 'center' }}><Clock size={12} /> {habit.reminderTime}</span>
          )}
        </span>
      </div>

      {/* Last 7 days */}
      <div className="row" style={{ gap: 4, flexShrink: 0 }}>
        {days.map((d) => {
          const hit = doneSet.has(d.iso)
          return (
            <div key={d.iso} className="col" style={{ alignItems: 'center', gap: 3 }} title={d.iso}>
              <span style={{ fontSize: 9.5, color: 'var(--ink-3)' }}>{d.label}</span>
              <span
                style={{
                  width: 16, height: 16, borderRadius: '50%',
                  background: hit ? 'var(--color-accent)' : 'var(--surface-2)',
                  border: '1px solid ' + (hit ? 'var(--color-accent)' : 'var(--border)'),
                }}
              />
            </div>
          )
        })}
      </div>

      {/* Streak */}
      <div className="col" style={{ alignItems: 'center', gap: 1, flexShrink: 0, minWidth: 40 }}>
        <span className="row" style={{ alignItems: 'center', gap: 3, fontSize: 15, fontWeight: 800, color: habit.currentStreak > 0 ? '#f97316' : 'var(--ink-3)' }}>
          <Flame size={15} /> {habit.currentStreak}
        </span>
        <span style={{ fontSize: 10, color: 'var(--ink-3)' }}>chuỗi</span>
      </div>

      <button onClick={onEdit} className="iconbtn" title="Chỉnh sửa" style={{ flexShrink: 0 }}>
        <Pencil size={16} />
      </button>
    </div>
  )
}

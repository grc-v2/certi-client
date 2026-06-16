import { useMemo, useState, type CSSProperties } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { TrackerModal } from '@/components/tracker/tracker-modal'
import type { TaskResponse, TaskStatus } from '@/lib/api/tracker'
import { STATUS_META } from './task-meta'

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
const MONTHS = Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`)

interface CalendarViewProps {
  tasks: TaskResponse[]
  onOpen: (task: TaskResponse) => void
  onCreateOn: (dateIso: string) => void
}

/** Month grid (Monday-first) that drops each task onto its due date. */
export function CalendarView({ tasks, onOpen, onCreateOn }: CalendarViewProps) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })
  const [dayView, setDayView] = useState<string | null>(null)

  const byDate = useMemo(() => {
    const map = new Map<string, TaskResponse[]>()
    for (const t of tasks) {
      if (!t.dueDate) continue
      const list = map.get(t.dueDate) ?? []
      list.push(t)
      map.set(t.dueDate, list)
    }
    return map
  }, [tasks])

  const cells = useMemo(() => buildMonthCells(cursor.year, cursor.month), [cursor])

  function shift(delta: number) {
    setCursor(({ year, month }) => {
      const next = new Date(year, month + delta, 1)
      return { year: next.getFullYear(), month: next.getMonth() }
    })
  }

  const today = toIsoDate(new Date())
  const dayTasksInView = dayView ? byDate.get(dayView) ?? [] : []

  return (
    <>
      <div className="col" style={{ height: '100%', minHeight: 0 }}>
        <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>
            {MONTHS[cursor.month]} {cursor.year}
          </h3>
          <div className="row" style={{ gap: 6 }}>
            <button onClick={() => shift(-1)} className="iconbtn" title="Tháng trước" style={navBtn}><ChevronLeft size={17} /></button>
            <button onClick={() => shift(1)} className="iconbtn" title="Tháng sau" style={navBtn}><ChevronRight size={17} /></button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 6 }}>
          {WEEKDAYS.map((d) => (
            <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--ink-3)' }}>{d}</div>
          ))}
        </div>

        <div
          className="scroll-area"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: 'minmax(80px, 1fr)', gap: 6, flex: 1, minHeight: 0, overflowY: 'auto' }}
        >
          {cells.map((cell) => {
            const dayTasks = byDate.get(cell.iso) ?? []
            const isToday = cell.iso === today
            return (
              <button
                key={cell.iso}
                type="button"
                onClick={() => setDayView(cell.iso)}
                className="col"
                style={{
                  gap: 4, padding: 6, textAlign: 'left', cursor: 'pointer', overflow: 'hidden',
                  borderRadius: 'var(--radius-sm)', border: 'none',
                  background: cell.inMonth ? 'var(--surface-2)' : 'transparent',
                }}
              >
                <span
                  style={{
                    display: 'grid', placeItems: 'center', width: 20, height: 20, borderRadius: '50%',
                    fontSize: 11, fontWeight: 600,
                    background: isToday ? 'var(--brand)' : 'transparent',
                    color: isToday ? '#fff' : cell.inMonth ? 'var(--ink-2)' : 'var(--ink-3)',
                  }}
                >
                  {cell.day}
                </span>
                <div className="col" style={{ gap: 3, flex: 1, minHeight: 0, overflow: 'hidden' }}>
                  {dayTasks.slice(0, 2).map((t) => (
                    <span
                      key={t.id}
                      onClick={(e) => { e.stopPropagation(); onOpen(t) }}
                      style={{ ...chipStyle(t.status), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {t.title}
                    </span>
                  ))}
                  {dayTasks.length > 2 && (
                    <span style={{ paddingLeft: 4, fontSize: 10, color: 'var(--ink-3)' }}>+{dayTasks.length - 2}</span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <TrackerModal open={dayView !== null} title={dayView ? formatFullDate(dayView) : ''} onClose={() => setDayView(null)}>
        {dayTasksInView.length > 0 ? (
          <div className="col" style={{ gap: 6 }}>
            {dayTasksInView.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => { onOpen(t); setDayView(null) }}
                className="row"
                style={{ gap: 12, alignItems: 'flex-start', padding: '10px 12px', textAlign: 'left', cursor: 'pointer', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</p>
                  {t.description && <p style={{ marginTop: 2, fontSize: 11.5, color: 'var(--ink-3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.description}</p>}
                </div>
                <span style={chipStyle(t.status)}>{STATUS_META[t.status].label}</span>
              </button>
            ))}
          </div>
        ) : (
          <p style={{ padding: '8px 0', textAlign: 'center', fontSize: 13.5, color: 'var(--ink-3)' }}>Chưa có task nào trong ngày này.</p>
        )}
        <button
          onClick={() => { if (dayView) onCreateOn(dayView); setDayView(null) }}
          className="btn3d sm"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <Plus size={16} /> Thêm task ngày này
        </button>
      </TrackerModal>
    </>
  )
}

function chipStyle(status: TaskStatus): CSSProperties {
  const dot = STATUS_META[status].dot
  return {
    padding: '2px 7px', borderRadius: 6, fontSize: 10.5, fontWeight: 600, lineHeight: 1.3,
    background: `color-mix(in srgb, ${dot} 16%, transparent)`,
    color: `color-mix(in srgb, ${dot} 75%, var(--ink))`,
    cursor: 'pointer', width: 'fit-content', maxWidth: '100%',
  }
}

function formatFullDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`)
  const weekday = ['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][d.getDay()]
  return `${weekday}, ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`
}

interface Cell { iso: string; day: number; inMonth: boolean }

function buildMonthCells(year: number, month: number): Cell[] {
  const first = new Date(year, month, 1)
  const offset = (first.getDay() + 6) % 7 // Monday = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const weeks = Math.ceil((offset + daysInMonth) / 7)
  const start = new Date(year, month, 1 - offset)
  return Array.from({ length: weeks * 7 }, (_, i) => {
    const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    return { iso: toIsoDate(d), day: d.getDate(), inMonth: d.getMonth() === month }
  })
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const navBtn: CSSProperties = { width: 32, height: 32, borderRadius: 'var(--radius-xs)' }

export default CalendarView

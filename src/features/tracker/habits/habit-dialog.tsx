import { useEffect, useState, type CSSProperties } from 'react'
import { Trash2 } from 'lucide-react'
import { TrackerModal } from '@/components/tracker/tracker-modal'
import type { HabitFrequency, HabitResponse, Weekday } from '@/lib/api/habits'
import { useCreateHabit, useUpdateHabit, useDeleteHabit } from '@/hooks/queries/tracker-habits'

/** Weekdays in display order with short Vietnamese labels. */
export const WEEKDAYS: { value: Weekday; label: string }[] = [
  { value: 'MONDAY', label: 'T2' },
  { value: 'TUESDAY', label: 'T3' },
  { value: 'WEDNESDAY', label: 'T4' },
  { value: 'THURSDAY', label: 'T5' },
  { value: 'FRIDAY', label: 'T6' },
  { value: 'SATURDAY', label: 'T7' },
  { value: 'SUNDAY', label: 'CN' },
]

interface HabitDialogProps {
  open: boolean
  /** The habit being edited, or null to create a new one. */
  habit: HabitResponse | null
  onClose: () => void
}

export function HabitDialog({ open, habit, onClose }: HabitDialogProps) {
  const isEdit = habit != null
  const [name, setName] = useState('')
  const [frequency, setFrequency] = useState<HabitFrequency>('DAILY')
  const [weekdays, setWeekdays] = useState<Weekday[]>([])
  const [reminderTime, setReminderTime] = useState('')
  const [active, setActive] = useState(true)

  const createHabit = useCreateHabit()
  const updateHabit = useUpdateHabit()
  const deleteHabit = useDeleteHabit()
  const saving = createHabit.isPending || updateHabit.isPending

  useEffect(() => {
    if (!open) return
    setName(habit?.name ?? '')
    setFrequency(habit?.frequency ?? 'DAILY')
    setWeekdays(habit?.weekdays ?? [])
    setReminderTime(habit?.reminderTime ?? '')
    setActive(habit?.active ?? true)
  }, [open, habit])

  function toggleDay(day: Weekday) {
    setWeekdays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]))
  }

  function save() {
    const trimmed = name.trim()
    if (!trimmed || saving) return
    const payload = {
      name: trimmed,
      frequency,
      weekdays: frequency === 'WEEKLY' ? weekdays : [],
      // empty string clears the reminder on the backend
      reminderTime: reminderTime || '',
    }
    if (isEdit && habit) {
      updateHabit.mutate({ id: habit.id, data: { ...payload, active } }, { onSuccess: onClose })
    } else {
      createHabit.mutate(payload, { onSuccess: onClose })
    }
  }

  function remove() {
    if (habit && window.confirm('Xoá thói quen này? Toàn bộ lịch sử check-in sẽ mất.')) {
      deleteHabit.mutate(habit.id, { onSuccess: onClose })
    }
  }

  const canSave = name.trim().length > 0 && !(frequency === 'WEEKLY' && weekdays.length === 0) && !saving

  return (
    <TrackerModal
      open={open}
      title={isEdit ? 'Chỉnh sửa thói quen' : 'Thêm thói quen'}
      onClose={onClose}
      footer={
        <>
          {isEdit && (
            <button onClick={remove} className="iconbtn" title="Xoá" style={{ marginRight: 'auto', color: 'var(--hard)' }}>
              <Trash2 size={17} />
            </button>
          )}
          <button onClick={onClose} className="btn3d ghost sm">Huỷ</button>
          <button onClick={save} disabled={!canSave} className="btn3d sm">Lưu</button>
        </>
      }
    >
      <label className="col" style={fieldStyle}>
        <span style={labelStyle}>Tên thói quen</span>
        <input value={name} onChange={(e) => setName(e.target.value)} autoFocus placeholder="vd: Đọc sách 20 phút" style={inputStyle} />
      </label>

      <div className="col" style={fieldStyle}>
        <span style={labelStyle}>Tần suất</span>
        <div className="row" style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: 3, gap: 2 }}>
          <FreqButton active={frequency === 'DAILY'} onClick={() => setFrequency('DAILY')} label="Hằng ngày" />
          <FreqButton active={frequency === 'WEEKLY'} onClick={() => setFrequency('WEEKLY')} label="Theo thứ" />
        </div>
      </div>

      {frequency === 'WEEKLY' && (
        <div className="col" style={fieldStyle}>
          <span style={labelStyle}>Các ngày trong tuần</span>
          <div className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
            {WEEKDAYS.map((d) => {
              const on = weekdays.includes(d.value)
              return (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => toggleDay(d.value)}
                  style={{
                    width: 40, height: 36, borderRadius: 'var(--radius-sm)', fontSize: 12.5, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                    border: '1px solid ' + (on ? 'var(--color-accent)' : 'var(--border)'),
                    background: on ? 'var(--color-accent)' : 'var(--surface-2)',
                    color: on ? '#fff' : 'var(--ink-2)',
                  }}
                >
                  {d.label}
                </button>
              )
            })}
          </div>
          {weekdays.length === 0 && <span style={{ fontSize: 11.5, color: 'var(--hard)' }}>Chọn ít nhất một ngày</span>}
        </div>
      )}

      <label className="col" style={fieldStyle}>
        <span style={labelStyle}>Giờ nhắc (tuỳ chọn)</span>
        <input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} style={inputStyle} />
        <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>Nhận thông báo nhắc nếu chưa hoàn thành trong ngày.</span>
      </label>

      {isEdit && (
        <label className="row" style={{ gap: 10, alignItems: 'center', cursor: 'pointer' }}>
          <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
          <span style={{ fontSize: 13, color: 'var(--ink-2)' }}>Đang theo dõi</span>
        </label>
      )}
    </TrackerModal>
  )
}

function FreqButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex: 1, height: 34, borderRadius: 'var(--radius-xs)', fontSize: 13, fontWeight: 600,
        cursor: 'pointer', border: 'none', fontFamily: 'inherit',
        background: active ? 'var(--surface)' : 'transparent',
        color: active ? 'var(--ink)' : 'var(--ink-3)',
        boxShadow: active ? 'var(--shadow-sm, 0 1px 2px rgba(0,0,0,.08))' : 'none',
      }}
    >
      {label}
    </button>
  )
}

const fieldStyle: CSSProperties = { gap: 6 }
const labelStyle: CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--ink-2)' }
const inputStyle: CSSProperties = {
  height: 40,
  padding: '0 12px',
  fontSize: 13.5,
  color: 'var(--ink)',
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  outline: 'none',
  fontFamily: 'inherit',
  width: '100%',
}

export default HabitDialog

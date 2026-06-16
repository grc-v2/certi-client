import { useEffect, useState, type CSSProperties } from 'react'
import { Trash2 } from 'lucide-react'
import { TrackerModal } from '@/components/tracker/tracker-modal'
import { usePomodoroSetting, useUpdatePomodoroSetting } from '@/hooks/queries/tracker-pomodoro'
import { useResetTrackerData } from '@/hooks/queries/tracker-data'
import type { PomodoroPreset } from '@/lib/api/tracker'

const PRESETS: { id: PomodoroPreset; label: string; hint: string }[] = [
  { id: 'CLASSIC', label: 'Cổ điển', hint: '25′ / 5′' },
  { id: 'DEEP', label: 'Chuyên sâu', hint: '50′ / 10′' },
]

interface SettingsDialogProps {
  open: boolean
  boardTitle: string
  onBoardTitleChange: (title: string) => void
  onClose: () => void
}

export function SettingsDialog({ open, boardTitle, onBoardTitleChange, onClose }: SettingsDialogProps) {
  const { data: setting } = usePomodoroSetting()
  const updatePreset = useUpdatePomodoroSetting()
  const resetData = useResetTrackerData()
  const [title, setTitle] = useState(boardTitle)

  useEffect(() => {
    if (open) setTitle(boardTitle)
  }, [open, boardTitle])

  const preset = setting?.preset ?? 'CLASSIC'

  function save() {
    onBoardTitleChange(title.trim() || boardTitle)
    onClose()
  }

  function reset() {
    if (window.confirm('Xoá toàn bộ task, tài nguyên và nhóm? Cài đặt được giữ lại. Không thể hoàn tác.')) {
      resetData.mutate()
    }
  }

  return (
    <TrackerModal
      open={open}
      title="Cài đặt"
      onClose={onClose}
      footer={
        <>
          <button onClick={onClose} className="btn3d ghost sm">Đóng</button>
          <button onClick={save} className="btn3d sm">Lưu</button>
        </>
      }
    >
      <label className="col" style={{ gap: 6 }}>
        <span style={labelStyle}>Tên bảng</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} placeholder="Tên hiển thị ở đầu trang" />
      </label>

      <div className="col" style={{ gap: 6 }}>
        <span style={labelStyle}>Pomodoro</span>
        <div className="row" style={{ gap: 8 }}>
          {PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => updatePreset.mutate(p.id)}
              className="col"
              style={{
                flex: 1, gap: 2, padding: '10px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer',
                fontFamily: 'inherit', alignItems: 'flex-start',
                border: `1px solid ${preset === p.id ? 'var(--brand)' : 'var(--border)'}`,
                background: preset === p.id ? 'var(--brand-soft)' : 'var(--surface-2)',
              }}
            >
              <span style={{ fontSize: 13.5, fontWeight: 700, color: preset === p.id ? 'var(--brand-deep)' : 'var(--ink)' }}>{p.label}</span>
              <span style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{p.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="col" style={{ gap: 6 }}>
        <span style={labelStyle}>Dữ liệu</span>
        <button onClick={reset} disabled={resetData.isPending} className="row" style={resetBtnStyle}>
          <Trash2 size={16} /> Đặt lại dữ liệu (task, tài nguyên, nhóm)
        </button>
      </div>
    </TrackerModal>
  )
}

const labelStyle: CSSProperties = { fontSize: 12, fontWeight: 600, color: 'var(--ink-2)' }
const inputStyle: CSSProperties = {
  height: 40, padding: '0 12px', fontSize: 13.5, color: 'var(--ink)', width: '100%',
  background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', outline: 'none', fontFamily: 'inherit',
}
const resetBtnStyle: CSSProperties = {
  gap: 8, alignItems: 'center', justifyContent: 'center', padding: '10px 14px', cursor: 'pointer',
  fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
  background: 'var(--hard-soft)', color: 'var(--hard)', border: '1px solid transparent', borderRadius: 'var(--radius-sm)',
}

export default SettingsDialog

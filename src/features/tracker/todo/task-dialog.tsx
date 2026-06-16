import { useEffect, useState, type CSSProperties } from 'react'
import { Trash2 } from 'lucide-react'
import { TrackerModal } from '@/components/tracker/tracker-modal'
import type { TaskResponse, TaskStatus } from '@/lib/api/tracker'
import { useCreateTask, useUpdateTask, useDeleteTask } from '@/hooks/queries/tracker-tasks'
import { STATUS_META, TASK_STATUSES } from './task-meta'

interface TaskDialogProps {
  open: boolean
  /** The task being edited, or null to create a new one. */
  task: TaskResponse | null
  /** Pre-fill the due date when creating (e.g. from a calendar day). */
  defaultDueDate?: string
  onClose: () => void
}

export function TaskDialog({ open, task, defaultDueDate, onClose }: TaskDialogProps) {
  const isEdit = task != null
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState<TaskStatus>('BACKLOG')

  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const saving = createTask.isPending || updateTask.isPending

  useEffect(() => {
    if (!open) return
    setTitle(task?.title ?? '')
    setDescription(task?.description ?? '')
    setDueDate(task?.dueDate ?? defaultDueDate ?? '')
    setStatus(task?.status ?? 'BACKLOG')
  }, [open, task, defaultDueDate])

  function save() {
    const trimmed = title.trim()
    if (!trimmed || saving) return
    if (isEdit && task) {
      updateTask.mutate(
        { id: task.id, data: { title: trimmed, description, dueDate, status } },
        { onSuccess: onClose },
      )
    } else {
      createTask.mutate(
        { title: trimmed, description, dueDate: dueDate || undefined },
        { onSuccess: onClose },
      )
    }
  }

  function remove() {
    if (task && window.confirm('Xoá task này?')) {
      deleteTask.mutate(task.id, { onSuccess: onClose })
    }
  }

  return (
    <TrackerModal
      open={open}
      title={isEdit ? 'Chỉnh sửa task' : 'Thêm task'}
      onClose={onClose}
      footer={
        <>
          {isEdit && (
            <button onClick={remove} className="iconbtn" title="Xoá" style={{ marginRight: 'auto', color: 'var(--hard)' }}>
              <Trash2 size={17} />
            </button>
          )}
          <button onClick={onClose} className="btn3d ghost sm">Huỷ</button>
          <button onClick={save} disabled={!title.trim() || saving} className="btn3d sm">Lưu</button>
        </>
      }
    >
      <label className="col" style={fieldStyle}>
        <span style={labelStyle}>Tiêu đề</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus placeholder="Cần làm gì?" style={inputStyle} />
      </label>

      <label className="col" style={fieldStyle}>
        <span style={labelStyle}>Mô tả</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Chi tiết (tuỳ chọn)" style={{ ...inputStyle, height: 'auto', resize: 'vertical', lineHeight: 1.5, paddingTop: 9 }} />
      </label>

      <div className="row" style={{ gap: 12 }}>
        <label className="col" style={{ ...fieldStyle, flex: 1 }}>
          <span style={labelStyle}>Hạn</span>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={inputStyle} />
        </label>
        {isEdit && (
          <label className="col" style={{ ...fieldStyle, flex: 1 }}>
            <span style={labelStyle}>Trạng thái</span>
            <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} style={inputStyle}>
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_META[s].label}</option>
              ))}
            </select>
          </label>
        )}
      </div>
    </TrackerModal>
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

export default TaskDialog

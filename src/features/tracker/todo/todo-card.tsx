import { useState, type CSSProperties } from 'react'
import { ListChecks, LayoutGrid, Calendar, Plus } from 'lucide-react'
import { BentoCard } from '@/components/tracker/bento-card'
import { useTasks, useReorderTasks } from '@/hooks/queries/tracker-tasks'
import type { TaskResponse } from '@/lib/api/tracker'
import { KanbanBoard } from './kanban-board'
import { CalendarView } from './calendar-view'
import { TaskDialog } from './task-dialog'

type View = 'board' | 'calendar'

interface TodoCardProps {
  className?: string
  style?: CSSProperties
}

export function TodoCard({ className, style }: TodoCardProps) {
  const { data: tasks = [], isLoading } = useTasks()
  const reorderTasks = useReorderTasks()
  const [view, setView] = useState<View>('board')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<TaskResponse | null>(null)
  const [createDueDate, setCreateDueDate] = useState<string | undefined>(undefined)

  function openCreate(dueDate?: string) {
    setEditing(null)
    setCreateDueDate(dueDate)
    setDialogOpen(true)
  }

  function openEdit(task: TaskResponse) {
    setEditing(task)
    setCreateDueDate(undefined)
    setDialogOpen(true)
  }

  return (
    <>
      <BentoCard
        icon={ListChecks}
        title="Todo"
        className={className}
        style={style}
        action={
          <>
            <div className="row" style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', padding: 3, gap: 2 }}>
              <ViewButton active={view === 'board'} onClick={() => setView('board')} icon={LayoutGrid} label="Board" />
              <ViewButton active={view === 'calendar'} onClick={() => setView('calendar')} icon={Calendar} label="Lịch" />
            </div>
            <button onClick={() => openCreate()} className="btn3d sm" style={{ padding: '7px 12px' }}>
              <Plus size={15} /> Thêm
            </button>
          </>
        }
      >
        {view === 'board' ? (
          isLoading ? (
            <BoardSkeleton />
          ) : (
            <KanbanBoard tasks={tasks} onReorder={(items) => reorderTasks.mutate(items)} onOpen={openEdit} />
          )
        ) : (
          <CalendarView tasks={tasks} onOpen={openEdit} onCreateOn={(date) => openCreate(date)} />
        )}
      </BentoCard>

      <TaskDialog open={dialogOpen} task={editing} defaultDueDate={createDueDate} onClose={() => setDialogOpen(false)} />
    </>
  )
}

function ViewButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof LayoutGrid; label: string }) {
  return (
    <button
      onClick={onClick}
      className="row"
      style={{
        alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 'var(--radius-xs)',
        border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit',
        background: active ? 'var(--surface)' : 'transparent',
        color: active ? 'var(--ink)' : 'var(--ink-3)',
        boxShadow: active ? 'var(--shadow-sm)' : 'none',
      }}
    >
      <Icon size={14} /> {label}
    </button>
  )
}

function BoardSkeleton() {
  const col: CSSProperties = { flex: 1, background: 'var(--surface-2)', borderRadius: 'var(--radius)', minHeight: 160, animation: 'pulse 1.5s ease-in-out infinite' }
  return (
    <div className="row" style={{ gap: 10, height: '100%' }}>
      {[0, 1, 2, 3].map((n) => <div key={n} style={col} />)}
    </div>
  )
}

export default TodoCard

import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import {
  DndContext, DragOverlay, KeyboardSensor, PointerSensor, TouchSensor,
  closestCorners, useDroppable, useSensor, useSensors,
  type DragEndEvent, type DragOverEvent, type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CalendarClock } from 'lucide-react'
import type { ReorderTaskItem, TaskResponse, TaskStatus } from '@/lib/api/tracker'
import { STATUS_META, TASK_STATUSES, dueState, dueTone, formatShortDate } from './task-meta'

type Columns = Record<TaskStatus, number[]>

interface KanbanBoardProps {
  tasks: TaskResponse[]
  onReorder: (items: ReorderTaskItem[]) => void
  onOpen: (task: TaskResponse) => void
}

function columnsFromTasks(tasks: TaskResponse[]): Columns {
  const cols = Object.fromEntries(TASK_STATUSES.map((s) => [s, [] as number[]])) as Columns
  const sorted = [...tasks].sort((a, b) => a.orderIndex - b.orderIndex)
  for (const t of sorted) cols[t.status]?.push(t.id)
  return cols
}

/**
 * Four-column board with sortable drag-and-drop. Cards reorder within a column and
 * move across columns (siblings shift to open a gap); the new arrangement is
 * flattened into `{id, status, orderIndex}` items and persisted on drop.
 */
export function KanbanBoard({ tasks, onReorder, onOpen }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<number | null>(null)
  const [columns, setColumns] = useState<Columns>(() => columnsFromTasks(tasks))

  const taskMap = useMemo(() => {
    const m = new Map<number, TaskResponse>()
    for (const t of tasks) m.set(t.id, t)
    return m
  }, [tasks])

  // Re-sync from props when not mid-drag (add/edit/delete elsewhere).
  useEffect(() => {
    if (activeId == null) setColumns(columnsFromTasks(tasks))
  }, [tasks, activeId])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 140, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function findColumn(id: number | string): TaskStatus | null {
    if (TASK_STATUSES.includes(id as TaskStatus)) return id as TaskStatus
    const numId = Number(id)
    return TASK_STATUSES.find((s) => columns[s].includes(numId)) ?? null
  }

  function persist(next: Columns) {
    const items: ReorderTaskItem[] = []
    for (const status of TASK_STATUSES) {
      next[status].forEach((id, index) => items.push({ id, status, orderIndex: index }))
    }
    onReorder(items)
  }

  function handleDragStart(e: DragStartEvent) {
    setActiveId(Number(e.active.id))
  }

  function handleDragOver(e: DragOverEvent) {
    const { active, over } = e
    if (!over) return
    const from = findColumn(active.id)
    const to = findColumn(over.id)
    if (!from || !to || from === to) return
    const activeNum = Number(active.id)

    setColumns((prev) => {
      const overItems = prev[to]
      const overIndex = overItems.indexOf(Number(over.id))
      const insertAt = overIndex >= 0 ? overIndex : overItems.length
      return {
        ...prev,
        [from]: prev[from].filter((id) => id !== activeNum),
        [to]: [...overItems.slice(0, insertAt), activeNum, ...overItems.slice(insertAt)],
      }
    })
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    setActiveId(null)
    if (!over) return
    const from = findColumn(active.id)
    const to = findColumn(over.id)
    if (!from || !to) return

    let next = columns
    if (from === to) {
      const items = columns[from]
      const oldIndex = items.indexOf(Number(active.id))
      const newIndex = items.indexOf(Number(over.id))
      if (newIndex !== -1 && oldIndex !== newIndex) {
        next = { ...columns, [from]: arrayMove(items, oldIndex, newIndex) }
        setColumns(next)
      }
    }
    persist(next)
  }

  const activeTask = activeId != null ? taskMap.get(activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div
        className="scroll-area"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(140px, 1fr))', gap: 10, height: '100%', overflow: 'auto', paddingBottom: 2 }}
      >
        {TASK_STATUSES.map((status) => (
          <Column key={status} status={status} ids={columns[status]} taskMap={taskMap} onOpen={onOpen} />
        ))}
      </div>
      <DragOverlay dropAnimation={{ duration: 180 }}>
        {activeTask ? <TaskCardBody task={activeTask} overlay /> : null}
      </DragOverlay>
    </DndContext>
  )
}

interface ColumnProps {
  status: TaskStatus
  ids: number[]
  taskMap: Map<number, TaskResponse>
  onOpen: (task: TaskResponse) => void
}

function Column({ status, ids, taskMap, onOpen }: ColumnProps) {
  const meta = STATUS_META[status]
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div
      ref={setNodeRef}
      className="col"
      style={{
        minHeight: 0,
        background: isOver ? 'var(--brand-soft)' : 'var(--surface-2)',
        borderRadius: 'var(--radius)',
        padding: 8,
        transition: 'background .15s',
      }}
    >
      <div className="row" style={{ alignItems: 'center', gap: 7, padding: '2px 4px 8px' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: meta.dot }} />
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>{meta.label}</span>
        <span style={{ marginLeft: 'auto', fontSize: 11.5, fontWeight: 600, color: 'var(--ink-3)' }}>{ids.length}</span>
      </div>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div className="col scroll-area" style={{ gap: 8, flex: 1, minHeight: 40, overflowY: 'auto' }}>
          {ids.map((id) => {
            const task = taskMap.get(id)
            return task ? <SortableTaskCard key={id} task={task} onClick={() => onOpen(task)} /> : null
          })}
        </div>
      </SortableContext>
    </div>
  )
}

function SortableTaskCard({ task, onClick }: { task: TaskResponse; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onClick}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        ...cardStyle,
      }}
      {...attributes}
      {...listeners}
    >
      <TaskCardBody task={task} />
    </button>
  )
}

function TaskCardBody({ task, overlay }: { task: TaskResponse; overlay?: boolean }) {
  const isDone = task.status === 'DONE'
  const due = dueState(task.dueDate)
  const body = (
    <>
      <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.35, color: 'var(--ink)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {task.title}
      </p>
      {task.description && !isDone && (
        <p style={{ marginTop: 4, fontSize: 11.5, lineHeight: 1.35, color: 'var(--ink-3)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {task.description}
        </p>
      )}
      {task.dueDate && !isDone && due && (
        <span
          className="row"
          style={{
            marginTop: 8, gap: 4, alignItems: 'center', width: 'fit-content',
            padding: '2px 8px', borderRadius: 999, fontSize: 11, fontWeight: 600,
            background: dueTone(due).bg, color: dueTone(due).fg,
          }}
        >
          <CalendarClock size={12} />
          {formatShortDate(task.dueDate)}
        </span>
      )}
    </>
  )
  if (overlay) {
    return <div style={{ ...cardStyle, width: 200, cursor: 'grabbing' }}>{body}</div>
  }
  return body
}

const cardStyle: CSSProperties = {
  width: '100%',
  textAlign: 'left',
  cursor: 'grab',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--radius-sm)',
  padding: 10,
}

export default KanbanBoard

import type { TaskStatus } from '@/lib/api/tracker'

export const TASK_STATUSES: TaskStatus[] = ['BACKLOG', 'TODO', 'DOING', 'DONE']

/** Column label + dot colour (Certi tokens) per status, in board order. */
export const STATUS_META: Record<TaskStatus, { label: string; dot: string }> = {
  BACKLOG: { label: 'Backlog', dot: 'var(--ink-3)' },
  TODO: { label: 'Todo', dot: 'var(--blue)' },
  DOING: { label: 'Doing', dot: 'var(--gold)' },
  DONE: { label: 'Done', dot: 'var(--brand)' },
}

export type DueState = 'overdue' | 'today' | 'upcoming'

/** Classify a yyyy-mm-dd due date relative to today. */
export function dueState(dueDate?: string | null): DueState | null {
  if (!dueDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(`${dueDate}T00:00:00`)
  if (Number.isNaN(due.getTime())) return null
  if (due.getTime() < today.getTime()) return 'overdue'
  if (due.getTime() === today.getTime()) return 'today'
  return 'upcoming'
}

const DUE_TONE: Record<DueState, { bg: string; fg: string }> = {
  overdue: { bg: 'var(--hard-soft)', fg: 'var(--hard)' },
  today: { bg: 'var(--gold-soft)', fg: 'var(--gold-deep)' },
  upcoming: { bg: 'var(--surface-2)', fg: 'var(--ink-2)' },
}

export function dueTone(state: DueState) {
  return DUE_TONE[state]
}

/** "15 Th6" style short date for a yyyy-mm-dd string. */
export function formatShortDate(dueDate: string): string {
  const d = new Date(`${dueDate}T00:00:00`)
  if (Number.isNaN(d.getTime())) return dueDate
  return `${d.getDate()} Th${d.getMonth() + 1}`
}

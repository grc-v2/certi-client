import { useState } from 'react'
import { LayoutGrid, Settings, RotateCcw } from 'lucide-react'
import { ResourceHubSummaryCard } from '@/features/tracker/resources/resource-hub-summary-card'
import { TodoCard } from '@/features/tracker/todo/todo-card'
import { PomodoroCard } from '@/features/tracker/pomodoro/pomodoro-card'
import { HabitCard } from '@/features/tracker/habits/habit-card'
import { SettingsDialog } from '@/features/tracker/settings/settings-dialog'
import { useResetTrackerData } from '@/hooks/queries/tracker-data'
import { useAuthStore } from '@/store/auth-store'

const BOARD_TITLE_KEY = 'tracker.boardTitle'

/**
 * Personal Tracker dashboard. Replaces the former exam-focused dashboard at
 * `/dashboard` — a bento grid of Todo, Pomodoro, Resource Hub plus coming-soon
 * cards, with a header for board title + settings/reset.
 */
export default function DashboardPage() {
  const { user } = useAuthStore()
  const defaultTitle = `Bảng của ${user?.fullName?.split(' ').pop() || 'bạn'}`
  const [boardTitle, setBoardTitle] = useState(() => localStorage.getItem(BOARD_TITLE_KEY) || defaultTitle)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const resetData = useResetTrackerData()

  const today = new Date().toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  function updateBoardTitle(title: string) {
    setBoardTitle(title)
    localStorage.setItem(BOARD_TITLE_KEY, title)
  }

  function quickReset() {
    if (window.confirm('Xoá toàn bộ task, tài nguyên và nhóm? Cài đặt được giữ lại. Không thể hoàn tác.')) {
      resetData.mutate()
    }
  }

  return (
    <div className="col" style={{ gap: 16 }}>
      {/* Page header — board title + date (left), actions (right) */}
      <header className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
        <div className="row" style={{ alignItems: 'center', gap: 12 }}>
          <span className="itile" style={{ width: 40, height: 40, background: 'var(--color-accent-soft)', color: 'var(--color-accent-ink)' }}>
            <LayoutGrid size={21} />
          </span>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-ink)' }}>{boardTitle}</h1>
            <p style={{ fontSize: 12.5, color: 'var(--color-ink-faint)', marginTop: 2, textTransform: 'capitalize' }}>{today}</p>
          </div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button onClick={quickReset} disabled={resetData.isPending} className="iconbtn" title="Đặt lại dữ liệu">
            <RotateCcw size={18} />
          </button>
          <button onClick={() => setSettingsOpen(true)} className="iconbtn" title="Cài đặt">
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Bento grid */}
      <div className="tracker-grid">
        {/* Todo — hero: 2 cols × full height (Kanban + Lịch) so tasks have room */}
        <TodoCard className="enter enter-1" style={{ gridColumn: '1 / 3', gridRow: '1 / 3', minHeight: 0 }} />

        {/* Right rail — full height: Pomodoro on top, Resource Hub fills the rest */}
        <div className="col" style={{ gridColumn: '3', gridRow: '1 / 3', gap: 14, minWidth: 0 }}>
          <PomodoroCard className="enter enter-2" style={{ flexShrink: 0 }} />
          <ResourceHubSummaryCard className="enter enter-3" style={{ flex: 1, minHeight: 0 }} />
        </div>
      </div>

      {/* Habits — today's good habits with quick check-in */}
      <HabitCard className="enter enter-3" />

      {/* Roadmap hint — kept slim, off the prime grid */}
      <p style={{ fontSize: 12, color: 'var(--color-ink-faint)', textAlign: 'center', margin: 0 }}>
        Sắp ra mắt: Chi tiêu
      </p>

      <SettingsDialog
        open={settingsOpen}
        boardTitle={boardTitle}
        onBoardTitleChange={updateBoardTitle}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  )
}

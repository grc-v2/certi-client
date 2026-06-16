import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface TrackerModalProps {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
  /** Footer actions (buttons), right-aligned. */
  footer?: ReactNode
  width?: number
}

/**
 * Minimal centered modal for the Personal Tracker — flat, rounded, Certi tokens.
 * Closes on overlay click and Escape.
 */
export function TrackerModal({ open, title, onClose, children, footer, width = 460 }: TrackerModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(9, 11, 18, 0.45)', backdropFilter: 'blur(2px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="col pop"
        style={{
          width: '100%', maxWidth: width,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)', overflow: 'hidden',
        }}
      >
        <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{title}</h2>
          <button onClick={onClose} className="iconbtn" title="Đóng" style={{ width: 32, height: 32, borderRadius: 'var(--radius-xs)' }}>
            <X size={17} />
          </button>
        </div>
        <div className="col" style={{ padding: 18, gap: 14 }}>{children}</div>
        {footer && (
          <div className="row" style={{ gap: 8, justifyContent: 'flex-end', padding: '14px 18px', borderTop: '1px solid var(--border)' }}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

export default TrackerModal

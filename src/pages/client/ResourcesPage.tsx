import { Library } from 'lucide-react'
import { ResourceHubCard } from '@/features/tracker/resources/resource-hub-card'

/**
 * Standalone Resource Hub — the centralized place for notes and saved links
 * (YouTube / GitHub / blog). Promotes the dashboard's Resource Hub card to a
 * full-height page with the same add / filter / CRUD behavior.
 */
export default function ResourcesPage() {
  return (
    <div className="col" style={{ gap: 16, height: '100%' }}>
      <header className="row" style={{ alignItems: 'center', gap: 12 }}>
        <span className="itile" style={{ width: 40, height: 40, background: 'var(--color-accent-soft)', color: 'var(--color-accent-ink)' }}>
          <Library size={21} />
        </span>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-ink)' }}>Resources</h1>
          <p style={{ fontSize: 12.5, color: 'var(--color-ink-faint)', marginTop: 2 }}>
            Kho tài nguyên tập trung — ghi chú & liên kết YouTube / GitHub / blog
          </p>
        </div>
      </header>

      <div style={{ flex: 1, minHeight: 'calc(100vh - 220px)' }}>
        <ResourceHubCard style={{ height: '100%' }} />
      </div>
    </div>
  )
}

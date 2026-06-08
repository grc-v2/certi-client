// Tiny pub/sub so the axios layer can signal "session unsalvageable" to the UI
// layer without coupling axios to React Router or the Zustand store.
//
// Why this exists:
//   - The axios interceptor must not call window.location.href (loses SPA state,
//     skips the Zustand logout, and prevents preserving the original path).
//   - The interceptor must not import the Zustand store / React Router directly
//     either, because client.ts is loaded eagerly at module init and we want
//     to keep that boundary thin.
//
// SessionGuard mounts at app root and reacts to these events.

export type SessionEvent = 'session-expired'

type Listener = (event: SessionEvent) => void

const listeners = new Set<Listener>()

export function onSessionEvent(fn: Listener): () => void {
  listeners.add(fn)
  return () => { listeners.delete(fn) }
}

// Coalesce bursts: if many in-flight requests get 401 at once, the interceptor
// will emit once per failed refresh — listeners may want to no-op duplicates.
let lastEmittedAt = 0
const COALESCE_WINDOW_MS = 500

export function emitSessionExpired(): void {
  const now = Date.now()
  if (now - lastEmittedAt < COALESCE_WINDOW_MS) return
  lastEmittedAt = now
  listeners.forEach((fn) => {
    try { fn('session-expired') } catch { /* listener errors must not break axios */ }
  })
}

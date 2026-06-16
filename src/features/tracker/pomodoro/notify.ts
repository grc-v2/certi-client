/** Sound + system notification used when a pomodoro phase ends. */

/** Short two-tone chime via the Web Audio API (no asset needed). */
export function playChime() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    const now = ctx.currentTime
    ;[880, 1320].forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.frequency.value = freq
      osc.type = 'sine'
      const start = now + i * 0.18
      gain.gain.setValueAtTime(0.0001, start)
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35)
      osc.connect(gain).connect(ctx.destination)
      osc.start(start)
      osc.stop(start + 0.4)
    })
    window.setTimeout(() => ctx.close(), 1200)
  } catch {
    // Audio unavailable — silent fallback.
  }
}

/** Ask once for notification permission (call on a user gesture). */
export function ensureNotifyPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    void Notification.requestPermission()
  }
}

export function notify(title: string, body: string) {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body })
    }
  } catch {
    // Ignore — the chime already signalled the user.
  }
}

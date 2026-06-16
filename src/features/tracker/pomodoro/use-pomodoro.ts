import { useEffect, useRef, useState } from 'react'
import { ensureNotifyPermission, notify, playChime } from './notify'

export type Phase = 'focus' | 'break'

/**
 * Countdown timer that auto-flips between focus and break phases. Durations come
 * from the user's saved preset; changing them resets the timer to a fresh focus.
 */
export function usePomodoro(focusMinutes: number, breakMinutes: number) {
  const [phase, setPhase] = useState<Phase>('focus')
  const [secondsLeft, setSecondsLeft] = useState(focusMinutes * 60)
  const [running, setRunning] = useState(false)
  const tick = useRef<number | null>(null)

  const total = (phase === 'focus' ? focusMinutes : breakMinutes) * 60

  // Reset whenever the preset durations change.
  useEffect(() => {
    setRunning(false)
    setPhase('focus')
    setSecondsLeft(focusMinutes * 60)
  }, [focusMinutes, breakMinutes])

  useEffect(() => {
    if (!running) return
    tick.current = window.setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1))
    }, 1000)
    return () => {
      if (tick.current) window.clearInterval(tick.current)
    }
  }, [running])

  // Phase rollover at zero — chime + system notification.
  useEffect(() => {
    if (secondsLeft > 0) return
    setRunning(false)
    playChime()
    if (phase === 'focus') {
      notify('Hết giờ tập trung', `Nghỉ ${breakMinutes} phút nhé.`)
      switchTo('break')
    } else {
      notify('Hết giờ nghỉ', `Quay lại tập trung ${focusMinutes} phút.`)
      switchTo('focus')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft])

  function switchTo(next: Phase) {
    setPhase(next)
    setSecondsLeft((next === 'focus' ? focusMinutes : breakMinutes) * 60)
  }

  return {
    phase,
    secondsLeft,
    total,
    running,
    progress: total > 0 ? 1 - secondsLeft / total : 0,
    toggle: () => {
      ensureNotifyPermission()
      setRunning((r) => !r)
    },
    reset: () => {
      setRunning(false)
      setSecondsLeft(total)
    },
    skip: () => switchTo(phase === 'focus' ? 'break' : 'focus'),
  }
}

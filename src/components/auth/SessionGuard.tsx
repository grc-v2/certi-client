import { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { onSessionEvent } from '@/lib/auth/session-events'
import { useAuthStore } from '@/store/auth-store'

const SESSION_EXPIRED_MESSAGE = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'

const AUTH_PUBLIC_PREFIXES = ['/login', '/register', '/verify-email', '/oauth/callback']
const isOnAuthRoute = (path: string) => AUTH_PUBLIC_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`))

/**
 * Mounted once at the React Router root. Centralises the response to a
 * server-confirmed dead session: drop in-flight cache, clear auth state, show
 * one toast, and SPA-navigate to /login preserving the original path.
 *
 * Why a component (vs. doing this in axios directly):
 *   - Axios is a singleton loaded at module init; it shouldn't depend on
 *     router/Zustand. The component composes them at the right layer.
 *   - Mounting under <BrowserRouter> means we get the live navigate() handle.
 */
export default function SessionGuard() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const logout = useAuthStore((s) => s.logout)

  // Keep a ref so we read the latest location/logout inside the listener without
  // resubscribing on every render.
  const locationRef = useRef(location)
  locationRef.current = location

  useEffect(() => {
    return onSessionEvent((event) => {
      if (event !== 'session-expired') return

      const { pathname, search } = locationRef.current

      // No-op if already on a public auth page — avoids redirect loops when the
      // login screen itself is what triggered the 401 (e.g. wrong credentials
      // returning 401 should NOT show "session expired").
      if (isOnAuthRoute(pathname)) return

      // Cancel in-flight queries so protected pages stop showing spinners.
      queryClient.cancelQueries()
      queryClient.clear()

      logout()
      toast.error(SESSION_EXPIRED_MESSAGE, { id: 'session-expired' })

      const redirect = encodeURIComponent(`${pathname}${search}`)
      navigate(`/login?reason=session_expired&redirect=${redirect}`, { replace: true })
    })
  }, [navigate, queryClient, logout])

  return null
}

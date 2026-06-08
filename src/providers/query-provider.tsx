'use client'
import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import { AxiosError } from 'axios'
import { toast } from 'sonner'

// Status codes where retrying makes no sense — fix the auth or the resource,
// don't burn extra requests. 401 is handled by the axios interceptor + SessionGuard.
const NON_RETRYABLE = new Set([400, 401, 403, 404, 405, 409, 422])

function statusOf(error: unknown): number | undefined {
  return error instanceof AxiosError ? error.response?.status : undefined
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        retry: (failureCount, error) => {
          const status = statusOf(error)
          if (status && NON_RETRYABLE.has(status)) return false
          return failureCount < 1
        },
        refetchOnWindowFocus: false,
      },
      mutations: { retry: 0 },
    },
    // Catch-all so an unhandled query error never leaves the UI in a forever-loading state.
    // 401 is intentionally silent here — SessionGuard owns the session-expired UX.
    queryCache: new QueryCache({
      onError: (error, query) => {
        const status = statusOf(error)
        if (status === 401) return
        // Only surface a toast for background refetches; first-load errors are
        // usually handled inline by the page (skeletons, error states).
        if (query.state.data !== undefined) {
          toast.error('Không tải được dữ liệu. Vui lòng thử lại.', { id: `query-error-${query.queryHash}` })
        }
      },
    }),
  }))
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

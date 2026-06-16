/**
 * Central, hierarchical TanStack Query key factory.
 *
 * Each resource exposes `all` (the root key) plus specific keys built from it, so a mutation can
 * invalidate a whole subtree with `keys.<resource>.all`. Query keys are an interface shared by
 * every reader and every `invalidateQueries` call — they live here, in exactly one place.
 *
 * Migrate resources into this factory worst-offenders first; the legacy `QUERY_KEYS` in
 * `constants.ts` is being absorbed and removed as each resource lands.
 */
export const keys = {
  examSessions: {
    all: ['exam-sessions'] as const,
    active: () => [...keys.examSessions.all, 'active'] as const,
    detail: (id: string | number) => [...keys.examSessions.all, id] as const,
  },
  adminUsers: {
    all: ['admin-users'] as const,
    list: (p: { page: number; search: string; status: string; role: string; sortBy: string }) =>
      [...keys.adminUsers.all, p.page, p.search, p.status, p.role, p.sortBy] as const,
  },
  adminQuestions: {
    all: ['admin-questions'] as const,
    list: (p: { page: number; search: string; type: string; difficulty: string; status: string; certFilter: string; domainFilter: string }) =>
      [...keys.adminQuestions.all, p.page, p.search, p.type, p.difficulty, p.status, p.certFilter, p.domainFilter] as const,
  },
  adminPosts: {
    all: ['admin-posts'] as const,
    list: (p: { page: number; search: string; status: string }) =>
      [...keys.adminPosts.all, p.page, p.search, p.status] as const,
  },
  bookmarks: {
    all: ['bookmarks'] as const,
    list: (p: { search: string; page: number }) =>
      [...keys.bookmarks.all, p.search, p.page] as const,
  },
  tracker: {
    all: ['tracker'] as const,
    resources: () => [...keys.tracker.all, 'resources'] as const,
    collections: () => [...keys.tracker.all, 'collections'] as const,
    tasks: () => [...keys.tracker.all, 'tasks'] as const,
    pomodoro: () => [...keys.tracker.all, 'pomodoro'] as const,
    habits: () => [...keys.tracker.all, 'habits'] as const,
    habitHistory: (id: number) => [...keys.tracker.all, 'habits', id, 'history'] as const,
  },
} as const

---
name: CertiMaster Project
description: Full Next.js 15 frontend for CertiMaster certification learning platform + community
type: project
---

CertiMaster is a full-stack certification learning platform frontend built with Next.js 15 App Router.

**Why:** Connect to a Java Spring Boot microservices backend (139 endpoints across 3 services: identity-service, learning-service, engagement-service, notification-service).

**How to apply:** When working on this project, the backend runs at `http://localhost:8080`. All API calls go through `src/lib/api/client.ts` (Axios with JWT interceptors + refresh token logic).

## Tech Stack
- Next.js 15 + React + TypeScript
- Tailwind CSS v4 + shadcn/ui + Radix UI
- TanStack Query v5 (data fetching/cache)
- Zustand (auth store with cookie-based JWT)
- React Hook Form + Zod (validation)
- Recharts (progress charts)
- sonner (toast notifications)
- next-themes (dark/light mode)

## Route Structure
- `(auth)`: /login, /register, /verify-email
- `(client)`: /dashboard, /certifications, /community, /learn, /bookmarks, /notifications, /profile, /tags
- `(admin)`: /admin/dashboard, /admin/users, /admin/posts, /admin/certifications, /admin/notifications
- `exam/[sessionId]`: Fullscreen exam interface (outside shared layout)

## Design System
- Primary: #0A66C2 (education blue)
- Accent: #22C55E (success/streak green)
- Font: Inter
- Design tokens in `src/lib/utils.ts` and `src/app/globals.css`

## Key Files
- `src/lib/api/client.ts` — Axios instance with JWT + refresh token interceptors
- `src/store/auth-store.ts` — Zustand auth store (persisted to localStorage + cookies)
- `src/middleware.ts` — Edge middleware for route protection
- `src/lib/constants.ts` — ROUTES, QUERY_KEYS, API_BASE_URL

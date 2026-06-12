# certi-client

Frontend SPA của nền tảng CertiMaster. React + Vite, gọi backend [`certi-master`](../certi-master) qua REST.

> Tổng quan kiến trúc, danh sách tính năng, API chi tiết xem ở [README tổng](../README.md).

---

## Tech stack

| Layer | Công nghệ |
|---|---|
| Runtime | React 19, TypeScript 5 |
| Bundler | Vite 5 (dev server + build) |
| Routing | react-router-dom v6 |
| State (server) | TanStack Query v5 |
| State (client) | Zustand 5 |
| Form | react-hook-form + Zod + @hookform/resolvers |
| HTTP | Axios (interceptor JWT + auto refresh) |
| UI | Tailwind CSS 4, shadcn-style components, Ant Design 5, Lucide icons |
| Markdown | react-markdown + remark-gfm + rehype-raw + syntax highlighter |
| Charts | recharts |
| Notification | sonner toast |

---

## Quickstart

### Yêu cầu

- Node.js 20+ (Vite 5 yêu cầu tối thiểu 18, khuyến nghị 20+)
- Backend `certi-master` đang chạy ở `http://localhost:8080` ([hướng dẫn](../certi-master/README.md#quickstart))

### Chạy local

```bash
npm install
npm run dev
```

App chạy ở `http://localhost:3000` và tự mở browser. Dev server hot-reload qua Vite.

### Lệnh thường dùng

```bash
npm run dev       # dev server (port 3000)
npm run build     # tsc check + vite build → output `build/`
npm run preview   # serve bản build (kiểm tra trước khi deploy)
npm run lint      # ESLint
```

---

## Cấu trúc thư mục

```
src/
├── App.tsx              # Routes + ConfigProvider + Toaster
├── main.tsx             # ReactDOM entry
├── pages/
│   ├── auth/            # Login, Register, VerifyEmail, OAuthCallback
│   ├── client/          # Dashboard, Certifications, Courses, Profile, Community, ...
│   ├── exam/            # ExamPage (dùng cho cả EXAM và PRACTICE mode)
│   ├── practice/        # Landing, Free, ExamSim, Flashcard, Weakness, CertificationPicker
│   └── admin/           # AdminDashboard, Users, Certifications, Questions, Posts, ...
├── components/
│   ├── ui/              # shadcn-style primitive (Button, Card, Dialog, ...)
│   ├── auth/            # SessionGuard
│   ├── layout/          # Header, Sidebar
│   ├── course/, dashboard/, community/, admin/
├── layouts/             # ClientLayout, AuthLayout, AdminLayout, ExamLayout
├── lib/
│   ├── api/             # axios client + 1 file per resource (certifications, exam-sessions, ...)
│   ├── auth/            # session-events
│   ├── constants.ts
│   └── utils.ts
├── hooks/               # use-debounce, ...
├── providers/           # theme-provider, query-provider
└── store/               # auth-store (Zustand)
```

### Quy ước

- **1 file API mỗi resource** trong `src/lib/api/`: ví dụ `certifications.ts`, `exam-sessions.ts`, `flashcard.ts`. Mỗi file export interface DTO + object API methods.
- **Path alias**: dùng `@/...` (cấu hình trong `tsconfig.json` + `vite-tsconfig-paths`).
- **Mutation/Query** đi qua TanStack Query, không gọi axios trực tiếp trong component.
- **Auth**: JWT lưu trong cookie (`access_token`, `refresh_token`); axios interceptor tự gắn header `Authorization` và refresh khi 401.

---

## Cấu hình môi trường

| Biến | Mặc định | Mục đích |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080` | Base URL backend (compile-time, đọc trong `src/lib/constants.ts`) |

Tạo file `.env.local` ở root để override:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

> **Lưu ý:** Vite chỉ inline biến có prefix `VITE_` vào bundle. Đổi giá trị → restart `npm run dev`.

---

## Routing chính

| Path | Page | Layout |
|---|---|---|
| `/login`, `/register`, `/verify-email`, `/oauth/callback` | Auth | `AuthLayout` |
| `/dashboard` | Dashboard | `ClientLayout` |
| `/certifications`, `/certifications/:slug` | Browse + detail chứng chỉ | `ClientLayout` |
| `/certifications/results/:sessionId` | Kết quả phiên thi | `ClientLayout` |
| `/courses`, `/courses/:id` | Khóa học | `ClientLayout` |
| `/courses/:id/learn/:lessonId` | Học lesson (standalone, không trong layout) | — |
| `/practice` + `/practice/{free,exam,flashcard,weakness}` | Luyện tập | `ClientLayout` |
| `/exam/:sessionId` | Làm bài (EXAM hoặc PRACTICE) | `ExamLayout` |
| `/community`, `/community/:slug`, `/tags/:slug` | Cộng đồng | `ClientLayout` |
| `/admin/...` | Quản trị | `AdminLayout` (role ADMIN) |

Bảo vệ route: `SessionGuard` listen `session-expired` event từ axios interceptor để force logout.

---

## Build & Deploy

```bash
npm run build                              # build static → build/
docker build -t certi-client .             # multi-stage: build + nginx serve
docker run -p 80:80 certi-client
```

`Dockerfile` dựng nginx serve static files. `nginx.conf` xử lý SPA fallback (`try_files $uri /index.html`). Build-time biến `VITE_API_BASE_URL` mặc định `/api` để reverse-proxy về backend.

---

## Tài liệu liên quan

- [README tổng](../README.md) — kiến trúc, API chi tiết, backend
- [Backend README](../certi-master/README.md)
- [docs/setup.md](../docs/setup.md) — setup chi tiết

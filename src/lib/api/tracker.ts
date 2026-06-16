import apiClient from './client'

// ── Resource Hub ────────────────────────────────────────────────────────────────
// Unified store of the personal tracker: text notes and saved links (YouTube /
// GitHub / blog), classified by `kind`. Backed by /api/v1/tracker/resources.

export type ResourceKind = 'YOUTUBE' | 'GITHUB' | 'BLOG' | 'NOTE' | 'PDF'

export interface ResourceResponse {
  id: number
  kind: ResourceKind
  url?: string | null
  title?: string | null
  content?: string | null
  collectionId?: number | null
  createdAt?: string
  updatedAt?: string
}

/** Provide `url` for a link (kind auto-detected, title auto-fetched) or `content` for a note. */
export interface CreateResourcePayload {
  url?: string
  title?: string
  content?: string
  kind?: ResourceKind
}

export interface UpdateResourcePayload {
  title?: string
  content?: string
  url?: string
}

// ── Todo ────────────────────────────────────────────────────────────────────────
// Kanban tasks backed by /api/v1/todo-tasks. Drag-and-drop persists via /reorder.

export const TASK_STATUSES = ['BACKLOG', 'TODO', 'DOING', 'DONE'] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

export interface TaskResponse {
  id: number
  title: string
  description?: string | null
  dueDate?: string | null
  status: TaskStatus
  orderIndex: number
  doneAt?: string | null
  createdAt?: string
}

export interface CreateTaskPayload {
  title: string
  description?: string
  dueDate?: string
}

/** Any omitted field is left unchanged. Send `dueDate: ''` to clear the due date. */
export interface UpdateTaskPayload {
  title?: string
  description?: string
  dueDate?: string
  status?: TaskStatus
  orderIndex?: number
}

export interface ReorderTaskItem {
  id: number
  status: TaskStatus
  orderIndex: number
}

// ── Collections (Resource Hub grouping) ────────────────────────────────────────────

export interface CollectionResponse {
  id: number
  name: string
}

// ── Pomodoro ──────────────────────────────────────────────────────────────────────

export type PomodoroPreset = 'CLASSIC' | 'DEEP'

export interface PomodoroSettingResponse {
  preset: PomodoroPreset
  focusMinutes: number
  breakMinutes: number
}

export const trackerApi = {
  // Resource Hub
  listResources: () =>
    apiClient.get<ResourceResponse[]>('/api/v1/tracker/resources').then(r => r.data),
  createResource: (data: CreateResourcePayload) =>
    apiClient.post<ResourceResponse>('/api/v1/tracker/resources', data).then(r => r.data),
  updateResource: (id: number, data: UpdateResourcePayload) =>
    apiClient.patch<ResourceResponse>(`/api/v1/tracker/resources/${id}`, data).then(r => r.data),
  setResourceCollection: (id: number, collectionId: number | null) =>
    apiClient.patch<ResourceResponse>(`/api/v1/tracker/resources/${id}/collection`, { collectionId }).then(r => r.data),
  deleteResource: (id: number) =>
    apiClient.delete(`/api/v1/tracker/resources/${id}`).then(r => r.data),
  /** Upload a PDF/ebook; stored privately and returned as a PDF resource. */
  uploadResourcePdf: (file: File, collectionId?: number | null) => {
    const form = new FormData()
    form.append('file', file)
    return apiClient.post<ResourceResponse>('/api/v1/tracker/resources/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      params: collectionId != null ? { collectionId } : undefined,
    }).then(r => r.data)
  },
  /** Short-lived presigned URL to open a PDF resource (owner only). */
  getResourceFileUrl: (id: number) =>
    apiClient.get<{ url: string }>(`/api/v1/tracker/resources/${id}/file`).then(r => r.data.url),

  // Collections
  listCollections: () =>
    apiClient.get<CollectionResponse[]>('/api/v1/tracker/collections').then(r => r.data),
  createCollection: (name: string) =>
    apiClient.post<CollectionResponse>('/api/v1/tracker/collections', { name }).then(r => r.data),
  renameCollection: (id: number, name: string) =>
    apiClient.patch<CollectionResponse>(`/api/v1/tracker/collections/${id}`, { name }).then(r => r.data),
  deleteCollection: (id: number) =>
    apiClient.delete(`/api/v1/tracker/collections/${id}`).then(r => r.data),

  // Reset
  resetData: () =>
    apiClient.delete('/api/v1/tracker/data').then(r => r.data),

  // Todo
  listTasks: () =>
    apiClient.get<TaskResponse[]>('/api/v1/todo-tasks').then(r => r.data),
  createTask: (data: CreateTaskPayload) =>
    apiClient.post<TaskResponse>('/api/v1/todo-tasks', data).then(r => r.data),
  updateTask: (id: number, data: UpdateTaskPayload) =>
    apiClient.patch<TaskResponse>(`/api/v1/todo-tasks/${id}`, data).then(r => r.data),
  reorderTasks: (items: ReorderTaskItem[]) =>
    apiClient.patch('/api/v1/todo-tasks/reorder', { items }).then(r => r.data),
  deleteTask: (id: number) =>
    apiClient.delete(`/api/v1/todo-tasks/${id}`).then(r => r.data),

  // Pomodoro
  getPomodoroSetting: () =>
    apiClient.get<PomodoroSettingResponse>('/api/v1/pomodoro/settings').then(r => r.data),
  updatePomodoroSetting: (preset: PomodoroPreset) =>
    apiClient.put<PomodoroSettingResponse>('/api/v1/pomodoro/settings', { preset }).then(r => r.data),
}

import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import {
  Library, Plus, MonitorPlay, Code2, Globe, StickyNote, FileText, Upload,
  Trash2, Pencil, ExternalLink, Check, X, LoaderCircle, SlidersHorizontal,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { toast } from 'sonner'
import { BentoCard } from '@/components/tracker/bento-card'
import {
  useResources, useCreateResource, useUpdateResource, useDeleteResource, useUploadResourcePdf,
} from '@/hooks/queries/tracker-resources'
import { useCollections, useSetResourceCollection } from '@/hooks/queries/tracker-collections'
import { CollectionManagerDialog } from './collection-manager-dialog'
import { trackerApi, type CollectionResponse, type ResourceKind, type ResourceResponse } from '@/lib/api/tracker'

const KIND_ICON: Record<ResourceKind, LucideIcon> = {
  YOUTUBE: MonitorPlay,
  GITHUB: Code2,
  BLOG: Globe,
  NOTE: StickyNote,
  PDF: FileText,
}
const KIND_LABEL: Record<ResourceKind, string> = {
  YOUTUBE: 'YouTube',
  GITHUB: 'GitHub',
  BLOG: 'Blog',
  NOTE: 'Ghi chú',
  PDF: 'PDF',
}

type KindFilter = 'ALL' | ResourceKind
type CollectionFilter = 'ALL' | 'NONE' | number

const KIND_FILTERS: { id: KindFilter; label: string }[] = [
  { id: 'ALL', label: 'Tất cả' },
  { id: 'YOUTUBE', label: 'YouTube' },
  { id: 'GITHUB', label: 'GitHub' },
  { id: 'BLOG', label: 'Blog' },
  { id: 'PDF', label: 'PDF' },
  { id: 'NOTE', label: 'Ghi chú' },
]

/** A single-token, space-free value that is a URL or a bare domain. */
function looksLikeUrl(value: string): boolean {
  const s = value.trim()
  if (!s || /\s/.test(s)) return false
  if (/^https?:\/\//i.test(s)) return true
  return /^[\w-]+(\.[\w-]+)+([/?#].*)?$/.test(s)
}

function hostOf(url?: string | null): string {
  if (!url) return ''
  try {
    return new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).host.replace(/^www\./, '')
  } catch {
    return url
  }
}

function firstLine(text: string): string {
  return text.split('\n')[0]?.trim().slice(0, 80) || 'Ghi chú'
}

interface ResourceHubCardProps {
  className?: string
  style?: CSSProperties
}

export function ResourceHubCard({ className, style }: ResourceHubCardProps) {
  const { data: resources = [], isLoading } = useResources()
  const { data: collections = [] } = useCollections()
  const createResource = useCreateResource()
  const uploadPdf = useUploadResourcePdf()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [input, setInput] = useState('')
  const [kindFilter, setKindFilter] = useState<KindFilter>('ALL')
  const [collectionFilter, setCollectionFilter] = useState<CollectionFilter>('ALL')
  const [managerOpen, setManagerOpen] = useState(false)

  const collectionName = useMemo(() => {
    const m = new Map<number, string>()
    for (const c of collections) m.set(c.id, c.name)
    return m
  }, [collections])

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      if (kindFilter !== 'ALL' && r.kind !== kindFilter) return false
      if (collectionFilter === 'NONE' && r.collectionId != null) return false
      if (typeof collectionFilter === 'number' && r.collectionId !== collectionFilter) return false
      return true
    })
  }, [resources, kindFilter, collectionFilter])

  function submit() {
    const value = input.trim()
    if (!value || createResource.isPending) return
    const payload = looksLikeUrl(value) ? { url: value } : { content: value }
    createResource.mutate(payload, { onSuccess: () => setInput('') })
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      submit()
    }
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (file.type !== 'application/pdf') {
      toast.error('Chỉ hỗ trợ tệp PDF')
      return
    }
    const collectionId = typeof collectionFilter === 'number' ? collectionFilter : undefined
    uploadPdf.mutate(
      { file, collectionId },
      {
        onSuccess: () => toast.success('Đã tải lên PDF'),
        onError: () => toast.error('Tải lên thất bại'),
      },
    )
  }

  return (
    <>
      <BentoCard
        icon={Library}
        title="Resource Hub"
        className={className}
        style={style}
        action={
          <>
            {resources.length > 0 && <span className="pill brand" style={{ padding: '3px 9px' }}>{resources.length}</span>}
            <button onClick={() => setManagerOpen(true)} className="iconbtn" title="Quản lý nhóm" style={{ width: 32, height: 32, borderRadius: 'var(--radius-xs)' }}>
              <SlidersHorizontal size={16} />
            </button>
          </>
        }
      >
        {/* Add bar */}
        <div className="row" style={{ gap: 8, marginBottom: 10 }}>
          <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={onKeyDown} placeholder="Dán link hoặc gõ ghi chú…" style={inputStyle} />
          <input ref={fileInputRef} type="file" accept="application/pdf" onChange={onPickFile} style={{ display: 'none' }} />
          <button onClick={() => fileInputRef.current?.click()} disabled={uploadPdf.isPending} className="iconbtn" title="Tải lên PDF / ebook" style={{ width: 38, height: 38, flexShrink: 0 }}>
            {uploadPdf.isPending ? <LoaderCircle size={17} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Upload size={17} />}
          </button>
          <button onClick={submit} disabled={!input.trim() || createResource.isPending} className="row" title="Thêm" style={addBtnStyle(!input.trim() || createResource.isPending)}>
            {createResource.isPending ? <LoaderCircle size={17} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Plus size={17} />}
          </button>
        </div>

        {/* Filters */}
        <div className="row scroll-area" style={{ gap: 6, marginBottom: 10, alignItems: 'center', overflowX: 'auto', flexShrink: 0 }}>
          {KIND_FILTERS.map((f) => (
            <button key={f.id} onClick={() => setKindFilter(f.id)} style={chipFilterStyle(kindFilter === f.id)}>{f.label}</button>
          ))}
          {collections.length > 0 && (
            <select
              value={String(collectionFilter)}
              onChange={(e) => {
                const v = e.target.value
                setCollectionFilter(v === 'ALL' || v === 'NONE' ? v : Number(v))
              }}
              style={{ ...chipFilterStyle(collectionFilter !== 'ALL'), marginLeft: 'auto', cursor: 'pointer' }}
            >
              <option value="ALL">Mọi nhóm</option>
              <option value="NONE">Không nhóm</option>
              {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
        </div>

        {/* List */}
        <div className="col scroll-area" style={{ gap: 6, flex: 1, minHeight: 0, overflowY: 'auto' }}>
          {isLoading ? (
            <ListSkeleton />
          ) : filtered.length === 0 ? (
            <EmptyState filtered={resources.length > 0} />
          ) : (
            filtered.map((r) => (
              <ResourceRow key={r.id} resource={r} collections={collections} collectionName={r.collectionId != null ? collectionName.get(r.collectionId) : undefined} />
            ))
          )}
        </div>
      </BentoCard>

      <CollectionManagerDialog open={managerOpen} onClose={() => setManagerOpen(false)} />
    </>
  )
}

function ResourceRow({ resource, collections, collectionName }: { resource: ResourceResponse; collections: CollectionResponse[]; collectionName?: string }) {
  const updateResource = useUpdateResource()
  const deleteResource = useDeleteResource()
  const setCollection = useSetResourceCollection()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const [draftCollection, setDraftCollection] = useState<string>('')
  const [opening, setOpening] = useState(false)

  const Icon = KIND_ICON[resource.kind]
  const isNote = resource.kind === 'NOTE'
  const isPdf = resource.kind === 'PDF'
  const primary = isNote
    ? (resource.content || resource.title || 'Ghi chú')
    : isPdf
      ? (resource.title || 'Tài liệu PDF')
      : (resource.title || resource.url || '')
  const secondary = (isNote || isPdf) ? null : hostOf(resource.url)

  async function openPdf() {
    try {
      setOpening(true)
      const url = await trackerApi.getResourceFileUrl(resource.id)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch {
      toast.error('Không mở được tệp')
    } finally {
      setOpening(false)
    }
  }

  function startEdit() {
    setDraft(isNote ? (resource.content ?? '') : (resource.title ?? ''))
    setDraftCollection(resource.collectionId != null ? String(resource.collectionId) : '')
    setEditing(true)
  }

  function saveEdit() {
    const value = draft.trim()
    const data = isNote ? { content: value, title: firstLine(value) } : { title: value }
    const nextCollection = draftCollection === '' ? null : Number(draftCollection)
    updateResource.mutate({ id: resource.id, data }, {
      onSuccess: () => {
        if (nextCollection !== (resource.collectionId ?? null)) {
          setCollection.mutate({ id: resource.id, collectionId: nextCollection })
        }
        setEditing(false)
      },
    })
  }

  function remove() {
    if (window.confirm('Xoá tài nguyên này?')) deleteResource.mutate(resource.id)
  }

  if (editing) {
    return (
      <div className="col" style={{ ...rowStyle, gap: 8, alignItems: 'stretch' }}>
        {isNote ? (
          <textarea value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus rows={3} style={{ ...inputStyle, height: 'auto', resize: 'vertical', lineHeight: 1.5 }} />
        ) : (
          <input value={draft} onChange={(e) => setDraft(e.target.value)} autoFocus style={inputStyle} />
        )}
        <div className="row" style={{ gap: 6, alignItems: 'center' }}>
          <select value={draftCollection} onChange={(e) => setDraftCollection(e.target.value)} style={{ ...inputStyle, flex: 1, cursor: 'pointer', height: 34 }}>
            <option value="">Không nhóm</option>
            {collections.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={() => setEditing(false)} className="iconbtn" title="Huỷ" style={smallBtn}><X size={15} /></button>
          <button onClick={saveEdit} disabled={updateResource.isPending} className="iconbtn" title="Lưu" style={{ ...smallBtn, color: 'var(--brand-deep)' }}><Check size={15} /></button>
        </div>
      </div>
    )
  }

  return (
    <div className="row" style={rowStyle}>
      <span className="itile" style={{ width: 30, height: 30, flexShrink: 0, background: 'var(--surface-2)', color: 'var(--ink-2)' }}>
        <Icon size={16} />
      </span>
      <div className="col" style={{ flex: 1, minWidth: 0, gap: 1 }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', whiteSpace: isNote ? 'normal' : 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: isNote ? '-webkit-box' : 'block', WebkitLineClamp: isNote ? 2 : undefined, WebkitBoxOrient: 'vertical' }}>
          {primary}
        </span>
        <span className="row" style={{ gap: 6, fontSize: 11, color: 'var(--ink-3)', alignItems: 'center' }}>
          <span>{KIND_LABEL[resource.kind]}</span>
          {secondary && <><span>·</span><span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{secondary}</span></>}
          {collectionName && <span className="pill brand" style={{ padding: '1px 7px', fontSize: 10 }}>{collectionName}</span>}
        </span>
      </div>
      <div className="row" style={{ gap: 4, flexShrink: 0, alignItems: 'center' }}>
        {isPdf ? (
          <button onClick={openPdf} disabled={opening} className="iconbtn" title="Mở PDF" style={smallBtn}>
            {opening ? <LoaderCircle size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <ExternalLink size={15} />}
          </button>
        ) : (!isNote && resource.url && (
          <a href={resource.url} target="_blank" rel="noopener noreferrer" className="iconbtn" title="Mở liên kết" style={smallBtn}><ExternalLink size={15} /></a>
        ))}
        <button onClick={startEdit} className="iconbtn" title="Sửa" style={smallBtn}><Pencil size={15} /></button>
        <button onClick={remove} className="iconbtn" title="Xoá" style={{ ...smallBtn, color: 'var(--hard)' }}><Trash2 size={15} /></button>
      </div>
    </div>
  )
}

function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <div className="col" style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 6, color: 'var(--ink-3)', minHeight: 120, textAlign: 'center' }}>
      <Library size={26} style={{ opacity: 0.4 }} />
      <span style={{ fontSize: 12.5 }}>
        {filtered ? 'Không có tài nguyên khớp bộ lọc.' : <>Chưa có tài nguyên nào.<br />Dán link YouTube/GitHub/blog hoặc gõ ghi chú.</>}
      </span>
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="col" style={{ gap: 6 }}>
      {[0, 1, 2].map((n) => (
        <div key={n} style={{ height: 48, background: 'var(--surface-2)', borderRadius: 'var(--radius-sm)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      ))}
    </div>
  )
}

const inputStyle: CSSProperties = {
  flex: 1, minWidth: 0, height: 38, padding: '0 12px', fontSize: 13.5, color: 'var(--ink)',
  background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', outline: 'none', fontFamily: 'inherit',
}

const rowStyle: CSSProperties = {
  gap: 10, alignItems: 'center', padding: '8px 10px', borderRadius: 'var(--radius-sm)',
  background: 'var(--surface)', border: '1px solid var(--border)',
}

const smallBtn: CSSProperties = { width: 30, height: 30, borderRadius: 'var(--radius-xs)' }

function chipFilterStyle(active: boolean): CSSProperties {
  return {
    padding: '4px 11px', borderRadius: 999, border: '1px solid', cursor: 'pointer',
    fontSize: 12, fontWeight: 600, fontFamily: 'inherit', whiteSpace: 'nowrap', flexShrink: 0,
    background: active ? 'var(--brand-soft)' : 'transparent',
    borderColor: active ? 'transparent' : 'var(--border)',
    color: active ? 'var(--brand-deep)' : 'var(--ink-3)',
  }
}

function addBtnStyle(disabled: boolean): CSSProperties {
  return {
    width: 38, height: 38, flexShrink: 0, alignItems: 'center', justifyContent: 'center',
    borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--brand)', color: '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
  }
}

export default ResourceHubCard

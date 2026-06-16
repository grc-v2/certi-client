'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ClipboardList, Search, ChevronLeft, ChevronRight, Eye, Calendar, Filter,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { adminApi, type AuditLogResponse } from '@/lib/api/admin'

const METHOD_STYLE: Record<string, { bg: string; color: string }> = {
  GET:    { bg: '#2E7DF618', color: '#2E7DF6' },
  POST:   { bg: 'var(--color-accent-soft)', color: 'var(--color-accent)' },
  PUT:    { bg: 'var(--color-accent-soft)', color: 'var(--color-accent-ink)' },
  PATCH:  { bg: '#F4943B18', color: '#F4943B' },
  DELETE: { bg: 'color-mix(in srgb, #dc2626 14%, #fff)', color: '#dc2626' },
}

function formatDatetime(dt: string) {
  if (!dt) return '-'
  const d = new Date(dt)
  return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function HttpMethodChip({ method }: { method: string }) {
  const s = METHOD_STYLE[method] ?? { bg: 'var(--color-surface-hover)', color: 'var(--color-ink-faint)' }
  return (
    <span className="codechip" style={{ fontSize: 11, background: s.bg, color: s.color, border: 'none' }}>{method}</span>
  )
}

function StatusCodePill({ code }: { code: number }) {
  if (code < 400) return <span className="pill brand" style={{ fontSize: 11 }}>{code}</span>
  return <span className="pill hard" style={{ fontSize: 11 }}>{code}</span>
}

export default function AdminAuditPage() {
  const [page, setPage] = useState(0)
  const [resourceType, setResourceType] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [detailLog, setDetailLog] = useState<AuditLogResponse | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit', page, resourceType, fromDate, toDate],
    queryFn: () => adminApi.getAuditLogs({
      page, size: 20,
      resourceType: resourceType || undefined,
      from: fromDate ? new Date(fromDate).toISOString() : undefined,
      to: toDate ? new Date(toDate + 'T23:59:59').toISOString() : undefined,
    }),
  })

  const logs = data?.content ?? []
  const totalPages = data?.totalPages ?? 0
  const total = data?.totalElements ?? 0

  return (
    <div className="col" style={{ gap: 20 }}>
      {/* Header */}
      <div className="row enter" style={{ alignItems: 'flex-start', gap: 12 }}>
        <div>
          <span className="eyebrow">Quản trị</span>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-ink)', marginTop: 6 }}>
            <span className="row" style={{ alignItems: 'center', gap: 8 }}>
              <ClipboardList size={22} style={{ color: 'var(--color-accent)' }} />
              Nhật ký hoạt động
            </span>
          </h1>
          <p style={{ color: 'var(--color-ink-faint)', fontSize: 13.5, marginTop: 4 }}>{total} bản ghi</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card enter enter-1" style={{ padding: '14px 16px' }}>
        <div className="row" style={{ gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <Select value={resourceType} onValueChange={v => { setResourceType(v ?? ''); setPage(0) }}>
            <SelectTrigger className="w-full sm:w-44 cursor-pointer">
              <Filter className="w-3.5 h-3.5 mr-1.5 text-zinc-400" />
              <SelectValue placeholder="Resource Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tất cả</SelectItem>
              <SelectItem value="USER">User</SelectItem>
              <SelectItem value="CERTIFICATION">Certification</SelectItem>
              <SelectItem value="QUESTION">Question</SelectItem>
              <SelectItem value="POST">Post</SelectItem>
              <SelectItem value="NOTIFICATION">Notification</SelectItem>
              <SelectItem value="SESSION">Session</SelectItem>
            </SelectContent>
          </Select>
          <div className="row" style={{ alignItems: 'center', gap: 8 }}>
            <Calendar size={15} style={{ color: 'var(--color-ink-faint)', flexShrink: 0 }} />
            <Input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setPage(0) }} className="w-40" />
            <span style={{ color: 'var(--color-ink-faint)' }}>-</span>
            <Input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setPage(0) }} className="w-40" />
          </div>
          {(resourceType || fromDate || toDate) && (
            <button
              className="btn3d ghost sm"
              onClick={() => { setResourceType(''); setFromDate(''); setToDate(''); setPage(0) }}
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card enter enter-2" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Thời gian', 'Actor', 'Method', 'Action', 'Resource', 'Status', 'Chi tiết'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 800, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--color-ink-faint)', background: 'var(--color-surface-muted)', borderBottom: '1px solid var(--color-line)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array(10).fill(0).map((_, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--color-line)' }}>
                    {[1,2,3,4,5,6,7].map(j => <td key={j} style={{ padding: '12px 14px' }}><div style={{ height: 14, background: 'var(--color-surface-hover)', borderRadius: 6 }} /></td>)}
                  </tr>
                ))
              ) : logs.map((log: AuditLogResponse) => (
                <AuditRow key={log.id} log={log} onView={() => setDetailLog(log)} />
              ))}
            </tbody>
          </table>
        </div>
        <div className="row" style={{ alignItems: 'center', justifyContent: 'space-between', padding: '12px 18px', borderTop: '1px solid var(--color-line)' }}>
          <p style={{ fontSize: 13, color: 'var(--color-ink-faint)' }}>Trang {page + 1} / {totalPages || 1}</p>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn3d ghost sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}><ChevronLeft size={15} /></button>
            <button className="btn3d ghost sm" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}><ChevronRight size={15} /></button>
          </div>
        </div>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!detailLog} onOpenChange={() => setDetailLog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Chi tiết Audit Log #{detailLog?.id}</DialogTitle></DialogHeader>
          {detailLog && (
            <div className="space-y-3 pt-2 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-zinc-500">Thời gian:</span><p className="font-medium">{formatDatetime(detailLog.occurredAt)}</p></div>
                <div><span className="text-zinc-500">Actor:</span><p className="font-medium">{detailLog.actorUsername ?? `#${detailLog.actorId}`}</p></div>
                <div><span className="text-zinc-500">Action:</span><p className="font-medium">{detailLog.action}</p></div>
                <div><span className="text-zinc-500">Service:</span><p className="font-medium">{detailLog.serviceName ?? '-'}</p></div>
                <div><span className="text-zinc-500">Resource:</span><p className="font-medium">{detailLog.resourceType} #{detailLog.resourceId}</p></div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-500">Status:</span>
                  {detailLog.statusCode && <StatusCodePill code={detailLog.statusCode} />}
                </div>
              </div>
              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 space-y-2">
                <div><span className="text-zinc-500">HTTP:</span><p className="font-mono text-xs">{detailLog.httpMethod} {detailLog.httpPath}{detailLog.queryString ? `?${detailLog.queryString}` : ''}</p></div>
                <div><span className="text-zinc-500">Duration:</span><p className="font-medium">{detailLog.durationMs ?? '-'} ms</p></div>
                <div><span className="text-zinc-500">IP:</span><p className="font-mono text-xs">{detailLog.ipAddress ?? '-'}</p></div>
                <div><span className="text-zinc-500">User Agent:</span><p className="text-xs text-zinc-600 dark:text-zinc-400 break-all">{detailLog.userAgent ?? '-'}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function AuditRow({ log, onView }: { log: AuditLogResponse; onView: () => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <tr
      style={{ borderBottom: '1px solid var(--color-line)', background: hovered ? 'var(--color-surface-muted)' : 'transparent', transition: 'background .12s' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td style={{ padding: '10px 14px', fontSize: 11.5, color: 'var(--color-ink-faint)', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)' }}>{formatDatetime(log.occurredAt)}</td>
      <td style={{ padding: '10px 14px' }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--color-ink)' }}>{log.actorUsername ?? `#${log.actorId}`}</span>
      </td>
      <td style={{ padding: '10px 14px' }}>
        {log.httpMethod && <HttpMethodChip method={log.httpMethod} />}
      </td>
      <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--color-ink-soft)' }}>{log.action}</td>
      <td style={{ padding: '10px 14px' }}>
        <div className="row" style={{ alignItems: 'center', gap: 6 }}>
          {log.resourceType && <span className="codechip" style={{ fontSize: 11 }}>{log.resourceType}</span>}
          {log.resourceId && <span style={{ fontSize: 11, color: 'var(--color-ink-faint)' }}>#{log.resourceId}</span>}
        </div>
      </td>
      <td style={{ padding: '10px 14px' }}>
        <div className="row" style={{ alignItems: 'center', gap: 6 }}>
          {log.statusCode && <StatusCodePill code={log.statusCode} />}
          {log.durationMs != null && <span style={{ fontSize: 11, color: 'var(--color-ink-faint)' }}>{log.durationMs}ms</span>}
        </div>
      </td>
      <td style={{ padding: '10px 14px' }}>
        <button onClick={onView} className="iconbtn" style={{ width: 30, height: 30 }}>
          <Eye size={14} />
        </button>
      </td>
    </tr>
  )
}

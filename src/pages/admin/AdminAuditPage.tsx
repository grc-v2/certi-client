'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ClipboardList, Search, ChevronLeft, ChevronRight, Eye, Calendar, Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { adminApi, type AuditLogResponse } from '@/lib/api/admin'
import { cn } from '@/lib/utils'

const METHOD_COLORS: Record<string, string> = {
  GET: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
  POST: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400',
  PUT: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400',
  PATCH: 'bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400',
}

function formatDatetime(dt: string) {
  if (!dt) return '-'
  const d = new Date(dt)
  return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-primary" />Audit Log
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">{total} bản ghi</p>
      </div>

      {/* Filters */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardContent className="p-4 flex flex-wrap gap-3">
          <Select value={resourceType} onValueChange={v => { setResourceType(v ?? ''); setPage(0) }}>
            <SelectTrigger className="w-full sm:w-44 cursor-pointer">
              <Filter className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
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
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <Input type="date" value={fromDate} onChange={e => { setFromDate(e.target.value); setPage(0) }} className="w-40" />
            <span className="text-slate-400">-</span>
            <Input type="date" value={toDate} onChange={e => { setToDate(e.target.value); setPage(0) }} className="w-40" />
          </div>
          {(resourceType || fromDate || toDate) && (
            <Button variant="outline" size="sm" onClick={() => { setResourceType(''); setFromDate(''); setToDate(''); setPage(0) }} className="cursor-pointer">
              Xóa bộ lọc
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-slate-200 dark:border-slate-700">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="p-3 text-left font-medium text-slate-500">Thời gian</th>
                  <th className="p-3 text-left font-medium text-slate-500">Actor</th>
                  <th className="p-3 text-left font-medium text-slate-500 hidden sm:table-cell">Method</th>
                  <th className="p-3 text-left font-medium text-slate-500">Action</th>
                  <th className="p-3 text-left font-medium text-slate-500 hidden md:table-cell">Resource</th>
                  <th className="p-3 text-left font-medium text-slate-500 hidden lg:table-cell">Status</th>
                  <th className="p-3 text-left font-medium text-slate-500">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array(10).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50">
                      {[1,2,3,4,5,6,7].map(j => <td key={j} className="p-3"><div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /></td>)}
                    </tr>
                  ))
                ) : logs.map(log => (
                  <tr key={log.id} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="p-3 text-xs text-slate-500 whitespace-nowrap">{formatDatetime(log.occurredAt)}</td>
                    <td className="p-3">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{log.actorUsername ?? `#${log.actorId}`}</span>
                    </td>
                    <td className="p-3 hidden sm:table-cell">
                      {log.httpMethod && (
                        <Badge className={cn('text-xs font-mono', METHOD_COLORS[log.httpMethod] ?? 'bg-slate-100 text-slate-600')}>{log.httpMethod}</Badge>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-slate-700 dark:text-slate-300">{log.action}</span>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        {log.resourceType && <Badge variant="secondary" className="text-xs">{log.resourceType}</Badge>}
                        {log.resourceId && <span className="text-xs text-slate-400">#{log.resourceId}</span>}
                      </div>
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <div className="flex items-center gap-2">
                        {log.statusCode && (
                          <Badge className={cn('text-xs', log.statusCode < 400 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                            {log.statusCode}
                          </Badge>
                        )}
                        {log.durationMs != null && <span className="text-xs text-slate-400">{log.durationMs}ms</span>}
                      </div>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => setDetailLog(log)}
                        className="p-1.5 text-slate-400 hover:text-primary cursor-pointer transition-colors rounded hover:bg-primary/10"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500">Trang {page + 1} / {totalPages || 1}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="cursor-pointer"><ChevronLeft className="w-4 h-4" /></Button>
              <Button size="sm" variant="outline" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="cursor-pointer"><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail dialog */}
      <Dialog open={!!detailLog} onOpenChange={() => setDetailLog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Chi tiết Audit Log #{detailLog?.id}</DialogTitle></DialogHeader>
          {detailLog && (
            <div className="space-y-3 pt-2 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-slate-500">Thời gian:</span><p className="font-medium">{formatDatetime(detailLog.occurredAt)}</p></div>
                <div><span className="text-slate-500">Actor:</span><p className="font-medium">{detailLog.actorUsername ?? `#${detailLog.actorId}`}</p></div>
                <div><span className="text-slate-500">Action:</span><p className="font-medium">{detailLog.action}</p></div>
                <div><span className="text-slate-500">Service:</span><p className="font-medium">{detailLog.serviceName ?? '-'}</p></div>
                <div><span className="text-slate-500">Resource:</span><p className="font-medium">{detailLog.resourceType} #{detailLog.resourceId}</p></div>
                <div><span className="text-slate-500">Status:</span>
                  {detailLog.statusCode && (
                    <Badge className={cn('text-xs', detailLog.statusCode < 400 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>{detailLog.statusCode}</Badge>
                  )}
                </div>
              </div>
              <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
                <div><span className="text-slate-500">HTTP:</span><p className="font-mono text-xs">{detailLog.httpMethod} {detailLog.httpPath}{detailLog.queryString ? `?${detailLog.queryString}` : ''}</p></div>
                <div><span className="text-slate-500">Duration:</span><p className="font-medium">{detailLog.durationMs ?? '-'} ms</p></div>
                <div><span className="text-slate-500">IP:</span><p className="font-mono text-xs">{detailLog.ipAddress ?? '-'}</p></div>
                <div><span className="text-slate-500">User Agent:</span><p className="text-xs text-slate-600 dark:text-slate-400 break-all">{detailLog.userAgent ?? '-'}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

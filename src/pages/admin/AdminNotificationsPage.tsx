'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Send, FileText, Edit2, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { notificationsApi, type BroadcastNotificationRequest, type NotificationTemplateRequest, type NotificationTemplateResponse } from '@/lib/api/notifications'
import { NotificationHistory } from '@/components/admin/notification-history'
import { toast } from 'sonner'

type BroadcastForm = BroadcastNotificationRequest & { targetRole: string }
type TemplateItem = NotificationTemplateResponse

export default function AdminNotificationsPage() {
  const queryClient = useQueryClient()
  const [editTemplate, setEditTemplate] = useState<TemplateItem | null>(null)
  const [templateForm, setTemplateForm] = useState({ subject: '', body: '' })
  const [broadcastForm, setBroadcastForm] = useState<BroadcastForm>({ title: '', message: '', type: 'BROADCAST', targetRole: '' })

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['notification-templates'],
    queryFn: notificationsApi.listTemplates,
  })

  const broadcastMutation = useMutation({
    mutationFn: (data: BroadcastForm) => notificationsApi.broadcast(data),
    onSuccess: () => { toast.success('Đã gửi thông báo broadcast!'); setBroadcastForm({ title: '', message: '', type: 'BROADCAST', targetRole: '' }) },
    onError: () => toast.error('Không thể gửi thông báo'),
  })

  const updateTemplateMutation = useMutation({
    mutationFn: ({ key, data }: { key: string; data: NotificationTemplateRequest }) => notificationsApi.updateTemplate(key, data),
    onSuccess: () => { toast.success('Đã cập nhật template'); setEditTemplate(null); queryClient.invalidateQueries({ queryKey: ['notification-templates'] }) },
  })

  const templatesList: TemplateItem[] = templates ?? []

  function openEditTemplate(t: TemplateItem) {
    setEditTemplate(t)
    setTemplateForm({ subject: t.subject ?? '', body: t.body ?? '' })
  }

  return (
    <div className="col" style={{ gap: 20 }}>
      {/* Header */}
      <div className="row enter" style={{ alignItems: 'flex-start', gap: 12 }}>
        <div>
          <span className="eyebrow">Quản trị</span>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--color-ink)', marginTop: 6 }}>
            <span className="row" style={{ alignItems: 'center', gap: 8 }}>
              <Bell size={22} style={{ color: 'var(--color-accent)' }} />
              Quản lý thông báo
            </span>
          </h1>
          <p style={{ color: 'var(--color-ink-faint)', fontSize: 13.5, marginTop: 4 }}>Broadcast và quản lý template thông báo</p>
        </div>
      </div>

      <Tabs defaultValue="broadcast">
        <TabsList>
          <TabsTrigger value="broadcast" className="cursor-pointer"><Send className="w-3.5 h-3.5 mr-1.5" />Broadcast</TabsTrigger>
          <TabsTrigger value="templates" className="cursor-pointer"><FileText className="w-3.5 h-3.5 mr-1.5" />Templates</TabsTrigger>
          <TabsTrigger value="history" className="cursor-pointer"><Clock className="w-3.5 h-3.5 mr-1.5" />Lịch sử</TabsTrigger>
        </TabsList>

        <TabsContent value="broadcast" className="mt-4">
          <div className="card enter" style={{ padding: 24, maxWidth: 640 }}>
            <span className="eyebrow" style={{ display: 'block', marginBottom: 16 }}>Gửi thông báo broadcast</span>
            <form onSubmit={e => { e.preventDefault(); broadcastMutation.mutate(broadcastForm) }} className="space-y-4">
              <div>
                <Label htmlFor="title">Tiêu đề</Label>
                <Input id="title" value={broadcastForm.title} onChange={e => setBroadcastForm(f => ({ ...f, title: e.target.value }))} placeholder="Tiêu đề thông báo" required />
              </div>
              <div>
                <Label htmlFor="message">Nội dung</Label>
                <Textarea id="message" value={broadcastForm.message} onChange={e => setBroadcastForm(f => ({ ...f, message: e.target.value }))} placeholder="Nội dung thông báo..." rows={4} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Loại</Label>
                  <Select value={broadcastForm.type} onValueChange={v => setBroadcastForm(f => ({ ...f, type: v ?? 'BROADCAST' }))}>
                    <SelectTrigger className="cursor-pointer"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BROADCAST">Broadcast</SelectItem>
                      <SelectItem value="ANNOUNCEMENT">Thông báo</SelectItem>
                      <SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Đối tượng</Label>
                  <Select value={broadcastForm.targetRole} onValueChange={v => setBroadcastForm(f => ({ ...f, targetRole: v ?? '' }))}>
                    <SelectTrigger className="cursor-pointer"><SelectValue placeholder="Tất cả" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Tất cả</SelectItem>
                      <SelectItem value="USER">Người dùng</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <button type="submit" disabled={broadcastMutation.isPending} className="btn3d sm">
                <Send size={14} />
                {broadcastMutation.isPending ? 'Đang gửi...' : 'Gửi thông báo'}
              </button>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          {templatesLoading ? (
            <div className="col" style={{ gap: 10, maxWidth: 640 }}>
              {Array(4).fill(0).map((_, i) => (
                <div key={i} style={{ height: 72, background: 'var(--color-surface-muted)', borderRadius: 'var(--radius-card)' }} />
              ))}
            </div>
          ) : templatesList.length > 0 ? (
            <div className="col" style={{ gap: 10, maxWidth: 640 }}>
              {templatesList.map(t => (
                <div key={t.key} className="card enter" style={{ padding: '14px 18px' }}>
                  <div className="row" style={{ alignItems: 'center', gap: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-ink)', margin: 0 }}>{t.name}</p>
                      <p style={{ fontSize: 12, color: 'var(--color-ink-faint)', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</p>
                      <div className="row" style={{ gap: 6, marginTop: 6 }}>
                        <span className="codechip" style={{ fontSize: 10.5 }}>{t.key}</span>
                        <span className="codechip" style={{ fontSize: 10.5 }}>{t.type}</span>
                      </div>
                    </div>
                    <button
                      className="btn3d ghost sm"
                      style={{ flexShrink: 0 }}
                      onClick={() => openEditTemplate(t)}
                    >
                      <Edit2 size={13} />Sửa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-ink-faint)', fontSize: 14 }}>Chưa có template nào</p>
          )}

          {/* Edit Template Dialog */}
          <Dialog open={!!editTemplate} onOpenChange={() => setEditTemplate(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Sửa template: {editTemplate?.key}</DialogTitle></DialogHeader>
              <form onSubmit={e => { e.preventDefault(); editTemplate && updateTemplateMutation.mutate({ key: editTemplate.key, data: templateForm }) }} className="space-y-4 pt-2">
                <div><Label>Subject</Label><Input value={templateForm.subject} onChange={e => setTemplateForm(f => ({ ...f, subject: e.target.value }))} /></div>
                <div><Label>Body</Label><Textarea value={templateForm.body} onChange={e => setTemplateForm(f => ({ ...f, body: e.target.value }))} rows={6} /></div>
                <Button type="submit" disabled={updateTemplateMutation.isPending} className="w-full bg-accent hover:bg-zinc-800 text-white cursor-pointer">
                  {updateTemplateMutation.isPending ? 'Đang lưu...' : 'Lưu template'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <NotificationHistory />
        </TabsContent>
      </Tabs>
    </div>
  )
}

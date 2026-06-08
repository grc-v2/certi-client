'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Send, FileText, Edit2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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

  // Broadcast form state
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="w-6 h-6 text-primary" />Quản lý thông báo
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Broadcast và quản lý template thông báo</p>
      </div>

      <Tabs defaultValue="broadcast">
        <TabsList>
          <TabsTrigger value="broadcast" className="cursor-pointer"><Send className="w-3.5 h-3.5 mr-1.5" />Broadcast</TabsTrigger>
          <TabsTrigger value="templates" className="cursor-pointer"><FileText className="w-3.5 h-3.5 mr-1.5" />Templates</TabsTrigger>
          <TabsTrigger value="history" className="cursor-pointer"><Clock className="w-3.5 h-3.5 mr-1.5" />Lịch sử</TabsTrigger>
        </TabsList>

        <TabsContent value="broadcast" className="mt-4">
          <Card className="border-slate-200 dark:border-slate-700 max-w-2xl">
            <CardHeader><CardTitle className="text-base">Gửi thông báo broadcast</CardTitle></CardHeader>
            <CardContent>
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
                <Button type="submit" disabled={broadcastMutation.isPending} className="bg-primary hover:bg-slate-800 text-white cursor-pointer">
                  <Send className="w-4 h-4 mr-2" />
                  {broadcastMutation.isPending ? 'Đang gửi...' : 'Gửi thông báo'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          {templatesLoading ? (
            <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="h-16 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />)}</div>
          ) : templatesList.length > 0 ? (
            <div className="space-y-3 max-w-2xl">
              {templatesList.map(t => (
                <Card key={t.key} className="border-slate-200 dark:border-slate-700">
                  <CardContent className="p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 dark:text-white text-sm">{t.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">{t.subject}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">{t.key}</Badge>
                        <Badge variant="secondary" className="text-xs">{t.type}</Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer flex-shrink-0"
                      onClick={() => openEditTemplate(t)}
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1.5" />Sửa
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-slate-500 text-sm">Chưa có template nào</p>
          )}

          {/* Edit Template Dialog */}
          <Dialog open={!!editTemplate} onOpenChange={() => setEditTemplate(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Sửa template: {editTemplate?.key}</DialogTitle></DialogHeader>
              <form onSubmit={e => { e.preventDefault(); editTemplate && updateTemplateMutation.mutate({ key: editTemplate.key, data: templateForm }) }} className="space-y-4 pt-2">
                <div><Label>Subject</Label><Input value={templateForm.subject} onChange={e => setTemplateForm(f => ({ ...f, subject: e.target.value }))} /></div>
                <div><Label>Body</Label><Textarea value={templateForm.body} onChange={e => setTemplateForm(f => ({ ...f, body: e.target.value }))} rows={6} /></div>
                <Button type="submit" disabled={updateTemplateMutation.isPending} className="w-full bg-primary hover:bg-slate-800 text-white cursor-pointer">
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

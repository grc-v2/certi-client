'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Send, FileText, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { notificationsApi } from '@/lib/api/notifications'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'

type BroadcastForm = { title: string; message: string; type: string; targetRole?: string }
type TemplateForm = { subject: string; body: string }

export default function AdminNotificationsPage() {
  const queryClient = useQueryClient()
  const [editTemplate, setEditTemplate] = useState<{ key: string; subject: string; body: string } | null>(null)
  const { register: broadcastRegister, handleSubmit: handleBroadcast, reset: resetBroadcast } = useForm<BroadcastForm>()
  const { register: templateRegister, handleSubmit: handleTemplate, reset: resetTemplate } = useForm<TemplateForm>()

  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ['notification-templates'],
    queryFn: notificationsApi.listTemplates,
  })

  const broadcastMutation = useMutation({
    mutationFn: (data: BroadcastForm) => notificationsApi.broadcast(data),
    onSuccess: () => { toast.success('Đã gửi thông báo broadcast!'); resetBroadcast() },
    onError: () => toast.error('Không thể gửi thông báo'),
  })

  const updateTemplateMutation = useMutation({
    mutationFn: ({ key, data }: { key: string; data: unknown }) => notificationsApi.updateTemplate(key, data),
    onSuccess: () => { toast.success('Đã cập nhật template'); setEditTemplate(null); queryClient.invalidateQueries({ queryKey: ['notification-templates'] }) },
  })

  const templatesList = (templates as Array<{ key: string; name: string; subject: string; type: string }>) ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Bell className="w-6 h-6 text-[#0A66C2]" />Quản lý thông báo
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Broadcast và quản lý template thông báo</p>
      </div>

      <Tabs defaultValue="broadcast">
        <TabsList>
          <TabsTrigger value="broadcast" className="cursor-pointer"><Send className="w-3.5 h-3.5 mr-1.5" />Broadcast</TabsTrigger>
          <TabsTrigger value="templates" className="cursor-pointer"><FileText className="w-3.5 h-3.5 mr-1.5" />Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="broadcast" className="mt-4">
          <Card className="border-slate-200 dark:border-slate-700 max-w-2xl">
            <CardHeader><CardTitle className="text-base">Gửi thông báo broadcast</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleBroadcast(d => broadcastMutation.mutate(d))} className="space-y-4">
                <div><Label htmlFor="title">Tiêu đề</Label><Input id="title" {...broadcastRegister('title', { required: true })} placeholder="Tiêu đề thông báo" /></div>
                <div><Label htmlFor="message">Nội dung</Label><Textarea id="message" {...broadcastRegister('message', { required: true })} placeholder="Nội dung thông báo..." rows={4} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Loại</Label>
                    <Select onValueChange={() => {}}>
                      <SelectTrigger className="cursor-pointer"><SelectValue placeholder="Chọn loại" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BROADCAST">Broadcast</SelectItem>
                        <SelectItem value="ANNOUNCEMENT">Thông báo</SelectItem>
                        <SelectItem value="MAINTENANCE">Bảo trì</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Đối tượng</Label>
                    <Select onValueChange={() => {}}>
                      <SelectTrigger className="cursor-pointer"><SelectValue placeholder="Tất cả" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Tất cả</SelectItem>
                        <SelectItem value="USER">Người dùng</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" disabled={broadcastMutation.isPending} className="bg-[#0A66C2] hover:bg-[#084E96] text-white cursor-pointer">
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
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white text-sm">{t.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="text-xs">{t.key}</Badge>
                        <Badge variant="secondary" className="text-xs">{t.type}</Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer flex-shrink-0"
                      onClick={() => setEditTemplate({ key: t.key, subject: t.subject, body: '' })}
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
            <DialogContent>
              <DialogHeader><DialogTitle>Sửa template: {editTemplate?.key}</DialogTitle></DialogHeader>
              <form onSubmit={handleTemplate(d => updateTemplateMutation.mutate({ key: editTemplate!.key, data: d }))} className="space-y-4 pt-2">
                <div><Label>Subject</Label><Input {...templateRegister('subject')} defaultValue={editTemplate?.subject} /></div>
                <div><Label>Body</Label><Textarea {...templateRegister('body')} rows={6} /></div>
                <Button type="submit" disabled={updateTemplateMutation.isPending} className="w-full bg-[#0A66C2] hover:bg-[#084E96] text-white cursor-pointer">
                  {updateTemplateMutation.isPending ? 'Đang lưu...' : 'Lưu template'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  )
}

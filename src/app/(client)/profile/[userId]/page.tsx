'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { Edit2, Camera, FileText, GraduationCap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { profileApi, type UpdateProfileRequest } from '@/lib/api/profile'
import { postsApi } from '@/lib/api/posts'
import { useAuthStore } from '@/store/auth-store'
import { formatRelativeTime } from '@/lib/utils'
import { toast } from 'sonner'
import { PostCard } from '@/components/community/post-card'

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>()
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const resolvedUserId = userId === 'me' ? user?.id : userId
  const isMyProfile = userId === 'me' || String(user?.id) === String(resolvedUserId)
  const [editOpen, setEditOpen] = useState(false)
  const [form, setForm] = useState<UpdateProfileRequest>({})

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', resolvedUserId],
    queryFn: () => isMyProfile ? profileApi.getMyProfile() : profileApi.getUserProfile(resolvedUserId!),
    enabled: !!resolvedUserId,
  })

  const { data: posts } = useQuery({
    queryKey: ['user-posts', resolvedUserId],
    queryFn: () => postsApi.getByAuthor(resolvedUserId!, 0, 10),
    enabled: !!resolvedUserId,
  })

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) => profileApi.updateMyProfile(data),
    onSuccess: () => {
      toast.success('Đã cập nhật hồ sơ')
      setEditOpen(false)
      queryClient.invalidateQueries({ queryKey: ['profile', resolvedUserId] })
    },
    onError: () => toast.error('Không thể cập nhật hồ sơ'),
  })

  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar(file),
    onSuccess: (data) => {
      toast.success('Đã cập nhật ảnh đại diện')
      queryClient.setQueryData(['profile', resolvedUserId], (old: typeof profile) =>
        old ? { ...old, avatarUrl: data.avatarUrl } : old
      )
    },
    onError: () => toast.error('Không thể tải ảnh lên'),
  })

  const openEdit = () => {
    setForm({
      displayName: profile?.displayName ?? '',
      bio: profile?.bio ?? '',
      timezone: profile?.timezone ?? '',
      preferredLanguage: profile?.preferredLanguage ?? '',
      professionalInfo: {
        jobTitle: profile?.professionalInfo?.jobTitle ?? '',
        company: profile?.professionalInfo?.company ?? '',
      },
      learningPreferences: {
        dailyGoalMinutes: profile?.learningPreferences?.dailyGoalMinutes ?? 30,
        notificationEnabled: profile?.learningPreferences?.notificationEnabled ?? true,
      },
    })
    setEditOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateMutation.mutate(form)
  }

  if (isLoading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
    </div>
  )

  if (!profile) return <div className="text-center py-16 text-slate-500">Không tìm thấy hồ sơ</div>

  const initials = profile.fullName?.slice(0, 2).toUpperCase() || 'U'

  const editDialog = (
    <Dialog open={editOpen} onOpenChange={setEditOpen}>
      <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <DialogTitle className="text-lg font-semibold text-slate-900 dark:text-white">Chỉnh sửa hồ sơ</DialogTitle>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Cập nhật thông tin cá nhân của bạn</p>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
            {/* Row 1: displayName + preferredLanguage */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Tên hiển thị</Label>
              <Input
                value={form.displayName ?? ''}
                onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                placeholder="Nhập tên hiển thị"
                maxLength={200}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Ngôn ngữ</Label>
              <Input
                value={form.preferredLanguage ?? ''}
                onChange={e => setForm(f => ({ ...f, preferredLanguage: e.target.value }))}
                placeholder="vd: vi, en"
                maxLength={10}
                className="h-8 text-sm"
              />
            </div>

            {/* Row 2: bio spans full width */}
            <div className="sm:col-span-2 space-y-1">
              <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Giới thiệu</Label>
              <Textarea
                value={form.bio ?? ''}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                rows={2}
                placeholder="Viết vài dòng giới thiệu về bản thân..."
                className="resize-none text-sm"
                maxLength={2000}
              />
            </div>

            {/* Row 3: timezone + jobTitle */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Múi giờ</Label>
              <Input
                value={form.timezone ?? ''}
                onChange={e => setForm(f => ({ ...f, timezone: e.target.value }))}
                placeholder="vd: Asia/Ho_Chi_Minh"
                maxLength={50}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Chức danh</Label>
              <Input
                value={form.professionalInfo?.jobTitle ?? ''}
                onChange={e => setForm(f => ({ ...f, professionalInfo: { ...f.professionalInfo, jobTitle: e.target.value } }))}
                placeholder="vd: Software Engineer"
                className="h-8 text-sm"
              />
            </div>

            {/* Row 4: company + dailyGoalMinutes */}
            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Công ty</Label>
              <Input
                value={form.professionalInfo?.company ?? ''}
                onChange={e => setForm(f => ({ ...f, professionalInfo: { ...f.professionalInfo, company: e.target.value } }))}
                placeholder="vd: Google"
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Mục tiêu mỗi ngày (phút)</Label>
              <Input
                type="number"
                min={1}
                max={480}
                value={form.learningPreferences?.dailyGoalMinutes ?? 30}
                onChange={e => setForm(f => ({ ...f, learningPreferences: { ...f.learningPreferences, dailyGoalMinutes: Number(e.target.value) } }))}
                className="h-8 text-sm"
              />
            </div>

            {/* Row 5: notification toggle */}
            <div className="sm:col-span-2 flex items-center gap-2 pt-1">
              <input
                id="notif-toggle"
                type="checkbox"
                className="w-4 h-4 rounded accent-[#0A66C2] cursor-pointer"
                checked={form.learningPreferences?.notificationEnabled ?? true}
                onChange={e => setForm(f => ({ ...f, learningPreferences: { ...f.learningPreferences, notificationEnabled: e.target.checked } }))}
              />
              <label htmlFor="notif-toggle" className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                Bật thông báo học tập
              </label>
            </div>
          </div>
          <DialogFooter className="mx-0 mb-0 px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-transparent">
            <Button type="submit" disabled={updateMutation.isPending} className="bg-[#0A66C2] hover:bg-[#084E96] text-white cursor-pointer px-6">
              {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="space-y-6">
      {/* Profile header card */}
      <Card className="border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Thin accent strip */}
        <div className="h-16 bg-gradient-to-r from-[#0A66C2] to-[#084E96]" />
        <div className="px-5 sm:px-6 pb-5">
          <div className="flex items-end gap-4 -mt-9">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-white dark:border-slate-950 shadow-sm">
                <AvatarImage src={profile.avatarUrl ?? undefined} />
                <AvatarFallback className="text-xl font-bold bg-[#0A66C2] text-white">{initials}</AvatarFallback>
              </Avatar>
              {isMyProfile && (
                <label className="absolute bottom-0 right-0 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
                  <Camera className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                  <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadAvatarMutation.mutate(f) }} />
                </label>
              )}
            </div>

            {/* Name row */}
            <div className="flex-1 min-w-0 flex items-center justify-between gap-3 pb-1">
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white leading-tight truncate">
                  {profile.displayName || profile.fullName}
                </h1>
                <p className="text-sm text-slate-500">@{profile.username}</p>
              </div>
              {isMyProfile && (
                <Button
                  size="sm"
                  variant="outline"
                  className="cursor-pointer flex-shrink-0"
                  onClick={openEdit}
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1.5" />Chỉnh sửa
                </Button>
              )}
            </div>
          </div>

          {/* Bio & meta */}
          {profile.bio && (
            <p className="text-slate-600 dark:text-slate-300 mt-3 text-sm">{profile.bio}</p>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
            <span>{profile.email}</span>
            {profile.professionalInfo?.jobTitle && (
              <span>{profile.professionalInfo.jobTitle}{profile.professionalInfo.company ? ` · ${profile.professionalInfo.company}` : ''}</span>
            )}
            {profile.preferredLanguage && <span>🌐 {profile.preferredLanguage}</span>}
            {profile.timezone && <span>🕐 {profile.timezone}</span>}
            {profile.updatedAt && <span>Cập nhật {formatRelativeTime(profile.updatedAt)}</span>}
          </div>

          {/* Completeness badge + bar */}
          {isMyProfile && profile.completenessScore < 100 && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-900">
              <div className="flex justify-between text-xs text-amber-700 dark:text-amber-400 mb-1.5">
                <span>Độ hoàn thiện hồ sơ</span>
                <span>{profile.completenessScore}%</span>
              </div>
              <Progress value={profile.completenessScore} className="h-1.5" />
            </div>
          )}
        </div>
      </Card>

      {editDialog}

      {/* Tabs */}
      <Tabs defaultValue="posts">
        <TabsList>
          <TabsTrigger value="posts" className="cursor-pointer"><FileText className="w-3.5 h-3.5 mr-1.5" />Bài viết</TabsTrigger>
          <TabsTrigger value="certifications" className="cursor-pointer"><GraduationCap className="w-3.5 h-3.5 mr-1.5" />Chứng chỉ</TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="space-y-4 mt-4">
          {posts?.content?.filter(Boolean).length ? (
            posts.content.filter(Boolean).map(post => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="text-center py-8 text-slate-500 text-sm">Chưa có bài viết nào</div>
          )}
        </TabsContent>
        <TabsContent value="certifications" className="mt-4">
          <Card className="border-slate-200 dark:border-slate-700">
            <CardContent className="py-8 text-center text-sm text-slate-500">
              Chứng chỉ sẽ hiển thị ở đây
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

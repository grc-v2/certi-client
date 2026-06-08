'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, Link } from 'react-router-dom'
import { useState } from 'react'
import { Edit2, Camera, FileText, GraduationCap, PenTool, BookOpen, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { profileApi, type UpdateProfileRequest } from '@/lib/api/profile'
import { postsApi } from '@/lib/api/posts'
import { resultsApi } from '@/lib/api/results'
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

  const { data: historyData, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['results-history', resolvedUserId],
    queryFn: () => resultsApi.getHistory(resolvedUserId!),
    enabled: !!resolvedUserId,
  })
  const userCerts = historyData?.statistics?.certifications ?? []

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
                className="w-4 h-4 rounded accent-primary cursor-pointer"
                checked={form.learningPreferences?.notificationEnabled ?? true}
                onChange={e => setForm(f => ({ ...f, learningPreferences: { ...f.learningPreferences, notificationEnabled: e.target.checked } }))}
              />
              <label htmlFor="notif-toggle" className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                Bật thông báo học tập
              </label>
            </div>
          </div>
          <DialogFooter className="mx-0 mb-0 px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-transparent">
            <Button type="submit" disabled={updateMutation.isPending} className="bg-primary hover:bg-slate-800 text-white cursor-pointer px-6">
              {updateMutation.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Profile header card */}
      <Card className="border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Thin accent strip */}
        <div className="h-16 bg-gradient-to-r from-primary to-slate-800" />
        <div className="px-5 sm:px-6 pb-5">
          <div className="flex items-end gap-4 -mt-9">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-white dark:border-slate-950 shadow-md">
                <AvatarImage src={profile.avatarUrl ?? undefined} />
                <AvatarFallback className="text-xl font-black bg-gradient-to-br from-primary via-slate-800 to-cta text-white font-heading">{initials}</AvatarFallback>
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
            <div className="flex flex-col items-center justify-center text-center py-12 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/30 dark:bg-slate-900/10">
              <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-900/50 mb-4 text-slate-400 dark:text-slate-500 flex items-center justify-center">
                <PenTool className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Chưa có bài viết nào</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm leading-relaxed">
                {isMyProfile 
                  ? "Chia sẻ kinh nghiệm thi cử, tài liệu học tập hoặc các mẹo công nghệ của bạn với cộng đồng ngay hôm nay!" 
                  : "Người dùng này chưa đăng tải bài viết nào trên cộng đồng."}
              </p>
              {isMyProfile && (
                <Link to="/community" className="mt-4">
                  <Button size="sm" className="bg-primary hover:bg-slate-800 text-white font-semibold cursor-pointer rounded-xl">
                    Tạo bài viết đầu tiên
                  </Button>
                </Link>
              )}
            </div>
          )}
        </TabsContent>
        <TabsContent value="certifications" className="mt-4">
          {isHistoryLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((n) => (
                <div key={n} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : userCerts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userCerts.map((cert) => {
                // Compute visual metrics
                const avgScore = Math.round(Number(cert.averageScore))
                const totalExams = cert.exams
                const isPassed = avgScore >= 70
                
                return (
                  <Card key={cert.certificationId} className="border-slate-200 dark:border-slate-800 bg-gradient-to-br from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/30 hover:shadow-md transition-all duration-200">
                    <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 text-primary dark:text-cta">
                            <GraduationCap className="w-5 h-5" />
                          </div>
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "text-[10px] font-bold px-2 py-0.5 rounded-full border-0",
                              isPassed ? "bg-success/10 text-success" : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                            )}
                          >
                            {isPassed ? 'Hoàn thành tốt' : 'Đang cải thiện'}
                          </Badge>
                        </div>
                        <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mt-3 line-clamp-1">{cert.name}</h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{totalExams} lượt làm đề luyện thi</p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                          <span>Điểm trung bình</span>
                          <span className="font-mono">{avgScore}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              isPassed ? "bg-success" : "bg-yellow-500"
                            )}
                            style={{ width: `${avgScore}%` }}
                          />
                        </div>
                      </div>
                      
                      <Link to="/certifications" className="w-full">
                        <Button size="sm" variant="ghost" className="w-full justify-between hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white text-xs font-bold rounded-lg cursor-pointer transition-colors p-0 px-2 h-8">
                          <span>Luyện thi tiếp</span>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/30 dark:bg-slate-900/10">
              <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-900/50 mb-4 text-slate-400 dark:text-slate-500 flex items-center justify-center">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">Chưa tham gia chứng chỉ nào</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm leading-relaxed">
                {isMyProfile 
                  ? "Khám phá danh sách các chứng chỉ CNTT hàng đầu và bắt đầu ôn luyện ngay hôm nay để đạt mục tiêu nghề nghiệp!" 
                  : "Người dùng này chưa tham gia ôn luyện chứng chỉ nào."}
              </p>
              {isMyProfile && (
                <Link to="/certifications" className="mt-4">
                  <Button size="sm" className="bg-primary hover:bg-slate-800 text-white font-semibold cursor-pointer rounded-xl">
                    Khám phá chứng chỉ ngay
                  </Button>
                </Link>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

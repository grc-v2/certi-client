'use client'
import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  ArrowLeft, CheckCircle2, PlayCircle, BookOpen,
  ChevronLeft, ChevronRight, Menu, X
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { coursesApi } from '@/lib/api/courses'
import { cn } from '@/lib/utils'

export default function CourseLearningPage() {
  const { id, lessonId } = useParams<{ id: string, lessonId: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const courseId = Number(id)
  const currentLessonId = Number(lessonId)

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const { data: course, isLoading: isLoadingCourse } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => coursesApi.getCourseById(courseId),
    enabled: !!courseId,
  })

  const { data: lesson, isLoading: isLoadingLesson } = useQuery({
    queryKey: ['course-lesson', courseId, currentLessonId],
    queryFn: () => coursesApi.getCourseLesson(courseId, currentLessonId),
    enabled: !!courseId && !!currentLessonId,
  })

  const { data: enrollments = [] } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: coursesApi.getMyEnrollments,
  })
  const enrollment = enrollments.find(e => e.courseId === courseId)

  const completeMutation = useMutation({
    mutationFn: () => coursesApi.markLessonComplete(courseId, currentLessonId),
    onSuccess: () => {
      toast.success('Đã hoàn thành bài học!')
      queryClient.invalidateQueries({ queryKey: ['course', courseId] })
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] })
      queryClient.invalidateQueries({ queryKey: ['course-lesson', courseId, currentLessonId] })
      
      if (lesson?.nextLessonId) {
        navigate(`/courses/${courseId}/learn/${lesson.nextLessonId}`)
      }
    }
  })

  if (isLoadingCourse || isLoadingLesson) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Đang tải bài học...</p>
        </div>
      </div>
    )
  }

  if (!course || !lesson) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Không tìm thấy nội dung</h2>
          <Button onClick={() => navigate(`/courses/${courseId}`)} className="cursor-pointer">Quay lại khóa học</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950 overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Curriculum Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-80 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-transform duration-300 lg:translate-x-0 lg:static lg:flex-shrink-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <Link to={`/courses/${courseId}`} className="flex items-center text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="truncate max-w-[200px]">{course.name}</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress */}
        {enrollment && (
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-950">
            <div className="flex justify-between text-xs font-medium mb-2">
              <span className="text-slate-700 dark:text-slate-300">Tiến độ của bạn</span>
              <span className="text-primary">{enrollment.progressPercentage}%</span>
            </div>
            <Progress value={enrollment.progressPercentage} className="h-1.5" />
          </div>
        )}

        {/* Modules List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide py-4 space-y-6">
          {course.modules.sort((a, b) => a.orderIndex - b.orderIndex).map((module, mIdx) => (
            <div key={module.id}>
              <div className="px-4 mb-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Phần {mIdx + 1}: {module.title}
                </h3>
              </div>
              <div className="space-y-0.5">
                {module.lessons?.sort((a, b) => a.orderIndex - b.orderIndex).map((l, lIdx) => {
                  const isActive = l.id === currentLessonId
                  return (
                    <Link
                      key={l.id}
                      to={`/courses/${courseId}/learn/${l.id}`}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-start gap-3 px-4 py-2.5 cursor-pointer transition-colors border-l-2",
                        isActive 
                          ? "bg-primary/10 border-primary" 
                          : "border-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
                      )}
                    >
                      <div className="mt-0.5 shrink-0">
                        {l.isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                        ) : l.type === 'VIDEO' ? (
                          <PlayCircle className={cn("w-4 h-4", isActive ? "text-primary" : "text-slate-400")} />
                        ) : (
                          <BookOpen className={cn("w-4 h-4", isActive ? "text-primary" : "text-slate-400")} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-medium line-clamp-2",
                          isActive ? "text-primary" : "text-slate-700 dark:text-slate-300"
                        )}>
                          {lIdx + 1}. {l.title}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{l.durationMinutes} phút</p>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-950">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white truncate max-w-[300px] sm:max-w-md">
              {lesson.title}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {!lesson.isCompleted && (
              <Button 
                onClick={() => completeMutation.mutate()}
                disabled={completeMutation.isPending}
                className="bg-[#22C55E] hover:bg-[#16a34a] text-white cursor-pointer h-9 hidden sm:flex"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" /> Hoàn thành
              </Button>
            )}
          </div>
        </header>

        {/* Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-950 scrollbar-hide p-4 sm:p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Video Player Placeholder */}
            {lesson.type === 'VIDEO' && lesson.videoUrl && (
              <div className="w-full aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
                <video 
                  src={lesson.videoUrl} 
                  controls 
                  className="w-full h-full object-contain"
                  poster="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop"
                />
              </div>
            )}

            {/* Markdown Content (Rendered as simple HTML here for mock) */}
            <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary">
              <div dangerouslySetInnerHTML={{ __html: lesson.content.replace(/\n/g, '<br/>') }} />
            </div>
            
            {/* Mobile Complete Button */}
            {!lesson.isCompleted && (
              <div className="pt-8 pb-4 sm:hidden flex justify-center border-t border-slate-100 dark:border-slate-800">
                <Button 
                  onClick={() => completeMutation.mutate()}
                  disabled={completeMutation.isPending}
                  className="bg-[#22C55E] hover:bg-[#16a34a] text-white cursor-pointer w-full"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Đánh dấu hoàn thành
                </Button>
              </div>
            )}
          </div>
        </main>

        {/* Bottom Navigation */}
        <footer className="h-16 flex items-center justify-between px-4 sm:px-6 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-950">
          <Button 
            variant="outline" 
            disabled={!lesson.prevLessonId}
            onClick={() => navigate(`/courses/${courseId}/learn/${lesson.prevLessonId}`)}
            className="cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 mr-2" /> Bài trước
          </Button>
          
          <Button 
            variant="default"
            disabled={!lesson.nextLessonId}
            onClick={() => navigate(`/courses/${courseId}/learn/${lesson.nextLessonId}`)}
            className="bg-primary hover:bg-slate-800 text-white cursor-pointer"
          >
            Bài tiếp <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </footer>
      </div>
    </div>
  )
}

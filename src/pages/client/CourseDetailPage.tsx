'use client'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, BookOpen, Clock, PlayCircle, Lock, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { coursesApi } from '@/lib/api/courses'

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const courseId = Number(id)

  const { data: course, isLoading: isLoadingCourse } = useQuery({
    queryKey: ['course', courseId],
    queryFn: () => coursesApi.getCourseById(courseId),
    enabled: !!courseId,
  })

  const { data: enrollments = [] } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: coursesApi.getMyEnrollments,
  })

  const enrollment = enrollments.find(e => e.courseId === courseId)
  const isEnrolled = !!enrollment

  const enrollMutation = useMutation({
    mutationFn: (cId: number) => coursesApi.enrollCourse(cId),
    onSuccess: () => {
      toast.success('Đăng ký khoá học thành công!')
      queryClient.invalidateQueries({ queryKey: ['my-enrollments'] })
      queryClient.invalidateQueries({ queryKey: ['course', courseId] })
    },
    onError: () => {
      toast.error('Có lỗi xảy ra, vui lòng thử lại sau.')
    }
  })

  if (isLoadingCourse) {
    return (
      <div className="space-y-6">
        <div className="h-64 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-xl" />
        <div className="h-10 w-1/3 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
        <div className="space-y-2">
          <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
          <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 animate-pulse rounded" />
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Không tìm thấy khoá học</h2>
        <Button onClick={() => navigate('/courses')} className="mt-4 cursor-pointer">Quay lại danh sách</Button>
      </div>
    )
  }

  const orderedLessons = course.modules
    .slice()
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .flatMap(module => module.lessons.slice().sort((a, b) => a.orderIndex - b.orderIndex))
  const continueLessonId = orderedLessons.find(lesson => !lesson.isCompleted)?.id ?? orderedLessons[0]?.id

  return (
    <div className="space-y-8 pb-10">
      {/* Back button */}
      <Link to="/courses" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại Khoá học
      </Link>

      {/* Hero Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="h-48 md:h-64 relative bg-slate-100 dark:bg-slate-800">
          {course.thumbnailUrl ? (
            <img src={course.thumbnailUrl} alt={course.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-slate-300 dark:text-slate-700" />
            </div>
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6">
            <Badge className="bg-primary hover:bg-slate-800 text-white border-0 mb-3">
              {course.certificationName}
            </Badge>
            <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">{course.name}</h1>
            <p className="text-slate-200 text-sm md:text-base max-w-2xl">{course.description}</p>
          </div>
        </div>
        
        <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              <span className="font-medium">{Math.round(course.durationMinutes / 60)} giờ học</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <span className="font-medium">{course.totalLessons} bài học</span>
            </div>
          </div>
          
          <div>
            {isEnrolled ? (
              <div className="flex items-center gap-4 min-w-[200px]">
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Tiến độ của bạn</span>
                    <span className="font-bold text-primary">{enrollment.progressPercentage}%</span>
                  </div>
                  <Progress value={enrollment.progressPercentage} className="h-2" />
                </div>
                <Button
                  onClick={() => continueLessonId && navigate(`/courses/${courseId}/learn/${continueLessonId}`)}
                  disabled={!continueLessonId}
                  className="bg-primary hover:bg-slate-800 text-white cursor-pointer flex-shrink-0"
                >
                  Tiếp tục học
                </Button>
              </div>
            ) : (
              <Button 
                onClick={() => enrollMutation.mutate(course.id)}
                disabled={enrollMutation.isPending}
                className="bg-[#22C55E] hover:bg-[#16a34a] text-white cursor-pointer w-full md:w-auto px-8"
              >
                {enrollMutation.isPending ? 'Đang xử lý...' : 'Đăng ký học ngay'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Curriculum Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Nội dung khoá học</h2>
        
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800/50">
          {course.modules.sort((a, b) => a.orderIndex - b.orderIndex).map((module, idx) => (
            <div key={module.id} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold text-primary mb-1 uppercase tracking-wider">
                    Phần {idx + 1}
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">{module.title}</h3>
                  {module.description && (
                    <p className="text-sm text-slate-500 mt-1">{module.description}</p>
                  )}
                </div>
                <div className="text-sm text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg">
                  {module.lessonsCount} bài học
                </div>
              </div>
              
              <div className="mt-4 space-y-2 pl-4 border-l-2 border-slate-100 dark:border-slate-800">
                {module.lessons && module.lessons.length > 0 ? (
                  module.lessons.sort((a, b) => a.orderIndex - b.orderIndex).map((l, i) => (
                    <div key={l.id} className="group relative">
                      {isEnrolled ? (
                        <Link 
                          to={`/courses/${course.id}/learn/${l.id}`}
                          className="flex items-center justify-between py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg px-2 -ml-2 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            {l.isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0" />
                            ) : l.type === 'VIDEO' ? (
                              <PlayCircle className="w-4 h-4 text-slate-400 group-hover:text-primary shrink-0" />
                            ) : (
                              <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-primary shrink-0" />
                            )}
                            <span className={cn("text-sm font-medium truncate", l.isCompleted ? "text-slate-500" : "text-slate-700 dark:text-slate-300 group-hover:text-primary")}>
                              Bài {i + 1}: {l.title}
                            </span>
                          </div>
                          <span className="text-xs text-slate-400 shrink-0">{l.durationMinutes} phút</span>
                        </Link>
                      ) : (
                        <div className="flex items-center justify-between py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg px-2 -ml-2 transition-colors">
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            <PlayCircle className="w-4 h-4 text-slate-300 shrink-0" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                              Bài {i + 1}: {l.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-xs text-slate-400">{l.durationMinutes} phút</span>
                            <Lock className="w-3.5 h-3.5 text-slate-300" />
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-slate-400 italic py-2">
                    Chưa có bài học nào trong phần này.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

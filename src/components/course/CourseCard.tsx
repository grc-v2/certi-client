import { Link } from 'react-router-dom'
import { BookOpen, Users, Clock, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { type CourseResponse, type CourseEnrollmentResponse } from '@/lib/api/courses'

interface CourseCardProps {
  course: CourseResponse
  enrollment?: CourseEnrollmentResponse
}

export function CourseCard({ course, enrollment }: CourseCardProps) {
  const isEnrolled = !!enrollment
  
  return (
    <Link to={`/courses/${course.id}`} className="block h-full group">
      <Card className="flex flex-col h-full overflow-hidden border-slate-200 dark:border-slate-800 hover:border-primary/40 hover:shadow-lg transition-all duration-300 bg-white dark:bg-slate-900/80 group-hover:-translate-y-1">
        {/* Thumbnail Image */}
        <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          {course.thumbnailUrl ? (
            <img 
              src={course.thumbnailUrl} 
              alt={course.name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <BookOpen className="w-12 h-12" />
            </div>
          )}
          
          {isEnrolled && (
            <div className="absolute top-3 left-3">
              <Badge className="bg-[#22C55E]/90 hover:bg-[#22C55E] text-white border-0 shadow-sm backdrop-blur-sm">
                Đang học
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="flex-1 p-5">
          <div className="mb-2">
            <span className="text-xs font-medium text-primary dark:text-[#3B82F6]">
              {course.certificationName}
            </span>
          </div>
          
          <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {course.name}
          </h3>
          
          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
            {course.description}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-auto">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>{course.totalLessons} bài học</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>{Math.round(course.durationMinutes / 60)} giờ</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-0 border-t border-slate-100 dark:border-slate-800/50 mt-4 flex flex-col items-stretch gap-3">
          {isEnrolled ? (
            <div className="space-y-1.5 w-full pt-3">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">Tiến độ</span>
                <span className="font-bold text-primary">{enrollment.progressPercentage}%</span>
              </div>
              <Progress value={enrollment.progressPercentage} className="h-1.5" />
            </div>
          ) : (
            <div className="flex items-center justify-between w-full pt-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Users className="w-4 h-4" />
                <span>{course.enrolledCount} học viên</span>
              </div>
              <div className="flex items-center text-sm font-medium text-primary group-hover:translate-x-1 transition-transform">
                Chi tiết <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  )
}

'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, Search, Compass, BookMarked } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CourseCard } from '@/components/course/CourseCard'
import { coursesApi } from '@/lib/api/courses'

export default function CoursesPage() {
  const [search, setSearch] = useState('')

  const { data: enrollments = [], isLoading: isLoadingEnrollments } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: coursesApi.getMyEnrollments,
  })

  const { data: allCourses = [], isLoading: isLoadingCourses } = useQuery({
    queryKey: ['available-courses'],
    queryFn: () => coursesApi.getAvailableCourses(),
  })

  const filteredCourses = allCourses.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.certificationName.toLowerCase().includes(search.toLowerCase())
  )

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-96 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
      ))}
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-primary" /> Khoá học
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Khám phá các khoá học chất lượng cao và nâng cao kỹ năng của bạn
          </p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Tìm kiếm khoá học..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          />
        </div>
      </div>

      <Tabs defaultValue="my-courses" className="w-full">
        <TabsList className="bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl">
          <TabsTrigger value="my-courses" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 px-6 cursor-pointer">
            <BookMarked className="w-4 h-4 mr-2" /> Khoá học của tôi
          </TabsTrigger>
          <TabsTrigger value="explore" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 px-6 cursor-pointer">
            <Compass className="w-4 h-4 mr-2" /> Khám phá
          </TabsTrigger>
        </TabsList>

        <TabsContent value="my-courses" className="mt-6">
          {isLoadingEnrollments ? (
            <LoadingSkeleton />
          ) : enrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map(enrollment => (
                <CourseCard 
                  key={enrollment.id} 
                  course={enrollment.course} 
                  enrollment={enrollment} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Bạn chưa tham gia khoá học nào</h3>
              <p className="text-slate-500 mb-6">Hãy khám phá danh mục để tìm khoá học phù hợp với mục tiêu của bạn.</p>
              {/* Note: We will use a button that switches tab programmatically or just link to /certifications for now. In a real app we might switch tab. Let's just encourage them to use the other tab. */}
            </div>
          )}
        </TabsContent>

        <TabsContent value="explore" className="mt-6">
          {isLoadingCourses ? (
            <LoadingSkeleton />
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Search className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
              <p className="font-medium text-slate-900 dark:text-white">Không tìm thấy khoá học phù hợp</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

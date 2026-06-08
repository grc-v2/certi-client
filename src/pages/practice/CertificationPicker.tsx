'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, GraduationCap, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { certificationsApi, type CertificationResponse } from '@/lib/api/certifications'
import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400',
  INTERMEDIATE: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
  ADVANCED: 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400',
  EXPERT: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400',
}

export default function CertificationPicker({
  title,
  subtitle,
  onSelect,
}: {
  title: string
  subtitle?: string
  onSelect: (cert: CertificationResponse) => void
}) {
  const [keyword, setKeyword] = useState('')
  const debouncedKeyword = useDebounce(keyword, 300)

  const { data, isLoading } = useQuery({
    queryKey: ['practice', 'certifications', debouncedKeyword],
    queryFn: () => certificationsApi.search({ keyword: debouncedKeyword || undefined, page: 0, size: 20 }),
  })

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">{title}</h2>
        {subtitle && <p className="text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <Input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm theo tên chứng chỉ..."
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : !data?.content?.length ? (
        <div className="text-center py-12 text-sm text-slate-500">
          Không có chứng chỉ phù hợp.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.content.map((cert) => (
            <button
              key={cert.id}
              onClick={() => onSelect(cert)}
              className="text-left group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-xl"
            >
              <Card className="border-slate-200 dark:border-slate-700 hover:border-primary/50 hover:shadow-md transition-all duration-200 h-full">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Badge variant="secondary" className={cn('text-[10px] mb-1.5', LEVEL_COLORS[cert.level] ?? 'bg-slate-100 text-slate-600')}>
                      {cert.level}
                    </Badge>
                    <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {cert.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{cert.provider}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-primary self-center transition-colors" />
                </CardContent>
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

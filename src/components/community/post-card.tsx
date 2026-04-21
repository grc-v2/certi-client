'use client'
import { useState } from 'react'
import Link from 'next/link'
import { MessageSquare, Bookmark, BookmarkCheck, Tag, Star, Pin, User as UserIcon } from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { postsApi, type PostResponse } from '@/lib/api/posts'
import { formatRelativeTime, cn } from '@/lib/utils'
import { toast } from 'sonner'

const CONTENT_TYPE_COLORS: Record<string, string> = {
  ARTICLE: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
  QUESTION: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400',
  EXPERIENCE: 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400',
  TIP: 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400',
}

const CONTENT_TYPE_LABELS: Record<string, string> = {
  ARTICLE: 'Bài viết', QUESTION: 'Câu hỏi', EXPERIENCE: 'Kinh nghiệm', TIP: 'Mẹo hay'
}

export function PostCard({ post }: { post: PostResponse }) {
  const queryClient = useQueryClient()
  const [bookmarked, setBookmarked] = useState(false)

  const bookmarkMutation = useMutation({
    mutationFn: () => postsApi.bookmarkPost(post.id),
    onSuccess: () => {
      const next = !bookmarked
      setBookmarked(next)
      toast.success(next ? 'Đã lưu bài viết' : 'Đã bỏ lưu')
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] })
    },
    onError: () => toast.error('Không thể cập nhật bookmark'),
  })

  return (
    <Card className="border-slate-200 dark:border-slate-700 hover:border-[#0A66C2]/30 hover:shadow-sm transition-all duration-200">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarFallback className="text-xs bg-[#0A66C2]/10 text-[#0A66C2]"><UserIcon className="w-4 h-4" /></AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <Link href={`/profile/${post.authorId}`} className="text-sm font-medium text-slate-900 dark:text-white hover:text-[#0A66C2] cursor-pointer transition-colors truncate block">#{post.authorId}</Link>
              <p className="text-xs text-slate-400">{formatRelativeTime(post.publishedAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {post.pinned && <Pin className="w-3.5 h-3.5 text-orange-500" />}
            {post.featured && <Star className="w-3.5 h-3.5 text-yellow-500" />}
            {post.contentType && <Badge className={cn('text-xs', CONTENT_TYPE_COLORS[post.contentType] ?? 'bg-slate-100 text-slate-600')}>{CONTENT_TYPE_LABELS[post.contentType] ?? post.contentType}</Badge>}
          </div>
        </div>
        <Link href={`/community/${post.slug}`} className="block group cursor-pointer">
          <h2 className="font-semibold text-slate-900 dark:text-white group-hover:text-[#0A66C2] transition-colors line-clamp-2 leading-snug">{post.title}</h2>
          {post.excerpt && <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 line-clamp-2">{post.excerpt}</p>}
        </Link>
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {post.tags.slice(0, 4).map(tag => (
              <Link key={tag.id} href={`/tags/${tag.slug}`} className="cursor-pointer">
                <Badge variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-[#0A66C2]/10 hover:text-[#0A66C2] transition-colors cursor-pointer">
                  <Tag className="w-2.5 h-2.5 mr-1" />{tag.name}
                </Badge>
              </Link>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Link href={`/community/${post.slug}#comments`} className="flex items-center gap-1 text-xs text-slate-500 hover:text-[#0A66C2] cursor-pointer transition-colors">
            <MessageSquare className="w-3.5 h-3.5" />{post.commentsCount}
          </Link>
          <button onClick={(e) => { e.preventDefault(); bookmarkMutation.mutate() }} className={cn('p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors', bookmarked ? 'text-[#0A66C2]' : 'text-slate-400 hover:text-[#0A66C2]')} disabled={bookmarkMutation.isPending}>
            {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

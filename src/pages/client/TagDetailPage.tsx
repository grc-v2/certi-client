'use client'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { ArrowLeft, Tag, Hash, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { postsApi } from '@/lib/api/posts'
import { PostCard } from '@/components/blog/post-card'
import { cn } from '@/lib/utils'

export default function TagPage() {
  const { slug } = useParams<{ slug: string }>()

  const { data: tag, isLoading: tagLoading } = useQuery({
    queryKey: ['tag', slug],
    queryFn: () => postsApi.getTagBySlug(slug),
  })

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['tag-posts', slug],
    queryFn: ({ pageParam = 0 }) => postsApi.getPostsByTag(slug, pageParam, 15),
    initialPageParam: 0,
    getNextPageParam: (last, pages) => last.pageNumber < last.totalPages - 1 ? pages.length : undefined,
  })

  const posts = data?.pages.flatMap(p => p.content ?? []).filter(Boolean) ?? []

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 cursor-pointer transition-colors">
        <ArrowLeft className="w-4 h-4" />Cộng đồng
      </Link>

      {/* Tag header */}
      {tagLoading ? (
        <div className="h-20 bg-zinc-200 dark:bg-zinc-700 rounded-xl animate-pulse" />
      ) : tag ? (
        <Card className="border-zinc-200 dark:border-zinc-700">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Hash className="w-6 h-6 text-accent" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white">{tag.name}</h1>
              <p className="text-sm text-zinc-500 mt-0.5">{tag.postCount ?? 0} bài viết</p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Posts */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">Bài viết</h2>
        {isLoading ? (
          <div className="space-y-4">{Array(4).fill(0).map((_, i) => <div key={i} className="h-28 bg-zinc-200 dark:bg-zinc-700 rounded-xl animate-pulse" />)}</div>
        ) : posts.length > 0 ? (
          <>
            <div className="space-y-4">
              {posts.map(post => <PostCard key={post.id} post={post} />)}
            </div>
            {hasNextPage && (
              <div className="flex justify-center mt-4">
                <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="cursor-pointer">
                  {isFetchingNextPage
                    ? <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-zinc-300/50 border-t-zinc-400 rounded-full animate-spin" />Đang tải...</span>
                    : <span className="flex items-center gap-2"><ChevronDown className="w-4 h-4" />Xem thêm</span>
                  }
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-zinc-500">
            <Tag className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Chưa có bài viết nào với tag này</p>
          </div>
        )}
      </div>
    </div>
  )
}

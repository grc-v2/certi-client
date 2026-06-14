'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useBookmarkPost } from '@/hooks/queries/bookmarks'
import { useParams } from 'react-router-dom'
import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { dracula } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { Components } from 'react-markdown'
import {
  ArrowLeft, Bookmark, BookmarkCheck, MessageSquare, Tag, User as UserIcon,
  Send, Trash2, CornerDownRight, Clock, Eye, Heart, Copy, Check,
  Share2, ThumbsUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { postsApi, type CommentResponse } from '@/lib/api/posts'
import { useAuthStore } from '@/store/auth-store'
import { formatRelativeTime, cn } from '@/lib/utils'
import { toast } from 'sonner'

// ── Code block with copy button ───────────────────────────────────────────────

function CodeBlock({ language, children }: { language: string; children: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(children)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="relative group my-6 rounded-xl overflow-hidden border border-slate-300 dark:border-[#44475a] shadow-lg dark:shadow-black/40">
      {/* Dracula accent strip */}
      <div className="h-0.5 bg-gradient-to-r from-[#BD93F9] via-[#FF79C6] to-[#50FA7B]" />
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 dark:bg-[#21222c] border-b border-slate-300 dark:border-[#44475a]">
        <div className="flex items-center gap-2">
          <span className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400 dark:bg-red-500/80" />
            <span className="w-3 h-3 rounded-full bg-yellow-400 dark:bg-yellow-500/80" />
            <span className="w-3 h-3 rounded-full bg-green-400 dark:bg-green-500/80" />
          </span>
          {language && (
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono ml-2">{language}</span>
          )}
        </div>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Đã copy!' : 'Copy'}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || 'text'}
        style={dracula}
        customStyle={{
          margin: 0,
          borderRadius: 0,
          fontSize: '0.875rem',
          lineHeight: '1.7',
          background: '#282A36',
          padding: '1.25rem 1.5rem',
        }}
        showLineNumbers
        lineNumberStyle={{ color: '#6272A4', minWidth: '2.5em', paddingRight: '1em', userSelect: 'none', fontSize: '0.8rem' }}
        wrapLongLines
      >
        {children}
      </SyntaxHighlighter>
    </div>
  )
}

// ── Markdown components ───────────────────────────────────────────────────────

const mdComponents: Components = {
  code({ className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || '')
    const isInline = !match && !String(children).includes('\n')
    if (isInline) {
      return (
        <code className="text-primary bg-primary/10 dark:bg-primary/20 px-1.5 py-0.5 rounded text-[0.85em] font-mono before:content-none after:content-none" {...props}>
          {children}
        </code>
      )
    }
    return (
      <CodeBlock language={match ? match[1] : ''}>
        {String(children).replace(/\n$/, '')}
      </CodeBlock>
    )
  },
  pre({ children }) {
    return <>{children}</>
  },
  blockquote({ children }) {
    return (
      <blockquote className="border-l-4 border-primary bg-primary/5 dark:bg-primary/10 pl-4 pr-3 py-3 my-5 rounded-r-lg text-slate-600 dark:text-slate-400 not-italic">
        {children}
      </blockquote>
    )
  },
  table({ children }) {
    return (
      <div className="overflow-x-auto my-6 rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm">{children}</table>
      </div>
    )
  },
  th({ children }) {
    return <th className="px-4 py-2.5 text-left font-semibold bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">{children}</th>
  },
  td({ children }) {
    return <td className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800/50">{children}</td>
  },
}

// ── Reading progress bar ──────────────────────────────────────────────────────

function ReadingProgress() {
  const [progress, setProgress] = useState(0)
  useEffect(() => {
    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement
      const total = scrollHeight - clientHeight
      setProgress(total > 0 ? Math.min((scrollTop / total) * 100, 100) : 0)
    }
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
  return (
    <div className="fixed top-16 left-0 right-0 z-40 h-0.5 bg-slate-200/50 dark:bg-slate-800/50">
      <div
        className="h-full bg-primary transition-all duration-75"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

// ── Comment ───────────────────────────────────────────────────────────────────

function CommentItem({ comment, postId, depth = 0 }: { comment: CommentResponse; postId: number; depth?: number }) {
  const { user } = useAuthStore()
  const queryClient = useQueryClient()
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyText, setReplyText] = useState('')

  const replyMutation = useMutation({
    mutationFn: () => postsApi.addReply(postId, comment.id, { content: replyText }),
    onSuccess: () => {
      setReplyText(''); setReplyOpen(false)
      queryClient.invalidateQueries({ queryKey: ['comments', postId] })
      toast.success('Đã thêm trả lời')
    },
  })
  const deleteMutation = useMutation({
    mutationFn: () => postsApi.deleteComment(postId, comment.id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['comments', postId] }); toast.success('Đã xóa bình luận') },
  })

  return (
    <div className={cn('space-y-3', depth > 0 && 'ml-6 sm:ml-10 pl-4 border-l-2 border-slate-100 dark:border-slate-800')}>
      <div className="flex gap-3">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={comment.authorAvatar} />
          <AvatarFallback className="text-xs bg-primary/10 text-primary">
            {comment.authorName?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl px-4 py-3">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <Link to={`/profile/${comment.authorId}`} className="text-sm font-semibold text-slate-900 dark:text-white hover:text-primary cursor-pointer transition-colors">
                {comment.authorName}
              </Link>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400">{formatRelativeTime(comment.createdAt)}</span>
                {String(user?.id) === String(comment.authorId) && (
                  <button onClick={() => deleteMutation.mutate()} className="p-1 text-slate-400 hover:text-red-500 cursor-pointer transition-colors rounded">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
          </div>
          {depth === 0 && (
            <button onClick={() => setReplyOpen(!replyOpen)} className="flex items-center gap-1 mt-1.5 text-xs text-slate-400 hover:text-primary cursor-pointer transition-colors ml-2">
              <CornerDownRight className="w-3 h-3" />Trả lời
            </button>
          )}
          {replyOpen && (
            <div className="mt-2 ml-2 flex gap-2">
              <Textarea value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Viết trả lời..." rows={2} className="text-sm resize-none" />
              <Button size="sm" onClick={() => replyMutation.mutate()} disabled={!replyText.trim() || replyMutation.isPending} className="bg-primary hover:bg-slate-800 text-white cursor-pointer self-end">
                <Send className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>
      {comment.replies?.map(reply => (
        <CommentItem key={reply.id} comment={reply} postId={postId} depth={depth + 1} />
      ))}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const queryClient = useQueryClient()
  const [commentText, setCommentText] = useState('')
  const [bookmarked, setBookmarked] = useState(false)
  const [copied, setCopied] = useState(false)

  const { data: post, isLoading } = useQuery({
    queryKey: ['posts', slug],
    queryFn: () => postsApi.getBySlug(slug),
  })
  const { data: comments } = useQuery({
    queryKey: ['comments', post?.id],
    queryFn: () => postsApi.getComments(post!.id),
    enabled: !!post?.id,
  })

  const addCommentMutation = useMutation({
    mutationFn: () => postsApi.addComment(post!.id, { content: commentText }),
    onSuccess: () => {
      setCommentText('')
      queryClient.invalidateQueries({ queryKey: ['comments', post!.id] })
      toast.success('Đã thêm bình luận')
    },
    onError: () => toast.error('Không thể thêm bình luận'),
  })
  const bookmarkMutation = useBookmarkPost({
    onSuccess: () => {
      const next = !bookmarked
      setBookmarked(next)
      toast.success(next ? 'Đã lưu bài viết' : 'Đã bỏ lưu')
    },
    onError: () => toast.error('Không thể cập nhật bookmark'),
  })
  const handleBookmarkToggle = () => {
    if (bookmarkMutation.isPending) return
    bookmarkMutation.mutate(post!.id)
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast.success('Đã copy link bài viết')
    setTimeout(() => setCopied(false), 2000)
  }, [shareUrl])

  if (isLoading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-24" />
      <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
      <div className="mt-8 space-y-3">
        {[90, 75, 85, 95, 70, 88, 78, 92].map((w, i) => <div key={i} className="h-4 bg-slate-200 dark:bg-slate-700 rounded" style={{ width: `${w}%` }} />)}
      </div>
    </div>
  )

  if (!post) return (
    <div className="text-center py-20 text-slate-500">
      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
      <p className="font-medium">Không tìm thấy bài viết</p>
    </div>
  )

  // Always prefer ReactMarkdown (post.content) so custom CodeBlock / Dracula theme applies.
  // Only fall back to raw HTML if markdown content is absent.
  const markdownContent = post.content || ''
  const useMarkdown = !!post.content

  return (
    <>
      <ReadingProgress />

      <div className="space-y-3">
        {/* Back */}
        <Link to="/community" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary cursor-pointer transition-colors group">
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          Cộng đồng
        </Link>

        {/* Two-column layout on xl */}
        <div className="flex gap-8 items-start">

          {/* ── Main content ── */}
          <article className="flex-1 min-w-0 space-y-0">

            {/* Article card */}
            <Card className="border-slate-200 dark:border-slate-700/60 shadow-sm">
              <CardContent className="p-6 sm:p-10">

                {/* Header */}
                <header className="mb-8">
                  {/* Content type + tags row */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {post.contentType && (
                      <Badge className="text-xs bg-primary/10 text-primary border-0">
                        {post.contentType === 'ARTICLE' ? 'Bài viết' : post.contentType === 'QUESTION' ? 'Câu hỏi' : post.contentType === 'EXPERIENCE' ? 'Kinh nghiệm' : post.contentType}
                      </Badge>
                    )}
                    {post.difficultyLevel && (
                      <Badge variant="secondary" className="text-xs">
                        {post.difficultyLevel}
                      </Badge>
                    )}
                    {post.tags?.map(tag => (
                      <Link key={tag.id} to={`/tags/${tag.slug}`} className="cursor-pointer">
                        <Badge variant="outline" className="text-xs hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors cursor-pointer">
                          <Tag className="w-2.5 h-2.5 mr-1" />{tag.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>

                  {/* Title */}
                  <h1 className="text-2xl sm:text-[1.85rem] font-bold text-slate-900 dark:text-white leading-tight mb-2">
                    {post.title}
                  </h1>
                  {post.subtitle && (
                    <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
                      {post.subtitle}
                    </p>
                  )}

                  {/* Author + meta */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          <UserIcon className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Link to={`/profile/${post.authorId}`} className="text-sm font-semibold text-slate-900 dark:text-white hover:text-primary cursor-pointer transition-colors">
                          Tác giả #{post.authorId}
                        </Link>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />{formatRelativeTime(post.publishedAt)}
                          </span>
                          {post.readingTimeMinutes && (
                            <span>{post.readingTimeMinutes} phút đọc</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleShare}
                        title="Chia sẻ"
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={handleBookmarkToggle}
                        disabled={bookmarkMutation.isPending}
                        title={bookmarked ? 'Bỏ lưu' : 'Lưu bài viết'}
                        className={cn(
                          'p-2 rounded-lg cursor-pointer transition-colors',
                          bookmarked
                            ? 'text-primary bg-primary/10'
                            : 'text-slate-400 hover:text-primary hover:bg-primary/10'
                        )}
                      >
                        {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </header>

                {/* Body */}
                <div className="prose prose-slate dark:prose-invert max-w-none
                  prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-headings:scroll-mt-20
                  prose-h1:text-2xl prose-h2:text-xl prose-h2:border-b prose-h2:border-slate-200 dark:prose-h2:border-slate-700 prose-h2:pb-2
                  prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:leading-[1.85] prose-p:text-[0.97rem]
                  prose-li:text-slate-700 dark:prose-li:text-slate-300 prose-li:leading-[1.8]
                  prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-slate-900 dark:prose-strong:text-white
                  prose-code:text-primary prose-code:before:content-none prose-code:after:content-none
                  prose-pre:p-0 prose-pre:bg-transparent prose-pre:border-0 prose-pre:rounded-none prose-pre:shadow-none
                  prose-img:rounded-xl prose-img:shadow-md prose-img:mx-auto
                  prose-hr:border-slate-200 dark:prose-hr:border-slate-700">
                  {useMarkdown ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      components={mdComponents}
                    >
                      {markdownContent}
                    </ReactMarkdown>
                  ) : post.contentHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
                  ) : null}
                </div>

                {/* Footer stats */}
                <div className="flex items-center gap-5 mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5"><Eye className="w-4 h-4" />{post.viewsCount} lượt xem</span>
                  <span className="flex items-center gap-1.5"><Heart className="w-4 h-4" />{post.likesCount} lượt thích</span>
                  <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4" />{post.commentsCount} bình luận</span>
                </div>
              </CardContent>
            </Card>

            {/* Comments card */}
            <Card className="border-slate-200 dark:border-slate-700/60 shadow-sm mt-6">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-5" id="comments">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  {comments?.length ?? 0} bình luận
                </h2>

                {/* Add comment */}
                <div className="flex gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">U</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      placeholder="Chia sẻ suy nghĩ của bạn..."
                      rows={3}
                      className="resize-none text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={() => addCommentMutation.mutate()}
                      disabled={!commentText.trim() || addCommentMutation.isPending}
                      className="bg-primary hover:bg-slate-800 text-white cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5 mr-1.5" />
                      {addCommentMutation.isPending ? 'Đang gửi...' : 'Gửi bình luận'}
                    </Button>
                  </div>
                </div>

                {/* Comment list */}
                <div className="space-y-5">
                  {comments?.map(c => <CommentItem key={c.id} comment={c} postId={post.id} />)}
                  {!comments?.length && (
                    <div className="text-center py-8 text-slate-400">
                      <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </article>

          {/* ── Sticky sidebar (xl+) ── */}
          <aside className="hidden xl:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-4">

              {/* Stats card */}
              <Card className="border-slate-200 dark:border-slate-700/60 shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Thống kê</p>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-slate-500"><Eye className="w-3.5 h-3.5" />Lượt xem</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{post.viewsCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-slate-500"><ThumbsUp className="w-3.5 h-3.5" />Lượt thích</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{post.likesCount.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-slate-500"><MessageSquare className="w-3.5 h-3.5" />Bình luận</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{post.commentsCount}</span>
                    </div>
                    {post.readingTimeMinutes && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 text-slate-500"><Clock className="w-3.5 h-3.5" />Đọc</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{post.readingTimeMinutes} phút</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card className="border-slate-200 dark:border-slate-700/60 shadow-sm">
                <CardContent className="p-4 space-y-2">
                  <button
                    onClick={handleBookmarkToggle}
                    disabled={bookmarkMutation.isPending}
                    className={cn(
                      'w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium cursor-pointer transition-colors',
                      bookmarked
                        ? 'bg-primary text-white hover:bg-slate-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-primary/10 hover:text-primary'
                    )}
                  >
                    {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                    {bookmarked ? 'Đã lưu' : 'Lưu bài viết'}
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium cursor-pointer transition-colors bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                  >
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                    {copied ? 'Đã copy link!' : 'Chia sẻ'}
                  </button>
                  <Link to="#comments" className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium cursor-pointer transition-colors bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700">
                    <MessageSquare className="w-4 h-4" />
                    Xem bình luận
                  </Link>
                </CardContent>
              </Card>

              {/* Tags */}
              {post.tags?.length > 0 && (
                <Card className="border-slate-200 dark:border-slate-700/60 shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {post.tags.map(tag => (
                        <Link key={tag.id} to={`/tags/${tag.slug}`} className="cursor-pointer">
                          <Badge variant="secondary" className="text-xs hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer">
                            {tag.name}
                          </Badge>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </aside>

        </div>
      </div>
    </>
  )
}

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { DeletePostButton } from '@/components/delete-post-button'
import { ArrowLeft, CalendarDays, Eye, Pencil, User } from 'lucide-react'

export default async function PostDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    include: {
      author: { select: { id: true, name: true, email: true } },
    },
  })

  if (!post) notFound()

  // 조회수 증가
  await prisma.post.update({
    where: { id: params.id },
    data: { views: { increment: 1 } },
  })

  const isAuthor = session?.user?.id === post.author.id
  const authorName = post.author.name || post.author.email.split('@')[0]

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" asChild className="-ml-2">
        <Link href="/board" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          목록으로
        </Link>
      </Button>

      {/* Post */}
      <div className="bg-white rounded-xl border shadow-sm p-6 sm:p-8 space-y-6">
        {/* Title & Meta */}
        <div className="space-y-3">
          <h1 className="text-2xl font-bold leading-tight">{post.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span className="font-medium text-foreground">{authorName}</span>
              {isAuthor && <Badge variant="secondary" className="text-xs">나</Badge>}
            </div>
            <div className="flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4" />
              <span>{formatDate(post.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              <span>조회 {post.views + 1}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Content */}
        <div className="prose prose-sm max-w-none">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Author Actions */}
        {isAuthor && (
          <>
            <Separator />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/board/${post.id}/edit`} className="gap-2">
                  <Pencil className="w-4 h-4" />
                  수정
                </Link>
              </Button>
              <DeletePostButton postId={post.id} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

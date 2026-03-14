import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Eye, MessageSquarePlus, PenLine, User } from 'lucide-react'

export default async function BoardPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const session = await getServerSession(authOptions)
  const page = parseInt(searchParams.page || '1')
  const limit = 10
  const skip = (page - 1) * limit

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.post.count(),
  ])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">게시판</h1>
          <p className="text-muted-foreground mt-1">총 {total}개의 게시글</p>
        </div>
        <Button asChild>
          <Link href="/board/new" className="gap-2">
            <PenLine className="w-4 h-4" />
            글쓰기
          </Link>
        </Button>
      </div>

      {/* Post List */}
      {posts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquarePlus className="w-12 h-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground font-medium">아직 게시글이 없습니다.</p>
            <p className="text-sm text-muted-foreground mt-1">첫 번째 글을 작성해보세요!</p>
            <Button asChild className="mt-4" variant="outline">
              <Link href="/board/new">글쓰기</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="hidden sm:grid grid-cols-[1fr_120px_100px_80px] gap-4 px-6 py-3 bg-slate-50 border-b text-sm font-medium text-muted-foreground">
            <span>제목</span>
            <span>작성자</span>
            <span>작성일</span>
            <span className="text-right">조회</span>
          </div>

          {/* Posts */}
          <ul className="divide-y">
            {posts.map((post) => {
              const authorName = post.author.name || post.author.email.split('@')[0]
              const isMyPost = session?.user?.id === post.author.id
              return (
                <li key={post.id}>
                  <Link
                    href={`/board/${post.id}`}
                    className="grid sm:grid-cols-[1fr_120px_100px_80px] gap-2 sm:gap-4 px-6 py-4 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                        {post.title}
                      </span>
                      {isMyPost && (
                        <Badge variant="secondary" className="text-xs shrink-0">내 글</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <User className="w-3 h-3 shrink-0" />
                      <span className="truncate">{authorName}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(post.createdAt)}
                    </div>
                    <div className="flex items-center justify-end gap-1 text-sm text-muted-foreground">
                      <Eye className="w-3 h-3" />
                      <span>{post.views}</span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === page ? 'default' : 'outline'}
              size="sm"
              asChild
            >
              <Link href={`/board?page=${p}`}>{p}</Link>
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}

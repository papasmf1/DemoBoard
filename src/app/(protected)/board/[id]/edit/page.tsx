import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound, redirect } from 'next/navigation'
import { PostForm } from '@/components/post-form'

export default async function EditPostPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession(authOptions)

  const post = await prisma.post.findUnique({
    where: { id: params.id },
    select: { id: true, title: true, content: true, authorId: true },
  })

  if (!post) notFound()
  if (post.authorId !== session?.user?.id) redirect('/board')

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">게시글 수정</h1>
        <p className="text-muted-foreground mt-1">게시글을 수정하세요.</p>
      </div>
      <PostForm
        postId={post.id}
        initialTitle={post.title}
        initialContent={post.content}
      />
    </div>
  )
}

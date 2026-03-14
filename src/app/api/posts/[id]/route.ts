import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    })

    if (!post) {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 })
    }

    await prisma.post.update({
      where: { id: params.id },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json({ post })
  } catch (error) {
    console.error('Get post error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const post = await prisma.post.findUnique({ where: { id: params.id } })
    if (!post) {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 })
    }
    if (post.authorId !== session.user.id) {
      return NextResponse.json({ error: '수정 권한이 없습니다.' }, { status: 403 })
    }

    const { title, content } = await request.json()
    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: '제목과 내용을 입력해주세요.' }, { status: 400 })
    }

    const updated = await prisma.post.update({
      where: { id: params.id },
      data: { title: title.trim(), content: content.trim() },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({ post: updated })
  } catch (error) {
    console.error('Update post error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const post = await prisma.post.findUnique({ where: { id: params.id } })
    if (!post) {
      return NextResponse.json({ error: '게시글을 찾을 수 없습니다.' }, { status: 404 })
    }
    if (post.authorId !== session.user.id) {
      return NextResponse.json({ error: '삭제 권한이 없습니다.' }, { status: 403 })
    }

    await prisma.post.delete({ where: { id: params.id } })
    return NextResponse.json({ message: '게시글이 삭제되었습니다.' })
  } catch (error) {
    console.error('Delete post error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

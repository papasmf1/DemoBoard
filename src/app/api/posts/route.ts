import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
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

    return NextResponse.json({ posts, total, page, totalPages: Math.ceil(total / limit) })
  } catch (error) {
    console.error('Get posts error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const { title, content } = await request.json()

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ error: '제목과 내용을 입력해주세요.' }, { status: 400 })
    }

    if (title.trim().length > 100) {
      return NextResponse.json({ error: '제목은 100자 이내로 입력해주세요.' }, { status: 400 })
    }

    const post = await prisma.post.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        authorId: session.user.id,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({ post }, { status: 201 })
  } catch (error) {
    console.error('Create post error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

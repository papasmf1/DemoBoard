import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    const { name } = await request.json()

    if (name !== undefined && typeof name !== 'string') {
      return NextResponse.json({ error: '올바르지 않은 입력입니다.' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { name: name?.trim() || null },
      select: { id: true, name: true, email: true },
    })

    return NextResponse.json({ message: '프로필이 업데이트되었습니다.', user: updatedUser })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}

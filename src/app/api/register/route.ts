import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: '이메일과 비밀번호는 필수입니다.' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: '올바른 이메일 형식이 아닙니다.' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: '비밀번호는 최소 8자 이상이어야 합니다.' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 사용 중인 이메일입니다.' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name: name?.trim() || null,
        email: email.trim().toLowerCase(),
        password: hashedPassword,
      },
    })

    return NextResponse.json(
      { message: '회원가입이 완료되었습니다.', userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Registration error:', message)
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

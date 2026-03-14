import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { formatDate, getInitials } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  CalendarDays,
  Mail,
  Shield,
  User,
} from 'lucide-react'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, createdAt: true },
  })

  if (!user) redirect('/login')

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return '좋은 아침이에요'
    if (hour < 17) return '좋은 오후에요'
    return '좋은 저녁이에요'
  }

  const stats = [
    {
      title: '가입일',
      value: formatDate(user.createdAt),
      icon: CalendarDays,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: '이메일',
      value: user.email,
      icon: Mail,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      title: '계정 상태',
      value: '활성',
      icon: Shield,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: '프로필',
      value: user.name || '이름 미설정',
      icon: User,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-sm border">
        <Avatar className="w-16 h-16 text-lg">
          <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xl">
            {getInitials(user.name, user.email)}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-foreground">
              {greeting()}, {user.name || user.email.split('@')[0]}님!
            </h1>
            <Badge variant="secondary" className="text-xs">
              로그인됨
            </Badge>
          </div>
          <p className="text-muted-foreground">
            대시보드에 오신 것을 환영합니다.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-foreground">계정 정보</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title} className="border shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <Icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-semibold truncate" title={stat.value}>
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Activity / Info Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">빠른 안내</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />
              <div>
                <p className="text-sm font-medium">프로필 설정</p>
                <p className="text-xs text-muted-foreground">
                  프로필 페이지에서 이름을 변경하거나 비밀번호를 수정할 수 있습니다.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-2 shrink-0" />
              <div>
                <p className="text-sm font-medium">보안 유지</p>
                <p className="text-xs text-muted-foreground">
                  강력한 비밀번호를 사용하고 주기적으로 변경하세요.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 shrink-0" />
              <div>
                <p className="text-sm font-medium">로그아웃</p>
                <p className="text-xs text-muted-foreground">
                  사용 후에는 우측 상단 메뉴에서 로그아웃하세요.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">계정 세부 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-dashed">
                <dt className="text-sm text-muted-foreground">사용자 ID</dt>
                <dd className="text-sm font-mono text-xs text-muted-foreground truncate max-w-[150px]">
                  {user.id}
                </dd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dashed">
                <dt className="text-sm text-muted-foreground">이름</dt>
                <dd className="text-sm font-medium">{user.name || '—'}</dd>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-dashed">
                <dt className="text-sm text-muted-foreground">이메일</dt>
                <dd className="text-sm font-medium truncate max-w-[180px]">{user.email}</dd>
              </div>
              <div className="flex justify-between items-center py-2">
                <dt className="text-sm text-muted-foreground">가입일</dt>
                <dd className="text-sm font-medium">{formatDate(user.createdAt)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

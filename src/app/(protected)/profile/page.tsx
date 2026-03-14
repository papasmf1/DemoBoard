import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { formatDate, getInitials } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ProfileNameForm } from '@/components/profile-name-form'
import { ProfilePasswordForm } from '@/components/profile-password-form'
import { CalendarDays, Mail, Shield } from 'lucide-react'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, createdAt: true, updatedAt: true },
  })

  if (!user) redirect('/login')

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">프로필</h1>
        <p className="text-muted-foreground mt-1">계정 정보를 확인하고 수정하세요.</p>
      </div>

      {/* Avatar & Basic Info */}
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <div className="flex items-center gap-5">
          <Avatar className="w-20 h-20">
            <AvatarFallback className="bg-primary text-primary-foreground font-bold text-2xl">
              {getInitials(user.name, user.email)}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold">
                {user.name || '이름 미설정'}
              </h2>
              <Badge variant="secondary">활성</Badge>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <Mail className="w-3.5 h-3.5" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>가입일: {formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Name */}
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-primary" />
          <h3 className="text-base font-semibold">기본 정보 수정</h3>
        </div>
        <Separator className="mb-5" />
        <ProfileNameForm
          userId={user.id}
          initialName={user.name ?? ''}
          email={user.email}
        />
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-orange-500" />
          <h3 className="text-base font-semibold">비밀번호 변경</h3>
        </div>
        <Separator className="mb-5" />
        <ProfilePasswordForm userId={user.id} />
      </div>
    </div>
  )
}

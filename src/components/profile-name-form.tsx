'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ProfileNameFormProps {
  userId: string
  initialName: string
  email: string
}

export function ProfileNameForm({ initialName, email }: ProfileNameFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState(initialName)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '업데이트 중 오류가 발생했습니다.')
      } else {
        setSuccess('프로필이 성공적으로 업데이트되었습니다.')
        router.refresh()
      }
    } catch {
      setError('서버 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-700 text-sm">
          {success}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">이름</Label>
        <Input
          id="name"
          type="text"
          placeholder="홍길동"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">이메일</Label>
        <Input
          id="email"
          type="email"
          value={email}
          disabled
          className="bg-muted cursor-not-allowed"
        />
        <p className="text-xs text-muted-foreground">이메일은 변경할 수 없습니다.</p>
      </div>

      <Button type="submit" disabled={isLoading} className="gap-2">
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            저장 중...
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            변경사항 저장
          </>
        )}
      </Button>
    </form>
  )
}

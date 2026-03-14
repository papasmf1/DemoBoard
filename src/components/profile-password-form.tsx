'use client'

import { useState } from 'react'
import { Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ProfilePasswordFormProps {
  userId: string
}

export function ProfilePasswordForm(_: ProfilePasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    if (formData.newPassword !== formData.confirmPassword) {
      setError('새 비밀번호가 일치하지 않습니다.')
      setIsLoading(false)
      return
    }

    if (formData.newPassword.length < 8) {
      setError('새 비밀번호는 최소 8자 이상이어야 합니다.')
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch('/api/profile/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '비밀번호 변경 중 오류가 발생했습니다.')
      } else {
        setSuccess('비밀번호가 성공적으로 변경되었습니다.')
        setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      }
    } catch {
      setError('서버 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const PasswordInput = ({
    id,
    label,
    value,
    show,
    onToggle,
    onChange,
    placeholder,
  }: {
    id: string
    label: string
    value: string
    show: boolean
    onToggle: () => void
    onChange: (v: string) => void
    placeholder: string
  }) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isLoading}
          className="pr-10"
          required
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )

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

      <PasswordInput
        id="currentPassword"
        label="현재 비밀번호"
        value={formData.currentPassword}
        show={showCurrent}
        onToggle={() => setShowCurrent(!showCurrent)}
        onChange={(v) => setFormData({ ...formData, currentPassword: v })}
        placeholder="현재 비밀번호를 입력하세요"
      />

      <PasswordInput
        id="newPassword"
        label="새 비밀번호 (최소 8자)"
        value={formData.newPassword}
        show={showNew}
        onToggle={() => setShowNew(!showNew)}
        onChange={(v) => setFormData({ ...formData, newPassword: v })}
        placeholder="새 비밀번호를 입력하세요"
      />

      <PasswordInput
        id="confirmPassword"
        label="새 비밀번호 확인"
        value={formData.confirmPassword}
        show={showConfirm}
        onToggle={() => setShowConfirm(!showConfirm)}
        onChange={(v) => setFormData({ ...formData, confirmPassword: v })}
        placeholder="새 비밀번호를 다시 입력하세요"
      />

      {formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
        <p className="text-xs text-destructive">비밀번호가 일치하지 않습니다.</p>
      )}

      <Button type="submit" disabled={isLoading} variant="outline" className="gap-2">
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            변경 중...
          </>
        ) : (
          <>
            <KeyRound className="w-4 h-4" />
            비밀번호 변경
          </>
        )}
      </Button>
    </form>
  )
}

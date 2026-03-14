'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Send, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

interface PostFormProps {
  postId?: string
  initialTitle?: string
  initialContent?: string
}

export function PostForm({ postId, initialTitle = '', initialContent = '' }: PostFormProps) {
  const router = useRouter()
  const isEdit = !!postId
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState(initialContent)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (!title.trim() || !content.trim()) {
      setError('제목과 내용을 입력해주세요.')
      setIsLoading(false)
      return
    }

    try {
      const url = isEdit ? `/api/posts/${postId}` : '/api/posts'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '오류가 발생했습니다.')
      } else {
        const postId = data.post?.id
        router.push(postId ? `/board/${postId}` : '/board')
        router.refresh()
      }
    } catch {
      setError('서버 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border shadow-sm">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              type="text"
              placeholder="제목을 입력하세요 (최대 100자)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground text-right">{title.length}/100</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">내용 *</Label>
            <textarea
              id="content"
              placeholder="내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              disabled={isLoading}
              rows={12}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y min-h-[200px]"
            />
            <p className="text-xs text-muted-foreground text-right">{content.length}자</p>
          </div>

          <div className="flex justify-between pt-2">
            <Button type="button" variant="ghost" asChild>
              <Link href={isEdit ? `/board/${postId}` : '/board'} className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                취소
              </Link>
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isEdit ? '저장 중...' : '등록 중...'}
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {isEdit ? '수정 완료' : '게시글 등록'}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

import { PostForm } from '@/components/post-form'

export default function NewPostPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">글쓰기</h1>
        <p className="text-muted-foreground mt-1">새 게시글을 작성하세요.</p>
      </div>
      <PostForm />
    </div>
  )
}

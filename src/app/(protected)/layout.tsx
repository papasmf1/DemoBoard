import { Navbar } from '@/components/navbar'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {children}
      </main>
    </div>
  )
}

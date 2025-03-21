import { notFound } from "next/navigation"
import { getSharedLove } from "#/app/actions"
import { Header } from "#/components/Header"
import { ScoreCard } from "#/components/ScoreCard"

interface SharePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params
  if (!id) {
    return notFound()
  }

  const love = await getSharedLove(id)

  if (!love || !love.sharePath) {
    return notFound()
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-375px space-y-4">
        <Header />
        <ScoreCard love={love} />
      </div>
    </main>
  )
}

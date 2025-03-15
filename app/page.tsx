import { Header } from "#/components/Header"
import { ScoreCard } from "#/components/ScoreCard"

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between p-24">
      {/* <div className="fixed inset-0 bg-yellow-700/30 grayscale" /> */}
      <div className="w-375px space-y-4">
        <Header />
        <ScoreCard />
      </div>
    </main>
  )
}

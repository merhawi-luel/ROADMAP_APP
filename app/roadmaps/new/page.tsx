import Header from '@/components/Header'
import NewRoadmapForm from '@/components/NewRoadmapForm'

export default function NewRoadmapPage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100">
      <Header />
      <main className="mx-auto max-w-4xl px-6 py-10 sm:px-8">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">Create roadmap</p>
          <h1 className="mt-4 text-3xl font-semibold text-zinc-50 sm:text-4xl">New roadmap</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300">
            Add a new roadmap to organize your learning resources and track progress.
          </p>
        </div>
        <NewRoadmapForm />
      </main>
    </div>
  )
}

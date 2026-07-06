import Header from '@/components/Header'
import NewRoadmapForm from '@/components/NewRoadmapForm'

export default function NewRoadmapPage() {
  return (
    <div className="min-h-screen bg-[#0a0c11] text-[#eef0f5]">
      <Header />
      <main className="mx-auto max-w-[1200px] px-6 py-12 sm:px-8">
        <div className="mb-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#5e6577]">Create roadmap</p>
          <h1 className="mt-3 text-3xl font-semibold text-[#eef0f5] sm:text-4xl">New roadmap</h1>
          <p className="mt-2 text-sm leading-6 text-[#b0b8cc]">
            Organize your learning resources into a structured roadmap with progress tracking.
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Form */}
          <NewRoadmapForm />

          {/* Tips panel */}
          <aside className="space-y-4">
            <div className="rounded-[12px] border border-[#1b1f29] bg-[#12151c] p-6">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.1em] text-[#5e6577]">Tips for a great roadmap</p>
              <ul className="space-y-3 text-sm text-[#b0b8cc]">
                <li className="flex gap-2"><span className="text-[#8177f2]">•</span> Give it a specific goal — e.g. "Learn TypeScript in 4 weeks"</li>
                <li className="flex gap-2"><span className="text-[#8177f2]">•</span> Add video links for topics you want to watch</li>
                <li className="flex gap-2"><span className="text-[#8177f2]">•</span> Mix videos, articles, and hands-on tasks</li>
                <li className="flex gap-2"><span className="text-[#8177f2]">•</span> Check items off as you go to track progress</li>
                <li className="flex gap-2"><span className="text-[#8177f2]">•</span> Use the planner to schedule your study sessions</li>
              </ul>
            </div>
            <div className="rounded-[12px] border border-[#1b1f29] bg-[#12151c] p-6">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#5e6577]">Item types</p>
              <div className="space-y-2 text-sm text-[#b0b8cc]">
                <div className="flex items-center gap-2"><span className="rounded-full bg-red-500/20 px-2 py-0.5 text-[11px] text-red-400">video</span> YouTube videos with embedded player</div>
                <div className="flex items-center gap-2"><span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[11px] text-blue-400">link</span> Articles, docs, or any URL</div>
                <div className="flex items-center gap-2"><span className="rounded-full bg-green-500/20 px-2 py-0.5 text-[11px] text-green-400">task</span> Hands-on exercises to complete</div>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getRoadmapById } from '@/lib/db/roadmaps'
import { getProgressSnapshotsByRoadmapId } from '@/lib/db/progress'
import { generateProgressAnalysis } from '@/lib/ai/progress'
import Header from '@/components/Header'
import ChecklistItemForm from '@/components/ChecklistItemForm'
import ChecklistSection from '@/components/ChecklistSection'
import ProgressAnalysisCard from '@/components/ProgressAnalysisCard'
import ProgressChartPanel from '@/components/ProgressChartPanel'
import CircularProgress from '@/components/CircularProgress'

interface RoadmapPageProps {
  params: Promise<{ id: string }>
}

export default async function RoadmapDetailPage({ params }: RoadmapPageProps) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const { id } = await params
  const roadmap = await getRoadmapById(id)

  if (!roadmap || roadmap.userId !== session.user.id) {
    redirect('/roadmaps')
  }

  const snapshots = await getProgressSnapshotsByRoadmapId(roadmap.id)
  const analysis = await generateProgressAnalysis(roadmap.title, snapshots)

  return (
    <div className="min-h-screen bg-[#0a0c11] text-[#eef0f5]">
      <Header />
      <main className="mx-auto max-w-[1180px] px-[32px] py-[40px]">
        <div className="space-y-8">
          <div className="relative overflow-hidden rounded-[12px] border border-[#1b1f29] bg-[#12151c] p-8 shadow-sm shadow-black/40 sm:p-9">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,_rgba(42,38,96,0.7)_0%,_transparent_70%)] opacity-70" />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#5e6577]">Roadmap details</p>
                <h1 className="mt-3 text-3xl font-semibold text-[#eef0f5]" style={{ fontFamily: 'var(--font-display)' }}>
                  {roadmap.title}
                </h1>
              </div>
              <div className="rounded-[20px] border border-[#252a35] bg-[#181c25] px-4 py-2 text-[13px] text-[#98a0b3]">
                Created at {new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(roadmap.createdAt))}
              </div>
            </div>

            <div className="mt-8 space-y-4 text-[#98a0b3]">
              <p>{roadmap.description}</p>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.64fr)_minmax(0,0.36fr)]">
            <ProgressChartPanel
              title="Roadmap progress"
              subtitle="Progress over time"
              points={snapshots.map((s) => ({ createdAt: new Date(s.createdAt), percentage: s.percentage }))}
              trendLine={analysis.trendLine}
            />

            <ProgressAnalysisCard title="What the progress trend suggests" analysis={analysis.summary} equation={analysis.trendLine.equation} />
          </div>

          <div className="rounded-[12px] border border-[#1b1f29] bg-[#12151c] p-8 shadow-sm shadow-black/40">
            <div className="eyebrow">
              <span className="bar"></span>Notes
            </div>
            <h2 className="card-title" style={{ marginBottom: '4px' }}>
              How this works
            </h2>
            <p className="mt-4 text-[14px] leading-6 text-[#98a0b3]">
              Add checklist items below and mark them complete as you learn. The progress bar and chart update automatically.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.62fr)_minmax(0,0.38fr)]">
            <div className="rounded-[12px] border border-[#1b1f29] bg-[#12151c] p-6 shadow-sm shadow-black/40">
              <div className="mb-6">
                <div className="eyebrow">
                  <span className="bar"></span>Checklist
                </div>
                <h2 className="card-title" style={{ marginBottom: '4px' }}>
                  Add a learning item
                </h2>
              </div>
              <ChecklistItemForm roadmapId={roadmap.id} />
            </div>

            <div className="rounded-[12px] border border-[#1b1f29] bg-[#12151c] p-8 shadow-sm shadow-black/40">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-[#98a0b3]">Progress</p>
                  <h2 className="card-title">Roadmap completion</h2>
                </div>
                <span className="rounded-full bg-zinc-900 px-3 py-1 text-sm text-zinc-300">
                  {snapshots.at(-1)?.completedItems ?? 0}/{snapshots.at(-1)?.totalItems ?? 0} complete
                </span>
              </div>
              <div className="mt-6">
                <CircularProgress
                  percentage={snapshots.at(-1)?.percentage ?? 0}
                  completedItems={snapshots.at(-1)?.completedItems ?? 0}
                  totalItems={snapshots.at(-1)?.totalItems ?? 0}
                />
              </div>
            </div>
          </div>

          <ChecklistSection roadmapId={roadmap.id} />
        </div>
      </main>
    </div>
  )
}

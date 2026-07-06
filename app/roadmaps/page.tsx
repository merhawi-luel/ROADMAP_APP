import { getServerSession } from 'next-auth/next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { getRoadmapsByUserId } from '@/lib/db/roadmaps'
import { getWorkspaceProgressSnapshots } from '@/lib/db/progress'
import { generateProgressAnalysis } from '@/lib/ai/progress'
import Header from '@/components/Header'
import RoadmapCard from '@/components/RoadmapCard'
import ProgressChartPanel from '@/components/ProgressChartPanel'
import ProgressAnalysisCard from '@/components/ProgressAnalysisCard'

export default async function RoadmapsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const roadmaps = await getRoadmapsByUserId(session.user.id)
  const workspaceSnapshots = await getWorkspaceProgressSnapshots(session.user.id)
  const workspaceAnalysis = await generateProgressAnalysis('Workspace progress', workspaceSnapshots)

  return (
    <div className="min-h-screen bg-[#0a0c11] text-[#eef0f5]">
      <Header />
      <main className="mx-auto max-w-6xl px-6 py-10 sm:px-8">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[#8a92a6]">Your workspace</p>
            <h1 className="mt-4 text-3xl font-semibold text-[#eef0f5] sm:text-[2.25rem]" style={{ fontFamily: 'var(--font-display)' }}>
              Your roadmaps
            </h1>
          </div>
          <Link
            href="/roadmaps/new"
            className="inline-flex items-center justify-center rounded-[9px] bg-[#8177f2] px-5 py-3 text-[14px] font-semibold text-[#0a0c11] transition hover:brightness-110"
          >
            Create roadmap
          </Link>
        </div>

        <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)]">
          <ProgressChartPanel
            title="Workspace progress"
            subtitle="General progress over time"
            points={workspaceSnapshots.map((snapshot) => ({
              createdAt: snapshot.createdAt,
              percentage: snapshot.percentage,
              label: snapshot.roadmap.title,
            }))}
            trendLine={workspaceAnalysis.trendLine}
          />
          <ProgressAnalysisCard title="Workspace AI analysis" analysis={workspaceAnalysis.summary} equation={workspaceAnalysis.trendLine.equation} />
        </div>

        {roadmaps.length === 0 ? (
          <div className="rounded-[12px] border border-dashed border-[#252a35] bg-[#12151c] p-10 text-center text-[#98a0b3] shadow-sm shadow-black/40">
            <p className="text-lg font-medium text-[#eef0f5]" style={{ fontFamily: 'var(--font-display)' }}>
              No roadmaps yet
            </p>
            <p className="mt-2 text-sm">Start by creating your first learning roadmap.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {roadmaps.map((roadmap) => (
              <RoadmapCard key={roadmap.id} roadmap={roadmap} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

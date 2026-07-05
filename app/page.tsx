import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session?.user?.id) {
    redirect('/roadmaps')
  }

  return (
    <div className="min-h-screen bg-[#0a0c11] text-[#eef0f5]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16 sm:px-8">
        <div className="relative grid gap-12 overflow-hidden rounded-[1rem] border border-[#1b1f29] bg-[#12151c] p-8 shadow-xl shadow-black/40 sm:grid-cols-[1.1fr_0.9fr] sm:p-9">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,_rgba(42,38,96,0.7)_0%,_transparent_70%)] opacity-70" />
          <section className="space-y-8">
            <div className="space-y-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#5e6577]">RoadmapApp</p>
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-[#eef0f5] sm:text-[3.05rem] sm:leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Build, track, and complete your learning roadmaps.
              </h1>
              <p className="max-w-2xl text-[15px] leading-7 text-[#98a0b3] sm:text-[16px]">
                Organize videos, links, and tasks into structured roadmaps with progress tracking and checklist management.
                Sign in to start building your learning journey.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/roadmaps"
                className="inline-flex items-center justify-center rounded-[9px] bg-[#8177f2] px-6 py-3 text-[14px] font-semibold text-[#0a0c11] transition hover:brightness-110"
              >
                Go to dashboard
              </Link>
              <Link
                href="/auth/signin"
                className="inline-flex items-center justify-center rounded-[9px] border border-[#252a35] bg-transparent px-6 py-3 text-[14px] font-semibold text-[#eef0f5] transition hover:border-[#8177f2] hover:text-white"
              >
                Sign in with Google
              </Link>
            </div>
          </section>

          <div className="rounded-[12px] border border-[#1b1f29] bg-[#181c25] p-8 text-white sm:p-10">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[#5e6577]">What you can do</p>
            <ul className="mt-8 space-y-5 text-[14px] leading-7 text-[#98a0b3]">
              <li>• Create and manage personalized learning roadmaps</li>
              <li>• Add videos, links, and task items to each roadmap</li>
              <li>• Track progress with a visual completion bar</li>
              <li>• Secure Google authentication and user-specific storage</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

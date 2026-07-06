import Link from 'next/link'
import Header from '@/components/Header'

const FEATURES = [
  {
    icon: '🗺️',
    title: 'Learning Roadmaps',
    description: 'Create structured roadmaps with videos, links, and tasks. Organize your learning path step by step.',
  },
  {
    icon: '✅',
    title: 'Checklist System',
    description: 'Mark items complete as you learn. Watch your progress bar fill up in real time.',
  },
  {
    icon: '📊',
    title: 'Progress Analytics',
    description: 'Visual charts show your progress over time with AI-powered trend analysis.',
  },
  {
    icon: '🤖',
    title: 'AI Learning Assistant',
    description: 'Ask questions while you study. Powered by Groq — fast, smart, always available.',
  },
  {
    icon: '📅',
    title: 'Weekly Planner',
    description: 'Schedule your study sessions with exact time slots and link them to roadmap tasks.',
  },
  {
    icon: '🔗',
    title: 'Social Links Hub',
    description: 'Store all your coding profiles (GitHub, LeetCode, LinkedIn, and more) and copy any link instantly.',
  },
]

const STACK = [
  { name: 'Next.js 14', role: 'App framework (App Router)' },
  { name: 'TypeScript', role: 'Type-safe development' },
  { name: 'Tailwind CSS', role: 'Styling' },
  { name: 'Prisma ORM', role: 'Database access layer' },
  { name: 'PostgreSQL', role: 'Database (hosted on Neon)' },
  { name: 'NextAuth.js', role: 'Google OAuth authentication' },
  { name: 'Groq AI', role: 'AI chatbot (Llama 3.1)' },
  { name: 'Vercel', role: 'Deployment platform' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0a0c11] text-[#eef0f5]">
      <Header />

      <main className="mx-auto max-w-[1200px] px-6 py-16 sm:px-8">

        {/* Hero section */}
        <div className="relative overflow-hidden rounded-[16px] border border-[#1b1f29] bg-[#12151c] p-10 sm:p-12 mb-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,_rgba(129,119,242,0.15)_0%,_transparent_70%)]" />
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#8a92a6]">About</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[#eef0f5] sm:text-5xl" style={{ fontFamily: 'var(--font-display)' }}>
            RoadmapApp
          </h1>
          <p className="mt-4 max-w-2xl text-[16px] leading-8 text-[#b0b8cc]">
            A full-stack learning management platform built to help you organize your learning journey,
            track your progress over time, and stay focused with AI-powered assistance.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/roadmaps"
              className="inline-flex items-center justify-center rounded-[9px] bg-[#8177f2] px-6 py-3 text-[14px] font-semibold text-white transition hover:brightness-110"
            >
              Get started
            </Link>
            <a
              href="https://github.com/merhawi-luel/ROADMAP_APP"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-[9px] border border-[#252a35] px-6 py-3 text-[14px] font-semibold text-[#eef0f5] transition hover:border-[#8177f2]"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              View on GitHub
            </a>
          </div>
        </div>

        {/* Features grid */}
        <div className="mb-10">
          <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#8a92a6] mb-4">Features</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(f => (
              <div key={f.title} className="rounded-[12px] border border-[#1b1f29] bg-[#12151c] p-6 transition hover:border-[#252a35]">
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="text-[15px] font-semibold text-[#eef0f5] mb-2">{f.title}</h3>
                <p className="text-sm leading-6 text-[#b0b8cc]">{f.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tech stack + Built by — two columns */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Tech stack */}
          <div className="rounded-[12px] border border-[#1b1f29] bg-[#12151c] p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#8a92a6] mb-6">Tech stack</p>
            <div className="space-y-3">
              {STACK.map(s => (
                <div key={s.name} className="flex items-center justify-between border-b border-[#1b1f29] pb-3 last:border-0 last:pb-0">
                  <span className="text-sm font-semibold text-[#eef0f5]">{s.name}</span>
                  <span className="text-xs text-[#8a92a6]">{s.role}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Built by */}
          <div className="rounded-[12px] border border-[#1b1f29] bg-[#12151c] p-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#8a92a6] mb-6">Built by</p>
            <div className="flex items-center gap-4 mb-6">
              <img
                src="https://github.com/merhawi-luel.png"
                alt="merhawi-luel"
                className="h-14 w-14 rounded-full border border-[#252a35]"
              />
              <div>
                <p className="text-[16px] font-semibold text-[#eef0f5]">merhawi-luel</p>
                <p className="text-sm text-[#8a92a6]">Full-stack developer</p>
              </div>
            </div>
            <p className="text-sm leading-7 text-[#b0b8cc] mb-6">
              RoadmapApp was built as a personal project to solve a real problem — keeping track of learning
              resources scattered across YouTube, articles, and bookmarks. Everything in one place, with progress tracking.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://github.com/merhawi-luel"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-[8px] border border-[#252a35] px-4 py-2 text-sm text-[#b0b8cc] transition hover:border-[#8177f2] hover:text-[#eef0f5]"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
                GitHub
              </a>
              <a
                href="https://github.com/merhawi-luel/ROADMAP_APP"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-[8px] bg-[#8177f2] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
              >
                View source code →
              </a>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}

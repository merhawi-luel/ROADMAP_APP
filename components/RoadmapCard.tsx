import Link from 'next/link'
import type { Roadmap } from '@prisma/client'

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateString))
}

export default function RoadmapCard({ roadmap }: { roadmap: Roadmap }) {
  return (
    <article className="flex h-full min-h-[220px] flex-col rounded-[12px] border border-[#1b1f29] bg-[#12151c] p-6 shadow-sm shadow-black/40 transition hover:border-[#252a35] hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-[19px] font-semibold text-[#eef0f5]" style={{ fontFamily: 'var(--font-display)' }}>
            {roadmap.title}
          </h2>
          <p className="mt-2 text-[14px] leading-6 text-[#98a0b3]">{roadmap.description}</p>
        </div>
        <span className="rounded-[20px] border border-[#252a35] bg-[#181c25] px-3 py-1 text-[10.5px] font-medium uppercase tracking-[0.2em] text-[#98a0b3]">
          {formatDate(roadmap.createdAt)}
        </span>
      </div>
      <div className="mt-auto pt-6">
        <div className="flex justify-center">
          <Link
            href={`/roadmaps/${roadmap.id}`}
            className="inline-flex items-center justify-center rounded-[8px] bg-[#33d6a6] px-4 py-2 text-[13px] font-semibold text-[#0a0c11] transition hover:brightness-110"
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  )
}

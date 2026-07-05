interface ProgressAnalysisCardProps {
  title: string
  analysis: string
  equation?: string
}

export default function ProgressAnalysisCard({ title, analysis, equation }: ProgressAnalysisCardProps) {
  return (
    <section className="rounded-[12px] border border-[#1b1f29] bg-[#12151c] p-8 text-white shadow-sm">
      <div className="inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-[#f0a93b]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#f0a93b]" />
        AI analysis
      </div>
      <h2 className="mt-3 text-[19px] font-semibold text-[#eef0f5]" style={{ fontFamily: 'var(--font-display)' }}>
        {title}
      </h2>
      <p className="mt-5 whitespace-pre-line text-[14px] leading-7 text-[#98a0b3]">{analysis}</p>
      {equation ? (
        <div className="mt-6 rounded-[12px] border border-[#252a35] bg-[#181c25] px-4 py-3">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.12em] text-[#5e6577]">AI trend equation</p>
          <p className="mt-2 font-mono text-[13px] text-[#eef0f5]">{equation}</p>
        </div>
      ) : null}
    </section>
  )
}
type ProgressPoint = {
  createdAt: Date
  percentage: number
  label?: string
}

interface ProgressAnalyticsPanelProps {
  title: string
  subtitle: string
  points: ProgressPoint[]
  analysis: string
}

function formatPointDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export default function ProgressAnalyticsPanel({ title, subtitle, points, analysis }: ProgressAnalyticsPanelProps) {
  const width = 720
  const height = 240
  const paddingX = 32
  const paddingY = 28
  const usableWidth = width - paddingX * 2
  const usableHeight = height - paddingY * 2

  const plottedPoints = points.map((point, index) => {
    const x = points.length <= 1 ? width / 2 : paddingX + (usableWidth * index) / (points.length - 1)
    const y = height - paddingY - (usableHeight * point.percentage) / 100
    return { ...point, x, y }
  })

  const linePath = plottedPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')

  const areaPath = plottedPoints.length
    ? `${linePath} L ${plottedPoints.at(-1)?.x ?? width / 2} ${height - paddingY} L ${plottedPoints[0].x} ${height - paddingY} Z`
    : ''

  const latestPoint = plottedPoints.at(-1)

  return (
    <section className="rounded-[12px] border border-[#1b1f29] bg-[#12151c] p-8 shadow-sm shadow-black/40">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[#8a92a6]">{subtitle}</p>
          <h2 className="mt-3 text-[19px] font-semibold text-[#eef0f5]" style={{ fontFamily: 'var(--font-display)' }}>
            {title}
          </h2>
        </div>
        {latestPoint ? (
          <div className="rounded-[20px] border border-[#252a35] bg-[#181c25] px-4 py-2 text-[13px] font-medium text-[#98a0b3]">
            Latest: {latestPoint.percentage}% on {formatPointDate(latestPoint.createdAt)}
          </div>
        ) : null}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        <div className="rounded-[12px] border border-[#1b1f29] bg-[#181c25] p-4">
          {points.length === 0 ? (
            <div className="flex min-h-[220px] items-center justify-center rounded-[12px] border border-dashed border-[#252a35] bg-[#12151c] text-[14px] text-[#98a0b3]">
              No progress snapshots yet. Make an update to start the timeline.
            </div>
          ) : (
            <svg viewBox={`0 0 ${width} ${height}`} className="h-[240px] w-full" role="img" aria-label="Progress timeline chart">
              <defs>
                <linearGradient id="progress-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#8177f2" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#8177f2" stopOpacity="0" />
                </linearGradient>
              </defs>

                <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#252a35" />
                <line x1={paddingX} y1={paddingY} x2={paddingX} y2={height - paddingY} stroke="#252a35" />

              {areaPath ? <path d={areaPath} fill="url(#progress-fill)" /> : null}
                {linePath ? <path d={linePath} fill="none" stroke="#8177f2" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /> : null}

              {plottedPoints.map((point, index) => (
                <g key={`${point.createdAt.toISOString()}-${index}`}>
                  <circle cx={point.x} cy={point.y} r="6" fill="#8177f2" />
                  <circle cx={point.x} cy={point.y} r="11" fill="#8177f2" opacity="0.14" />
                  <text x={point.x} y={height - 6} textAnchor="middle" className="fill-[#5e6577] text-[12px]">
                    {formatPointDate(point.createdAt)}
                  </text>
                  <text x={point.x} y={point.y - 16} textAnchor="middle" className="fill-[#eef0f5] text-[12px] font-semibold">
                    {point.percentage}%
                  </text>
                </g>
              ))}
            </svg>
          )}
        </div>

        <aside className="rounded-[12px] border border-[#1b1f29] bg-[#181c25] p-6 text-white">
          <div className="inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.1em] text-[#f0a93b]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f0a93b]" />
            AI analysis
          </div>
          <p className="mt-4 text-[17px] font-semibold text-[#eef0f5]" style={{ fontFamily: 'var(--font-display)' }}>
            What the progress trend suggests
          </p>
          <p className="mt-4 whitespace-pre-line text-[14px] leading-7 text-[#98a0b3]">{analysis}</p>
        </aside>
      </div>
    </section>
  )
}
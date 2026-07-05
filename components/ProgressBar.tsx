'use client'

export default function ProgressBar({ percentage }: { percentage: number }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm font-medium text-zinc-300">
        <span>Progress</span>
        <span>{percentage}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

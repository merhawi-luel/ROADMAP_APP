interface CircularProgressProps {
  percentage: number
  completedItems?: number
  totalItems?: number
}

export default function CircularProgress({ percentage, completedItems, totalItems }: CircularProgressProps) {
  const radius = 38
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference - (percentage / 100) * circumference

  return (
    <div className="flex items-center gap-6">
      <div className="ring-wrap relative">
        <svg width="88" height="88" aria-hidden="true">
          <circle cx="44" cy="44" r={radius} fill="none" stroke="#181c25" strokeWidth="8" />
          <circle
            cx="44"
            cy="44"
            r={radius}
            fill="none"
            stroke="#33d6a6"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute left-0 top-0 flex h-20 w-20 items-center justify-center text-sm font-medium text-white">{percentage}%</div>
      </div>

      <div>
        {typeof completedItems === 'number' && typeof totalItems === 'number' ? (
          <div className="text-sm text-zinc-300">{completedItems}/{totalItems} complete</div>
        ) : null}
      </div>
    </div>
  )
}

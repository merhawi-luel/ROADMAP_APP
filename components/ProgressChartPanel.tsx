'use client'

import { useState } from 'react'

type ProgressPoint = {
  createdAt: Date
  percentage: number
  label?: string
}

type TrendLine = {
  slope: number
  intercept: number
  equation: string
}

interface ProgressChartPanelProps {
  title: string
  subtitle: string
  points: ProgressPoint[]
  trendLine?: TrendLine
}

type ZoomLevel = 'week' | 'day' | 'hour'

type ChartPoint = ProgressPoint & {
  x: number
  y: number
  key: string
  index: number
}

const zoomLevels: Array<{ value: ZoomLevel; label: string; bucketMs: number; spanCount: number }> = [
  { value: 'week', label: '4 Weeks', bucketMs: 7 * 24 * 60 * 60 * 1000, spanCount: 4 },
  { value: 'day', label: '7 Days', bucketMs: 24 * 60 * 60 * 1000, spanCount: 7 },
  { value: 'hour', label: '6 Hours', bucketMs: 60 * 60 * 1000, spanCount: 6 },
]

function formatPointDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function formatPointTime(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
  }).format(date)
}

function formatWindowDate(date: Date, zoomLevel: ZoomLevel) {
  if (zoomLevel === 'hour') {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

function bucketPoints(points: ProgressPoint[], zoomLevel: ZoomLevel) {
  const bucketMs = zoomLevels.find((level) => level.value === zoomLevel)?.bucketMs ?? zoomLevels[0].bucketMs
  const buckets = new Map<number, ProgressPoint[]>()

  for (const point of points) {
    const bucketKey = Math.floor(point.createdAt.getTime() / bucketMs) * bucketMs
    const existing = buckets.get(bucketKey)
    if (existing) {
      existing.push(point)
    } else {
      buckets.set(bucketKey, [point])
    }
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => a - b)
    .map(([bucketStart, bucketItems], index) => {
      const latestItem = bucketItems.at(-1) ?? bucketItems[0]
      const averagePercentage = bucketItems.reduce((sum, item) => sum + item.percentage, 0) / bucketItems.length

      return {
        createdAt: new Date(bucketStart),
        percentage: Math.round(averagePercentage),
        label: latestItem?.label,
        index,
      }
    })
}

function getVisibleWindow(points: Array<ChartPoint>, zoomLevel: ZoomLevel, offset: number) {
  const zoomConfig = zoomLevels.find((level) => level.value === zoomLevel) ?? zoomLevels[1]
  const maxOffset = Math.max(points.length - zoomConfig.spanCount, 0)
  const normalizedOffset = Math.min(Math.max(offset, 0), maxOffset)
  const startIndex = Math.max(points.length - zoomConfig.spanCount - normalizedOffset, 0)
  const visiblePoints = points.slice(startIndex, startIndex + zoomConfig.spanCount)

  return { visiblePoints, maxOffset, startIndex, spanCount: zoomConfig.spanCount }
}

export default function ProgressChartPanel({ title, subtitle, points, trendLine }: ProgressChartPanelProps) {
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('day')
  const [windowOffset, setWindowOffset] = useState(0)
  const width = 720
  const height = 240
  const paddingX = 32
  const paddingY = 28
  const usableWidth = width - paddingX * 2
  const usableHeight = height - paddingY * 2

  const zoomOptions = zoomLevels
  const bucketedPoints = bucketPoints(points, zoomLevel)
  const { visiblePoints, maxOffset, startIndex, spanCount } = getVisibleWindow(bucketedPoints as ChartPoint[], zoomLevel, windowOffset)
  const currentOffset = Math.min(windowOffset, maxOffset)

  const plottedPoints: ChartPoint[] = visiblePoints

  const timeBounds = plottedPoints.length
    ? {
        min: plottedPoints[0].createdAt.getTime(),
        max: plottedPoints[plottedPoints.length - 1].createdAt.getTime(),
      }
    : null

  const getX = (createdAt: Date) => {
    if (!timeBounds || timeBounds.max === timeBounds.min) {
      return width / 2
    }

    const normalized = (createdAt.getTime() - timeBounds.min) / (timeBounds.max - timeBounds.min)
    return paddingX + normalized * usableWidth
  }

  const plottedSeries = plottedPoints.map((point) => ({
    ...point,
    x: getX(point.createdAt),
    y: height - paddingY - (usableHeight * point.percentage) / 100,
    key: `${point.createdAt.toISOString()}-${point.percentage}-${point.label ?? ''}`,
  }))

  const linePath = plottedSeries
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')

  const trendPath = trendLine
    ? plottedSeries
        .map((point, index) => {
          const percentage = Math.max(0, Math.min(100, trendLine.slope * (point.index ?? index) + trendLine.intercept))
          const y = height - paddingY - (usableHeight * percentage) / 100
          return `${index === 0 ? 'M' : 'L'} ${point.x} ${y}`
        })
        .join(' ')
    : ''

  const areaPath = plottedSeries.length
    ? `${linePath} L ${plottedSeries.at(-1)?.x ?? width / 2} ${height - paddingY} L ${plottedSeries[0].x} ${height - paddingY} Z`
    : ''

  const latestPoint = plottedSeries.at(-1)
  const windowStartPoint = plottedSeries[0]
  const windowEndPoint = plottedSeries.at(-1)
  const windowLabel = windowStartPoint && windowEndPoint ? `${formatWindowDate(windowStartPoint.createdAt, zoomLevel)} - ${formatWindowDate(windowEndPoint.createdAt, zoomLevel)}` : ''
  const activeZoom = zoomLevels.find((level) => level.value === zoomLevel) ?? zoomLevels[1]

  return (
    <section className="rounded-[12px] border border-[#1b1f29] bg-[#12151c] p-8 shadow-sm shadow-black/40">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-[#5e6577]">{subtitle}</p>
          <h2 className="mt-3 text-[19px] font-semibold text-[#eef0f5]" style={{ fontFamily: 'var(--font-display)' }}>
            {title}
          </h2>
        </div>
        <div className="flex flex-col items-start gap-3 lg:items-end">
          <div className="inline-flex rounded-full border border-[#252a35] bg-[#181c25] p-1">
            {zoomOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setZoomLevel(option.value)
                  setWindowOffset(0)
                }}
                className={`rounded-full px-4 py-2 text-[12px] font-medium transition ${
                  zoomLevel === option.value
                    ? 'bg-[#8177f2] text-[#0a0c11]'
                    : 'text-[#98a0b3] hover:bg-[#252a35] hover:text-[#eef0f5]'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {maxOffset > 0 ? (
            <div className="w-full rounded-[16px] border border-[#252a35] bg-[#181c25] px-4 py-3 lg:w-[300px]">
              <div className="flex items-center justify-between gap-4 text-[12px] text-[#98a0b3]">
                <span>Recent</span>
                <span>Older</span>
              </div>
              <input
                type="range"
                min={0}
                max={maxOffset}
                step={1}
                value={currentOffset}
                onChange={(event) => setWindowOffset(Number(event.target.value))}
                className="mt-3 w-full accent-[#8177f2]"
                aria-label={`Slide across ${activeZoom.label.toLowerCase()} window`}
              />
              <p className="mt-2 text-[12px] text-[#5e6577]">
                Showing {spanCount} {activeZoom.value === 'week' ? 'weeks' : activeZoom.value === 'day' ? 'days' : 'hours'} at a time.
              </p>
            </div>
          ) : null}
          {trendLine ? (
            <div className="rounded-[20px] border border-[#2a2734] bg-[#1b172a] px-4 py-2 text-[13px] font-medium text-[#d7cffc]">
              {trendLine.equation}
            </div>
          ) : null}
          {latestPoint ? (
            <div className="rounded-[20px] border border-[#252a35] bg-[#181c25] px-4 py-2 text-[13px] font-medium text-[#98a0b3]">
              Latest: {latestPoint.percentage}% on {formatPointDate(latestPoint.createdAt)}
            </div>
          ) : null}
          {windowLabel ? (
            <div className="rounded-[20px] border border-[#252a35] bg-[#181c25] px-4 py-2 text-[13px] font-medium text-[#98a0b3]">
              Window: {windowLabel}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-8 rounded-[12px] border border-[#1b1f29] bg-[#181c25] p-4">
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
            {trendPath ? (
              <path
                d={trendPath}
                fill="none"
                stroke="#f0a93b"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="8 8"
              />
            ) : null}
            {linePath ? <path d={linePath} fill="none" stroke="#8177f2" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /> : null}

            {plottedSeries.map((point, index) => (
              <g key={point.key}>
                <circle cx={point.x} cy={point.y} r="6" fill="#8177f2" />
                <circle cx={point.x} cy={point.y} r="11" fill="#8177f2" opacity="0.14" />
                <text x={point.x} y={height - 6} textAnchor="middle" className="fill-[#5e6577] text-[12px]">
                  {zoomLevel === 'hour' ? formatPointTime(point.createdAt) : formatPointDate(point.createdAt)}
                </text>
                <text x={point.x} y={point.y - 16} textAnchor="middle" className="fill-[#eef0f5] text-[12px] font-semibold">
                  {point.percentage}%
                </text>
              </g>
            ))}
          </svg>
        )}
      </div>
    </section>
  )
}
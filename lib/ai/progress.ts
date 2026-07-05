type ProgressSnapshotLike = {
  createdAt: Date
  percentage: number
  completedItems: number
  totalItems: number
  source: string
}

export type ProgressTrendLine = {
  slope: number
  intercept: number
  equation: string
}

export type ProgressAnalysisResult = {
  summary: string
  trendLine: ProgressTrendLine
}

function roundValue(value: number) {
  return Math.round(value * 100) / 100
}

function formatNumber(value: number) {
  const rounded = roundValue(value)
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(2).replace(/\.0+$/, '')
}

function buildEquation(slope: number, intercept: number) {
  const formattedIntercept = formatNumber(intercept)
  const formattedSlope = formatNumber(Math.abs(slope))

  if (Math.abs(slope) < 0.005) {
    return `p(t) = ${formattedIntercept}`
  }

  return `p(t) = ${formattedIntercept} ${slope >= 0 ? '+' : '-'} ${formattedSlope}t`
}

function calculateLinearTrend(snapshots: ProgressSnapshotLike[]): ProgressTrendLine {
  if (snapshots.length === 0) {
    return {
      slope: 0,
      intercept: 0,
      equation: 'p(t) = 0',
    }
  }

  if (snapshots.length === 1) {
    const singleValue = snapshots[0]?.percentage ?? 0
    return {
      slope: 0,
      intercept: singleValue,
      equation: buildEquation(0, singleValue),
    }
  }

  const n = snapshots.length
  let sumX = 0
  let sumY = 0
  let sumXX = 0
  let sumXY = 0

  snapshots.forEach((snapshot, index) => {
    const x = index
    const y = snapshot.percentage
    sumX += x
    sumY += y
    sumXX += x * x
    sumXY += x * y
  })

  const denominator = n * sumXX - sumX * sumX
  const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator
  const intercept = denominator === 0 ? sumY / n : (sumY - slope * sumX) / n

  return {
    slope: roundValue(slope),
    intercept: roundValue(intercept),
    equation: buildEquation(slope, intercept),
  }
}

function buildFallbackAnalysis(snapshots: ProgressSnapshotLike[]): ProgressAnalysisResult {
  const trendLine = calculateLinearTrend(snapshots)

  if (snapshots.length === 0) {
    return {
      summary: 'No progress history yet. Add items or mark work complete to start building a trend line.',
      trendLine,
    }
  }

  const latest = snapshots.at(-1)
  const first = snapshots[0]
  const delta = (latest?.percentage ?? 0) - (first?.percentage ?? 0)

  if ((latest?.percentage ?? 0) === 0) {
    return {
      summary: 'Progress is still at zero. The next useful step is to complete the first checklist item so the trend can start moving.',
      trendLine,
    }
  }

  if (delta > 0) {
    return {
      summary: `Progress is moving upward by ${delta} points from the first recorded snapshot. Keep the momentum by finishing the next small item before switching context.`,
      trendLine,
    }
  }

  if (delta < 0) {
    return {
      summary: `The latest snapshot is ${Math.abs(delta)} points below the first one. That usually means items were added faster than they were completed, so focus on closing a few tasks to restore the trend.`,
      trendLine,
    }
  }

  return {
    summary: 'Progress is flat across the recorded snapshots. The roadmap is active, but the completion rate has not changed much yet, so the best move is to reduce the number of open items.',
    trendLine,
  }
}

export async function generateProgressAnalysis(
  roadmapTitle: string,
  snapshots: ProgressSnapshotLike[]
): Promise<ProgressAnalysisResult> {
  const fallback = buildFallbackAnalysis(snapshots)
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    return fallback
  }

  const recentSnapshots = snapshots.slice(-12).map((snapshot) => ({
    date: snapshot.createdAt.toISOString(),
    percentage: snapshot.percentage,
    completedItems: snapshot.completedItems,
    totalItems: snapshot.totalItems,
    source: snapshot.source,
  }))

  const prompt = [
    `You are a concise progress coach for a learning roadmap called "${roadmapTitle}".`,
    'Return valid JSON only.',
    'Use the shape {"summary":"...","slope":number,"intercept":number}.',
    'Model progress as a linear function p(t) = slope * t + intercept, where t is the snapshot index starting at 0.',
    'Keep the summary to 3 short sentences or fewer.',
    'Do not include markdown, code fences, or extra commentary.',
    `Progress history: ${JSON.stringify(recentSnapshots)}`,
  ].join('\n')

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 180,
          },
        }),
      }
    )

    if (!response.ok) {
      return fallback
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> }
      }>
    }

    const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('').trim()
    if (!text) {
      return fallback
    }

    const parsed = JSON.parse(text) as {
      summary?: string
      slope?: number
      intercept?: number
    }

    if (typeof parsed.summary !== 'string' || typeof parsed.slope !== 'number' || typeof parsed.intercept !== 'number') {
      return fallback
    }

    return {
      summary: parsed.summary.trim(),
      trendLine: {
        slope: roundValue(parsed.slope),
        intercept: roundValue(parsed.intercept),
        equation: buildEquation(parsed.slope, parsed.intercept),
      },
    }
  } catch {
    return fallback
  }
}
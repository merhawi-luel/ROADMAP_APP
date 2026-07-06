import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  title: z.string().min(1).max(200),
  timeFrom: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  timeTo: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  notes: z.string().optional(),
  checklistItemId: z.string().optional(),
})

function getMondayAndSunday(weekParam: string): { gte: string; lte: string } {
  // Parse the date parts directly to avoid timezone issues
  const [year, month, day] = weekParam.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  const dayOfWeek = d.getDay()
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  
  const monday = new Date(year, month - 1, day + diffToMonday)
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6)

  const fmt = (dt: Date) => {
    const y = dt.getFullYear()
    const m = String(dt.getMonth() + 1).padStart(2, '0')
    const d = String(dt.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  return { gte: fmt(monday), lte: fmt(sunday) }
}

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const week = searchParams.get('week')

  const where: any = { userId: session.user.id }
  if (week) where.date = getMondayAndSunday(week)

  try {
    const entries = await prisma.plannerEntry.findMany({
      where,
      include: {
        checklistItem: { select: { id: true, title: true, type: true, roadmapId: true } },
      },
      orderBy: [{ date: 'asc' }, { timeFrom: 'asc' }, { createdAt: 'asc' }],
    })
    return NextResponse.json(entries)
  } catch (error) {
    console.error('Planner GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const parsed = createSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid data', details: parsed.error.errors }, { status: 400 })
    }

    const entry = await prisma.plannerEntry.create({
      data: { ...parsed.data, userId: session.user.id },
      include: {
        checklistItem: { select: { id: true, title: true, type: true, roadmapId: true } },
      },
    })

    return NextResponse.json(entry, { status: 201 })
  } catch (error) {
    console.error('Planner POST error:', error)
    return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 })
  }
}

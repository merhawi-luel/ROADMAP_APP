import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  duration: z.number().int().min(1).nullable().optional(),
  notes: z.string().nullable().optional(),
  completed: z.boolean().optional(),
})

async function getEntry(id: string, userId: string) {
  return prisma.plannerEntry.findFirst({ where: { id, userId } })
}

// PATCH /api/planner/[id]
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const entry = await getEntry(id, session.user.id)
  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await request.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 })

  const updated = await prisma.plannerEntry.update({
    where: { id },
    data: parsed.data,
    include: {
      checklistItem: { select: { id: true, title: true, type: true, roadmapId: true } },
    },
  })

  return NextResponse.json(updated)
}

// DELETE /api/planner/[id]
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const entry = await getEntry(id, session.user.id)
  if (!entry) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.plannerEntry.delete({ where: { id } })
  return NextResponse.json({ success: true })
}

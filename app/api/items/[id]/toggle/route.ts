import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getRoadmapById } from '@/lib/db/roadmaps'
import { getItemById, getItemsByRoadmapId, toggleItemDone } from '@/lib/db/items'
import { recordProgressSnapshot } from '@/lib/db/progress'

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const item = await getItemById(id)
  if (!item) {
    return NextResponse.json({ error: 'Checklist item not found' }, { status: 404 })
  }

  const roadmap = await getRoadmapById(item.roadmapId)
  if (!roadmap || roadmap.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })
  }

  const updated = await toggleItemDone(id)
  const items = await getItemsByRoadmapId(item.roadmapId)
  await recordProgressSnapshot(item.roadmapId, items, 'item-toggled')
  return NextResponse.json(updated)
}

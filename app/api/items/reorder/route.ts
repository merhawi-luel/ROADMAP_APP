import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getItemById, getItemsByRoadmapId, reorderItems } from '@/lib/db/items'
import { getRoadmapById } from '@/lib/db/roadmaps'
import { recordProgressSnapshot } from '@/lib/db/progress'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body || !Array.isArray(body.items)) {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 })
  }

  const orderedItems = body.items as Array<{ id: string; order: number }>
  if (orderedItems.some((item) => typeof item.id !== 'string' || typeof item.order !== 'number')) {
    return NextResponse.json({ error: 'Invalid item data' }, { status: 400 })
  }

  const firstItem = await getItemById(orderedItems[0].id)
  if (!firstItem) {
    return NextResponse.json({ error: 'Checklist item not found' }, { status: 404 })
  }

  const roadmap = await getRoadmapById(firstItem.roadmapId)
  if (!roadmap || roadmap.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })
  }

  await reorderItems(orderedItems)
  const items = await getItemsByRoadmapId(roadmap.id)
  await recordProgressSnapshot(roadmap.id, items, 'items-reordered')
  return NextResponse.json({ success: true })
}

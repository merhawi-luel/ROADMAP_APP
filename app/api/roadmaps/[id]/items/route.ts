import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getRoadmapById } from '@/lib/db/roadmaps'
import { createItem, getItemsByRoadmapId } from '@/lib/db/items'
import { recordProgressSnapshot } from '@/lib/db/progress'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const roadmap = await getRoadmapById(id)

  if (!roadmap || roadmap.userId !== session.user.id) {
    return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 })
  }

  const items = await getItemsByRoadmapId(id)
  return NextResponse.json(items)
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const roadmap = await getRoadmapById(id)
  if (!roadmap || roadmap.userId !== session.user.id) {
    return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 })
  }

  const body = await request.json().catch(() => null)

  if (
    !body ||
    typeof body.title !== 'string' ||
    typeof body.type !== 'string' ||
    !['video', 'link', 'task'].includes(body.type)
  ) {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 })
  }

  if (body.type !== 'task' && typeof body.url !== 'string') {
    return NextResponse.json({ error: 'URL is required for video and link items' }, { status: 400 })
  }

  const item = await createItem({
    roadmapId: id,
    title: body.title.trim(),
    type: body.type,
    url: body.type === 'task' ? null : body.url.trim(),
  })

  const items = await getItemsByRoadmapId(id)
  await recordProgressSnapshot(id, items, 'item-created')

  return NextResponse.json(item, { status: 201 })
}

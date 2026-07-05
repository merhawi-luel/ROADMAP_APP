import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { getItemById, getItemsByRoadmapId, updateItem, deleteItem } from '@/lib/db/items'
import { getRoadmapById } from '@/lib/db/roadmaps'
import { recordProgressSnapshot } from '@/lib/db/progress'

async function authorizeItemOwner(userId: string, itemId: string) {
  const item = await getItemById(itemId)

  if (!item) {
    return null
  }

  const roadmap = await getRoadmapById(item.roadmapId)
  if (!roadmap || roadmap.userId !== userId) {
    return null
  }

  return item
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const item = await authorizeItemOwner(session.user.id, id)
  if (!item) {
    return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })
  }

  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 })
  }

  const updates: { title?: string; url?: string | null } = {}
  if (typeof body.title === 'string') updates.title = body.title.trim()
  if (typeof body.url === 'string') updates.url = body.url.trim()

  const updated = await updateItem(id, updates)
  return NextResponse.json(updated)
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const resolvedParams = await params
    let id = resolvedParams?.id

    if (!id) {
      try {
        const url = new URL(request.url)
        const parts = url.pathname.split('/').filter(Boolean)
        id = parts[parts.length - 1]
      } catch {
        // ignore and fall through to the validation below
      }
    }

    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
    }

    const item = await authorizeItemOwner(session.user.id, id)
    if (!item) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })
    }

    await deleteItem(id)
    const items = await getItemsByRoadmapId(item.roadmapId)
    await recordProgressSnapshot(item.roadmapId, items, 'item-deleted')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete checklist item', error)
    return NextResponse.json({ error: 'Unable to delete checklist item' }, { status: 500 })
  }
}

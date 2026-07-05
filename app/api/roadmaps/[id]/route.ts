import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { deleteRoadmap, getRoadmapById, updateRoadmap } from '@/lib/db/roadmaps'

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

  return NextResponse.json(roadmap)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

  if (!body) {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 })
  }

  const updates: { title?: string; description?: string } = {}
  if (typeof body.title === 'string') updates.title = body.title.trim()
  if (typeof body.description === 'string') updates.description = body.description.trim()

  if (updates.title !== undefined && updates.title.length === 0) {
    return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 })
  }

  if (updates.description !== undefined && updates.description.length === 0) {
    return NextResponse.json({ error: 'Description cannot be empty' }, { status: 400 })
  }

  const updatedRoadmap = await updateRoadmap(id, updates)
  return NextResponse.json(updatedRoadmap)
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const roadmap = await getRoadmapById(id)
  if (!roadmap || roadmap.userId !== session.user.id) {
    return NextResponse.json({ error: 'Roadmap not found' }, { status: 404 })
  }

  await deleteRoadmap(id)
  return NextResponse.json({ success: true })
}

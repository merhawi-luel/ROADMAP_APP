import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createRoadmap, getRoadmapsByUserId } from '@/lib/db/roadmaps'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const roadmaps = await getRoadmapsByUserId(session.user.id)
  return NextResponse.json(roadmaps)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)

  if (!body || typeof body.title !== 'string' || typeof body.description !== 'string') {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 })
  }

  const title = body.title.trim()
  const description = body.description.trim()

  if (title.length === 0) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  if (description.length === 0) {
    return NextResponse.json({ error: 'Description is required' }, { status: 400 })
  }

  const roadmap = await createRoadmap(session.user.id, { title, description })
  return NextResponse.json(roadmap, { status: 201 })
}

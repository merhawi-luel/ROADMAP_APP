import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) return u.pathname.slice(1)
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v')
      if (v) return v
      const parts = u.pathname.split('/')
      const embedIndex = parts.indexOf('embed')
      if (embedIndex !== -1 && parts[embedIndex + 1]) return parts[embedIndex + 1]
    }
  } catch (err) {
    // ignore
  }
  return null
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const items = await prisma.playlistItem.findMany({ where: { userId: session.user.id }, orderBy: { order: 'asc' } })
  return NextResponse.json(items)
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body || typeof body.url !== 'string') return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })

  const youtubeId = getYouTubeId(body.url)
  if (!youtubeId) return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })

  // Try to fetch oEmbed for title/thumbnail
  let title = body.url
  let thumbnail = ''
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(body.url)}&format=json`)
    if (res.ok) {
      const data = await res.json()
      title = data.title || title
      thumbnail = data.thumbnail_url || ''
    }
  } catch (e) {
    // ignore
  }

  const maxOrder = await prisma.playlistItem.aggregate({ _max: { order: true }, where: { userId: session.user.id } })
  const nextOrder = (maxOrder._max.order ?? 0) + 1

  const item = await prisma.playlistItem.create({ data: { youtubeId, title, thumbnail, order: nextOrder, userId: session.user.id } })
  return NextResponse.json(item, { status: 201 })
}

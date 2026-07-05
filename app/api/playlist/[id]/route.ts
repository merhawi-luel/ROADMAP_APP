import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = params || {}

    // log minimal request info for debugging
    try {
      console.log('[DELETE /api/playlist/:id] request.url=', _.url, 'params.id=', id, 'sessionUserId=', session?.user?.id)
    } catch (e) {
      // ignore
    }

    // Fallback: if params.id is missing, try to extract from the request URL path
    let targetId = id
    if (!targetId) {
      try {
        const urlObj = new URL(_.url)
        const parts = urlObj.pathname.split('/').filter(Boolean)
        // expected path ends with .../api/playlist/:id
        targetId = parts[parts.length - 1]
        console.log('[DELETE] extracted id from path=', targetId)
      } catch (e) {
        // ignore
      }
    }

    if (!targetId) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
    }

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized - no active session' }, { status: 401 })
    }

    const item = await prisma.playlistItem.findUnique({ where: { id: targetId } })
    if (!item) {
      return NextResponse.json({ error: `Not found - item ${targetId} does not exist` }, { status: 404 })
    }

    if (item.userId !== session.user.id) {
      console.log('[DELETE] ownership mismatch: item.userId=', item.userId, 'session.user.id=', session.user.id)
      return NextResponse.json({ error: 'Forbidden - not owner' }, { status: 403 })
    }

    try {
      await prisma.playlistItem.delete({ where: { id: targetId } })
      return NextResponse.json({ success: true })
    } catch (err: any) {
      console.error('[DELETE] prisma.delete error', err)
      return NextResponse.json({ error: 'Server error deleting item', details: String(err?.message || err) }, { status: 500 })
    }
  } catch (err: any) {
    console.error('[DELETE] unexpected error', err)
    return NextResponse.json({ error: 'Unexpected server error', details: String(err?.message || err) }, { status: 500 })
  }
}

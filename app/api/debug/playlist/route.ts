import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const items = await prisma.playlistItem.findMany({ orderBy: { order: 'asc' } })
  return NextResponse.json(items)
}

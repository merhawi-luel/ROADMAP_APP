import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const socialLinksSchema = z.object({
  linkedin:   z.string().url().optional().or(z.literal('')),
  instagram:  z.string().url().optional().or(z.literal('')),
  telegram:   z.string().url().optional().or(z.literal('')),
  leetcode:   z.string().url().optional().or(z.literal('')),
  codeforces: z.string().url().optional().or(z.literal('')),
  github:     z.string().url().optional().or(z.literal('')),
  x:          z.string().url().optional().or(z.literal('')),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const links = await prisma.socialLinks.findUnique({
    where: { userId: session.user.id },
  })

  return NextResponse.json(links ?? {})
}

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const parsed = socialLinksSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid data', details: parsed.error.errors }, { status: 400 })
  }

  // Convert empty strings to null
  const data = Object.fromEntries(
    Object.entries(parsed.data).map(([k, v]) => [k, v === '' ? null : v])
  )

  const links = await prisma.socialLinks.upsert({
    where: { userId: session.user.id },
    update: data,
    create: { userId: session.user.id, ...data },
  })

  return NextResponse.json(links)
}

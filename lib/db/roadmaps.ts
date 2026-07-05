import type { Roadmap } from '@prisma/client'
import { prisma } from '../prisma'
import { recordProgressSnapshot } from '../progress'

export interface RoadmapCreateInput {
  title: string
  description: string
}

export interface RoadmapUpdateInput {
  title?: string
  description?: string
}

export async function createRoadmap(userId: string, input: RoadmapCreateInput): Promise<Roadmap> {
  const roadmap = await prisma.roadmap.create({
    data: {
      userId,
      title: input.title.trim(),
      description: input.description.trim(),
    },
  })

  await recordProgressSnapshot(roadmap.id, [], 'roadmap-created')

  return roadmap
}

export async function getRoadmapsByUserId(userId: string): Promise<Roadmap[]> {
  return prisma.roadmap.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function getRoadmapById(id: string): Promise<Roadmap | null> {
  return prisma.roadmap.findUnique({
    where: { id },
  })
}

export async function updateRoadmap(id: string, data: RoadmapUpdateInput): Promise<Roadmap> {
  return prisma.roadmap.update({
    where: { id },
    data: {
      title: data.title?.trim(),
      description: data.description?.trim(),
    },
  })
}

export async function deleteRoadmap(id: string): Promise<Roadmap> {
  return prisma.roadmap.delete({
    where: { id },
  })
}

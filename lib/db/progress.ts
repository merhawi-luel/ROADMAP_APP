import type { ChecklistItem, ProgressSnapshot } from '@prisma/client'
import { prisma } from '../prisma'
import { calculateProgress } from '../progress'

export async function recordProgressSnapshot(
  roadmapId: string,
  items: ChecklistItem[],
  source = 'system'
): Promise<ProgressSnapshot> {
  const progress = calculateProgress(items)

  return prisma.progressSnapshot.create({
    data: {
      roadmapId,
      totalItems: progress.totalItems,
      completedItems: progress.completedItems,
      percentage: progress.percentage,
      source,
    },
  })
}

export async function getProgressSnapshotsByRoadmapId(roadmapId: string): Promise<ProgressSnapshot[]> {
  return prisma.progressSnapshot.findMany({
    where: { roadmapId },
    orderBy: { createdAt: 'asc' },
  })
}

export async function getWorkspaceProgressSnapshots(userId: string) {
  return prisma.progressSnapshot.findMany({
    where: {
      roadmap: {
        userId,
      },
    },
    include: {
      roadmap: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })
}
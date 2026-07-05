import type { ChecklistItem, ProgressSnapshot } from '@prisma/client'
import { prisma } from './prisma'

export function calculateProgress(items: ChecklistItem[]) {
  const totalItems = items.length
  const completedItems = items.filter((item) => item.done).length
  const percentage = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100)

  return { totalItems, completedItems, percentage }
}

export async function recordProgressSnapshot(roadmapId: string, items: ChecklistItem[], source = 'system') {
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

export async function getProgressSnapshots(roadmapId: string): Promise<ProgressSnapshot[]> {
  return prisma.progressSnapshot.findMany({
    where: { roadmapId },
    orderBy: { createdAt: 'asc' },
  })
}

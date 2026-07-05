import type { ChecklistItem } from '@prisma/client'
import { prisma } from '../prisma'

export type ChecklistItemType = 'video' | 'link' | 'task'

export interface ChecklistItemCreateInput {
  roadmapId: string
  title: string
  type: ChecklistItemType
  url?: string | null
}

export interface ChecklistItemUpdateInput {
  title?: string
  url?: string | null
}

export async function createItem(input: ChecklistItemCreateInput): Promise<ChecklistItem> {
  const order =
    (await prisma.checklistItem.aggregate({
      where: { roadmapId: input.roadmapId },
      _max: { order: true },
    }))?._max.order ?? 0

  return prisma.checklistItem.create({
    data: {
      roadmapId: input.roadmapId,
      title: input.title.trim(),
      type: input.type,
      url: input.url?.trim() || null,
      order: order + 1,
    },
  })
}

export async function getItemsByRoadmapId(roadmapId: string): Promise<ChecklistItem[]> {
  return prisma.checklistItem.findMany({
    where: { roadmapId },
    orderBy: { order: 'asc' },
  })
}

export async function getItemById(id: string): Promise<ChecklistItem | null> {
  return prisma.checklistItem.findUnique({ where: { id } })
}

export async function updateItem(id: string, data: ChecklistItemUpdateInput): Promise<ChecklistItem> {
  const updateData: { title?: string; url?: string | null } = {}

  if (typeof data.title === 'string') {
    updateData.title = data.title.trim()
  }

  if (data.url !== undefined) {
    updateData.url = data.url?.trim() || null
  }

  return prisma.checklistItem.update({
    where: { id },
    data: updateData,
  })
}

export async function toggleItemDone(id: string): Promise<ChecklistItem> {
  const item = await getItemById(id)

  if (!item) {
    throw new Error('Checklist item not found')
  }

  return prisma.checklistItem.update({
    where: { id },
    data: { done: !item.done },
  })
}

export async function deleteItem(id: string): Promise<ChecklistItem> {
  return prisma.checklistItem.delete({ where: { id } })
}

export async function reorderItems(items: Array<{ id: string; order: number }>): Promise<boolean> {
  const transactions = items.map((item) =>
    prisma.checklistItem.update({ where: { id: item.id }, data: { order: item.order } })
  )

  await prisma.$transaction(transactions)
  return true
}

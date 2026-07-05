'use client'

import { useCallback, useEffect, useState, useRef } from 'react'
import type { ChecklistItem as ChecklistItemModel } from '@prisma/client'
import ChecklistItem from './ChecklistItem'
import CircularProgress from './CircularProgress'
import { calculateProgress } from '@/lib/progress'

interface ChecklistSectionProps {
  roadmapId: string
}

export default function ChecklistSection({ roadmapId }: ChecklistSectionProps) {
  const [items, setItems] = useState<ChecklistItemModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadItems = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    const response = await fetch(`/api/roadmaps/${roadmapId}/items`, { cache: 'no-store' })
    if (!response.ok) {
      setError('Unable to load checklist items.')
      setIsLoading(false)
      return
    }

    const data = (await response.json()) as ChecklistItemModel[]
    setItems(data)
    setIsLoading(false)
  }, [roadmapId])

  const dragItemId = useRef<string | null>(null)
  const dragOverItemId = useRef<string | null>(null)

  const onDragStart = (e: React.DragEvent<HTMLLIElement>, id: string) => {
    dragItemId.current = id
    e.dataTransfer.effectAllowed = 'move'
    try {
      e.dataTransfer.setData('text/plain', id)
    } catch (err) {
      // ignore
    }
  }

  const onDragOver = (e: React.DragEvent<HTMLLIElement>, id: string) => {
    e.preventDefault()
    dragOverItemId.current = id
  }

  const onDrop = async (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault()
    const fromId = dragItemId.current || e.dataTransfer.getData('text/plain')
    const toId = dragOverItemId.current
    if (!fromId || !toId || fromId === toId) return

    // compute new order
    const current = [...items]
    const fromIndex = current.findIndex((i) => i.id === fromId)
    const toIndex = current.findIndex((i) => i.id === toId)
    if (fromIndex === -1 || toIndex === -1) return

    const [moved] = current.splice(fromIndex, 1)
    current.splice(toIndex, 0, moved)

    // update client
    setItems(current)

    // send reorder to server
    const payload = current.map((it, idx) => ({ id: it.id, order: idx + 1 }))
    const resp = await fetch('/api/items/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: payload }),
    })

    if (!resp.ok) {
      setError('Unable to reorder items.')
      // reload to reflect server state
      await loadItems()
    }

    dragItemId.current = null
    dragOverItemId.current = null
  }

  useEffect(() => {
    loadItems()
  }, [loadItems])

  const handleToggle = async (itemId: string) => {
    const response = await fetch(`/api/items/${itemId}/toggle`, { method: 'POST' })
    if (response.ok) {
      await loadItems()
    } else {
      setError('Unable to toggle checklist item.')
    }
  }

  const handleDelete = async (itemId: string) => {
    const response = await fetch(`/api/items/${itemId}`, { method: 'DELETE' })
    if (response.ok) {
      await loadItems()
    } else {
      setError('Unable to delete checklist item.')
    }
  }

  const progress = calculateProgress(items)

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-sm shadow-black/40">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-zinc-400">Checklist</p>
            <h3 className="text-lg font-semibold text-zinc-50">Learning steps</h3>
          </div>
          <span className="text-sm text-zinc-400">Check off items as you complete them</span>
        </div>

        {isLoading ? (
          <p className="text-sm text-zinc-300">Loading checklist items…</p>
        ) : error ? (
          <p className="text-sm text-danger">{error}</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-zinc-300">No items yet. Add a checklist item to get started.</p>
        ) : (
          <ul className="space-y-4">
            {items.map((item) => (
              <ChecklistItem
                key={item.id}
                item={item}
                onToggle={() => handleToggle(item.id)}
                onDelete={() => handleDelete(item.id)}
                draggable={true}
                onDragStart={(e) => onDragStart(e, item.id)}
                onDragOver={(e) => onDragOver(e, item.id)}
                onDrop={onDrop}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

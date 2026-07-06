'use client'

import type { ChecklistItem as ChecklistItemModel } from '@prisma/client'
import YouTubeEmbed from './YouTubeEmbed'

interface ChecklistItemProps {
  item: ChecklistItemModel
  onToggle: () => Promise<void>
  onDelete: () => Promise<void>
  draggable?: boolean
  onDragStart?: (e: React.DragEvent<HTMLLIElement>) => void
  onDragOver?: (e: React.DragEvent<HTMLLIElement>) => void
  onDrop?: (e: React.DragEvent<HTMLLIElement>) => void
}

const typeLabels: Record<string, string> = {
  video: 'Video',
  link: 'Link',
  task: 'Task',
}

export default function ChecklistItem({ item, onToggle, onDelete, draggable, onDragStart, onDragOver, onDrop }: ChecklistItemProps) {
  return (
    <li
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className="rounded-[11px] border border-[#1b1f29] bg-[#12151c] p-4 shadow-sm shadow-black/40"
    >
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            void onToggle()
          }}
          className={`mt-1 inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition ${
            item.done ? 'border-success bg-success/10 text-success' : 'border-[#252a35] text-[#98a0b3] hover:border-[#8177f2]'
          }`}
        >
          {item.done ? '✓' : '+'}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className={`text-[15px] font-semibold ${item.done ? 'text-[#5e6577] line-through' : 'text-[#eef0f5]'}`}>
                {item.title}
              </p>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-[#8a92a6]">{typeLabels[item.type]}</p>
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                void onDelete()
              }}
              className="text-[13px] font-medium text-[#f1696c] transition hover:text-[#ff8083]"
            >
              Delete
            </button>
          </div>
          {item.url ? (
            <>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer"
                className="mt-3 block text-[13px] text-[#8177f2] hover:text-[#a79efb]"
              >
                Open resource
              </a>
              {item.type === 'video' ? <YouTubeEmbed url={item.url} /> : null}
            </>
          ) : null}
        </div>
      </div>
    </li>
  )
}

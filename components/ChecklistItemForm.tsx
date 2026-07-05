'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface ChecklistItemFormProps {
  roadmapId: string
}

export default function ChecklistItemForm({ roadmapId }: ChecklistItemFormProps) {
  const router = useRouter()
  const [type, setType] = useState<'video' | 'link' | 'task'>('video')
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Title is required.')
      return
    }

    if ((type === 'video' || type === 'link') && !url.trim()) {
      setError('URL is required for video and link items.')
      return
    }

    setIsSubmitting(true)

    const response = await fetch(`/api/roadmaps/${roadmapId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, type, url: type === 'task' ? null : url }),
    })

    setIsSubmitting(false)

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      setError(data?.error || 'Unable to add checklist item.')
      return
    }

    setTitle('')
    setUrl('')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[12px] border border-[#1b1f29] bg-[#12151c] p-6 shadow-sm shadow-black/40">
      <div>
        <label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.06em] text-[#98a0b3]">Item title</label>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="w-full rounded-[9px] border border-[#252a35] bg-[#181c25] px-4 py-3 text-[14px] text-[#eef0f5] outline-none transition placeholder:text-[#5e6577] focus:border-[#8177f2] focus:ring-2 focus:ring-[#8177f2]/20"
          placeholder="e.g. Watch React tutorial"
        />
      </div>
      <div>
        <label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.06em] text-[#98a0b3]">Item type</label>
        <select
          value={type}
          onChange={(event) => setType(event.target.value as 'video' | 'link' | 'task')}
          className="w-full rounded-[9px] border border-[#252a35] bg-[#181c25] px-4 py-3 text-[14px] text-[#eef0f5] outline-none transition focus:border-[#8177f2] focus:ring-2 focus:ring-[#8177f2]/20"
        >
          <option value="video">Video</option>
          <option value="link">Link</option>
          <option value="task">Task</option>
        </select>
      </div>
      {(type === 'video' || type === 'link') && (
        <div>
          <label className="mb-2 block font-mono text-[11px] uppercase tracking-[0.06em] text-[#98a0b3]">URL</label>
          <input
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            className="w-full rounded-[9px] border border-[#252a35] bg-[#181c25] px-4 py-3 text-[14px] text-[#eef0f5] outline-none transition placeholder:text-[#5e6577] focus:border-[#8177f2] focus:ring-2 focus:ring-[#8177f2]/20"
            placeholder="https://"
          />
        </div>
      )}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center rounded-[9px] bg-[#8177f2] px-6 py-3 text-[14px] font-semibold text-[#0a0c11] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Adding item…' : 'Add checklist item'}
      </button>
    </form>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewRoadmapForm() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setIsSubmitting(true)

    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.')
      setIsSubmitting(false)
      return
    }

    const response = await fetch('/api/roadmaps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    })

    setIsSubmitting(false)

    if (!response.ok) {
      const data = await response.json().catch(() => null)
      setError(data?.error || 'Unable to create roadmap.')
      return
    }

    router.push('/roadmaps')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-[16px] border border-[#1b1f29] bg-[#12151c] p-8">
      <div>
        <label className="block text-sm font-medium text-[#eef0f5]">Roadmap title</label>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-2 w-full rounded-[10px] border border-[#252a35] bg-[#0a0c11] px-4 py-3 text-sm text-[#eef0f5] outline-none transition placeholder:text-[#3d4455] focus:border-[#8177f2] focus:ring-1 focus:ring-[#8177f2]/30"
          placeholder="e.g. Learn React in 4 weeks"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#eef0f5]">Description</label>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="mt-2 h-32 w-full rounded-[10px] border border-[#252a35] bg-[#0a0c11] px-4 py-3 text-sm text-[#eef0f5] outline-none transition placeholder:text-[#3d4455] focus:border-[#8177f2] focus:ring-1 focus:ring-[#8177f2]/30 resize-none"
          placeholder="What will you learn? What's the goal?"
        />
      </div>
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center rounded-[8px] bg-[#8177f2] px-6 py-2.5 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Creating…' : 'Create roadmap'}
      </button>
    </form>
  )
}

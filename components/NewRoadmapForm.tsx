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
    <form onSubmit={handleSubmit} className="space-y-6 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-sm shadow-black/40">
      <div>
        <label className="block text-sm font-medium text-zinc-100">Roadmap title</label>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          className="mt-2 w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-white focus:ring-2 focus:ring-white/20"
          placeholder="Learn React and build a roadmap"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-100">Description</label>
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="mt-2 h-32 w-full rounded-2xl border border-zinc-700 bg-black px-4 py-3 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-500 focus:border-white focus:ring-2 focus:ring-white/20"
          placeholder="Add a short description for this roadmap"
        />
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? 'Creating roadmap…' : 'Create roadmap'}
      </button>
    </form>
  )
}

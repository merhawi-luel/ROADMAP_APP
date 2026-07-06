'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteRoadmapButton({ roadmapId }: { roadmapId: string }) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    const res = await fetch(`/api/roadmaps/${roadmapId}`, { method: 'DELETE' })
    if (res.ok) {
      router.push('/roadmaps')
    } else {
      alert('Failed to delete roadmap. Please try again.')
      setDeleting(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-[#b0b8cc]">Delete this roadmap?</span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="rounded-[8px] bg-red-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
        >
          {deleting ? 'Deleting…' : 'Yes, delete'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="rounded-[8px] border border-[#252a35] px-3 py-1.5 text-sm text-[#b0b8cc] transition hover:border-[#8177f2]"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="flex items-center gap-2 rounded-[8px] border border-red-900/50 px-3 py-1.5 text-sm text-red-400 transition hover:border-red-600 hover:bg-red-950/30 hover:text-red-300"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      Delete roadmap
    </button>
  )
}

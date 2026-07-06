'use client'

import { useState, useEffect, useCallback } from 'react'
import Header from '@/components/Header'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface PlannerEntry {
  id: string
  date: string
  title: string
  timeFrom?: string | null
  timeTo?: string | null
  notes?: string | null
  completed: boolean
  checklistItem?: { id: string; title: string; type: string } | null
}

interface RoadmapItem {
  id: string
  title: string
  type: string
  roadmapTitle?: string
}

function getMondayOf(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

function formatDate(date: Date): string {
  // Use local date to avoid timezone shifting
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`
}

// Generate time options every 30 minutes
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2).toString().padStart(2, '0')
  const m = i % 2 === 0 ? '00' : '30'
  return `${h}:${m}`
})

export default function PlannerPage() {
  const [currentMonday, setCurrentMonday] = useState<Date>(() => getMondayOf(new Date()))
  const [entries, setEntries] = useState<PlannerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [roadmapItems, setRoadmapItems] = useState<RoadmapItem[]>([])
  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [form, setForm] = useState({ title: '', timeFrom: '', timeTo: '', notes: '', checklistItemId: '' })
  const [saving, setSaving] = useState(false)

  const loadEntries = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/planner?week=${formatDate(currentMonday)}`)
      if (res.ok) setEntries(await res.json())
    } catch (e) {
      console.error('Failed to load entries', e)
    }
    setLoading(false)
  }, [currentMonday])

  useEffect(() => {
    fetch('/api/roadmaps')
      .then(r => r.ok ? r.json() : [])
      .then(async (roadmaps) => {
        if (!Array.isArray(roadmaps)) return
        const allItems: RoadmapItem[] = []
        for (const rm of roadmaps) {
          const res = await fetch(`/api/roadmaps/${rm.id}`)
          if (res.ok) {
            const data = await res.json()
            ;(data.items || []).filter((i: any) => !i.done).forEach((item: any) => {
              allItems.push({ ...item, roadmapTitle: rm.title })
            })
          }
        }
        setRoadmapItems(allItems)
      })
  }, [])

  useEffect(() => { loadEntries() }, [loadEntries])

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(currentMonday, i)
    return { date: formatDate(d), label: DAYS[i], display: formatDisplayDate(formatDate(d)) }
  })

  const isToday = (dateStr: string) => {
    const today = new Date()
    const y = today.getFullYear()
    const m = String(today.getMonth() + 1).padStart(2, '0')
    const d = String(today.getDate()).padStart(2, '0')
    return dateStr === `${y}-${m}-${d}`
  }

  const openModal = (date: string) => {
    setSelectedDate(date)
    setForm({ title: '', timeFrom: '', timeTo: '', notes: '', checklistItemId: '' })
    setShowModal(true)
  }

  const handleSelectRoadmapItem = (itemId: string) => {
    const item = roadmapItems.find(i => i.id === itemId)
    setForm(prev => ({ ...prev, checklistItemId: itemId, title: item ? item.title : prev.title }))
  }

  const handleCreate = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    const body: any = { date: selectedDate, title: form.title.trim() }
    if (form.timeFrom) body.timeFrom = form.timeFrom
    if (form.timeTo) body.timeTo = form.timeTo
    if (form.notes.trim()) body.notes = form.notes.trim()
    if (form.checklistItemId) body.checklistItemId = form.checklistItemId

    const res = await fetch('/api/planner', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      const newEntry = await res.json()
      setEntries(prev => [...prev, newEntry])
      setShowModal(false)
    } else {
      const err = await res.json()
      alert(`Failed to save: ${err.error || 'Unknown error'}`)
    }
    setSaving(false)
  }

  const handleToggle = async (entry: PlannerEntry) => {
    const res = await fetch(`/api/planner/${entry.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !entry.completed }),
    })
    if (res.ok) {
      const updated = await res.json()
      setEntries(prev => prev.map(e => e.id === updated.id ? updated : e))
    }
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/planner/${id}`, { method: 'DELETE' })
    if (res.ok) setEntries(prev => prev.filter(e => e.id !== id))
  }

  const weekLabel = `${formatDisplayDate(formatDate(currentMonday))} – ${formatDisplayDate(formatDate(addDays(currentMonday, 6)))}`

  return (
    <div className="min-h-screen bg-[#0a0c11] text-[#eef0f5]">
      <Header />
      <main className="mx-auto max-w-[1200px] px-6 py-12 sm:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#5e6577]">Planner</p>
            <h1 className="mt-2 text-2xl font-semibold">Weekly Planner</h1>
            <p className="mt-1 text-sm text-[#b0b8cc]">Schedule your learning sessions with exact time slots</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentMonday(prev => addDays(prev, -7))} className="rounded-[8px] border border-[#252a35] px-3 py-2 text-sm text-[#b0b8cc] hover:border-[#8177f2] hover:text-[#eef0f5] transition">←</button>
            <button onClick={() => setCurrentMonday(getMondayOf(new Date()))} className="rounded-[8px] border border-[#252a35] px-3 py-2 text-sm text-[#b0b8cc] hover:border-[#8177f2] hover:text-[#eef0f5] transition">Today</button>
            <button onClick={() => setCurrentMonday(prev => addDays(prev, 7))} className="rounded-[8px] border border-[#252a35] px-3 py-2 text-sm text-[#b0b8cc] hover:border-[#8177f2] hover:text-[#eef0f5] transition">→</button>
            <span className="ml-2 text-sm font-medium text-[#eef0f5]">{weekLabel}</span>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-[#5e6577]">Loading…</div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map(day => {
              const dayEntries = entries.filter(e => e.date === day.date)
              const today = isToday(day.date)
              return (
                <div key={day.date} className={`flex flex-col rounded-[12px] border ${today ? 'border-[#8177f2]' : 'border-[#1b1f29]'} bg-[#12151c] min-h-[400px]`}>
                  {/* Day header */}
                  <div className={`rounded-t-[11px] px-3 py-3 ${today ? 'bg-[#8177f2]/10' : 'border-b border-[#1b1f29]'}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-[11px] font-semibold uppercase tracking-wider ${today ? 'text-[#8177f2]' : 'text-[#b0b8cc]'}`}>{day.label}</p>
                        <p className={`text-sm font-semibold mt-0.5 ${today ? 'text-[#8177f2]' : 'text-[#eef0f5]'}`}>{day.display}</p>
                      </div>
                      <button onClick={() => openModal(day.date)} className="flex h-6 w-6 items-center justify-center rounded-full border border-[#252a35] text-[#b0b8cc] hover:border-[#8177f2] hover:text-[#8177f2] transition text-base font-light">+</button>
                    </div>
                  </div>

                  {/* Entries */}
                  <div className="flex-1 space-y-2 p-2">
                    {dayEntries.map(entry => (
                      <div key={entry.id} className={`group relative rounded-[8px] border px-3 py-2.5 text-xs transition ${entry.completed ? 'border-[#1b1f29] opacity-40' : entry.checklistItem ? 'border-[#8177f2]/40 bg-[#8177f2]/8' : 'border-[#252a35] bg-[#181c25]'}`}>
                        <div className="flex items-start gap-2">
                          <button
                            onClick={() => handleToggle(entry)}
                            className={`mt-0.5 flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-sm border transition ${entry.completed ? 'border-green-500 bg-green-500' : 'border-[#3d4455] hover:border-[#8177f2]'}`}
                          >
                            {entry.completed && (
                              <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                          <div className="min-w-0 flex-1">
                            <p className={`font-medium leading-tight ${entry.completed ? 'line-through text-[#5e6577]' : 'text-[#eef0f5]'}`}>{entry.title}</p>
                            {(entry.timeFrom || entry.timeTo) && (
                              <p className="mt-1 text-[10px] text-[#8177f2] font-medium">
                                🕐 {entry.timeFrom ? formatTime(entry.timeFrom) : '?'}{entry.timeTo ? ` – ${formatTime(entry.timeTo)}` : ''}
                              </p>
                            )}
                            {entry.checklistItem && (
                              <p className="mt-0.5 text-[10px] text-[#8177f2]/70">📌 From roadmap</p>
                            )}
                          </div>
                          <button onClick={() => handleDelete(entry.id)} className="hidden flex-shrink-0 text-[#3d4455] hover:text-red-400 group-hover:block transition">×</button>
                        </div>
                      </div>
                    ))}

                    {dayEntries.length === 0 && (
                      <button onClick={() => openModal(day.date)} className="w-full rounded-[8px] border border-dashed border-[#1b1f29] py-4 text-[11px] text-[#3d4455] hover:border-[#252a35] hover:text-[#b0b8cc] transition">
                        + Add session
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-[16px] border border-[#1b1f29] bg-[#12151c] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add Study Session</h2>
              <button onClick={() => setShowModal(false)} className="text-[#5e6577] hover:text-[#eef0f5] text-xl">×</button>
            </div>

            <div className="space-y-4">
              {/* Roadmap link */}
              {roadmapItems.length > 0 && (
                <div>
                  <label className="mb-1 block text-xs text-[#5e6577]">Link to roadmap task (optional)</label>
                  <select
                    value={form.checklistItemId}
                    onChange={e => handleSelectRoadmapItem(e.target.value)}
                    className="w-full rounded-[8px] border border-[#252a35] bg-[#0a0c11] px-3 py-2 text-sm text-[#eef0f5] outline-none focus:border-[#8177f2]"
                  >
                    <option value="">— None —</option>
                    {roadmapItems.map(item => (
                      <option key={item.id} value={item.id}>[{item.roadmapTitle}] {item.title}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="mb-1 block text-xs text-[#5e6577]">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Study React hooks"
                  className="w-full rounded-[8px] border border-[#252a35] bg-[#0a0c11] px-3 py-2 text-sm text-[#eef0f5] placeholder-[#3d4455] outline-none focus:border-[#8177f2]"
                />
              </div>

              {/* Time range */}
              <div>
                <label className="mb-1 block text-xs text-[#5e6577]">Time range (optional)</label>
                <div className="flex items-center gap-2">
                  <select
                    value={form.timeFrom}
                    onChange={e => setForm(prev => ({ ...prev, timeFrom: e.target.value }))}
                    className="flex-1 rounded-[8px] border border-[#252a35] bg-[#0a0c11] px-3 py-2 text-sm text-[#eef0f5] outline-none focus:border-[#8177f2]"
                  >
                    <option value="">From</option>
                    {TIME_OPTIONS.map(t => (
                      <option key={t} value={t}>{formatTime(t)}</option>
                    ))}
                  </select>
                  <span className="text-[#5e6577] text-sm">—</span>
                  <select
                    value={form.timeTo}
                    onChange={e => setForm(prev => ({ ...prev, timeTo: e.target.value }))}
                    className="flex-1 rounded-[8px] border border-[#252a35] bg-[#0a0c11] px-3 py-2 text-sm text-[#eef0f5] outline-none focus:border-[#8177f2]"
                  >
                    <option value="">To</option>
                    {TIME_OPTIONS.map(t => (
                      <option key={t} value={t}>{formatTime(t)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="mb-1 block text-xs text-[#5e6577]">Notes (optional)</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any notes for this session…"
                  rows={3}
                  className="w-full rounded-[8px] border border-[#252a35] bg-[#0a0c11] px-3 py-2 text-sm text-[#eef0f5] placeholder-[#3d4455] outline-none focus:border-[#8177f2] resize-none"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 rounded-[8px] border border-[#252a35] py-2 text-sm text-[#98a0b3]">Cancel</button>
              <button
                onClick={handleCreate}
                disabled={!form.title.trim() || saving}
                className="flex-1 rounded-[8px] bg-[#8177f2] py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Add session'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

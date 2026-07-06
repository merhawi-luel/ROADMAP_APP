'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'

const PLATFORMS = [
  {
    key: 'github',
    label: 'GitHub',
    placeholder: 'https://github.com/username',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
      </svg>
    ),
    color: 'text-white',
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    placeholder: 'https://linkedin.com/in/username',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    color: 'text-[#0077b5]',
  },
  {
    key: 'x',
    label: 'X (Twitter)',
    placeholder: 'https://x.com/username',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.857L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    color: 'text-white',
  },
  {
    key: 'instagram',
    label: 'Instagram',
    placeholder: 'https://instagram.com/username',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
    color: 'text-[#e1306c]',
  },
  {
    key: 'telegram',
    label: 'Telegram',
    placeholder: 'https://t.me/username',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
    color: 'text-[#2ca5e0]',
  },
  {
    key: 'leetcode',
    label: 'LeetCode',
    placeholder: 'https://leetcode.com/username',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.823.662s-1.357-.195-1.823-.662l-4.124-4.141c-.468-.467-.617-1.108-.617-1.818s.148-1.352.617-1.818l4.124-4.141c.466-.467 1.111-.662 1.823-.662s1.357.195 1.823.662l2.697 2.607c.31.311.47.72.47 1.131s-.16.82-.47 1.131l-2.697 2.607.003-.007z" />
      </svg>
    ),
    color: 'text-[#ffa116]',
  },
  {
    key: 'codeforces',
    label: 'Codeforces',
    placeholder: 'https://codeforces.com/profile/username',
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
        <path d="M4.5 7.5C5.328 7.5 6 8.172 6 9v10.5c0 .828-.672 1.5-1.5 1.5h-3C.672 21 0 20.328 0 19.5V9c0-.828.672-1.5 1.5-1.5h3zm9-4.5c.828 0 1.5.672 1.5 1.5V19.5c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5V4.5C9 3.672 9.672 3 10.5 3h3zm9 7.5c.828 0 1.5.672 1.5 1.5v9c0 .828-.672 1.5-1.5 1.5h-3c-.828 0-1.5-.672-1.5-1.5V15c0-.828.672-1.5 1.5-1.5h3z" />
      </svg>
    ),
    color: 'text-[#1f8dd6]',
  },
]

interface SocialLinks {
  linkedin?: string
  instagram?: string
  telegram?: string
  leetcode?: string
  codeforces?: string
  github?: string
  x?: string
}

export default function ProfilePage() {
  const [links, setLinks] = useState<SocialLinks>({})
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<SocialLinks>({})
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/profile/social')
      .then(r => r.json())
      .then(data => {
        setLinks(data)
        setForm(data)
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch('/api/profile/social', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      const updated = await res.json()
      setLinks(updated)
      setForm(updated)
      setEditing(false)
    }
    setSaving(false)
  }

  const handleCopy = (url: string, key: string) => {
    navigator.clipboard.writeText(url)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const filledLinks = PLATFORMS.filter(p => links[p.key as keyof SocialLinks])
  const emptyLinks = PLATFORMS.filter(p => !links[p.key as keyof SocialLinks])

  return (
    <div className="min-h-screen bg-[#0a0c11] text-[#eef0f5]">
      <Header />
      <main className="mx-auto max-w-[1200px] px-6 py-12 sm:px-8">
        {/* Page Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#5e6577]">Profile</p>
            <h1 className="mt-2 text-2xl font-semibold text-[#eef0f5]">Social Links</h1>
            <p className="mt-1 text-sm text-[#b0b8cc]">All your profiles in one place — copy any link instantly</p>
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="rounded-[8px] border border-[#252a35] px-4 py-2 text-sm font-medium text-[#b0b8cc] transition hover:border-[#8177f2] hover:text-[#eef0f5]"
            >
              Edit links
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => { setEditing(false); setForm(links) }}
                className="rounded-[8px] border border-[#252a35] px-4 py-2 text-sm font-medium text-[#b0b8cc] transition hover:border-[#3d4455]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-[8px] bg-[#8177f2] px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="text-center py-16 text-[#5e6577]">Loading…</div>
        ) : editing ? (
          /* Edit Form — 2 col grid */
          <div className="grid gap-3 sm:grid-cols-2">
            {PLATFORMS.map(platform => (
              <div key={platform.key} className="flex items-center gap-3 rounded-[10px] border border-[#1b1f29] bg-[#12151c] px-4 py-3">
                <span className={`flex-shrink-0 ${platform.color}`}>{platform.icon}</span>
                <div className="flex flex-1 flex-col min-w-0">
                  <span className="text-xs text-[#5e6577] mb-0.5">{platform.label}</span>
                  <input
                    type="url"
                    value={form[platform.key as keyof SocialLinks] ?? ''}
                    onChange={e => setForm(prev => ({ ...prev, [platform.key]: e.target.value }))}
                    placeholder={platform.placeholder}
                    className="bg-transparent text-sm text-[#eef0f5] placeholder-[#3d4455] outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* View Mode — 2 col grid */
          <div className="space-y-6">
            {filledLinks.length === 0 ? (
              <div className="rounded-[12px] border border-dashed border-[#252a35] py-16 text-center">
                <p className="text-[#5e6577]">No links added yet.</p>
                <button onClick={() => setEditing(true)} className="mt-4 text-sm text-[#8177f2] hover:underline">
                  Add your first link →
                </button>
              </div>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  {filledLinks.map(platform => {
                    const url = links[platform.key as keyof SocialLinks]!
                    return (
                      <div key={platform.key} className="flex items-center gap-4 rounded-[10px] border border-[#1b1f29] bg-[#12151c] px-4 py-3">
                        <span className={`flex-shrink-0 ${platform.color}`}>{platform.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-[#b0b8cc] font-medium">{platform.label}</p>
                          <a href={url} target="_blank" rel="noopener noreferrer" className="block truncate text-sm text-[#eef0f5] transition hover:text-[#8177f2]">
                            {url}
                          </a>
                        </div>
                        <button
                          onClick={() => handleCopy(url, platform.key)}
                          title="Copy link"
                          className="flex-shrink-0 rounded-[6px] border border-[#252a35] p-2 transition hover:border-[#8177f2] hover:text-[#8177f2]"
                        >
                          {copied === platform.key ? (
                            <svg className="h-4 w-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    )
                  })}
                </div>

                {emptyLinks.length > 0 && (
                  <div className="rounded-[10px] border border-dashed border-[#1b1f29] px-4 py-4">
                    <p className="text-xs text-[#5e6577]">
                      Not added yet: {emptyLinks.map(p => p.label).join(', ')}
                    </p>
                    <button onClick={() => setEditing(true)} className="mt-1 text-xs text-[#8177f2] hover:underline">
                      Add them →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

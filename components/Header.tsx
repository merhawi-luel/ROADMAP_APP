'use client'

import Link from 'next/link'
import { signIn, signOut, useSession } from 'next-auth/react'

export default function Header() {
  const { data: session, status } = useSession()
  const signedIn = status === 'authenticated' && session?.user?.email

  return (
    <header className="sticky top-0 z-20 border-b border-[#1b1f29] bg-[#0a0c11]/92 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-[20px] sm:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 text-[17px] font-semibold text-[#eef0f5]" style={{ fontFamily: 'var(--font-display)' }}>
            <img src="/roadmapapp_logo_orange.svg" alt="RoadmapApp logo" className="h-8 w-8 rounded-md object-cover" />
            <span>RoadmapApp</span>
          </Link>
          <nav className="hidden items-center gap-5 text-[14px] text-[#98a0b3] md:flex">
            <Link href="/roadmaps/new" className="transition hover:text-[#eef0f5]">
              New roadmap
            </Link>
            {signedIn && (
              <Link href="/profile" className="transition hover:text-[#eef0f5]">
                Social links
              </Link>
            )}
            {signedIn && (
              <Link href="/planner" className="transition hover:text-[#eef0f5]">
                Planner
              </Link>
            )}
            <Link href="/about" className="transition hover:text-[#eef0f5]">
              About
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {signedIn ? (
            <>
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name ?? 'User avatar'}
                  className="h-8 w-8 rounded-full border border-[#252a35] object-cover"
                />
              ) : null}
              <span className="hidden text-[14px] text-[#98a0b3] sm:inline">
                {session.user.name ?? session.user.email}
              </span>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="rounded-[8px] border border-[#252a35] bg-transparent px-4 py-2 text-[13px] font-semibold text-[#eef0f5] transition hover:border-[#8177f2]"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => signIn('google', { callbackUrl: '/' })}
              className="rounded-[8px] bg-[#8177f2] px-4 py-2 text-[13px] font-semibold text-[#0a0c11] transition hover:brightness-110"
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </header>
  )
}

/**
 * Custom Authentication Error Page
 * Displays error messages when authentication fails
 */

'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

const errorMessages: Record<string, string> = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The verification token has expired or has already been used.',
  Default: 'An error occurred during authentication.',
}

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') || 'Default'
  const errorMessage = errorMessages[error] || errorMessages.Default

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-6 text-zinc-100">
      <div className="w-full max-w-md space-y-8 rounded-3xl border border-zinc-800 bg-zinc-950 p-8 shadow-2xl shadow-black/40">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-950/60">
            <svg
              className="h-6 w-6 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-zinc-50">
            Authentication Error
          </h1>
          <p className="mt-2 text-sm text-zinc-300">{errorMessage}</p>
        </div>

        <div className="mt-8">
          <Link
            href="/auth/signin"
            className="flex w-full items-center justify-center rounded-md bg-white px-4 py-3 text-sm font-semibold text-black shadow-sm hover:bg-zinc-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Try Again
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-300 hover:text-zinc-100"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  )
}

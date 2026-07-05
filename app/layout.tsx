import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '../lib/auth'
import Providers from './providers'
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  variable: '--font-display',
  subsets: ['latin'],
})

const inter = Inter({
  variable: '--font-body',
  subsets: ['latin'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'RoadmapApp - Learning Roadmap Manager',
  description:
    'Create, manage, and track your learning roadmaps with progress analytics and AI assistance',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-black text-zinc-100">
        <Providers session={session}>{children}</Providers>
      </body>
    </html>
  )
}

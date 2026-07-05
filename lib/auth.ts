/**
 * NextAuth.js Configuration for RoadmapApp
 * Configures Google OAuth provider and Prisma adapter for session storage
 */

import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  // Use Prisma adapter for session storage
  adapter: PrismaAdapter(prisma),

  // Configure session strategy to use JWT
  session: {
    strategy: 'jwt',
  },

  // Configure authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],

  // Configure custom pages
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },

  // Configure callbacks for session and JWT tokens
  callbacks: {
    // JWT callback - called when JWT is created or updated
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }

      return token
    },

    // Session callback - called when session is checked
    async session({ session, token }) {
      // Add user ID to session
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
      }

      return session
    },
  },

  // Enable debug mode in development
  debug: process.env.NODE_ENV === 'development',
}

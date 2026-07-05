/**
 * TypeScript type extensions for NextAuth.js
 * Extends default session and JWT types to include user ID
 */

import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  /**
   * Extends the built-in session type to include user ID
   */
  interface Session {
    user: {
      id: string
      name: string
      email: string
      image: string
    }
  }

  /**
   * Extends the built-in user type to include ID
   */
  interface User {
    id: string
  }
}

declare module 'next-auth/jwt' {
  /**
   * Extends the JWT token to include user ID
   */
  interface JWT {
    id: string
  }
}

/**
 * Configuration parsing and validation for RoadmapApp
 * Validates required environment variables and provides type-safe access
 */

export interface Configuration {
  DATABASE_URL: string
  NEXTAUTH_URL: string
  NEXTAUTH_SECRET: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  GEMINI_API_KEY: string
  YOUTUBE_API_KEY: string
}

const REQUIRED_FIELDS: (keyof Configuration)[] = [
  'DATABASE_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GEMINI_API_KEY',
  'YOUTUBE_API_KEY',
]

/**
 * Parse environment variables into a Configuration object
 * @throws Error if any required field is missing or empty
 */
export function parseConfig(env: Record<string, string | undefined>): Configuration {
  const missing: string[] = []

  // Check for missing or empty required fields
  for (const field of REQUIRED_FIELDS) {
    if (!env[field] || env[field]?.trim() === '') {
      missing.push(field)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}. ` +
        `Please check your .env.local file and ensure all required variables are set.`
    )
  }

  return {
    DATABASE_URL: env.DATABASE_URL!,
    NEXTAUTH_URL: env.NEXTAUTH_URL!,
    NEXTAUTH_SECRET: env.NEXTAUTH_SECRET!,
    GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID!,
    GOOGLE_CLIENT_SECRET: env.GOOGLE_CLIENT_SECRET!,
    GEMINI_API_KEY: env.GEMINI_API_KEY!,
    YOUTUBE_API_KEY: env.YOUTUBE_API_KEY!,
  }
}

/**
 * Print Configuration object back to environment variable format
 * Used for serialization and round-trip testing
 */
export function printConfig(config: Configuration): string {
  return Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')
}

/**
 * Validate configuration object
 * @throws Error if validation fails
 */
export function validateConfig(config: Configuration): void {
  const missing: string[] = []

  for (const field of REQUIRED_FIELDS) {
    if (!config[field] || config[field].trim() === '') {
      missing.push(field)
    }
  }

  if (missing.length > 0) {
    throw new Error(`Invalid configuration: missing required fields: ${missing.join(', ')}`)
  }
}

/**
 * Get validated configuration from process.env
 * Safe to use in server-side code
 */
export function getConfig(): Configuration {
  return parseConfig(process.env as Record<string, string | undefined>)
}

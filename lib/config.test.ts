/**
 * Property-based tests for configuration parsing and validation
 * Feature: roadmap-app-complete
 */

import * as fc from 'fast-check'
import { parseConfig, printConfig, validateConfig, Configuration } from './config'

// Custom fast-check generator for valid Configuration objects
const validConfigArbitrary = (): fc.Arbitrary<Configuration> =>
  fc.record({
    DATABASE_URL: fc.webUrl({ validSchemes: ['postgres', 'postgresql'] }),
    NEXTAUTH_URL: fc.webUrl(),
    NEXTAUTH_SECRET: fc.stringMatching(/^[A-Za-z0-9+/]{32,}$/), // Base64-like string
    GOOGLE_CLIENT_ID: fc.stringMatching(/^[0-9]+-[a-z0-9]+\.apps\.googleusercontent\.com$/),
    GOOGLE_CLIENT_SECRET: fc.stringMatching(/^[A-Za-z0-9_-]{24,}$/),
    GEMINI_API_KEY: fc.stringMatching(/^[A-Za-z0-9_-]{32,}$/),
    YOUTUBE_API_KEY: fc.stringMatching(/^[A-Za-z0-9_-]{32,}$/),
  })

// Generator for valid environment variable records
const validEnvArbitrary = (): fc.Arbitrary<Record<string, string>> =>
  validConfigArbitrary().map((config) => config as Record<string, string>)

describe('Configuration Parsing and Validation', () => {
  // Feature: roadmap-app-complete, Property 5: Configuration Round-Trip Preservation
  // Validates: Requirements 12.1, 12.2, 12.3, 12.4
  describe('Property 5: Configuration Round-Trip Preservation', () => {
    test('config → print → parse → print → parse should preserve data', () => {
      fc.assert(
        fc.property(validConfigArbitrary(), (config) => {
          // Round-trip: config → print → parse → print → parse
          const printed1 = printConfig(config)
          const parsed1 = parseConfig(stringToEnv(printed1))
          const printed2 = printConfig(parsed1)
          const parsed2 = parseConfig(stringToEnv(printed2))

          // Deep equality check
          expect(parsed2).toEqual(parsed1)
          expect(printed2).toEqual(printed1)
        }),
        { numRuns: 100 }
      )
    })

    test('parsing then printing then parsing produces equivalent object', () => {
      fc.assert(
        fc.property(validEnvArbitrary(), (env) => {
          const config1 = parseConfig(env)
          const printed = printConfig(config1)
          const config2 = parseConfig(stringToEnv(printed))

          expect(config2).toEqual(config1)
        }),
        { numRuns: 100 }
      )
    })

    test('printing then parsing preserves all fields', () => {
      fc.assert(
        fc.property(validConfigArbitrary(), (config) => {
          const printed = printConfig(config)
          const parsed = parseConfig(stringToEnv(printed))

          // Check all fields are preserved
          expect(parsed.DATABASE_URL).toBe(config.DATABASE_URL)
          expect(parsed.NEXTAUTH_URL).toBe(config.NEXTAUTH_URL)
          expect(parsed.NEXTAUTH_SECRET).toBe(config.NEXTAUTH_SECRET)
          expect(parsed.GOOGLE_CLIENT_ID).toBe(config.GOOGLE_CLIENT_ID)
          expect(parsed.GOOGLE_CLIENT_SECRET).toBe(config.GOOGLE_CLIENT_SECRET)
          expect(parsed.GEMINI_API_KEY).toBe(config.GEMINI_API_KEY)
          expect(parsed.YOUTUBE_API_KEY).toBe(config.YOUTUBE_API_KEY)
        }),
        { numRuns: 100 }
      )
    })
  })

  // Feature: roadmap-app-complete, Property 6: Configuration Required Field Validation
  // Validates: Requirements 12.5, 12.6
  describe('Property 6: Configuration Required Field Validation', () => {
    const requiredFields: (keyof Configuration)[] = [
      'DATABASE_URL',
      'NEXTAUTH_URL',
      'NEXTAUTH_SECRET',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GEMINI_API_KEY',
      'YOUTUBE_API_KEY',
    ]

    test('all required fields present with non-empty values → validation succeeds', () => {
      fc.assert(
        fc.property(validConfigArbitrary(), (config) => {
          // Should not throw
          expect(() => validateConfig(config)).not.toThrow()
        }),
        { numRuns: 100 }
      )
    })

    test('any required field missing → validation fails with descriptive error', () => {
      fc.assert(
        fc.property(
          validConfigArbitrary(),
          fc.constantFrom(...requiredFields),
          (config, fieldToRemove) => {
            // Create config with one field missing
            const incompleteConfig = { ...config }
            delete (incompleteConfig as any)[fieldToRemove]

            // Should throw error
            expect(() => validateConfig(incompleteConfig as Configuration)).toThrow()
          }
        ),
        { numRuns: 100 }
      )
    })

    test('any required field empty → validation fails', () => {
      fc.assert(
        fc.property(
          validConfigArbitrary(),
          fc.constantFrom(...requiredFields),
          (config, fieldToEmpty) => {
            // Create config with one field empty
            const incompleteConfig = { ...config, [fieldToEmpty]: '' }

            // Should throw error
            expect(() => validateConfig(incompleteConfig)).toThrow()
          }
        ),
        { numRuns: 100 }
      )
    })

    test('error message contains the name of missing field', () => {
      fc.assert(
        fc.property(
          validConfigArbitrary(),
          fc.constantFrom(...requiredFields),
          (config, fieldToRemove) => {
            // Create config with one field missing
            const incompleteConfig = { ...config }
            delete (incompleteConfig as any)[fieldToRemove]

            try {
              validateConfig(incompleteConfig as Configuration)
              // Should not reach here
              expect(true).toBe(false)
            } catch (error) {
              const errorMessage = (error as Error).message
              // Error message should contain the field name
              expect(errorMessage.toLowerCase()).toContain(fieldToRemove.toLowerCase())
            }
          }
        ),
        { numRuns: 100 }
      )
    })

    test('parseConfig rejects environment with missing required field', () => {
      fc.assert(
        fc.property(
          validEnvArbitrary(),
          fc.constantFrom(...requiredFields),
          (env, fieldToRemove) => {
            // Remove one required field
            const incompleteEnv = { ...env }
            delete incompleteEnv[fieldToRemove]

            // Should throw error with field name in message
            expect(() => parseConfig(incompleteEnv)).toThrow(fieldToRemove)
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})

// Helper function to convert printed config string to environment object
function stringToEnv(configString: string): Record<string, string> {
  const env: Record<string, string> = {}
  const lines = configString.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim()
      }
    }
  }

  return env
}

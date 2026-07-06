/**
 * Gemini AI integration for RoadmapApp chatbot
 * Provides AI-powered assistance for learning questions
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import { getConfig } from './config'

// Initialize Gemini AI client
let genAI: GoogleGenerativeAI | null = null

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const config = getConfig()
    if (!config.GEMINI_API_KEY || config.GEMINI_API_KEY === 'your-gemini-api-key-here') {
      throw new Error('GEMINI_API_KEY is not configured. Please add your API key to .env.local')
    }
    genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY)
  }
  return genAI
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: Date
}

export interface GenerateResponseOptions {
  maxTokens?: number
  temperature?: number
  timeout?: number
}

/**
 * Generate AI response using Gemini with conversation context
 * @param message - Current user message
 * @param context - Previous conversation messages (last 5-10)
 * @param options - Generation options
 * @returns Promise resolving to AI response
 */
export async function generateResponse(
  message: string,
  context: ChatMessage[] = [],
  options: GenerateResponseOptions = {}
): Promise<string> {
  const {
    maxTokens = 1000,
    temperature = 0.7,
    timeout = 10000, // 10 seconds
  } = options

  try {
    const genAI = getGenAI()
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-pro',
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: temperature,
      },
    })

    // Build conversation context
    const contextPrompt = buildContextPrompt(message, context)

    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('AI response timeout')), timeout)
    })

    // Generate response with timeout
    const responsePromise = model.generateContent(contextPrompt)

    const result = await Promise.race([responsePromise, timeoutPromise])
    const response = await result.response
    const text = response.text()

    if (!text || text.trim().length === 0) {
      throw new Error('Empty response from AI')
    }

    return text.trim()

  } catch (error) {
    console.error('Gemini AI Error:', error)
    
    // Provide fallback responses for common errors
    if (error instanceof Error) {
      console.log('Error message:', error.message)
      console.log('Error details:', error)
      
      if (error.message.includes('timeout')) {
        throw new Error('AI response took too long. Please try again.')
      }
      if (error.message.includes('API key')) {
        throw new Error('AI service is not properly configured.')
      }
      if (error.message.includes('quota') || error.message.includes('limit')) {
        throw new Error('AI service is temporarily unavailable. Please try again later.')
      }
      if (error.message.includes('403')) {
        throw new Error('AI service access denied. Please check API permissions.')
      }
      if (error.message.includes('400')) {
        throw new Error('AI service configuration error. Please check billing and API enablement.')
      }
    }

    throw new Error(`Failed to get AI response: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Build conversation context prompt for Gemini
 * Includes system prompt and recent conversation history
 */
function buildContextPrompt(currentMessage: string, context: ChatMessage[]): string {
  const systemPrompt = `You are a helpful AI assistant for RoadmapApp, a learning roadmap management application. 

Your role is to help users with:
- Learning advice and study strategies
- Organizing and structuring learning paths
- Motivation and goal setting
- General questions about technology, programming, and education
- Using the RoadmapApp features effectively

Keep responses:
- Helpful and encouraging
- Concise but informative (2-3 sentences typically)
- Focused on learning and productivity
- Appropriate for all ages

Current conversation:`

  // Add recent context (last 5 messages for efficiency)
  const recentContext = context.slice(-5)
  let conversationHistory = ''
  
  for (const msg of recentContext) {
    conversationHistory += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`
  }

  // Add current message
  conversationHistory += `User: ${currentMessage}\nAssistant:`

  return `${systemPrompt}\n\n${conversationHistory}`
}

/**
 * Validate Gemini API configuration
 * @returns true if properly configured, false otherwise
 */
export function validateGeminiConfig(): boolean {
  try {
    const config = getConfig()
    const isValid = config.GEMINI_API_KEY && 
                   config.GEMINI_API_KEY !== 'your-gemini-api-key-here' &&
                   (config.GEMINI_API_KEY.startsWith('AIzaSy') || config.GEMINI_API_KEY.startsWith('AQ.')) &&
                   config.GEMINI_API_KEY.length > 20
    
    if (!isValid) {
      console.warn('Gemini API key validation failed. Key format:', config.GEMINI_API_KEY?.substring(0, 5) + '...')
    }
    
    return isValid
  } catch (error) {
    console.error('Gemini config validation error:', error)
    return false
  }
}

/**
 * Test Gemini AI connection
 * @returns Promise resolving to true if connection works
 */
export async function testGeminiConnection(): Promise<boolean> {
  try {
    const response = await generateResponse('Hello', [], { timeout: 5000 })
    return response.length > 0
  } catch {
    return false
  }
}
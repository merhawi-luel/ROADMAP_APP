/**
 * Groq AI integration for RoadmapApp chatbot
 * Provides AI-powered assistance for learning questions using Groq's fast API
 */

import Groq from 'groq-sdk'
import { getConfig } from './config'

// Initialize Groq AI client
let groq: Groq | null = null

function getGroq(): Groq {
  if (!groq) {
    const config = getConfig()
    if (!config.GROQ_API_KEY || config.GROQ_API_KEY === 'your-groq-api-key-here') {
      throw new Error('GROQ_API_KEY is not configured. Please add your API key to .env.local')
    }
    groq = new Groq({
      apiKey: config.GROQ_API_KEY,
    })
  }
  return groq
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
 * Generate AI response using Groq with conversation context
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
    const groq = getGroq()

    // Build conversation messages
    const messages = buildConversationMessages(message, context)

    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('AI response timeout')), timeout)
    })

    // Generate response with timeout
    const responsePromise = groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.1-8b-instant', // Updated to supported model
      max_tokens: maxTokens,
      temperature: temperature,
    })

    const completion = await Promise.race([responsePromise, timeoutPromise])
    const text = completion.choices[0]?.message?.content

    if (!text || text.trim().length === 0) {
      throw new Error('Empty response from AI')
    }

    return text.trim()

  } catch (error) {
    console.error('Groq AI Error:', error)
    console.error('Error type:', typeof error)
    console.error('Error constructor:', error?.constructor?.name)
    
    // Provide fallback responses for common errors
    if (error instanceof Error) {
      console.log('Error message:', error.message)
      console.log('Error stack:', error.stack)
      
      if (error.message.includes('timeout')) {
        throw new Error('AI response took too long. Please try again.')
      }
      if (error.message.includes('API key') || error.message.includes('401') || error.message.includes('Unauthorized')) {
        throw new Error('AI service is not properly configured.')
      }
      if (error.message.includes('quota') || error.message.includes('limit') || error.message.includes('429')) {
        throw new Error('AI service is temporarily unavailable. Please try again later.')
      }
      if (error.message.includes('400') || error.message.includes('Bad Request')) {
        throw new Error('AI service configuration error. Please check request format.')
      }
    }

    throw new Error(`Failed to get AI response: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Build conversation messages for Groq API
 * Includes system prompt and recent conversation history
 */
function buildConversationMessages(currentMessage: string, context: ChatMessage[]): Array<{ role: 'system' | 'user' | 'assistant'; content: string }> {
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
- Appropriate for all ages`

  // Start with system message
  const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    { role: 'system', content: systemPrompt }
  ]

  // Add recent context (last 5 messages for efficiency)
  const recentContext = context.slice(-5)
  for (const msg of recentContext) {
    messages.push({
      role: msg.role,
      content: msg.content
    })
  }

  // Add current message
  messages.push({
    role: 'user',
    content: currentMessage
  })

  return messages
}

/**
 * Validate Groq API configuration
 * @returns true if properly configured, false otherwise
 */
export function validateGroqConfig(): boolean {
  try {
    const config = getConfig()
    const isValid = config.GROQ_API_KEY && 
                   config.GROQ_API_KEY !== 'your-groq-api-key-here' &&
                   config.GROQ_API_KEY.startsWith('gsk_') &&
                   config.GROQ_API_KEY.length > 20
    
    if (!isValid) {
      console.warn('Groq API key validation failed. Key format:', config.GROQ_API_KEY?.substring(0, 5) + '...')
    }
    
    return isValid
  } catch (error) {
    console.error('Groq config validation error:', error)
    return false
  }
}

/**
 * Test Groq AI connection
 * @returns Promise resolving to true if connection works
 */
export async function testGroqConnection(): Promise<boolean> {
  try {
    const response = await generateResponse('Hello', [], { timeout: 5000 })
    return response.length > 0
  } catch {
    return false
  }
}
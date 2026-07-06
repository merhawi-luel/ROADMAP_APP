/**
 * Chatbot API route for Gemini AI integration
 * Handles chat messages and returns AI-generated responses
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateResponse, ChatMessage, validateGroqConfig } from '@/lib/groq'
import { z } from 'zod'

// Request validation schema
const chatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  context: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
    timestamp: z.string().optional(),
  })).optional().default([]),
})

export async function POST(request: NextRequest) {
  try {
    console.log('Chat API: Request received')
    
    // Check authentication (optional - you can remove this if you want public access)
    const session = await getServerSession(authOptions)
    if (!session) {
      console.log('Chat API: No session found')
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    console.log('Chat API: Session found for user:', session.user?.email)

    // Validate Groq configuration
    const isConfigValid = validateGroqConfig()
    console.log('Chat API: Groq config valid:', isConfigValid)
    
    if (!isConfigValid) {
      console.log('Chat API: Groq config validation failed')
      return NextResponse.json(
        { error: 'AI service is not properly configured' },
        { status: 503 }
      )
    }

    // Parse and validate request body
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const validation = chatRequestSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request format', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { message, context } = validation.data

    // Convert context with timestamps
    const chatContext: ChatMessage[] = context.map(msg => ({
      ...msg,
      timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
    }))

    // Generate AI response with retry logic
    let response: string
    let attempt = 0
    const maxAttempts = 2

    while (attempt < maxAttempts) {
      try {
        response = await generateResponse(message, chatContext, {
          timeout: 10000, // 10 seconds
          temperature: 0.7,
          maxTokens: 500,
        })
        console.log('Chat API: AI response received:', response?.substring(0, 50) + '...')
        break
      } catch (error) {
        attempt++
        console.error(`Chat API: Attempt ${attempt} failed:`, error)
        
        if (attempt >= maxAttempts) {
          console.error(`AI response failed after ${maxAttempts} attempts:`, error)
          
          // Return specific error messages
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          console.log('Chat API: Returning error:', errorMessage)
          return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
          )
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    // Return successful response
    return NextResponse.json({
      message: response!,
      timestamp: new Date().toISOString(),
    })

  } catch (error) {
    console.error('Chat API Error:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
}
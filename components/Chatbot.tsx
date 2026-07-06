'use client'

import { useState, useRef, useEffect } from 'react'
import { ChatMessage as ChatMessageType } from '@/lib/groq'

interface ChatbotProps {
  className?: string
}

const QUICK_ACTIONS = [
  'Explain recursion',
  'Study plan for finals',
  'Practice quiz',
]

export default function Chatbot({ className = '' }: ChatbotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessageType[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  useEffect(() => {
    if (isOpen && inputRef.current) inputRef.current.focus()
  }, [isOpen])

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: "Hi! I'm your AI learning assistant. What would you like to study today?",
        timestamp: new Date(),
      }])
    }
  }, [messages.length])

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return

    const userMsg: ChatMessageType = { role: 'user', content: trimmed, timestamp: new Date() }
    setMessages(prev => [...prev, userMsg])
    setInputMessage('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, context: messages.slice(-5) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        timestamp: new Date(data.timestamp),
      }])
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I ran into an error: ${msg}. Please try again.`,
        timestamp: new Date(),
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(inputMessage) }
  }

  // Show quick actions only if there's just the welcome message
  const showQuickActions = messages.length === 1 && messages[0].role === 'assistant'

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end ${className}`}>
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 flex flex-col w-[340px] h-[520px] rounded-2xl overflow-hidden shadow-2xl border border-[#2a2a2a]">
          {/* Header */}
          <div className="bg-[#8177f2] px-4 py-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              {/* Robot icon */}
              <div className="w-9 h-9 rounded-full bg-[#6d63e0] flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5 2.5 2.5 0 0 0 7.5 18a2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 0 7.5 13m9 0a2.5 2.5 0 0 0-2.5 2.5 2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 0 16.5 13z"/>
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">AI learning assistant</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  <span className="text-green-300 text-xs">Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-[#1a1a1a] px-4 py-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`
                  max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
                  ${msg.role === 'user'
                    ? 'bg-[#8177f2] text-white rounded-br-sm'
                    : 'bg-[#2a2a2a] text-[#eef0f5] rounded-bl-sm'
                  }
                `}>
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Loading dots */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#2a2a2a] rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-[#98a0b3] rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-[#98a0b3] rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
                    <div className="w-2 h-2 bg-[#98a0b3] rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick action suggestions + input */}
          <div className="bg-[#1f1f1f] border-t border-[#2a2a2a] px-4 pt-3 pb-4 flex-shrink-0">
            {/* Quick actions - only on first load */}
            {showQuickActions && !isLoading && (
              <div className="flex flex-wrap gap-2 mb-3">
                {QUICK_ACTIONS.map(action => (
                  <button
                    key={action}
                    onClick={() => sendMessage(action)}
                    className="rounded-full border border-[#3a3a3a] bg-[#2a2a2a] px-3 py-1.5 text-xs text-[#eef0f5] transition hover:border-[#8177f2] hover:text-white"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

            {/* Input row */}
            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about learning..."
                disabled={isLoading}
                className="flex-1 rounded-full bg-[#2a2a2a] border border-[#3a3a3a] px-4 py-2.5 text-sm text-[#eef0f5] placeholder-[#5e6577] outline-none focus:border-[#8177f2] disabled:opacity-50 transition"
              />
              <button
                onClick={() => sendMessage(inputMessage)}
                disabled={!inputMessage.trim() || isLoading}
                className="w-10 h-10 flex-shrink-0 rounded-full bg-[#8177f2] flex items-center justify-center text-white transition hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-14 h-14 rounded-full bg-[#8177f2] hover:brightness-110 text-white shadow-lg flex items-center justify-center transition-all hover:scale-105"
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2M7.5 13A2.5 2.5 0 0 0 5 15.5 2.5 2.5 0 0 0 7.5 18a2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 0 7.5 13m9 0a2.5 2.5 0 0 0-2.5 2.5 2.5 2.5 0 0 0 2.5 2.5 2.5 2.5 0 0 0 2.5-2.5A2.5 2.5 0 0 0 16.5 13z"/>
          </svg>
        )}
      </button>
    </div>
  )
}

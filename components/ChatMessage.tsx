/**
 * Individual chat message component
 * Displays user and assistant messages with proper styling
 */

import { ChatMessage as ChatMessageType } from '@/lib/groq'

interface ChatMessageProps {
  message: ChatMessageType
  isLoading?: boolean
}

export default function ChatMessage({ message, isLoading = false }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const timestamp = message.timestamp || new Date()

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`
          max-w-[80%] rounded-lg px-4 py-2 shadow-sm
          ${isUser 
            ? 'bg-orange-500 text-white' 
            : 'bg-gray-50 text-gray-900 border border-gray-300'
          }
          ${isLoading ? 'animate-pulse' : ''}
        `}
      >
        {/* Message content */}
        <div className="whitespace-pre-wrap break-words">
          {message.content}
        </div>
        
        {/* Timestamp */}
        <div
          className={`
            text-xs mt-1 opacity-70
            ${isUser ? 'text-orange-100' : 'text-gray-600'}
          `}
        >
          {formatTime(timestamp)}
        </div>
      </div>
    </div>
  )
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}
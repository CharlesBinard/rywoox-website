import { useState, useRef, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ChatProps } from './Chat.types'
import { GlassCard } from '@/components/ui'
import { TypingIndicator } from '@/components/ui/TypingIndicator'
import { ChatHeader } from './_partials/ChatHeader'
import { ChatMessage } from './_partials/ChatMessage'
import { ChatInput } from './_partials/ChatInput'

export const Chat = ({ messages, isLoading, messagesEndRef, onSendMessage }: ChatProps) => {
  const [inputValue, setInputValue] = useState('')
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // Prevent page scroll when clicking the input inside the chat
  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (container.contains(target)) {
        // Ensure the chat container doesn't bubble focus events that cause page scroll
        e.stopPropagation()
      }
    }

    container.addEventListener('focusin', handleFocus, true)
    return () => container.removeEventListener('focusin', handleFocus, true)
  }, [])

  const handleSendMessage = (message: string) => {
    onSendMessage(message)
  }

  return (
    <div className="max-w-4xl mx-auto fade-in-up">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
          Rywoox Assistant
        </h2>
        <p className="text-gray-400 max-w-md mx-auto">
          Ask me anything about Charles Binard — his projects, skills, experience...
        </p>
      </div>

      <GlassCard glowBorder padding="none" className="overflow-hidden">
        <ChatHeader />

        {/* Chat messages area — self-contained scrolling, no viewport interference */}
        <div
          ref={messagesContainerRef}
          className="h-[500px] overflow-y-auto p-6 space-y-4 chat-scroll"
        >
          <AnimatePresence mode="popLayout">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center text-gray-500 mt-20"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-6xl mb-4"
                >
                  🤖
                </motion.div>
                <p className="text-lg">Start a conversation about Rywoox!</p>
                <p className="text-sm mt-2 text-gray-600">I can tell you about his projects, skills, and more</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                id={message.id}
                role={message.role}
                content={message.content}
                timestamp={message.timestamp}
              />
            ))}
          </AnimatePresence>

          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-start"
            >
              <div className="bg-dark-card border border-dark-border rounded-2xl px-5 py-4">
                <TypingIndicator />
              </div>
            </motion.div>
          )}

            <div ref={messagesEndRef} className="h-px" />
        </div>

        <div className="border-t border-dark-border p-4 bg-dark-bg/50">
          <ChatInput
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSendMessage}
            isLoading={isLoading}
          />
        </div>
      </GlassCard>
    </div>
  )
}

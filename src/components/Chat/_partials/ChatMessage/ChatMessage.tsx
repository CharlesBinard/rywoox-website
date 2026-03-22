import { motion } from 'framer-motion'
import type { ChatMessageProps } from './ChatMessage.types'

export const ChatMessage = ({ role, content, timestamp }: ChatMessageProps) => {
  const isUser = role === 'user'

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`
          max-w-[80%] rounded-2xl px-4 py-3 relative group
          ${
            isUser
              ? 'bg-gradient-to-r from-neon-cyan to-neon-purple text-black'
              : 'bg-dark-card border border-dark-border'
          }
        `}
      >
        <p className="whitespace-pre-wrap break-words">{content}</p>

        <div
          className={`
            flex items-center justify-between mt-2 gap-4 text-xs
            ${isUser ? 'text-black/50' : 'text-gray-500'}
          `}
        >
          <span>{timestamp.toLocaleTimeString()}</span>
          <button
            onClick={copyToClipboard}
            className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-neon-cyan"
            title="Copy message"
          >
            📋
          </button>
        </div>
      </div>
    </motion.div>
  )
}

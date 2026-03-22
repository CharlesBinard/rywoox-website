export interface ChatMessageProps {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

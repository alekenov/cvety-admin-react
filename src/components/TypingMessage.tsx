import { useTypingEffect } from '../hooks/useTypingEffect'
import { cn } from '../lib/utils'

interface TypingMessageProps {
  content: string
  className?: string
  speed?: number
  delay?: number
  onComplete?: () => void
}

export function TypingMessage({ 
  content, 
  className, 
  speed = 30, 
  delay = 0,
  onComplete 
}: TypingMessageProps) {
  const { displayedText, isTyping, isComplete } = useTypingEffect(content, speed, delay)

  // Call onComplete when typing is finished
  if (isComplete && onComplete) {
    setTimeout(onComplete, 100)
  }

  return (
    <div className={cn("relative", className)}>
      <p className="whitespace-pre-wrap">{displayedText}</p>
      {isTyping && (
        <span className="inline-block w-2 h-5 bg-current ml-1 animate-pulse" />
      )}
    </div>
  )
}
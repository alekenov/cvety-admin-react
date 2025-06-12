import { useState, useEffect } from 'react'

export function useTypingEffect(text: string, speed: number = 50, delay: number = 0) {
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (!text) return

    setDisplayedText('')
    setIsTyping(false)
    setIsComplete(false)

    const startTyping = () => {
      setIsTyping(true)
      let currentIndex = 0

      const typeCharacter = () => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1))
          currentIndex++
          setTimeout(typeCharacter, speed)
        } else {
          setIsTyping(false)
          setIsComplete(true)
        }
      }

      typeCharacter()
    }

    const timer = setTimeout(startTyping, delay)
    return () => clearTimeout(timer)
  }, [text, speed, delay])

  return { displayedText, isTyping, isComplete }
}

export function useStreamingText(initialText: string = '') {
  const [text, setText] = useState(initialText)
  const [isStreaming, setIsStreaming] = useState(false)

  const startStreaming = () => {
    setIsStreaming(true)
    setText('')
  }

  const appendText = (chunk: string) => {
    setText(prev => prev + chunk)
  }

  const stopStreaming = () => {
    setIsStreaming(false)
  }

  const resetText = () => {
    setText('')
    setIsStreaming(false)
  }

  return {
    text,
    isStreaming,
    startStreaming,
    appendText,
    stopStreaming,
    resetText
  }
}
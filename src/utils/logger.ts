// Система логирования для чата
interface LogEntry {
  timestamp: string
  type: 'user_message' | 'ai_response' | 'api_request' | 'api_response' | 'error' | 'cache_hit' | 'fallback'
  sessionId: string
  data: any
  duration?: number
}

class ChatLogger {
  private logs: LogEntry[] = []
  private sessionId: string

  constructor(sessionId: string) {
    this.sessionId = sessionId
  }

  private formatTimestamp(): string {
    return new Date().toISOString()
  }

  log(type: LogEntry['type'], data: any, duration?: number) {
    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      type,
      sessionId: this.sessionId,
      data,
      duration
    }
    
    this.logs.push(entry)
    
    // Консольное логирование с красивым форматированием
    const emoji = this.getEmoji(type)
    const color = this.getColor(type)
    
    console.group(`${emoji} [${type.toUpperCase()}] ${entry.timestamp}`)
    console.log(`%c${JSON.stringify(data, null, 2)}`, `color: ${color}`)
    if (duration) {
      console.log(`⏱️ Duration: ${duration}ms`)
    }
    console.groupEnd()
    
    // Сохраняем в localStorage для экспорта
    this.saveToStorage()
  }

  private getEmoji(type: LogEntry['type']): string {
    const emojis: Record<string, string> = {
      user_message: '👤',
      ai_response: '🤖',
      api_request: '📤',
      api_response: '📥',
      error: '❌',
      cache_hit: '⚡',
      fallback: '🔄'
    }
    return emojis[type] || '📝'
  }

  private getColor(type: LogEntry['type']): string {
    const colors: Record<string, string> = {
      user_message: '#2563eb',
      ai_response: '#059669',
      api_request: '#dc2626',
      api_response: '#16a34a',
      error: '#dc2626',
      cache_hit: '#f59e0b',
      fallback: '#6b7280'
    }
    return colors[type] || '#000000'
  }

  private saveToStorage() {
    try {
      localStorage.setItem(`chat_logs_${this.sessionId}`, JSON.stringify(this.logs))
    } catch (error) {
      console.warn('Не удалось сохранить логи в localStorage:', error)
    }
  }

  // Экспорт логов
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2)
  }

  // Получить статистику
  getStats() {
    const stats = {
      totalMessages: this.logs.filter(l => l.type === 'user_message').length,
      aiResponses: this.logs.filter(l => l.type === 'ai_response').length,
      apiCalls: this.logs.filter(l => l.type === 'api_request').length,
      cacheHits: this.logs.filter(l => l.type === 'cache_hit').length,
      errors: this.logs.filter(l => l.type === 'error').length,
      fallbacks: this.logs.filter(l => l.type === 'fallback').length,
      avgResponseTime: 0
    }

    const responseTimes = this.logs
      .filter(l => l.duration && typeof l.duration === 'number')
      .map(l => l.duration as number)
    
    if (responseTimes.length > 0) {
      stats.avgResponseTime = Math.round(
        responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      )
    }

    return stats
  }

  // Очистить логи
  clearLogs() {
    this.logs = []
    localStorage.removeItem(`chat_logs_${this.sessionId}`)
    console.clear()
    console.log('🧹 Логи очищены')
  }

  // Получить последние N записей
  getRecentLogs(count: number = 10) {
    return this.logs.slice(-count)
  }

  // Поиск по логам
  searchLogs(query: string) {
    try {
      return this.logs.filter(log => {
        const dataStr = JSON.stringify(log.data || {})
        return dataStr.toLowerCase().includes(query.toLowerCase())
      })
    } catch (error) {
      console.warn('Ошибка поиска в логах:', error)
      return []
    }
  }
}

// Глобальный экземпляр логгера
let globalLogger: ChatLogger | null = null

export function createLogger(sessionId: string): ChatLogger {
  globalLogger = new ChatLogger(sessionId)
  
  // Добавляем логгер в window для доступа из консоли
  try {
    if (typeof window !== 'undefined') {
      (window as any).chatLogger = globalLogger
    }
  } catch (error) {
    // Игнорируем ошибки window в SSR
  }
  
  console.log('🚀 Chat Logger инициализирован')
  console.log('💡 Используйте window.chatLogger для доступа к логам из консоли')
  console.log('📊 Команды: exportLogs(), getStats(), clearLogs(), searchLogs("query")')
  
  return globalLogger
}

export function getLogger(): ChatLogger | null {
  return globalLogger
}
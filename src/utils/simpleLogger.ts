// Упрощенная версия логгера
export class SimpleLogger {
  private logs: any[] = []
  private sessionId: string

  constructor(sessionId: string) {
    this.sessionId = sessionId
  }

  log(type: string, data: any, duration?: number) {
    const entry = {
      timestamp: new Date().toISOString(),
      type,
      sessionId: this.sessionId,
      data,
      duration
    }
    
    this.logs.push(entry)
    console.log(`[${type}]`, data)
    
    // Сохраняем в localStorage
    try {
      localStorage.setItem(`simple_logs_${this.sessionId}`, JSON.stringify(this.logs))
    } catch (error) {
      // Игнорируем ошибки localStorage
    }
  }

  exportLogs() {
    return JSON.stringify(this.logs, null, 2)
  }

  getStats() {
    return {
      totalMessages: this.logs.filter(l => l.type === 'user_message').length,
      aiResponses: this.logs.filter(l => l.type === 'ai_response').length,
      apiCalls: this.logs.filter(l => l.type === 'api_request').length,
      cacheHits: this.logs.filter(l => l.type === 'cache_hit').length,
      errors: this.logs.filter(l => l.type === 'error').length,
      avgResponseTime: 0
    }
  }

  clearLogs() {
    this.logs = []
  }

  getRecentLogs(count = 10) {
    return this.logs.slice(-count)
  }
}

let globalLogger: SimpleLogger | null = null

export function createSimpleLogger(sessionId: string): SimpleLogger {
  globalLogger = new SimpleLogger(sessionId)
  
  if (typeof window !== 'undefined') {
    (window as any).chatLogger = globalLogger
  }
  
  console.log('🚀 Simple Logger инициализирован')
  return globalLogger
}

export function getSimpleLogger(): SimpleLogger | null {
  return globalLogger
}
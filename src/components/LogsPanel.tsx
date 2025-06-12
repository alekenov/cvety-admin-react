import { useState, useEffect } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { getSimpleLogger } from '../utils/simpleLogger'

export function LogsPanel() {
  const [logs, setLogs] = useState<any[]>([])
  const [stats, setStats] = useState<any>({})
  const [isExpanded, setIsExpanded] = useState(false)
  const logger = getSimpleLogger()

  useEffect(() => {
    if (!logger) return

    const interval = setInterval(() => {
      setLogs(logger.getRecentLogs(20))
      setStats(logger.getStats())
    }, 1000)

    return () => clearInterval(interval)
  }, [logger])

  if (!logger) return null

  const exportLogs = () => {
    const logsData = logger.exportLogs()
    const blob = new Blob([logsData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-logs-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(logger.exportLogs())
    alert('Логи скопированы в буфер обмена!')
  }

  const getTypeColor = (type: string) => {
    const colors = {
      user_message: 'bg-blue-100 text-blue-800',
      ai_response: 'bg-green-100 text-green-800',
      api_request: 'bg-red-100 text-red-800',
      api_response: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      cache_hit: 'bg-yellow-100 text-yellow-800',
      fallback: 'bg-gray-100 text-gray-800'
    }
    return colors[type] || 'bg-gray-100 text-gray-800'
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">📊 Логи чата</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? 'Свернуть' : 'Развернуть'}
          </Button>
          <Button size="sm" variant="outline" onClick={copyToClipboard}>
            📋 Копировать
          </Button>
          <Button size="sm" variant="outline" onClick={exportLogs}>
            💾 Экспорт
          </Button>
          <Button size="sm" variant="outline" onClick={() => logger.clearLogs()}>
            🧹 Очистить
          </Button>
        </div>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-4 gap-2 mb-4 text-sm">
        <div className="text-center p-2 bg-blue-50 rounded">
          <div className="font-bold text-blue-600">{stats.totalMessages}</div>
          <div className="text-blue-500">Сообщений</div>
        </div>
        <div className="text-center p-2 bg-green-50 rounded">
          <div className="font-bold text-green-600">{stats.apiCalls}</div>
          <div className="text-green-500">API вызовов</div>
        </div>
        <div className="text-center p-2 bg-yellow-50 rounded">
          <div className="font-bold text-yellow-600">{stats.cacheHits}</div>
          <div className="text-yellow-500">Из кеша</div>
        </div>
        <div className="text-center p-2 bg-gray-50 rounded">
          <div className="font-bold text-gray-600">{stats.avgResponseTime}ms</div>
          <div className="text-gray-500">Среднее время</div>
        </div>
      </div>

      {/* Логи */}
      {isExpanded && (
        <div className="max-h-96 overflow-y-auto space-y-2">
          {logs.map((log, index) => (
            <div key={index} className="text-xs border rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <Badge className={getTypeColor(log.type)}>
                  {log.type}
                </Badge>
                <span className="text-gray-500">
                  {new Date(log.timestamp).toLocaleTimeString()}
                  {log.duration && ` (${log.duration}ms)`}
                </span>
              </div>
              <pre className="whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded">
                {JSON.stringify(log.data, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}

      {!isExpanded && logs.length > 0 && (
        <div className="text-sm text-gray-500">
          Последний лог: {logs[logs.length - 1]?.type} в{' '}
          {new Date(logs[logs.length - 1]?.timestamp).toLocaleTimeString()}
        </div>
      )}
    </Card>
  )
}
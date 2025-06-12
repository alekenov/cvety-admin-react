import { useState } from 'react'
import { ChatInterface } from './components/ChatInterface'
import { AdminPanel } from './components/AdminPanel'
import { Button } from './components/ui/button'
import { MessageSquare, Settings } from 'lucide-react'

function App() {
  const [view, setView] = useState<'chat' | 'admin'>('chat')

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Cvety.kz AI Assistant</h1>
            <div className="flex gap-2">
              <Button
                variant={view === 'chat' ? 'default' : 'outline'}
                onClick={() => setView('chat')}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Чат
              </Button>
              <Button
                variant={view === 'admin' ? 'default' : 'outline'}
                onClick={() => setView('admin')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Админка
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {view === 'chat' ? <ChatInterface /> : <AdminPanel />}
      </main>
    </div>
  )
}

export default App
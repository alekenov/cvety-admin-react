import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Plus, Package, ShoppingCart, BarChart3, Search, FileText } from 'lucide-react'
import { LogsPanel } from './LogsPanel'
// import type { ProductDialog } from './ProductDialog'
// import { OrdersTable } from './OrdersTable'

interface Stats {
  totalProducts: number
  activeOrders: number
  todayRevenue: number
  totalOrders: number
}

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'analytics' | 'logs'>('products')
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    activeOrders: 0,
    todayRevenue: 0,
    totalOrders: 0
  })
  // const [showProductDialog, setShowProductDialog] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Load stats from API
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // This will be replaced with actual API call
      setStats({
        totalProducts: 12,
        activeOrders: 3,
        todayRevenue: 125500,
        totalOrders: 156
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Всего товаров
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              В наличии
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Активные заказы
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground">
              В доставке
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Выручка сегодня
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.todayRevenue.toLocaleString('ru-RU')} ₸
            </div>
            <p className="text-xs text-muted-foreground">
              +12% от вчера
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Всего заказов
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              За все время
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b">
        <Button
          variant={activeTab === 'products' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('products')}
          className="rounded-b-none"
        >
          <Package className="h-4 w-4 mr-2" />
          Товары
        </Button>
        <Button
          variant={activeTab === 'orders' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('orders')}
          className="rounded-b-none"
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Заказы
        </Button>
        <Button
          variant={activeTab === 'analytics' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('analytics')}
          className="rounded-b-none"
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Аналитика
        </Button>
        <Button
          variant={activeTab === 'logs' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('logs')}
          className="rounded-b-none"
        >
          <FileText className="h-4 w-4 mr-2" />
          Логи чата
        </Button>
      </div>

      {/* Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {activeTab === 'products' && 'Управление товарами'}
                {activeTab === 'orders' && 'Управление заказами'}
                {activeTab === 'analytics' && 'Аналитика'}
                {activeTab === 'logs' && 'Логи чата'}
              </CardTitle>
              <CardDescription>
                {activeTab === 'products' && 'Добавляйте и редактируйте букеты'}
                {activeTab === 'orders' && 'Отслеживайте и управляйте заказами'}
                {activeTab === 'analytics' && 'Статистика и метрики'}
                {activeTab === 'logs' && 'Подробные логи AI чата для отладки'}
              </CardDescription>
            </div>
            {activeTab === 'products' && (
              <Button onClick={() => console.log('Add product')}>
                <Plus className="h-4 w-4 mr-2" />
                Добавить товар
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Search bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Поиск..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Tab content */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Список товаров будет здесь...
              </p>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>Таблица заказов (в разработке)</div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Графики и статистика будут здесь...
              </p>
            </div>
          )}

          {activeTab === 'logs' && (
            <LogsPanel />
          )}
        </CardContent>
      </Card>

      {/* Product Dialog */}
      {/* <ProductDialog 
        open={showProductDialog} 
        onOpenChange={setShowProductDialog}
      /> */}
    </div>
  )
}
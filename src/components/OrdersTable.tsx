import { useState, useEffect } from 'react'
import { Button } from './ui/button'
// import { Badge } from './ui/badge'
import { Eye } from 'lucide-react'

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  status: string
  total_amount: number
  delivery_date: string
  delivery_address: string
}

interface OrdersTableProps {
  searchQuery: string
}

const statusLabels: Record<string, string> = {
  'new': 'Новый',
  'confirmed': 'Подтвержден',
  'in_preparation': 'Готовится',
  'ready': 'Готов',
  'in_delivery': 'В доставке',
  'delivered': 'Доставлен',
  'cancelled': 'Отменен'
}

const statusColors: Record<string, string> = {
  'new': 'bg-blue-100 text-blue-800',
  'confirmed': 'bg-yellow-100 text-yellow-800',
  'in_preparation': 'bg-purple-100 text-purple-800',
  'ready': 'bg-green-100 text-green-800',
  'in_delivery': 'bg-orange-100 text-orange-800',
  'delivered': 'bg-green-500 text-white',
  'cancelled': 'bg-red-100 text-red-800'
}

export function OrdersTable({ searchQuery }: OrdersTableProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('https://faq-demo.cvety.kz/api/orders')
      const data = await response.json()
      
      if (data.success) {
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => 
    order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer_phone.includes(searchQuery)
  )

  if (loading) {
    return <div>Загрузка заказов...</div>
  }

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-muted">
          <tr>
            <th className="px-6 py-3">Номер заказа</th>
            <th className="px-6 py-3">Клиент</th>
            <th className="px-6 py-3">Телефон</th>
            <th className="px-6 py-3">Статус</th>
            <th className="px-6 py-3">Сумма</th>
            <th className="px-6 py-3">Доставка</th>
            <th className="px-6 py-3">Действия</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.map((order) => (
            <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
              <td className="px-6 py-4 font-medium">
                {order.order_number}
              </td>
              <td className="px-6 py-4">
                {order.customer_name}
              </td>
              <td className="px-6 py-4">
                {order.customer_phone}
              </td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                  {statusLabels[order.status] || order.status}
                </span>
              </td>
              <td className="px-6 py-4">
                {order.total_amount.toLocaleString('ru-RU')} ₸
              </td>
              <td className="px-6 py-4">
                {new Date(order.delivery_date).toLocaleDateString('ru-RU')}
              </td>
              <td className="px-6 py-4">
                <Button variant="ghost" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {filteredOrders.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Заказы не найдены
        </div>
      )}
    </div>
  )
}
import { useState } from 'react'
import type { OrderForm as OrderFormType } from '../types'
import { useCart } from '../hooks/useCart'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { ArrowLeft, CreditCard, Banknote } from 'lucide-react'

interface OrderFormProps {
  onSubmit: (order: OrderFormType) => void
  onBack: () => void
  loading?: boolean
}

export function OrderForm({ onSubmit, onBack, loading = false }: OrderFormProps) {
  const { cart } = useCart()
  const [formData, setFormData] = useState<OrderFormType>({
    phone: '',
    address: '',
    deliveryDate: new Date().toISOString().split('T')[0],
    deliveryTime: '14:00',
    paymentMethod: 'kaspi',
    comment: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleInputChange = (field: keyof OrderFormType, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const isValid = formData.phone && formData.address

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-xl font-semibold">Оформление заказа</h2>
      </div>

      {/* Order Summary */}
      <div className="bg-muted p-4 rounded-lg mb-6">
        <h3 className="font-medium mb-3">Ваш заказ:</h3>
        <div className="space-y-2">
          {cart.items.map(item => (
            <div key={item.product.id} className="flex justify-between text-sm">
              <span>{item.product.name} × {item.quantity}</span>
              <span>{(item.product.price * item.quantity).toLocaleString('ru-RU')}₸</span>
            </div>
          ))}
          <div className="border-t pt-2 flex justify-between font-semibold">
            <span>Итого:</span>
            <span>{cart.total.toLocaleString('ru-RU')}₸</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Phone */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Телефон *
          </label>
          <Input
            type="tel"
            placeholder="+7 777 123 4567"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            required
          />
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Адрес доставки *
          </label>
          <Input
            placeholder="ул. Абая 123, кв. 45"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            required
          />
        </div>

        {/* Delivery Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Дата доставки
            </label>
            <Input
              type="date"
              value={formData.deliveryDate}
              onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Время доставки
            </label>
            <select
              className="w-full px-3 py-2 border border-border rounded-md"
              value={formData.deliveryTime}
              onChange={(e) => handleInputChange('deliveryTime', e.target.value)}
            >
              <option value="10:00">10:00 - 12:00</option>
              <option value="12:00">12:00 - 14:00</option>
              <option value="14:00">14:00 - 16:00</option>
              <option value="16:00">16:00 - 18:00</option>
              <option value="18:00">18:00 - 20:00</option>
            </select>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Способ оплаты
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-muted">
              <input
                type="radio"
                name="paymentMethod"
                value="kaspi"
                checked={formData.paymentMethod === 'kaspi'}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                className="mr-2"
              />
              <CreditCard className="w-4 h-4 mr-2" />
              <span>Kaspi QR</span>
            </label>
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-muted">
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={formData.paymentMethod === 'cash'}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                className="mr-2"
              />
              <Banknote className="w-4 h-4 mr-2" />
              <span>Наличными</span>
            </label>
          </div>
          
          {/* Kaspi payment info */}
          {formData.paymentMethod === 'kaspi' && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                💳 <strong>Оплата через Kaspi QR</strong>
              </p>
              <p className="text-xs text-blue-600">
                После подтверждения заказа на номер <strong>{formData.phone}</strong> будет отправлена ссылка для оплаты через Kaspi.
              </p>
              {!formData.phone && (
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ Укажите номер телефона для получения ссылки на оплату
                </p>
              )}
            </div>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Комментарий к заказу
          </label>
          <textarea
            className="w-full px-3 py-2 border border-border rounded-md resize-none"
            rows={3}
            placeholder="Особые пожелания к доставке..."
            value={formData.comment}
            onChange={(e) => handleInputChange('comment', e.target.value)}
          />
        </div>

        <Button
          type="submit"
          disabled={!isValid || loading}
          className="w-full"
          size="lg"
        >
          {loading ? 'Оформляем заказ...' : `Подтвердить заказ (${cart.total.toLocaleString('ru-RU')}₸)`}
        </Button>
      </form>
    </Card>
  )
}
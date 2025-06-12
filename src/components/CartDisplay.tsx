import { useCart } from '../hooks/useCart'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { ShoppingCart, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react'

interface CartDisplayProps {
  onCheckout?: () => void
  compact?: boolean
}

export function CartDisplay({ onCheckout, compact = false }: CartDisplayProps) {
  const { cart, updateQuantity, removeFromCart, clearCart, getItemCount } = useCart()

  if (cart.items.length === 0) {
    return (
      <Card className="p-4">
        <div className="text-center text-muted-foreground">
          <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Корзина пуста</p>
          <p className="text-sm">Добавьте товары для оформления заказа</p>
        </div>
      </Card>
    )
  }

  if (compact) {
    return (
      <Card className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            <span className="font-medium">{getItemCount()} товаров</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold">{cart.total.toLocaleString('ru-RU')}₸</span>
            <Button size="sm" onClick={onCheckout}>
              Оформить
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ShoppingCart className="w-5 h-5" />
          Ваша корзина
        </h3>
        <Badge variant="secondary">
          {getItemCount()} товаров
        </Badge>
      </div>

      <div className="space-y-3 mb-4">
        {cart.items.map((item) => (
          <div key={item.product.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
            <img
              src={item.product.image}
              alt={item.product.name}
              className="w-16 h-16 object-cover rounded"
            />
            
            <div className="flex-1">
              <h4 className="font-medium">{item.product.name}</h4>
              <p className="text-sm text-muted-foreground">
                {item.product.price.toLocaleString('ru-RU')}₸ за шт.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
              >
                <Minus className="w-3 h-3" />
              </Button>
              
              <span className="min-w-[2rem] text-center font-medium">
                {item.quantity}
              </span>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>

            <div className="text-right">
              <p className="font-medium">
                {(item.product.price * item.quantity).toLocaleString('ru-RU')}₸
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => removeFromCart(item.product.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-lg font-semibold">Итого:</span>
          <span className="text-2xl font-bold text-primary">
            {cart.total.toLocaleString('ru-RU')}₸
          </span>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={clearCart}
            className="flex-1"
          >
            Очистить корзину
          </Button>
          <Button
            onClick={onCheckout}
            className="flex-1"
          >
            Оформить заказ
          </Button>
        </div>
      </div>
    </Card>
  )
}
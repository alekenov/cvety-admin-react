import type { Product } from '../types'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Star, ShoppingCart } from 'lucide-react'
import { useCart } from '../hooks/useCart'

interface ProductCardProps {
  product: Product
  onAddToCart?: (product: Product) => void
  showAddToCart?: boolean
}

export function ProductCard({ product, onAddToCart, showAddToCart = true }: ProductCardProps) {
  const { addToCart } = useCart()

  const handleAddToCart = () => {
    addToCart(product)
    onAddToCart?.(product)
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover"
          loading="lazy"
        />
        {product.isPopular && (
          <Badge className="absolute top-2 left-2 bg-orange-500">
            ⭐ Хит продаж
          </Badge>
        )}
        {!product.inStock && (
          <Badge className="absolute top-2 right-2 bg-red-500">
            Нет в наличии
          </Badge>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
        
        {product.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl font-bold text-primary">
            {product.price.toLocaleString('ru-RU')}₸
          </span>
          
          {product.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm">{product.rating}</span>
            </div>
          )}
        </div>

        {showAddToCart && (
          <Button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="w-full"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {product.inStock ? 'В корзину' : 'Нет в наличии'}
          </Button>
        )}
      </div>
    </Card>
  )
}
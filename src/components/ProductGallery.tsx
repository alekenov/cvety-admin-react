import type { Product } from '../types'
import { ProductCard } from './ProductCard'
import { Button } from './ui/button'
import { Grid, List } from 'lucide-react'
import { useState } from 'react'

interface ProductGalleryProps {
  products: Product[]
  onProductSelect?: (product: Product) => void
  title?: string
}

export function ProductGallery({ products, onProductSelect, title }: ProductGalleryProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Товары не найдены</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {title && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <div className="flex gap-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <div className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'space-y-3'
      }>
        {products.map((product) => (
          <div key={product.id} onClick={() => onProductSelect?.(product)}>
            <ProductCard 
              product={product} 
              onAddToCart={(product) => {
                // Handle add to cart with toast notification
                console.log('Added to cart:', product.name)
              }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
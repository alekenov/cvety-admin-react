import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import { X } from 'lucide-react'

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductDialog({ open, onOpenChange }: ProductDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: 'roses',
    stock: '10',
    imageUrl: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // API call to add product
      const response = await fetch('https://faq-demo.cvety.kz/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': 'your-admin-password' // This should be stored securely
        },
        body: JSON.stringify({
          name: formData.name,
          price: parseInt(formData.price),
          description: formData.description,
          category: `cat-${formData.category}`,
          stock_quantity: parseInt(formData.stock),
          image_url: formData.imageUrl,
          tags: JSON.stringify([formData.category, 'новинка']),
          attributes: JSON.stringify({})
        })
      })

      if (response.ok) {
        // Reset form and close dialog
        setFormData({
          name: '',
          price: '',
          description: '',
          category: 'roses',
          stock: '10',
          imageUrl: ''
        })
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Error adding product:', error)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Добавить новый товар</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Заполните информацию о новом букете
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Название</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="25 красных роз"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Цена (тенге)</label>
              <Input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="15000"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Описание</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Премиальные розы из Эквадора..."
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Категория</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="roses">Розы</option>
                <option value="tulips">Тюльпаны</option>
                <option value="bouquets">Букеты</option>
                <option value="gift-boxes">Подарочные коробки</option>
                <option value="wedding">Свадебные букеты</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Количество</label>
              <Input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                placeholder="10"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium">Ссылка на фото</label>
              <Input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://example.com/photo.jpg"
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex gap-2">
            <Button type="submit" className="flex-1">
              Добавить товар
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Отмена
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
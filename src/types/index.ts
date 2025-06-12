// Экспорт типов для Vite/ES модулей
export type Product = {
  id: string
  name: string
  price: number
  image: string
  description?: string
  category: string
  inStock: boolean
  rating?: number
  isPopular?: boolean
}

export type CartItem = {
  product: Product
  quantity: number
}

export type Cart = {
  items: CartItem[]
  total: number
}

export type OrderForm = {
  phone: string
  address: string
  deliveryDate: string
  deliveryTime: string
  paymentMethod: 'kaspi' | 'cash'
  comment?: string
}

export type Order = OrderForm & {
  id: string
  items: CartItem[]
  total: number
  status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered' | 'cancelled'
  createdAt: Date
}
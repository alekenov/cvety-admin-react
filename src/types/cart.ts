// Определяем типы
interface Product {
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

interface CartItem {
  product: Product
  quantity: number
}

interface Cart {
  items: CartItem[]
  total: number
}

interface OrderForm {
  phone: string
  address: string
  deliveryDate: string
  deliveryTime: string
  paymentMethod: 'kaspi' | 'cash'
  comment?: string
}

interface Order extends OrderForm {
  id: string
  items: CartItem[]
  total: number
  status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'delivered' | 'cancelled'
  createdAt: Date
}

// Экспортируем типы
export { Product, CartItem, Cart, OrderForm, Order }
export type { Product as ProductType, CartItem as CartItemType, Cart as CartType, OrderForm as OrderFormType, Order as OrderType }
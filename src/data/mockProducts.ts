import type { Product } from '../types'

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Красные розы "Страсть"',
    price: 15000,
    image: 'https://images.unsplash.com/photo-1565485117423-84d0b0c1c34c?w=400&h=300&fit=crop',
    description: '25 красных роз премиум класса, 60 см',
    category: 'Розы',
    inStock: true,
    rating: 4.9,
    isPopular: true
  },
  {
    id: '2',
    name: 'Белые розы "Невеста"',
    price: 18500,
    image: 'https://images.unsplash.com/photo-1511799739531-40d9526b4e5d?w=400&h=300&fit=crop',
    description: '31 белая роза, идеально для свадьбы и торжеств',
    category: 'Розы',
    inStock: true,
    rating: 4.8
  },
  {
    id: '3',
    name: 'Микс роз "Радуга"',
    price: 12000,
    image: 'https://images.unsplash.com/photo-1463320898766-4665b12aa1a4?w=400&h=300&fit=crop',
    description: '21 роза разных цветов - яркий букет для особых моментов',
    category: 'Розы',
    inStock: true,
    rating: 4.7
  },
  {
    id: '4',
    name: 'Букет "Нежность"',
    price: 8500,
    image: 'https://images.unsplash.com/photo-1520271348391-049dd132bb7c?w=400&h=300&fit=crop',
    description: 'Нежный букет из хризантем и роз',
    category: 'Смешанные',
    inStock: true,
    rating: 4.6,
    isPopular: true
  },
  {
    id: '5',
    name: 'Букет "Весенний день"',
    price: 9500,
    image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=300&fit=crop',
    description: 'Тюльпаны и нарциссы - дыхание весны',
    category: 'Весенние',
    inStock: true,
    rating: 4.5
  },
  {
    id: '6',
    name: 'Букет "Романтика"',
    price: 18000,
    image: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=400&h=300&fit=crop',
    description: 'Роскошная композиция из пионов и роз',
    category: 'Премиум',
    inStock: false,
    rating: 5.0
  },
  {
    id: '7',
    name: 'Открытка "С днем рождения"',
    price: 1500,
    image: 'https://images.unsplash.com/photo-1621793490481-c1c0bb9e6e84?w=400&h=300&fit=crop',
    description: 'Красивая открытка ручной работы',
    category: 'Открытки',
    inStock: true,
    rating: 4.3
  },
  {
    id: '8',
    name: 'Шоколадные конфеты',
    price: 3500,
    image: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&h=300&fit=crop',
    description: 'Коробка бельгийского шоколада',
    category: 'Подарки',
    inStock: true,
    rating: 4.4
  }
]

export const getProductsByCategory = (category: string): Product[] => {
  return mockProducts.filter(product => product.category === category)
}

export const getPopularProducts = (): Product[] => {
  return mockProducts.filter(product => product.isPopular)
}

export const searchProducts = (query: string): Product[] => {
  const lowerQuery = query.toLowerCase()
  return mockProducts.filter(product => 
    product.name.toLowerCase().includes(lowerQuery) ||
    product.description.toLowerCase().includes(lowerQuery) ||
    product.category.toLowerCase().includes(lowerQuery)
  )
}
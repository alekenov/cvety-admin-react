// Утилиты для семантического поиска товаров через Cloudflare AI
import type { Product } from '../types'

interface SemanticSearchResponse {
  success: boolean
  query: string
  results: Product[]
  total: number
  processingTime: number
  error?: string
}

// Семантический поиск товаров
export async function searchProductsSemantic(query: string, maxResults = 6): Promise<Product[]> {
  try {
    const response = await fetch('https://faq-demo.cvety.kz/api/products-search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        maxResults
      })
    })

    if (!response.ok) {
      throw new Error(`Search API error: ${response.status}`)
    }

    const data: SemanticSearchResponse = await response.json()
    
    if (!data.success) {
      throw new Error(data.error || 'Search failed')
    }

    // Преобразуем результаты в формат Product
    return data.results.map(result => ({
      id: result.id,
      name: result.name,
      price: result.price,
      image: result.image,
      description: result.description,
      category: result.category,
      inStock: result.inStock,
      rating: result.rating,
      // Добавляем similarity score как дополнительное поле
      similarity: (result as any).similarity
    }))

  } catch (error) {
    console.error('Semantic search error:', error)
    // Fallback к старому поиску при ошибках
    return fallbackTextSearch(query, maxResults)
  }
}

// Fallback текстовый поиск (копия старой логики)
function fallbackTextSearch(query: string, maxResults = 6): Product[] {
  const mockProducts: Product[] = [
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
    }
  ]

  const lowerQuery = query.toLowerCase()
  return mockProducts
    .filter(product => 
      product.name.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery) ||
      product.category.toLowerCase().includes(lowerQuery)
    )
    .slice(0, maxResults)
}

// Инициализация векторов (вызывается один раз)
export async function initializeProductVectors(): Promise<boolean> {
  try {
    const response = await fetch('https://faq-demo.cvety.kz/api/vectorize-products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    })

    if (!response.ok) {
      throw new Error(`Vectorization API error: ${response.status}`)
    }

    const data = await response.json()
    return data.success

  } catch (error) {
    console.error('Product vectorization error:', error)
    return false
  }
}

// Получить популярные товары через семантический поиск
export async function getPopularProductsSemantic(): Promise<Product[]> {
  return searchProductsSemantic('популярные букеты розы', 4)
}
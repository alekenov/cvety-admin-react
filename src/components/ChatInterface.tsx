import { useState, useEffect, useRef } from 'react'
import { Card } from './ui/card'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Send, Loader2 } from 'lucide-react'
import { cn } from '../lib/utils'
import { useCart } from '../hooks/useCart'
import { useCache } from '../hooks/useCache'
import { CartDisplay } from './CartDisplay'
import { ProductGallery } from './ProductGallery'
import { OrderForm } from './OrderForm'
import { TypingMessage } from './TypingMessage'
import type { Product, OrderForm as OrderFormType } from '../types'
import { mockProducts, searchProducts, getPopularProducts } from '../data/mockProducts'
import { searchProductsSemantic, getPopularProductsSemantic } from '../utils/semanticSearch'
import { createSimpleLogger, getSimpleLogger } from '../utils/simpleLogger'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  products?: Product[]
  showCart?: boolean
  showOrderForm?: boolean
  typing?: boolean
  cached?: boolean
}

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [orderLoading, setOrderLoading] = useState(false)
  const [apiStatus, setApiStatus] = useState<'unknown' | 'online' | 'offline'>('unknown')
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const sessionId = useRef(`session-${Date.now()}`).current
  const { cart, getItemCount } = useCart()
  const { getCachedData, setCachedData, hasCachedData } = useCache()
  const logger = useRef<ReturnType<typeof createSimpleLogger> | null>(null)
  
  if (!logger.current) {
    logger.current = createSimpleLogger(sessionId)
  }

  // Preload popular products for instant responses
  useEffect(() => {
    // Пробуем получить популярные товары через семантический поиск
    const loadPopularProducts = async () => {
      try {
        const popularProducts = await getPopularProductsSemantic()
        setCachedData('popular_products', popularProducts, 3600) // 1 hour cache
        
        logger.current?.log('semantic_search', {
          type: 'popular_products_loaded',
          count: popularProducts.length,
          method: 'semantic'
        })
      } catch (error) {
        // Fallback к обычным популярным товарам
        const popularProducts = getPopularProducts()
        setCachedData('popular_products', popularProducts, 3600)
        
        logger.current?.log('fallback', {
          type: 'popular_products_fallback',
          count: popularProducts.length,
          error: error.message,
          method: 'text_search'
        })
      }
    }
    
    loadPopularProducts()
    
    // Cache common responses
    const commonResponses = [
      { query: 'розы', response: '🌹 Вот наши прекрасные розы:', products: searchProducts('розы') },
      { query: 'букеты', response: '🌸 Показываю букеты по вашему запросу:', products: mockProducts.slice(0, 6) },
      { query: 'корзина', response: '🛒 Ваша корзина:', showCart: true }
    ]
    
    commonResponses.forEach(item => {
      setCachedData(`response_${item.query}`, item, 1800) // 30 min cache
    })
  }, [])

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleQuickAction = async (action: string) => {
    if (action === 'show_products') {
      let products
      try {
        products = await getPopularProductsSemantic()
        logger.current?.log('semantic_search', {
          type: 'quick_action_products',
          method: 'semantic',
          resultsCount: products.length
        })
      } catch (error) {
        products = getPopularProducts()
        logger.current?.log('fallback', {
          type: 'quick_action_fallback',
          error: error.message,
          method: 'text_search'
        })
      }
      
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-products`,
        role: 'assistant',
        content: '🌹 Вот наши популярные букеты:',
        timestamp: new Date(),
        products
      }
      setMessages(prev => [...prev, assistantMessage])
    } else if (action === 'show_cart') {
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-cart`,
        role: 'assistant',
        content: '🛒 Ваша корзина:',
        timestamp: new Date(),
        showCart: true
      }
      setMessages(prev => [...prev, assistantMessage])
    } else if (action === 'checkout') {
      setShowOrderForm(true)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const messageContent = input.trim().toLowerCase()
    setInput('')

    // Логируем пользовательское сообщение
    logger.current?.log('user_message', {
      content: userMessage.content,
      messageId: userMessage.id,
      timestamp: userMessage.timestamp
    })

    // Check cache first for instant responses
    const cacheKey = `response_${messageContent}`
    const cachedResponse = getCachedData(cacheKey)
    
    if (cachedResponse) {
      // Instant cached response
      logger.current?.log('cache_hit', {
        query: messageContent,
        cachedResponse: cachedResponse.response,
        cacheKey
      })

      const assistantMessage: Message = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        content: cachedResponse.response,
        timestamp: new Date(),
        products: cachedResponse.products,
        showCart: cachedResponse.showCart,
        cached: true
      }
      
      setMessages(prev => [...prev, assistantMessage])
      
      logger.current?.log('ai_response', {
        content: assistantMessage.content,
        messageId: assistantMessage.id,
        fromCache: true,
        hasProducts: !!assistantMessage.products,
        showCart: !!assistantMessage.showCart
      })
      
      if (assistantMessage.showCart || assistantMessage.showOrderForm) {
        if (assistantMessage.showOrderForm) setShowOrderForm(true)
      }
      return
    }

    // Show typing indicator
    const typingMessage: Message = {
      id: `msg-${Date.now()}-typing`,
      role: 'assistant',
      content: 'Подбираю для вас лучшие варианты...',
      timestamp: new Date(),
      typing: true
    }
    
    setMessages(prev => [...prev, typingMessage])
    setIsLoading(true)

    try {
      let assistantMessage: Message
      let shouldCallAPI = true
      
      // First try API for intelligent responses
      const apiCacheKey = `api_${messageContent}`
      let apiResponse = getCachedData(apiCacheKey)
      
      if (!apiResponse) {
        try {
          const startTime = Date.now()
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 10000) // Увеличили до 10 секунд
          
          const requestBody = {
            message: messageContent,
            sessionId: sessionId,
            conversationHistory: messages.slice(-6).map(m => ({
              role: m.role,
              content: m.content
            }))
          }

          logger.current?.log('api_request', {
            url: 'https://faq-demo.cvety.kz/api/chat-stream',
            method: 'POST',
            body: requestBody,
            query: messageContent
          })
          
          // Используем рабочий endpoint
          const response = await fetch('https://faq-demo.cvety.kz/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...requestBody,
              timestamp: Date.now()
            }),
            signal: controller.signal
          })
          
          clearTimeout(timeoutId)
          const data = await response.json()
          const duration = Date.now() - startTime

          logger.current?.log('api_response', {
            status: response.status,
            success: data.success,
            response: data.response,
            data: data,
            query: messageContent
          }, duration)
          
          if (data.success && data.response) {
            apiResponse = data.response
            setCachedData(apiCacheKey, apiResponse, 600)
            shouldCallAPI = false
            setApiStatus('online')
          }
        } catch (fetchError) {
          logger.current?.log('error', {
            type: 'api_fetch_error',
            error: fetchError.message,
            query: messageContent,
            fallback: 'using pattern matching'
          })
          setApiStatus('offline')
          console.log('AI API недоступен, используем fallback логику')
        }
      } else {
        shouldCallAPI = false
      }
      
      // If API worked, use that response
      if (apiResponse && !shouldCallAPI) {
        assistantMessage = {
          id: `msg-${Date.now()}-ai`,
          role: 'assistant',
          content: apiResponse,
          timestamp: new Date(),
          cached: !!getCachedData(apiCacheKey)
        }
        
        // Показываем товары только если пользователь спрашивает о них ИЛИ AI явно предлагает показать
        const shouldShowProducts = (
          // Пользователь спрашивает о товарах
          messageContent.includes('розы') || 
          messageContent.includes('букет') || 
          messageContent.includes('цветы') ||
          messageContent.includes('наличии') ||
          messageContent.includes('покажи') ||
          messageContent.includes('ассортимент') ||
          // AI явно предлагает показать товары
          apiResponse.toLowerCase().includes('посмотрите') ||
          apiResponse.toLowerCase().includes('вот наши') ||
          apiResponse.toLowerCase().includes('показываю') ||
          apiResponse.toLowerCase().includes('каталог')
        )
        
        if (shouldShowProducts) {
          try {
            // Используем семантический поиск для более точных результатов
            if (apiResponse.toLowerCase().includes('розы') || messageContent.includes('розы')) {
              assistantMessage.products = await searchProductsSemantic('красивые розы букеты', 6)
              logger.current?.log('semantic_search', {
                query: 'розы',
                resultsCount: assistantMessage.products.length,
                method: 'semantic'
              })
            } else if (messageContent.includes('наличии') || messageContent.includes('ассортимент')) {
              assistantMessage.products = await searchProductsSemantic('букеты цветы в наличии', 8)
              logger.current?.log('semantic_search', {
                query: 'ассортимент',
                resultsCount: assistantMessage.products.length,
                method: 'semantic'
              })
            } else if (apiResponse.toLowerCase().includes('букет') || messageContent.includes('букет') || messageContent.includes('цветы')) {
              assistantMessage.products = await searchProductsSemantic('красивые букеты цветы', 6)
              logger.current?.log('semantic_search', {
                query: 'букеты',
                resultsCount: assistantMessage.products.length,
                method: 'semantic'
              })
            }
          } catch (error) {
            // Fallback к старому поиску при ошибках
            logger.current?.log('fallback', {
              type: 'semantic_search_error',
              error: error.message,
              fallbackToTextSearch: true
            })
            
            if (apiResponse.toLowerCase().includes('розы') || messageContent.includes('розы')) {
              assistantMessage.products = searchProducts('розы')
            } else if (messageContent.includes('наличии') || messageContent.includes('ассортимент')) {
              assistantMessage.products = mockProducts.slice(0, 8)
            } else if (apiResponse.toLowerCase().includes('букет') || messageContent.includes('букет') || messageContent.includes('цветы')) {
              assistantMessage.products = mockProducts.slice(0, 6)
            }
          }
        }

        logger.current?.log('ai_response', {
          content: assistantMessage.content,
          messageId: assistantMessage.id,
          fromAPI: true,
          fromCache: assistantMessage.cached,
          hasProducts: !!assistantMessage.products,
          query: messageContent
        })
        
      } else {
        // Fallback to pattern matching if API fails
        logger.current?.log('fallback', {
          reason: 'API unavailable or failed',
          query: messageContent,
          usingPatternMatching: true
        })

        if (messageContent.includes('наличии') || messageContent.includes('есть') || messageContent.includes('ассортимент')) {
          let products
          try {
            products = await searchProductsSemantic('букеты цветы в наличии ассортимент', 8)
            logger.current?.log('semantic_search', {
              type: 'fallback_inventory',
              query: 'наличии/ассортимент',
              resultsCount: products.length,
              method: 'semantic'
            })
          } catch (error) {
            products = mockProducts.slice(0, 8)
            logger.current?.log('fallback', {
              type: 'semantic_search_fallback',
              error: error.message,
              usingMockData: true
            })
          }
          
          assistantMessage = {
            id: `msg-${Date.now()}-ai`,
            role: 'assistant',
            content: '🌸 Вот что у нас есть в наличии:',
            timestamp: new Date(),
            products
          }
          logger.current?.log('ai_response', {
            content: assistantMessage.content,
            messageId: assistantMessage.id,
            fallbackType: 'inventory_pattern',
            productsCount: products.length,
            query: messageContent
          })
        } else if (messageContent.includes('розы') || messageContent.includes('роз')) {
          let roses
          try {
            roses = await searchProductsSemantic('красивые розы красные белые букеты', 6)
            logger.current?.log('semantic_search', {
              type: 'fallback_roses',
              query: 'розы',
              resultsCount: roses.length,
              method: 'semantic'
            })
          } catch (error) {
            roses = searchProducts('розы')
            logger.current?.log('fallback', {
              type: 'semantic_search_fallback',
              error: error.message,
              usingTextSearch: true
            })
          }
          
          assistantMessage = {
            id: `msg-${Date.now()}-ai`,
            role: 'assistant',
            content: '🌹 Вот наши прекрасные розы:',
            timestamp: new Date(),
            products: roses
          }
          logger.current?.log('ai_response', {
            content: assistantMessage.content,
            messageId: assistantMessage.id,
            fallbackType: 'roses_pattern',
            productsCount: roses.length,
            query: messageContent
          })
        } else if (messageContent.includes('букет') || messageContent.includes('цветы')) {
          let products
          try {
            products = await searchProductsSemantic('красивые букеты цветы композиции', 6)
            logger.current?.log('semantic_search', {
              type: 'fallback_bouquets',
              query: 'букеты/цветы',
              resultsCount: products.length,
              method: 'semantic'
            })
          } catch (error) {
            products = mockProducts.slice(0, 6)
            logger.current?.log('fallback', {
              type: 'semantic_search_fallback',
              error: error.message,
              usingMockData: true
            })
          }
          
          assistantMessage = {
            id: `msg-${Date.now()}-ai`,
            role: 'assistant',
            content: '🌸 Показываю букеты по вашему запросу:',
            timestamp: new Date(),
            products
          }
          logger.current?.log('ai_response', {
            content: assistantMessage.content,
            messageId: assistantMessage.id,
            fallbackType: 'bouquet_pattern',
            productsCount: products.length,
            query: messageContent
          })
        } else if (messageContent.includes('корзин')) {
          assistantMessage = {
            id: `msg-${Date.now()}-ai`,
            role: 'assistant',
            content: '🛒 Ваша корзина:',
            timestamp: new Date(),
            showCart: true
          }
          logger.current?.log('ai_response', {
            content: assistantMessage.content,
            messageId: assistantMessage.id,
            fallbackType: 'cart_pattern',
            showCart: true,
            query: messageContent
          })
        } else if (messageContent.includes('цена') || messageContent.includes('стоимость') || messageContent.includes('сколько')) {
          let products
          try {
            products = await searchProductsSemantic('недорогие букеты цены стоимость', 6)
            logger.current?.log('semantic_search', {
              type: 'fallback_prices',
              query: 'цены/стоимость',
              resultsCount: products.length,
              method: 'semantic'
            })
          } catch (error) {
            products = mockProducts.slice(0, 6)
            logger.current?.log('fallback', {
              type: 'semantic_search_fallback',
              error: error.message,
              usingMockData: true
            })
          }
          
          assistantMessage = {
            id: `msg-${Date.now()}-ai`,
            role: 'assistant',
            content: '💰 Цены на наши букеты:',
            timestamp: new Date(),
            products
          }
          logger.current?.log('ai_response', {
            content: assistantMessage.content,
            messageId: assistantMessage.id,
            fallbackType: 'price_pattern',
            productsCount: products.length,
            query: messageContent
          })
        } else if (messageContent.includes('доставка') || messageContent.includes('доставить')) {
          assistantMessage = {
            id: `msg-${Date.now()}-ai`,
            role: 'assistant',
            content: '🚚 Доставка:\n\n• По Алматы: 2000₸ (2-4 часа)\n• По Астане: 2500₸ (3-5 часов)\n• Бесплатная доставка при заказе от 15000₸\n• Срочная доставка (1-2 часа): +1000₸',
            timestamp: new Date()
          }
          logger.current?.log('ai_response', {
            content: assistantMessage.content,
            messageId: assistantMessage.id,
            fallbackType: 'delivery_pattern',
            query: messageContent
          })
        } else if (messageContent.includes('заказ') || messageContent.includes('оформить')) {
          assistantMessage = {
            id: `msg-${Date.now()}-ai`,
            role: 'assistant',
            content: '📝 Давайте оформим ваш заказ:',
            timestamp: new Date(),
            showOrderForm: true
          }
          logger.current?.log('ai_response', {
            content: assistantMessage.content,
            messageId: assistantMessage.id,
            fallbackType: 'order_pattern',
            showOrderForm: true,
            query: messageContent
          })
        } else if (messageContent.includes('привет') || messageContent.includes('здравствуйте') || messageContent.includes('добро')) {
          assistantMessage = {
            id: `msg-${Date.now()}-ai`,
            role: 'assistant',
            content: '👋 Добро пожаловать в Cvety.kz!\n\nЯ помогу вам выбрать идеальный букет. Могу показать:\n• 🌹 Розы\n• 🌸 Букеты\n• 💰 Цены\n• 🚚 Информацию о доставке\n\nЧто вас интересует?',
            timestamp: new Date()
          }
          logger.current?.log('ai_response', {
            content: assistantMessage.content,
            messageId: assistantMessage.id,
            fallbackType: 'greeting_pattern',
            query: messageContent
          })
        } else if (messageContent.includes('помощь') || messageContent.includes('помоги') || messageContent.includes('как')) {
          assistantMessage = {
            id: `msg-${Date.now()}-ai`,
            role: 'assistant',
            content: '🤖 Я могу помочь вам:\n\n• Показать букеты и розы\n• Рассказать о ценах\n• Объяснить условия доставки\n• Помочь оформить заказ\n• Показать вашу корзину\n\nПросто спросите: "Покажи розы" или "Что есть в наличии?"',
            timestamp: new Date()
          }
          logger.current?.log('ai_response', {
            content: assistantMessage.content,
            messageId: assistantMessage.id,
            fallbackType: 'help_pattern',
            query: messageContent
          })
        } else {
          assistantMessage = {
            id: `msg-${Date.now()}-ai`,
            role: 'assistant',
            content: '🤖 AI сервис временно недоступен, но я могу помочь!\n\nПопробуйте спросить:\n• "Что есть в наличии?"\n• "Покажи розы"\n• "Сколько стоит доставка?"\n• "Помощь"',
            timestamp: new Date()
          }
          logger.current?.log('ai_response', {
            content: assistantMessage.content,
            messageId: assistantMessage.id,
            fallbackType: 'enhanced_default_message',
            query: messageContent
          })
        }
      }
      
      // Remove typing indicator and add real response
      setMessages(prev => prev.filter(m => m.id !== typingMessage.id).concat(assistantMessage))
      
      if (assistantMessage.showOrderForm) {
        setShowOrderForm(true)
      }
      
    } catch (error) {
      logger.current?.log('error', {
        type: 'message_processing_error',
        error: error instanceof Error ? error.message : 'Unknown error',
        query: messageContent,
        stack: error instanceof Error ? error.stack : undefined
      })

      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: 'Извините, произошла ошибка. Попробуйте позже.',
        timestamp: new Date()
      }
      setMessages(prev => prev.filter(m => m.id !== typingMessage.id).concat(errorMessage))
      
      logger.current?.log('ai_response', {
        content: errorMessage.content,
        messageId: errorMessage.id,
        isError: true,
        query: messageContent
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOrderSubmit = async (orderData: OrderFormType) => {
    setOrderLoading(true)
    
    try {
      // Simulate order submission
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const orderNumber = `CVT-${Date.now().toString().slice(-6)}`
      
      let paymentInfo = ''
      if (orderData.paymentMethod === 'kaspi') {
        const kaspiLink = `https://kaspi.kz/pay?order=${orderNumber}&amount=${cart.total}&phone=${orderData.phone}`
        paymentInfo = `💳 Ссылка для оплаты Kaspi отправлена на ${orderData.phone}\n🔗 Или оплатите по ссылке: ${kaspiLink}\n💰 Сумма к оплате: ${cart.total.toLocaleString('ru-RU')}₸`
      } else {
        paymentInfo = `💵 Оплата наличными при получении: ${cart.total.toLocaleString('ru-RU')}₸`
      }

      const successMessage: Message = {
        id: `msg-${Date.now()}-success`,
        role: 'assistant',
        content: `✅ Заказ #${orderNumber} успешно оформлен!\n\n📱 SMS с деталями отправлено на ${orderData.phone}\n🚚 Ожидайте доставку ${orderData.deliveryDate} к ${orderData.deliveryTime}\n\n${paymentInfo}\n\n📞 Вопросы по заказу: +7 777 123 4567\n🔍 Отслеживать заказ: cvety.kz/track/${orderNumber}`,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, successMessage])
      setShowOrderForm(false)
      
      // Clear cart after successful order
      // clearCart() - можно добавить позже
    } catch (error) {
      console.error('Order submission error:', error)
    } finally {
      setOrderLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-4xl mx-auto h-[600px] flex flex-col">
      {/* Chat messages */}
      <div 
        ref={scrollAreaRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <p className="text-lg mb-4">Добро пожаловать в Cvety.kz!</p>
            <p className="mb-4">Спросите меня о букетах, доставке или оформлении заказа.</p>
            
            <div className="flex flex-wrap gap-2 justify-center">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleQuickAction('show_products')}
              >
                🌹 Показать букеты
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleQuickAction('show_cart')}
              >
                🛒 Корзина ({getItemCount()})
              </Button>
              {getItemCount() > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleQuickAction('checkout')}
                >
                  📝 Оформить заказ
                </Button>
              )}
            </div>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className="space-y-3">
            <div
              className={cn(
                "flex",
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-4 py-2",
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                {message.typing ? (
                  <TypingMessage content={message.content} speed={25} />
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
                
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs opacity-70">
                    {message.timestamp.toLocaleTimeString('ru-RU', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                  {message.cached && (
                    <span className="text-xs opacity-50 ml-2">⚡ Быстрый ответ</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Products display */}
            {message.products && (
              <div className="ml-4">
                <ProductGallery 
                  products={message.products}
                  title={undefined}
                />
              </div>
            )}
            
            {/* Cart display */}
            {message.showCart && (
              <div className="ml-4">
                <CartDisplay 
                  onCheckout={() => setShowOrderForm(true)}
                  compact={false}
                />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg px-4 py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <OrderForm
              onSubmit={handleOrderSubmit}
              onBack={() => setShowOrderForm(false)}
              loading={orderLoading}
            />
          </div>
        </div>
      )}

      {/* Cart indicator */}
      {getItemCount() > 0 && (
        <div className="px-4 py-2 border-t bg-muted/50">
          <CartDisplay compact onCheckout={() => setShowOrderForm(true)} />
        </div>
      )}

      {/* API Status */}
      {apiStatus !== 'unknown' && (
        <div className={`px-4 py-2 text-xs flex items-center gap-2 ${
          apiStatus === 'online' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            apiStatus === 'online' ? 'bg-green-500' : 'bg-yellow-500'
          }`} />
          {apiStatus === 'online' 
            ? '🤖 AI подключен' 
            : '⚠️ AI недоступен - используется базовая логика'
          }
        </div>
      )}

      {/* Input form */}
      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Напишите сообщение..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Quick action buttons */}
        <div className="flex flex-wrap gap-2 mt-2">
          <Button 
            variant="ghost" 
            size="sm"
            type="button"
            onClick={() => handleQuickAction('show_products')}
          >
            🌹 Букеты
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            type="button"
            onClick={() => handleQuickAction('show_cart')}
          >
            🛒 Корзина ({getItemCount()})
          </Button>
          {getItemCount() > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              type="button"
              onClick={() => handleQuickAction('checkout')}
            >
              📝 Заказ
            </Button>
          )}
        </div>
      </form>
    </Card>
  )
}
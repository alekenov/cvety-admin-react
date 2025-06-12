import { useState, useEffect } from 'react'

interface CacheItem<T> {
  data: T
  timestamp: number
  ttl: number
}

class Cache {
  private storage = new Map<string, CacheItem<any>>()
  
  set<T>(key: string, data: T, ttlSeconds: number = 300): void {
    this.storage.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000
    })
  }
  
  get<T>(key: string): T | null {
    const item = this.storage.get(key)
    if (!item) return null
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.storage.delete(key)
      return null
    }
    
    return item.data
  }
  
  has(key: string): boolean {
    return this.get(key) !== null
  }
  
  clear(): void {
    this.storage.clear()
  }
  
  remove(key: string): void {
    this.storage.delete(key)
  }
}

const globalCache = new Cache()

export function useCache() {
  const [cache] = useState(globalCache)
  
  const getCachedData = <T>(key: string): T | null => {
    return cache.get<T>(key)
  }
  
  const setCachedData = <T>(key: string, data: T, ttlSeconds: number = 300): void => {
    cache.set(key, data, ttlSeconds)
  }
  
  const hasCachedData = (key: string): boolean => {
    return cache.has(key)
  }
  
  const clearCache = (): void => {
    cache.clear()
  }
  
  const removeCachedData = (key: string): void => {
    cache.remove(key)
  }
  
  return {
    getCachedData,
    setCachedData,
    hasCachedData,
    clearCache,
    removeCachedData
  }
}

// Hook for caching API responses
export function useCachedAPI<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { getCachedData, setCachedData, hasCachedData } = useCache()
  
  const fetchData = async (force: boolean = false) => {
    const cachedKey = `api:${key}`
    
    // Check cache first
    if (!force && hasCachedData(cachedKey)) {
      const cachedData = getCachedData<T>(cachedKey)
      if (cachedData) {
        setData(cachedData)
        return cachedData
      }
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await fetcher()
      setCachedData(cachedKey, result, ttlSeconds)
      setData(result)
      return result
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error')
      setError(error)
      throw error
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    fetchData()
  }, [key])
  
  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    fetchData
  }
}
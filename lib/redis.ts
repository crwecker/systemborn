import { Redis } from '@upstash/redis'
import type { Book } from '../src/types/book'

// Initialize Redis client with error handling
let redis: Redis

try {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (!redisUrl || !redisToken) {
    console.warn('Redis credentials not found. Caching will be disabled.')
    console.log('UPSTASH_REDIS_REST_URL:', redisUrl ? 'Set' : 'Not set')
    console.log('UPSTASH_REDIS_REST_TOKEN:', redisToken ? 'Set' : 'Not set')
  } else if (!redisUrl.startsWith('https://')) {
    console.error('Invalid Redis URL format. Expected HTTPS URL, got:', redisUrl)
    console.log('Please check your Upstash console for the correct REST API URL')
  } else {
    redis = new Redis({
      url: redisUrl,
      token: redisToken,
    })
    console.log('Redis client initialized successfully')
  }
} catch (error) {
  console.error('Failed to initialize Redis client:', error)
}

// Cache keys
export const CACHE_KEYS = {
  ALL_BOOKS: 'books:all',
  POPULAR_TAGS: 'tags:popular',
  ALL_TAGS: 'tags:all',
  AMAZON_BOOKS: 'books:amazon',
  LAST_UPDATE: 'cache:last_update',
} as const

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
  BOOKS: 3600, // 1 hour
  TAGS: 3600 * 24, // 24 hours (tags change less frequently)
} as const

/**
 * Cache all books in Redis using chunked storage
 */
export async function cacheAllBooks(books: Book[]): Promise<void> {
  if (!redis) {
    console.log('Redis not available, skipping cache operation')
    return
  }

  try {
    console.log(`Caching ${books.length} books to Redis using chunked storage...`)
    
    // Split books into chunks to avoid request size limits (Upstash limit: ~10MB)
    const CHUNK_SIZE = 500 // ~500 books per chunk should be safe
    const chunks: Book[][] = []
    
    for (let i = 0; i < books.length; i += CHUNK_SIZE) {
      chunks.push(books.slice(i, i + CHUNK_SIZE))
    }
    
    console.log(`Split ${books.length} books into ${chunks.length} chunks`)
    
    // Store metadata about chunks
    await redis.setex(
      `${CACHE_KEYS.ALL_BOOKS}:meta`, 
      CACHE_TTL.BOOKS, 
      JSON.stringify({ 
        totalBooks: books.length, 
        chunkCount: chunks.length,
        chunkSize: CHUNK_SIZE 
      })
    )
    
    // Store each chunk separately
    const chunkPromises = chunks.map((chunk, index) => 
      redis.setex(
        `${CACHE_KEYS.ALL_BOOKS}:chunk:${index}`,
        CACHE_TTL.BOOKS,
        JSON.stringify(chunk)
      )
    )
    
    await Promise.all(chunkPromises)
    
    // Update last cache update timestamp
    await redis.setex(CACHE_KEYS.LAST_UPDATE, CACHE_TTL.BOOKS, Date.now())
    
    console.log(`Successfully cached ${books.length} books in ${chunks.length} chunks to Redis`)
  } catch (error) {
    console.error('Error caching books to Redis:', error)
    throw error
  }
}

/**
 * Get all books from Redis cache using chunked retrieval
 */
export async function getCachedBooks(): Promise<Book[] | null> {
  if (!redis) {
    console.log('Redis not available, returning null')
    return null
  }

  try {
    // First, try to get metadata about chunks
    const metaData = await redis.get(`${CACHE_KEYS.ALL_BOOKS}:meta`)
    
    if (!metaData) {
      console.log('No book metadata found in Redis cache')
      return null
    }
    
    // Handle case where Redis returns parsed JSON instead of string
    let meta
    if (typeof metaData === 'string') {
      meta = JSON.parse(metaData)
    } else {
      // If it's already an object, use it directly
      meta = metaData as any
    }
    
    console.log(`Found metadata: ${meta.totalBooks} books in ${meta.chunkCount} chunks`)
    
    // Retrieve all chunks in parallel
    const chunkPromises: Promise<unknown>[] = []
    for (let i = 0; i < meta.chunkCount; i++) {
      chunkPromises.push(redis.get(`${CACHE_KEYS.ALL_BOOKS}:chunk:${i}`))
    }
    
    const chunkResults = await Promise.all(chunkPromises)
    
    // Combine all chunks into a single array
    const allBooks: Book[] = []
    for (let i = 0; i < chunkResults.length; i++) {
      const chunkData = chunkResults[i]
      if (chunkData) {
        try {
          // Handle case where Redis returns parsed JSON instead of string
          let chunkBooks: Book[]
          if (typeof chunkData === 'string') {
            chunkBooks = JSON.parse(chunkData) as Book[]
          } else {
            // If it's already an object, use it directly
            chunkBooks = chunkData as Book[]
          }
          
          allBooks.push(...chunkBooks)
        } catch (error) {
          console.error(`Error parsing chunk ${i}:`, error)
          console.error(`Chunk ${i} data:`, chunkData)
          // Skip this chunk but continue with others
        }
      }
    }
    
    console.log(`Retrieved ${allBooks.length} books from ${meta.chunkCount} Redis chunks`)
    return allBooks
  } catch (error) {
    console.error('Error retrieving books from Redis cache:', error)
    return null
  }
}

/**
 * Cache Amazon books separately
 */
export async function cacheAmazonBooks(books: any[]): Promise<void> {
  if (!redis) {
    console.log('Redis not available, skipping cache operation')
    return
  }

  try {
    console.log(`Caching ${books.length} Amazon books to Redis...`)
    await redis.setex(CACHE_KEYS.AMAZON_BOOKS, CACHE_TTL.BOOKS, JSON.stringify(books))
    console.log('Successfully cached Amazon books to Redis')
  } catch (error) {
    console.error('Error caching Amazon books to Redis:', error)
    throw error
  }
}

/**
 * Get Amazon books from Redis cache
 */
export async function getCachedAmazonBooks(): Promise<any[] | null> {
  if (!redis) {
    console.log('Redis not available, returning null')
    return null
  }

  try {
    const cachedData = await redis.get(CACHE_KEYS.AMAZON_BOOKS)
    
    if (!cachedData) {
      console.log('No Amazon books found in Redis cache')
      return null
    }
    
    // Handle case where Redis returns parsed JSON instead of string
    let books
    if (typeof cachedData === 'string') {
      books = JSON.parse(cachedData)
    } else {
      // If it's already an object, use it directly
      books = cachedData as any[]
    }
    
    console.log(`Retrieved ${books.length} Amazon books from Redis cache`)
    return books
  } catch (error) {
    console.error('Error retrieving Amazon books from Redis cache:', error)
    return null
  }
}

/**
 * Cache tags
 */
export async function cacheTags(popularTags: string[], allTags: string[]): Promise<void> {
  if (!redis) {
    console.log('Redis not available, skipping cache operation')
    return
  }

  try {
    console.log(`Caching ${popularTags.length} popular tags and ${allTags.length} total tags to Redis...`)
    
    await Promise.all([
      redis.setex(CACHE_KEYS.POPULAR_TAGS, CACHE_TTL.TAGS, JSON.stringify(popularTags)),
      redis.setex(CACHE_KEYS.ALL_TAGS, CACHE_TTL.TAGS, JSON.stringify(allTags)),
    ])
    
    console.log('Successfully cached tags to Redis')
  } catch (error) {
    console.error('Error caching tags to Redis:', error)
    throw error
  }
}

/**
 * Get popular tags from Redis cache
 */
export async function getCachedPopularTags(): Promise<string[] | null> {
  if (!redis) {
    console.log('Redis not available, returning null')
    return null
  }

  try {
    const cachedData = await redis.get(CACHE_KEYS.POPULAR_TAGS)
    
    if (!cachedData) {
      console.log('No popular tags found in Redis cache')
      return null
    }
    
    // Handle case where Redis returns parsed JSON instead of string
    if (typeof cachedData === 'string') {
      return JSON.parse(cachedData) as string[]
    } else {
      // If it's already an object, use it directly
      return cachedData as string[]
    }
  } catch (error) {
    console.error('Error retrieving popular tags from Redis cache:', error)
    return null
  }
}

/**
 * Get all tags from Redis cache
 */
export async function getCachedAllTags(): Promise<string[] | null> {
  if (!redis) {
    console.log('Redis not available, returning null')
    return null
  }

  try {
    const cachedData = await redis.get(CACHE_KEYS.ALL_TAGS)
    
    if (!cachedData) {
      console.log('No all tags found in Redis cache')
      return null
    }
    
    // Handle case where Redis returns parsed JSON instead of string
    if (typeof cachedData === 'string') {
      return JSON.parse(cachedData) as string[]
    } else {
      // If it's already an object, use it directly
      return cachedData as string[]
    }
  } catch (error) {
    console.error('Error retrieving all tags from Redis cache:', error)
    return null
  }
}

/**
 * Check if cache needs refresh (older than 1 hour)
 */
export async function shouldRefreshCache(): Promise<boolean> {
  if (!redis) {
    console.log('Redis not available, refresh needed')
    return true
  }

  try {
    const lastUpdate = await redis.get(CACHE_KEYS.LAST_UPDATE)
    
    if (!lastUpdate) {
      console.log('No cache timestamp found, refresh needed')
      return true
    }
    
    // Handle case where Redis returns parsed JSON instead of string
    let lastUpdateTime: number
    if (typeof lastUpdate === 'string') {
      lastUpdateTime = parseInt(lastUpdate)
    } else {
      // If it's already a number, use it directly
      lastUpdateTime = lastUpdate as number
    }
    
    const oneHourAgo = Date.now() - (60 * 60 * 1000) // 1 hour in milliseconds
    
    const needsRefresh = lastUpdateTime < oneHourAgo
    console.log(`Cache last updated: ${new Date(lastUpdateTime)}, needs refresh: ${needsRefresh}`)
    
    return needsRefresh
  } catch (error) {
    console.error('Error checking cache timestamp:', error)
    return true // Refresh on error
  }
}

/**
 * Clear all cached data
 */
export async function clearCache(): Promise<void> {
  if (!redis) {
    console.log('Redis not available, no cache to clear')
    return
  }

  try {
    console.log('Clearing all cached data...')
    
    // Get metadata to know how many chunks to delete
    const metaData = await redis.get(`${CACHE_KEYS.ALL_BOOKS}:meta`)
    
    const keysToDelete = [
      `${CACHE_KEYS.ALL_BOOKS}:meta`,
      CACHE_KEYS.AMAZON_BOOKS,
      CACHE_KEYS.POPULAR_TAGS,
      CACHE_KEYS.ALL_TAGS,
      CACHE_KEYS.LAST_UPDATE,
    ]
    
    // If we have metadata, add all chunk keys
    if (metaData) {
      try {
        // Handle case where Redis returns parsed JSON instead of string
        let meta
        if (typeof metaData === 'string') {
          meta = JSON.parse(metaData)
        } else {
          // If it's already an object, use it directly
          meta = metaData as any
        }
        
        for (let i = 0; i < meta.chunkCount; i++) {
          keysToDelete.push(`${CACHE_KEYS.ALL_BOOKS}:chunk:${i}`)
        }
      } catch (error) {
        console.error('Error parsing metadata, doing safety cleanup:', error)
        // If parsing fails, try to clear potential chunks anyway (safety cleanup)
        for (let i = 0; i < 50; i++) { // Assume max 50 chunks
          keysToDelete.push(`${CACHE_KEYS.ALL_BOOKS}:chunk:${i}`)
        }
      }
    } else {
      // If no metadata, try to clear potential chunks anyway (safety cleanup)
      for (let i = 0; i < 50; i++) { // Assume max 50 chunks
        keysToDelete.push(`${CACHE_KEYS.ALL_BOOKS}:chunk:${i}`)
      }
    }
    
    await redis.del(...keysToDelete)
    console.log(`Successfully cleared all cached data (${keysToDelete.length} keys)`)
  } catch (error) {
    console.error('Error clearing cache:', error)
    throw error
  }
}

export { redis } 
import { prisma } from './prisma'
import { 
  cacheAllBooks, 
  cacheAmazonBooks, 
  cacheTags,
  getCachedBooks,
  getCachedAmazonBooks,
  getCachedPopularTags,
  getCachedAllTags,
  shouldRefreshCache
} from './redis'
import { convertBooksToApiFormat } from './royalroad'
import type { Book } from '../src/types/book'

/**
 * Refresh all cached data from the database
 */
export async function refreshCache(): Promise<void> {
  console.log('Starting cache refresh...')
  
  try {
    // Fetch all Royal Road books with their latest stats
    console.log('Fetching all Royal Road books from database...')
    const dbBooks = await prisma.book.findMany({
      where: {
        source: 'ROYAL_ROAD'
      },
      include: {
        stats: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    })
    
    // Convert to API format
    const royalRoadBooks = convertBooksToApiFormat(dbBooks)
    console.log(`Converted ${royalRoadBooks.length} Royal Road books`)
    
    // Cache Royal Road books
    await cacheAllBooks(royalRoadBooks)
    
    // Fetch Amazon books separately
    console.log('Fetching Amazon books from database...')
    const amazonBooks = await prisma.book.findMany({
      where: { source: 'AMAZON' },
      include: {
        bookContributors: {
          include: {
            contributor: true
          }
        },
        bookReviews: {
          where: { userId: 'cmbjdfr1c0000kyu3giis7lz2' }, // Admin/reviewer user
          take: 1
        }
      },
      orderBy: { createdAt: 'asc' }
    })
    
    console.log(`Found ${amazonBooks.length} Amazon books`)
    
    // Cache Amazon books
    await cacheAmazonBooks(amazonBooks)
    
    // Fetch and cache tags
    console.log('Fetching tags from database...')
    
    // Get popular tags (most frequently used)
    const popularTagsResult = await prisma.book.groupBy({
      by: ['tags'],
      _count: { tags: true },
      orderBy: { _count: { tags: 'desc' } },
      take: 12
    })
    
    // Flatten and deduplicate popular tags
    const allPopularTags = popularTagsResult.flatMap(item => item.tags)
    const popularTagCounts = new Map<string, number>()
    
    allPopularTags.forEach(tag => {
      const count = popularTagCounts.get(tag) || 0
      popularTagCounts.set(tag, count + 1)
    })
    
    const popularTags = Array.from(popularTagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([tag]) => tag)
    
    // Get all unique tags
    const allBooksForTags = await prisma.book.findMany({
      select: { tags: true }
    })
    
    const allTagsSet = new Set<string>()
    allBooksForTags.forEach(book => {
      book.tags.forEach(tag => allTagsSet.add(tag))
    })
    
    const allTags = Array.from(allTagsSet).sort()
    
    console.log(`Found ${popularTags.length} popular tags and ${allTags.length} total tags`)
    
    // Cache tags
    await cacheTags(popularTags, allTags)
    
    console.log('Cache refresh completed successfully!')
    
  } catch (error) {
    console.error('Error refreshing cache:', error)
    throw error
  }
}

/**
 * Get cached data with fallback to database
 */
export async function getCachedBooksWithFallback(): Promise<Book[]> {
  try {
    // Check if cache needs refresh
    const needsRefresh = await shouldRefreshCache()
    
    if (needsRefresh) {
      console.log('Cache is stale, refreshing...')
      await refreshCache()
    }
    
    // Try to get from cache first
    const cachedBooks = await getCachedBooks()
    
    if (cachedBooks) {
      return cachedBooks
    }
    
    // Fallback: refresh cache and return
    console.log('No cached books found, refreshing cache...')
    await refreshCache()
    
    const freshBooks = await getCachedBooks()
    return freshBooks || []
    
  } catch (error) {
    console.error('Error getting cached books with fallback:', error)
    
    // Ultimate fallback: fetch directly from database
    console.log('Falling back to direct database query...')
    const dbBooks = await prisma.book.findMany({
      where: {
        source: 'ROYAL_ROAD'
      },
      include: {
        stats: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    })
    
    return convertBooksToApiFormat(dbBooks)
  }
}

/**
 * Get cached Amazon books with fallback
 */
export async function getCachedAmazonBooksWithFallback(): Promise<any[]> {
  try {
    // Try cache first
    const cachedBooks = await getCachedAmazonBooks()
    
    if (cachedBooks) {
      return cachedBooks
    }
    
    // Fallback to database
    console.log('No cached Amazon books found, fetching from database...')
    const amazonBooks = await prisma.book.findMany({
      where: { source: 'AMAZON' },
      include: {
        bookContributors: {
          include: {
            contributor: true
          }
        },
        bookReviews: {
          where: { userId: 'cmbjdfr1c0000kyu3giis7lz2' },
          take: 1
        }
      },
      orderBy: { createdAt: 'asc' }
    })
    
    // Cache for next time
    await cacheAmazonBooks(amazonBooks)
    
    return amazonBooks
    
  } catch (error) {
    console.error('Error getting cached Amazon books with fallback:', error)
    
    // Ultimate fallback
    const amazonBooks = await prisma.book.findMany({
      where: { source: 'AMAZON' },
      include: {
        bookContributors: {
          include: {
            contributor: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })
    
    return amazonBooks
  }
}

/**
 * Get cached tags with fallback
 */
export async function getCachedTagsWithFallback(): Promise<{ popularTags: string[], allTags: string[] }> {
  try {
    // Try cache first
    const [cachedPopular, cachedAll] = await Promise.all([
      getCachedPopularTags(),
      getCachedAllTags()
    ])
    
    if (cachedPopular && cachedAll) {
      return { popularTags: cachedPopular, allTags: cachedAll }
    }
    
    // Fallback: fetch from database and cache
    console.log('No cached tags found, fetching from database...')
    
    // Get popular tags
    const popularTagsResult = await prisma.book.groupBy({
      by: ['tags'],
      _count: { tags: true },
      orderBy: { _count: { tags: 'desc' } },
      take: 12
    })
    
    const allPopularTags = popularTagsResult.flatMap(item => item.tags)
    const popularTagCounts = new Map<string, number>()
    
    allPopularTags.forEach(tag => {
      const count = popularTagCounts.get(tag) || 0
      popularTagCounts.set(tag, count + 1)
    })
    
    const popularTags = Array.from(popularTagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([tag]) => tag)
    
    // Get all tags
    const allBooksForTags = await prisma.book.findMany({
      select: { tags: true }
    })
    
    const allTagsSet = new Set<string>()
    allBooksForTags.forEach(book => {
      book.tags.forEach(tag => allTagsSet.add(tag))
    })
    
    const allTags = Array.from(allTagsSet).sort()
    
    // Cache for next time
    await cacheTags(popularTags, allTags)
    
    return { popularTags, allTags }
    
  } catch (error) {
    console.error('Error getting cached tags with fallback:', error)
    throw error
  }
} 
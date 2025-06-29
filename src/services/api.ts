import type { Book } from '../types/book'

// Use Netlify Functions in production, local server in development
export const API_BASE_URL = import.meta.env.PROD
  ? '/.netlify/functions/api'
  : 'http://localhost:3000/.netlify/functions/api'

export const USER_API_BASE_URL = import.meta.env.PROD
  ? '/.netlify/functions/user-api'
  : 'http://localhost:3000/.netlify/functions/user-api'

interface BookListResponse {
  books: Book[]
  totalPages: number
  currentPage: number
}

export async function fetchBooks(page: number = 1): Promise<BookListResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/books?page=${page}`)
    if (!response.ok) {
      throw new Error('Failed to fetch books')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching books:', error)
    throw error
  }
}

export async function fetchBookDetails(bookId: string): Promise<Book> {
  try {
    const response = await fetch(`${API_BASE_URL}/books/${bookId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch book details')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching book details:', error)
    throw error
  }
}

export async function fetchTags(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/tags`)
    if (!response.ok) {
      throw new Error('Failed to fetch tags')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching tags:', error)
    throw error
  }
}

export async function fetchTrendingBooks(limit: number = 10): Promise<Book[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/books/trending?limit=${limit}`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch trending books')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching trending books:', error)
    throw error
  }
}

export async function fetchAmazonBooks(): Promise<Book[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/books/amazon`)
    if (!response.ok) {
      throw new Error('Failed to fetch Amazon books')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching Amazon books:', error)
    throw error
  }
}

interface SearchParams {
  tags?: string[]
  minRating?: number
  minPages?: number
  sortBy?: string
  limit?: number
  offset?: number
  query?: string
}

export async function searchBooks(params: SearchParams): Promise<Book[]> {
  try {
    const searchParams = new URLSearchParams()
    if (params.tags?.length) {
      params.tags.forEach(tag => searchParams.append('tags', tag))
    }
    if (params.minRating) {
      searchParams.append('minRating', params.minRating.toString())
    }
    if (params.minPages) {
      searchParams.append('minPages', params.minPages.toString())
    }
    if (params.sortBy) {
      searchParams.append('sortBy', params.sortBy)
    }
    if (params.limit) {
      searchParams.append('limit', params.limit.toString())
    }
    if (params.offset) {
      searchParams.append('offset', params.offset.toString())
    }
    if (params.query) {
      searchParams.append('query', params.query)
    }

    const response = await fetch(`${API_BASE_URL}/books/search?${searchParams}`)
    if (!response.ok) {
      throw new Error('Failed to search books')
    }
    return await response.json()
  } catch (error) {
    console.error('Error searching books:', error)
    throw error
  }
}

export async function fetchSimilarBooks(
  bookId: string,
  limit: number = 5
): Promise<Book[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/books/${bookId}/similar?limit=${limit}`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch similar books')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching similar books:', error)
    throw error
  }
}

export async function fetchAuthorBooks(authorName: string): Promise<Book[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/books/author/${encodeURIComponent(authorName)}`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch author books')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching author books:', error)
    throw error
  }
}

export async function fetchAvailableTags(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/tags`)
    if (!response.ok) {
      throw new Error('Failed to fetch tags')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching tags:', error)
    throw error
  }
}

export async function fetchAllTags(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/all-tags`)
    if (!response.ok) {
      throw new Error('Failed to fetch all tags')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching all tags:', error)
    throw error
  }
}

// Interface for top tier books with user information
export interface TopTierBook {
  book: Book
  tierAssignments: {
    tier: TierLevel
    userCount: number
    users: Array<{
      id: string
      name: string
    }>
  }[]
}

export async function fetchTopTierBooks(
  tags: string[]
): Promise<TopTierBook[]> {
  try {
    const searchParams = new URLSearchParams()
    if (tags?.length) {
      tags.forEach(tag => searchParams.append('tags', tag))
    }

    const response = await fetch(
      `${USER_API_BASE_URL}/top-tier-books?${searchParams}`,
      {
        headers: getAuthHeaders(),
      }
    )
    if (!response.ok) {
      throw new Error('Failed to fetch top tier books')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching top tier books:', error)
    throw error
  }
}

// Book Tiers API functions
import type {
  BookTier,
  BookReview,
  TierLevel,
  ReadingStatus,
} from '../types/book'

// Helper function to get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('authToken')
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  }
}

export async function fetchUserBookTiers(userId: string): Promise<BookTier[]> {
  try {
    const response = await fetch(`${USER_API_BASE_URL}/users/${userId}/tiers`, {
      headers: getAuthHeaders(),
    })
    if (!response.ok) {
      throw new Error('Failed to fetch user book tiers')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching user book tiers:', error)
    throw error
  }
}

export async function assignBookToTier(
  bookId: string,
  tier: TierLevel,
  readingStatus: ReadingStatus = 'FINISHED'
): Promise<BookTier> {
  try {
    const response = await fetch(`${USER_API_BASE_URL}/tiers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ bookId, tier, readingStatus }),
    })
    if (!response.ok) {
      throw new Error('Failed to assign book to tier')
    }
    return await response.json()
  } catch (error) {
    console.error('Error assigning book to tier:', error)
    throw error
  }
}

export async function updateBookTier(
  tierId: string,
  tier: TierLevel
): Promise<BookTier> {
  try {
    const response = await fetch(`${USER_API_BASE_URL}/tiers/${tierId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ tier }),
    })
    if (!response.ok) {
      throw new Error('Failed to update book tier')
    }
    return await response.json()
  } catch (error) {
    console.error('Error updating book tier:', error)
    throw error
  }
}

export async function updateReadingStatus(
  bookId: string,
  readingStatus: ReadingStatus
): Promise<BookTier> {
  try {
    const response = await fetch(`${USER_API_BASE_URL}/reading-status`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ bookId, readingStatus }),
    })
    if (!response.ok) {
      throw new Error('Failed to update reading status')
    }
    return await response.json()
  } catch (error) {
    console.error('Error updating reading status:', error)
    throw error
  }
}

export async function removeBookFromTiers(tierId: string): Promise<void> {
  try {
    const response = await fetch(`${USER_API_BASE_URL}/tiers/${tierId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    if (!response.ok) {
      throw new Error('Failed to remove book from tiers')
    }
  } catch (error) {
    console.error('Error removing book from tiers:', error)
    throw error
  }
}

// Book Reviews API functions
export async function fetchUserBookReviews(
  userId: string
): Promise<BookReview[]> {
  try {
    const response = await fetch(
      `${USER_API_BASE_URL}/users/${userId}/reviews`,
      {
        headers: getAuthHeaders(),
      }
    )
    if (!response.ok) {
      throw new Error('Failed to fetch user book reviews')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching user book reviews:', error)
    throw error
  }
}

export async function fetchBookReviews(bookId: string): Promise<BookReview[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/books/reviews/${bookId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch book reviews')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching book reviews:', error)
    return [] // Return empty array on error to prevent crashes
  }
}

export async function createBookReview(
  bookId: string,
  review: string
): Promise<BookReview> {
  try {
    const response = await fetch(`${USER_API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ bookId, review }),
    })
    if (!response.ok) {
      const errorData = await response.text()
      throw new Error(`Failed to create book review: ${errorData}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Error creating book review:', error)
    throw error
  }
}

export async function updateBookReview(
  reviewId: string,
  review: string
): Promise<BookReview> {
  try {
    const response = await fetch(`${USER_API_BASE_URL}/reviews/${reviewId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ review }),
    })
    if (!response.ok) {
      throw new Error('Failed to update book review')
    }
    return await response.json()
  } catch (error) {
    console.error('Error updating book review:', error)
    throw error
  }
}

export async function deleteBookReview(reviewId: string): Promise<void> {
  try {
    const response = await fetch(`${USER_API_BASE_URL}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    if (!response.ok) {
      throw new Error('Failed to delete book review')
    }
  } catch (error) {
    console.error('Error deleting book review:', error)
    throw error
  }
}

// Create a new book
export interface CreateBookData {
  id: string
  title: string
  authorName: string
  description: string
  tags: string[]
  coverUrl?: string
  sourceUrl: string
  source: 'ROYAL_ROAD' | 'AMAZON'
  contentWarnings: string[]
  rating?: number
  followers?: number
  views?: number
  pages?: number
  average_views?: number
  favorites?: number
  ratings_count?: number
  character_score?: number
  grammar_score?: number
  overall_score?: number
  story_score?: number
  style_score?: number
}

export async function createBook(
  bookData: CreateBookData
): Promise<{ message: string; book: any }> {
  try {
    const response = await fetch(`${API_BASE_URL}/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create book')
    }

    return await response.json()
  } catch (error) {
    console.error('Error creating book:', error)
    throw error
  }
}

// User progress across all realms
export interface UserRealmProgress {
  totalMinutes: number
  realmMinutes: {
    cultivation: number
    gamelit: number
    apocalypse: number
    portal: number
  }
  realmBooks: {
    cultivation: Array<{bookId: string, title: string, minutes: number}>
    gamelit: Array<{bookId: string, title: string, minutes: number}>
    apocalypse: Array<{bookId: string, title: string, minutes: number}>
    portal: Array<{bookId: string, title: string, minutes: number}>
  }
  bonusActivities: Array<{
    bookId: string
    bookTitle: string
    minutes: number
    activityType: string
    date: string
  }>
  totalBonusMinutes: number
  progress: {
    cultivation: {
      currentRealm: string
      currentLevel: number
      progressPercent: number
      totalMinutes: number
    }
    gamelit: {
      level: number
      experience: number
      experienceToNext: number
      progressPercent: number
      totalMinutes: number
    }
    apocalypse: {
      survivalDays: number
      stats: {
        STR: number
        CON: number
        DEX: number
        WIS: number
        INT: number
        CHA: number
        LUCK: number
      }
      totalMinutes: number
    }
    portal: {
      reincarnations: number
      currentLife: string
      lifeLevel: number
      totalMinutes: number
    }
  }
}

export async function fetchUserRealmProgress(userId: string): Promise<UserRealmProgress> {
  try {
    const response = await fetch(`${API_BASE_URL}/realms/user/${userId}/progress`)
    if (!response.ok) {
      throw new Error('Failed to fetch user realm progress')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching user realm progress:', error)
    throw error
  }
}

// Book tier counts interface
export interface BookTierCounts {
  [bookId: string]: {
    SSS: number
    SS: number
    S: number
    total: number
  }
}

export async function fetchBookTierCounts(bookIds: string[]): Promise<BookTierCounts> {
  try {
    const response = await fetch(`${API_BASE_URL}/book-tier-counts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bookIds }),
    })
    if (!response.ok) {
      throw new Error('Failed to fetch book tier counts')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching book tier counts:', error)
    return {}
  }
}

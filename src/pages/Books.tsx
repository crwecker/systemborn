import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Book } from '../types/book'
import {
  searchBooks,
  fetchAmazonBooks,
  fetchAvailableTags,
  fetchAllTags,
} from '../services/api'
import {
  BookFiltersComponent,
  type BookFilters,
} from '../components/BookFilters'
import { BookResults } from '../components/BookResults'

interface BooksPageProps {
  initialFilters?: Partial<BookFilters>
}

// Helper functions
const getAuthors = (book: any) => {
  if (book.bookContributors?.length > 0) {
    return book.bookContributors
      .filter((bc: any) => bc.contributorType === 'AUTHOR')
      .map((bc: any) => bc.contributor.name)
      .join(', ')
  }
  return book.authorName || 'Unknown Author'
}

const normalizeAmazonBook = (book: any): Book => ({
  id: book.id,
  title: book.title,
  author: { name: getAuthors(book) },
  description: book.description,
  tags: book.tags || ['LitRPG'],
  image: book.coverUrl || '',
  url: book.sourceUrl,
  rating: 0,
  coverUrl: book.coverUrl || '',
  contentWarnings: book.contentWarnings || [],
  stats: {
    followers: 0,
    views: { total: 0, average: 0 },
    pages: 0,
    favorites: 0,
    ratings_count: 0,
    overall_score: 0,
    style_score: 0,
    story_score: 0,
    grammar_score: 0,
    character_score: 0,
  },
  source: 'AMAZON' as const,
})

const filterAmazonBooks = (
  books: any[],
  searchQuery: string,
  selectedTags: string[]
) => {
  return books
    .filter(book => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const title = book.title?.toLowerCase() || ''
        const author = getAuthors(book)?.toLowerCase() || ''
        const description = book.description?.toLowerCase() || ''

        if (
          !title.includes(query) &&
          !author.includes(query) &&
          !description.includes(query)
        ) {
          return false
        }
      }

      if (selectedTags.length > 0) {
        const bookTags = book.tags || ['LitRPG']
        return selectedTags.every(tag =>
          bookTags.some((bookTag: string) =>
            bookTag.toLowerCase().includes(tag.toLowerCase())
          )
        )
      }

      return true
    })
    .map(normalizeAmazonBook)
}

// Custom hooks
const useDebounced = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

const useBookData = (
  filters: BookFilters & { debouncedSearchQuery: string }
) => {
  const { data: popularTags = [] } = useQuery<string[]>({
    queryKey: ['popular-tags'],
    queryFn: fetchAvailableTags,
    staleTime: 5 * 60 * 1000,
  })

  // Fetch all tags using the new endpoint
  const { data: allTags = [] } = useQuery<string[]>({
    queryKey: ['all-tags'],
    queryFn: fetchAllTags,
    staleTime: 5 * 60 * 1000,
  })

  const { data: royalRoadBooks = [], isLoading: isLoadingRoyalRoad } = useQuery<
    Book[]
  >({
    queryKey: [
      'books',
      filters.selectedTags,
      filters.minRating,
      filters.sortBy,
      filters.debouncedSearchQuery,
    ],
    queryFn: () =>
      searchBooks({
        tags: filters.selectedTags,
        minRating: filters.minRating,
        sortBy: filters.sortBy,
        query: filters.debouncedSearchQuery,
      }),
  })

  const { data: amazonBooks = [], isLoading: isLoadingAmazon } = useQuery<
    any[]
  >({
    queryKey: ['amazon-books'],
    queryFn: fetchAmazonBooks,
  })

  const processedBooks = (() => {
    const filteredAmazonBooks = filterAmazonBooks(
      amazonBooks,
      filters.debouncedSearchQuery,
      filters.selectedTags
    )
    const combinedBooks = [...filteredAmazonBooks, ...royalRoadBooks]

    const filteredBooks = combinedBooks.filter(book => {
      if (filters.sourceFilter === 'ALL') return true
      if (filters.sourceFilter === 'AMAZON') return book.source === 'AMAZON'
      if (filters.sourceFilter === 'ROYAL_ROAD')
        return book.source === 'ROYAL_ROAD' || !book.source
      return true
    })

    // Apply client-side sorting to the combined books to ensure proper ordering
    // IMPORTANT: Amazon books always appear first as featured recommendations
    // since they don't have follower/stats data yet
    return filteredBooks.sort((a, b) => {
      // Always prioritize Amazon books first regardless of sort criteria
      if (a.source === 'AMAZON' && b.source !== 'AMAZON') return -1
      if (b.source === 'AMAZON' && a.source !== 'AMAZON') return 1
      
      // If both are the same source type, apply normal sorting
      switch (filters.sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'followers':
          return (b.stats?.followers || 0) - (a.stats?.followers || 0)
        case 'views':
          return (b.stats?.views?.total || 0) - (a.stats?.views?.total || 0)
        case 'pages':
          return (b.stats?.pages || 0) - (a.stats?.pages || 0)
        case 'latest':
          // For new books, we don't have createdAt, so fall back to original order
          return 0
        case 'trending':
          // Trending is a complex calculation, trust backend ordering for Royal Road books
          return 0
        default:
          return 0
      }
    })
  })()

  return {
    popularTags,
    allTags,
    books: processedBooks,
    isLoading: isLoadingRoyalRoad || isLoadingAmazon,
  }
}

export function BooksPage({ initialFilters }: BooksPageProps = {}) {
  const [filters, setFilters] = useState<BookFilters>({
    selectedTags: [],
    sortBy: 'followers',
    minRating: 0,
    searchQuery: '',
    sourceFilter: 'ALL',
    ...initialFilters,
  })

  const debouncedSearchQuery = useDebounced(filters.searchQuery, 300)
  const { popularTags, allTags, books, isLoading } = useBookData({
    ...filters,
    debouncedSearchQuery,
  })

  const handleFiltersChange = (updates: Partial<BookFilters>) => {
    setFilters(prev => ({ ...prev, ...updates }))
  }

  const handleAuthorClick = (authorName: string) => {
    window.location.href = `/author/${encodeURIComponent(authorName)}`
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <BookFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
        popularTags={popularTags}
        allTags={allTags}
        debouncedSearchQuery={debouncedSearchQuery}
      />

      <BookResults
        books={books}
        isLoading={isLoading}
        debouncedSearchQuery={debouncedSearchQuery}
        sourceFilter={filters.sourceFilter}
        onAuthorClick={handleAuthorClick}
      />
    </div>
  )
}

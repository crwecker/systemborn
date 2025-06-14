import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BookCard } from '../components/BookCard'
import type { Book } from '../types/book'
import { searchBooks, fetchTrendingBooks, fetchAmazonBooks, fetchAvailableTags } from '../services/api'

const SORT_OPTIONS = [
  { value: 'trending', label: 'Trending' },
  { value: 'rating', label: 'Rating' },
  { value: 'followers', label: 'Followers' },
  { value: 'views', label: 'Views' },
  { value: 'pages', label: 'Pages' },
  { value: 'latest', label: 'Latest' },
]

export function BooksPage() {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('trending')
  const [minRating, setMinRating] = useState(0)
  const [minPages, setMinPages] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'AMAZON' | 'ROYAL_ROAD'>('ALL')

  // Fetch popular tags
  const { data: popularTags = [] } = useQuery<string[]>({
    queryKey: ['popular-tags'],
    queryFn: fetchAvailableTags,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  // Helper function to get authors from database structure
  const getAuthors = (book: any) => {
    if (book.bookContributors && book.bookContributors.length > 0) {
      return book.bookContributors
        .filter((bc: any) => bc.contributorType === 'AUTHOR')
        .map((bc: any) => bc.contributor.name)
        .join(', ')
    }
    return book.authorName || 'Unknown Author'
  }

  // Helper function to get review from database structure
  const getReview = (book: any) => {
    if (book.bookReviews && book.bookReviews.length > 0) {
      return book.bookReviews[0].review
    }
    return 'No review available'
  }

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300) // 300ms delay

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch Royal Road books with current filters
  const { data: royalRoadBooks = [], isLoading: isLoadingRoyalRoad } = useQuery<Book[]>({
    queryKey: [
      'books',
      selectedTags,
      minRating,
      minPages,
      sortBy,
      debouncedSearchQuery,
    ],
    queryFn: () =>
      searchBooks({
        tags: selectedTags,
        minRating,
        minPages,
        sortBy,
        query: debouncedSearchQuery,
      }),
  })

  // Fetch Amazon affiliate books
  const { data: amazonBooks = [], isLoading: isLoadingAmazon } = useQuery<any[]>({
    queryKey: ['amazon-books'],
    queryFn: fetchAmazonBooks,
  })

  // Helper function to normalize Amazon books to Book format
  const normalizeAmazonBook = (book: any): Book => {
    return {
      id: book.id,
      title: book.title,
      author: {
        name: getAuthors(book)
      },
      description: book.description,
      tags: book.tags || ['LitRPG'],
      image: book.coverUrl || '',
      url: book.sourceUrl,
      rating: 0, // Amazon books don't have ratings in our system
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
        character_score: 0
      },
      source: 'AMAZON' as const
    }
  }

  // Filter Amazon books based on search criteria
  const filteredAmazonBooks = amazonBooks
    .filter(book => {
      // Apply search query filter
      if (debouncedSearchQuery) {
        const query = debouncedSearchQuery.toLowerCase()
        const title = book.title?.toLowerCase() || ''
        const author = getAuthors(book)?.toLowerCase() || ''
        const description = book.description?.toLowerCase() || ''
        
        if (!title.includes(query) && !author.includes(query) && !description.includes(query)) {
          return false
        }
      }
      
      // Apply tag filter
      if (selectedTags.length > 0) {
        const bookTags = book.tags || ['LitRPG']
        // ALL selected tags must match (AND logic)
        return selectedTags.every(tag => 
          bookTags.some((bookTag: string) => 
            bookTag.toLowerCase().includes(tag.toLowerCase())
          )
        )
      }
      
      return true
    })
    .map(normalizeAmazonBook)

  // Combine and filter by source (Amazon books first)
  const combinedBooks = [...filteredAmazonBooks, ...royalRoadBooks]
  const allBooks = combinedBooks.filter(book => {
    if (sourceFilter === 'ALL') return true
    if (sourceFilter === 'AMAZON') return book.source === 'AMAZON'
    if (sourceFilter === 'ROYAL_ROAD') return book.source === 'ROYAL_ROAD' || !book.source
    return true
  })
  
  const isLoading = isLoadingRoyalRoad || isLoadingAmazon

  const handleAuthorClick = (authorName: string) => {
    window.location.href = `/author/${encodeURIComponent(authorName)}`
  }

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Search and Filters */}
      <section>
        <h2 className='text-2xl font-bold mb-8 text-copper'>
          Browse Books
        </h2>

        {/* Filters */}
        <div className='mb-8 bg-slate p-6 rounded-lg shadow'>
          {/* Search Input */}
          <div className='mb-6'>
            <label className='block text-sm font-medium text-light-gray mb-2'>
              Search Books
            </label>
            <div className='relative'>
              <input
                type='text'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder='Search by title, author, or description...'
                className='w-full p-3 pr-10 rounded bg-medium-gray text-light-gray border-slate border focus:border-copper focus:ring-1 focus:ring-copper placeholder-gray-400'
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-light-gray'
                  type='button'>
                  ✕
                </button>
              )}
            </div>
            {debouncedSearchQuery && (
              <div className='mt-2 text-sm text-copper'>
                Searching for: "{debouncedSearchQuery}"
              </div>
            )}
          </div>

          {/* Source Filter Buttons */}
          <div className='mb-6'>
            <label className='block text-sm font-medium text-light-gray mb-2'>
              Source
            </label>
            <div className='flex flex-wrap gap-2'>
              <button
                onClick={() => setSourceFilter('ALL')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  sourceFilter === 'ALL'
                    ? 'bg-copper text-dark-blue'
                    : 'bg-medium-gray text-light-gray hover:bg-light-gray hover:text-dark-blue'
                }`}>
                All Sources
              </button>
              <button
                onClick={() => setSourceFilter('ROYAL_ROAD')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  sourceFilter === 'ROYAL_ROAD'
                    ? 'bg-blue-600 text-white'
                    : 'bg-medium-gray text-light-gray hover:bg-blue-600 hover:text-white'
                }`}>
                Royal Road
              </button>
              <button
                onClick={() => setSourceFilter('AMAZON')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                  sourceFilter === 'AMAZON'
                    ? 'bg-orange-600 text-white'
                    : 'bg-medium-gray text-light-gray hover:bg-orange-600 hover:text-white'
                }`}>
                Amazon
              </button>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {/* Tags */}
            <div>
              <label className='block text-sm font-medium text-light-gray mb-2'>
                Tags
              </label>
              <div className='flex flex-wrap gap-2'>
                {popularTags.map((tag: string) => (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedTags.includes(tag)
                        ? 'bg-copper text-dark-blue'
                        : 'bg-medium-gray text-light-gray'
                    } transition-colors duration-200`}>
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <label className='block text-sm font-medium text-light-gray mb-2'>
                Minimum Rating
              </label>
              <div className='flex flex-wrap gap-2'>
                <button
                  onClick={() => setMinRating(0)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                    minRating === 0
                      ? 'bg-copper text-dark-blue'
                      : 'bg-medium-gray text-light-gray hover:bg-light-gray hover:text-dark-blue'
                  }`}>
                  Any Rating
                </button>
                <button
                  onClick={() => setMinRating(3)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                    minRating === 3
                      ? 'bg-copper text-dark-blue'
                      : 'bg-medium-gray text-light-gray hover:bg-light-gray hover:text-dark-blue'
                  }`}>
                  3+ ★
                </button>
                <button
                  onClick={() => setMinRating(3.5)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                    minRating === 3.5
                      ? 'bg-copper text-dark-blue'
                      : 'bg-medium-gray text-light-gray hover:bg-light-gray hover:text-dark-blue'
                  }`}>
                  3.5+ ★
                </button>
                <button
                  onClick={() => setMinRating(4)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                    minRating === 4
                      ? 'bg-copper text-dark-blue'
                      : 'bg-medium-gray text-light-gray hover:bg-light-gray hover:text-dark-blue'
                  }`}>
                  4+ ★
                </button>
                <button
                  onClick={() => setMinRating(4.5)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                    minRating === 4.5
                      ? 'bg-copper text-dark-blue'
                      : 'bg-medium-gray text-light-gray hover:bg-light-gray hover:text-dark-blue'
                  }`}>
                  4.5+ ★
                </button>
                <button
                  onClick={() => setMinRating(5)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                    minRating === 5
                      ? 'bg-copper text-dark-blue'
                      : 'bg-medium-gray text-light-gray hover:bg-light-gray hover:text-dark-blue'
                  }`}>
                  5 ★
                </button>
              </div>
            </div>

            {/* Sort By */}
            <div>
              <label className='block text-sm font-medium text-light-gray mb-2'>
                Sort By
              </label>
              <div className='flex flex-wrap gap-2'>
                {SORT_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setSortBy(option.value)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                      sortBy === option.value
                        ? 'bg-copper text-dark-blue'
                        : 'bg-medium-gray text-light-gray hover:bg-light-gray hover:text-dark-blue'
                    }`}>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        {isLoading ? (
          <div className='text-center py-12 text-light-gray'>
            <div className='animate-pulse'>
              {debouncedSearchQuery
                ? `Searching for "${debouncedSearchQuery}"...`
                : 'Loading books...'}
            </div>
          </div>
        ) : (
          <>
            {debouncedSearchQuery && (
              <div className='mb-4 text-sm text-light-gray'>
                Found {allBooks.length} book{allBooks.length !== 1 ? 's' : ''}{' '}
                matching "{debouncedSearchQuery}"
                {sourceFilter !== 'ALL' && (
                  <span className='text-copper'> from {sourceFilter === 'ROYAL_ROAD' ? 'Royal Road' : 'Amazon'}</span>
                )}
              </div>
            )}
            {!debouncedSearchQuery && sourceFilter !== 'ALL' && (
              <div className='mb-4 text-sm text-light-gray'>
                Showing {allBooks.length} book{allBooks.length !== 1 ? 's' : ''}{' '}
                <span className='text-copper'>from {sourceFilter === 'ROYAL_ROAD' ? 'Royal Road' : 'Amazon'}</span>
              </div>
            )}
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6'>
              {allBooks.map(book => (
                <BookCard
                  key={book.id}
                  book={book}
                  onAuthorClick={handleAuthorClick}
                />
              ))}
            </div>
            {allBooks.length === 0 && debouncedSearchQuery && (
              <div className='text-center py-12 text-medium-gray'>
                No books found matching "{debouncedSearchQuery}". Try adjusting
                your search terms or filters.
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}

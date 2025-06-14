import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BookCard } from '../components/BookCard'
import type { Book } from '../types/book'
import { searchBooks, fetchTrendingBooks, fetchAmazonBooks } from '../services/api'
import { LITRPG_RELATED_TAGS } from '../../lib/royalroad'

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

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300) // 300ms delay

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Fetch Amazon affiliate books
  const { data: amazonBooks = [], isLoading: isLoadingAmazon } = useQuery<any[]>({
    queryKey: ['amazon-books'],
    queryFn: fetchAmazonBooks,
  })

  // Fetch books with current filters
  const { data: books = [], isLoading } = useQuery<Book[]>({
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

  const handleAuthorClick = (authorName: string) => {
    window.location.href = `/author/${encodeURIComponent(authorName)}`
  }

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

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

  return (
    <div className='container mx-auto px-4 py-8'>
      {/* Affiliate Recommendations */}
      <section className='mb-16'>
        <h2 className='text-2xl font-bold text-copper'>
          Recommended Amazon Kindle Books
        </h2>
        <div className='text-light-gray text-md mb-8'>
          If you are just getting into litrpg, these are some of my (and my
          family's) all time favorites. Clicking on any title will take you to
          the amazon page and as an Amazon Associate I earn from qualifying
          purchases.
        </div>

        {isLoadingAmazon ? (
          <div className='text-center py-12 text-light-gray'>
            <div className='animate-pulse'>Loading affiliate recommendations...</div>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8'>
            {amazonBooks.map((book: any) => (
              <div
                key={book.id}
                className='bg-[#1a1a1a] rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl group flex flex-col sm:flex-row lg:flex-col'>
                <a
                  href={book.sourceUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='block w-full'>
                  <div className='relative sm:w-48 lg:w-full'>
                    <div className='relative pb-[150%] bg-[#1a1a1a]'>
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className='absolute inset-0 w-full h-full object-contain transition-opacity duration-300 group-hover:opacity-90'
                      />
                    </div>
                  </div>
                  <div className='p-6 flex flex-col flex-grow'>
                    <h3 className='text-lg font-bold text-copper mb-3 line-clamp-2 group-hover:text-amber-400 transition-colors duration-300'>
                      {book.title}
                    </h3>
                    <div className='text-sm text-light-gray mb-3'>
                      by {getAuthors(book)}
                    </div>
                    <p className='text-light-gray text-sm leading-relaxed flex-grow mb-4'>
                      {book.description}
                    </p>
                    {getReview(book) && (
                      <div className='text-copper text-sm italic mb-4 p-3 bg-slate rounded'>
                        "{getReview(book)}"
                      </div>
                    )}
                    <div className='mt-4 text-xs text-copper opacity-80 font-medium uppercase tracking-wider'>
                      View on Amazon →
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Royal Road Books Section */}
      <section className='mt-16'>
        <h2 className='text-2xl font-bold mb-8 text-copper'>
          Browse Royal Road Books
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

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            {/* Tags */}
            <div>
              <label className='block text-sm font-medium text-light-gray mb-2'>
                Tags
              </label>
              <div className='flex flex-wrap gap-2'>
                {LITRPG_RELATED_TAGS.map((tag: string) => (
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
              <input
                type='range'
                min='0'
                max='5'
                step='0.5'
                value={minRating}
                onChange={e => setMinRating(parseFloat(e.target.value))}
                className='w-full accent-copper'
              />
              <span className='text-sm text-light-gray'>{minRating} stars</span>
            </div>

            {/* Sort By */}
            <div>
              <label className='block text-sm font-medium text-light-gray mb-2'>
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className='w-full p-2 rounded bg-medium-gray text-light-gray border-slate border focus:border-copper focus:ring-1 focus:ring-copper'>
                {SORT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
                Found {books.length} book{books.length !== 1 ? 's' : ''}{' '}
                matching "{debouncedSearchQuery}"
              </div>
            )}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
              {books.map(book => (
                <BookCard
                  key={book.id}
                  book={book}
                  onAuthorClick={handleAuthorClick}
                />
              ))}
            </div>
            {books.length === 0 && debouncedSearchQuery && (
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

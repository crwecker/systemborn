import { useState, useEffect } from 'react'
import { BookCard } from './BookCard'
import type { Book } from '../types/book'

const SOURCE_OPTIONS = [
  { value: 'ALL', label: 'All Sources', color: 'bg-copper' },
  { value: 'ROYAL_ROAD', label: 'Royal Road', color: 'bg-blue-600' },
  { value: 'AMAZON', label: 'Amazon', color: 'bg-orange-600' },
] as const

const PAGE_SIZE_OPTIONS = [25, 50, 100, 200]

type SourceFilter = typeof SOURCE_OPTIONS[number]['value']

interface BookResultsProps {
  books: Book[]
  isLoading: boolean
  debouncedSearchQuery: string
  sourceFilter: SourceFilter
  onAuthorClick: (authorName: string) => void
}

interface PaginationNavigationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

// Reusable pagination navigation component
const PaginationNavigation = ({ currentPage, totalPages, onPageChange }: PaginationNavigationProps) => {
  // Generate page numbers to show
  const generatePageNumbers = () => {
    const delta = 2 // Number of pages to show on each side of current page
    const pages: (number | string)[] = []
    
    // Always show first page
    if (currentPage > delta + 2) {
      pages.push(1)
      if (currentPage > delta + 3) {
        pages.push('...')
      }
    }
    
    // Show pages around current page
    for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
      pages.push(i)
    }
    
    // Always show last page
    if (currentPage < totalPages - delta - 1) {
      if (currentPage < totalPages - delta - 2) {
        pages.push('...')
      }
      pages.push(totalPages)
    }
    
    return pages
  }

  if (totalPages <= 1) return null

  return (
    <div className='flex justify-center items-center gap-2 p-4'>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className='px-4 py-2 bg-dark-blue text-light-gray border border-slate rounded hover:bg-slate disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
      >
        Previous
      </button>
      
      {generatePageNumbers().map((page, index) => (
        <button
          key={`${page}-${index}`}
          onClick={() => typeof page === 'number' && onPageChange(page)}
          disabled={page === '...' || page === currentPage}
          className={`px-3 py-2 border border-slate rounded transition-colors ${
            page === currentPage 
              ? 'bg-copper text-dark-blue font-semibold' 
              : page === '...'
              ? 'bg-transparent text-light-gray cursor-default'
              : 'bg-dark-blue text-light-gray hover:bg-slate'
          }`}
        >
          {page}
        </button>
      ))}
      
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className='px-4 py-2 bg-dark-blue text-light-gray border border-slate rounded hover:bg-slate disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
      >
        Next
      </button>
    </div>
  )
}

export const BookResults = ({ books, isLoading, debouncedSearchQuery, sourceFilter, onAuthorClick }: BookResultsProps) => {
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)

  // Reset to first page when books change (new search/filter)
  useEffect(() => {
    setCurrentPage(1)
  }, [books.length, debouncedSearchQuery, sourceFilter])

  if (isLoading) {
    return (
      <div className='text-center py-12 text-light-gray'>
        <div className='animate-pulse'>
          {debouncedSearchQuery ? `Searching for "${debouncedSearchQuery}"...` : 'Loading books...'}
        </div>
      </div>
    )
  }

  // Calculate pagination
  const totalPages = Math.ceil(books.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentBooks = books.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1) // Reset to first page when changing page size
  }

  return (
    <>
      {/* Results Info */}
      {(debouncedSearchQuery || sourceFilter !== 'ALL') && (
        <div className='mb-4 text-sm text-light-gray'>
          Found {books.length} book{books.length !== 1 ? 's' : ''}{' '}
          {debouncedSearchQuery && `matching "${debouncedSearchQuery}"`}
          {sourceFilter !== 'ALL' && (
            <span className='text-copper'>
              {debouncedSearchQuery ? ' ' : ''}from {
                SOURCE_OPTIONS.find(opt => opt.value === sourceFilter)?.label
              }
            </span>
          )}
        </div>
      )}

      {/* Pagination Controls */}
      {books.length > 0 && (
        <div className='flex justify-between items-center mb-6 p-4 bg-slate rounded-lg'>
          <div className='flex items-center gap-4'>
            <span className='text-light-gray'>Show:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className='bg-dark-blue text-light-gray border border-slate rounded px-3 py-1 focus:outline-none focus:border-copper'
            >
              {PAGE_SIZE_OPTIONS.map(size => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
          </div>
          
          <div className='text-light-gray text-sm'>
            Showing {startIndex + 1}-{Math.min(endIndex, books.length)} of {books.length} books
          </div>
          
          <div className='text-light-gray text-sm'>
            Page {currentPage} of {totalPages}
          </div>
        </div>
      )}

      {/* Top Pagination Navigation */}
      {totalPages > 1 && (
        <div className='border-b border-slate mb-6'>
          <PaginationNavigation
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Books Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8'>
        {currentBooks.map(book => (
          <BookCard key={book.id} book={book} onAuthorClick={onAuthorClick} />
        ))}
      </div>

      {/* Bottom Pagination Navigation */}
      {totalPages > 1 && (
        <div className='border-t border-slate'>
          <PaginationNavigation
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* No Results */}
      {books.length === 0 && debouncedSearchQuery && (
        <div className='text-center py-12 text-medium-gray'>
          No books found matching "{debouncedSearchQuery}". Try adjusting your search terms or filters.
        </div>
      )}
    </>
  )
} 
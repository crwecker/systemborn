import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { fetchUserBookTiers, fetchBookTierCounts } from '../services/api'
import { useAuthContext } from '../contexts/AuthContext'
import type { Book } from '../types/book'
import { TIER_CONFIG } from '../types/book'

interface BookCardProps {
  book: Book
  onAuthorClick?: (authorName: string) => void
  tierCounts?: {
    SSS: number
    SS: number
    S: number
    total: number
  }
}

export const BookCard: React.FC<BookCardProps> = ({ book, onAuthorClick, tierCounts }) => {
  const { user } = useAuthContext()
  const navigate = useNavigate()

  const { data: userTiers = [] } = useQuery({
    queryKey: ['userBookTiers', user?.id],
    queryFn: () => (user ? fetchUserBookTiers(user.id) : Promise.resolve([])),
    enabled: !!user,
  })

  // Check if book is already in user's tiers
  const existingTier =
    userTiers.find(tier => tier.bookId === book.id) || undefined

  const isAmazonBook = book.source === 'AMAZON'

  return (
    <div className='bg-[#1a1a1a] rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-200 hover:-translate-y-1 relative group'>
      <div className='relative pb-[150%] bg-[#1a1a1a]'>
        <div
          className='absolute inset-0 cursor-pointer'
          onClick={() =>
            navigate({ to: '/book/$bookId', params: { bookId: book.id } })
          }>
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={`Cover for ${book.title}`}
              className='absolute inset-0 w-full h-full object-contain hover:opacity-90 transition-opacity'
              onError={e => {
                // Hide the broken image and show the title fallback
                e.currentTarget.style.display = 'none'
                const titleDiv = e.currentTarget.parentElement?.querySelector(
                  '.title-fallback'
                ) as HTMLElement
                if (titleDiv) titleDiv.style.display = 'flex'
              }}
            />
          ) : null}
          <div
            className={`title-fallback absolute inset-0 flex items-center justify-center p-4 bg-gradient-to-br from-slate to-dark-blue ${book.coverUrl ? 'hidden' : 'flex'}`}
            style={{ display: book.coverUrl ? 'none' : 'flex' }}>
            <h3 className='text-copper text-lg font-serif text-center leading-tight'>
              {book.title}
            </h3>
          </div>
        </div>

        {/* Current Tier Badge Only */}
        {user && existingTier?.tier && (
          <div className='absolute top-2 right-2'>
            <div
              className={`px-2 py-1 rounded text-white text-xs font-bold ${TIER_CONFIG[existingTier.tier].color}`}>
              {existingTier.tier}
            </div>
          </div>
        )}
      </div>

      <div
        className='p-4 cursor-pointer'
        onClick={() =>
          navigate({ to: '/book/$bookId', params: { bookId: book.id } })
        }>
        <div>
          <h3 className='text-copper text-lg font-serif text-center line-clamp-2'>
            {book.title}
          </h3>
        </div>
        <div className='flex items-center justify-between mb-2'>
          <button
            onClick={e => {
              e.stopPropagation()
              onAuthorClick?.(book.author.name)
            }}
            className='text-light-gray hover:text-copper transition-colors duration-200'>
            by {book.author.name}
          </button>

          {/* Source Badge */}
          <div className='flex-shrink-0'>
            <span
              className={`px-2 py-1 rounded text-white text-xs font-bold ${
                isAmazonBook ? 'bg-orange-600' : 'bg-blue-600'
              }`}>
              {isAmazonBook ? 'AMZ' : 'RR'}
            </span>
          </div>
        </div>

        {/* Only show rating and stats for Royal Road books */}
        {!isAmazonBook && (
          <div className='flex items-center mb-2 text-light-gray'>
            <span className='text-copper'>★</span>
            <span className='ml-1'>{book.rating.toFixed(1)}</span>
            <span className='mx-2 text-medium-gray'>•</span>
            <span>{book.stats?.pages || 0} pages</span>
          </div>
        )}

        {/* Only show stats for Royal Road books */}
        {!isAmazonBook && (
          <div className='mt-3 flex items-center justify-between text-sm text-medium-gray'>
            <span>
              {(book.stats?.followers || 0).toLocaleString()} followers
            </span>
            <span>
              {(book.stats?.views?.total || 0).toLocaleString()} views
            </span>
          </div>
        )}

        {/* Tier counts for all books */}
        {tierCounts && tierCounts.total > 0 && (
          <div className='mt-3 flex items-center justify-center gap-2 text-xs'>
            <span className='text-medium-gray'>Student Tiers:</span>
            {tierCounts.SSS > 0 && (
              <span className='bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-2 py-1 rounded font-bold'>
                SSS: {tierCounts.SSS}
              </span>
            )}
            {tierCounts.SS > 0 && (
              <span className='bg-gradient-to-r from-gray-300 to-gray-500 text-black px-2 py-1 rounded font-bold'>
                SS: {tierCounts.SS}
              </span>
            )}
            {tierCounts.S > 0 && (
              <span className='bg-gradient-to-r from-yellow-600 to-yellow-800 text-white px-2 py-1 rounded font-bold'>
                S: {tierCounts.S}
              </span>
            )}
          </div>
        )}


      </div>
    </div>
  )
}

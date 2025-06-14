import React, { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  assignBookToTier,
  fetchUserBookTiers,
  updateReadingStatus,
} from '../services/api'
import { useAuthContext } from '../contexts/AuthContext'
import type { Book, TierLevel, ReadingStatus, BookTier } from '../types/book'
import { TIER_CONFIG, READING_STATUS_CONFIG } from '../types/book'

interface BookCardProps {
  book: Book
  onAuthorClick?: (authorName: string) => void
}

export const BookCard: React.FC<BookCardProps> = ({ book, onAuthorClick }) => {
  const [showBookActions, setShowBookActions] = useState(false)
  const { user } = useAuthContext()
  const queryClient = useQueryClient()

  const { data: userTiers = [] } = useQuery({
    queryKey: ['userBookTiers', user?.id],
    queryFn: () => (user ? fetchUserBookTiers(user.id) : Promise.resolve([])),
    enabled: !!user,
  })

  const assignTierMutation = useMutation({
    mutationFn: ({
      bookId,
      tier,
      readingStatus,
    }: {
      bookId: string
      tier: TierLevel
      readingStatus?: ReadingStatus
    }) => assignBookToTier(bookId, tier, readingStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBookTiers'] })
      setShowBookActions(false)
    },
  })

  // Check if book is already in user's tiers
  const existingTier =
    userTiers.find(tier => tier.bookId === book.id) || undefined

  const handleAddToTier = (tier: TierLevel) => {
    if (!user) return

    // Check tier limits
    const tierConfig = TIER_CONFIG[tier]
    const currentBooksInTier = userTiers.filter(
      userTier => userTier.tier === tier
    ).length

    if (tierConfig.maxBooks && currentBooksInTier >= tierConfig.maxBooks) {
      alert(
        `Tier ${tier} is full! Maximum ${tierConfig.maxBooks} books allowed.`
      )
      return
    }

    // Automatically set reading status to FINISHED when assigning to tier
    assignTierMutation.mutate({
      bookId: book.id,
      tier,
      readingStatus: 'FINISHED',
    })
  }

  const readingStatusMutation = useMutation({
    mutationFn: ({
      bookId,
      readingStatus,
    }: {
      bookId: string
      readingStatus: ReadingStatus
    }) => updateReadingStatus(bookId, readingStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBookTiers'] })
      setShowBookActions(false)
    },
  })

  const handleUpdateReadingStatus = (readingStatus: ReadingStatus) => {
    if (!user) return
    readingStatusMutation.mutate({ bookId: book.id, readingStatus })
  }

  const isAmazonBook = book.source === 'AMAZON'

  return (
    <div className='bg-[#1a1a1a] rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-200 hover:-translate-y-1 relative group'>
      <div className='relative pb-[150%] bg-[#1a1a1a]'>
        {isAmazonBook ? (
          <a
            href={book.url}
            target='_blank'
            rel='noopener noreferrer'
            className='absolute inset-0'>
            <img
              src={book.coverUrl || '/placeholder-cover.jpg'}
              alt={`Cover for ${book.title}`}
              className='absolute inset-0 w-full h-full object-contain hover:opacity-90 transition-opacity'
            />
          </a>
        ) : (
          <img
            src={book.coverUrl || '/placeholder-cover.jpg'}
            alt={`Cover for ${book.title}`}
            className='absolute inset-0 w-full h-full object-contain'
          />
        )}

        {/* Source Badge */}
        <div className='absolute top-2 left-2'>
          <span
            className={`px-2 py-1 rounded text-white text-xs font-bold ${
              isAmazonBook ? 'bg-orange-600' : 'bg-blue-600'
            }`}>
            {isAmazonBook ? 'Amazon' : 'Royal Road'}
          </span>
        </div>

        {/* Tier Action Overlay */}
        {user && (
          <div className='absolute top-2 right-2'>
            {existingTier ? (
              <div className='flex flex-col gap-1'>
                {/* Show reading status */}
                {existingTier?.readingStatus && (
                  <div
                    className={`px-2 py-1 rounded text-white text-xs font-bold ${READING_STATUS_CONFIG[existingTier.readingStatus]?.color || 'bg-gray-500'}`}
                    title={
                      READING_STATUS_CONFIG[existingTier.readingStatus]?.name ||
                      'Unknown Status'
                    }>
                    {existingTier.readingStatus === 'WANT_TO_READ'
                      ? 'Want'
                      : existingTier.readingStatus === 'READING'
                        ? 'Reading'
                        : 'Finished'}
                  </div>
                )}
                {/* Show tier if book is reading or finished and has a tier */}
                {existingTier.readingStatus &&
                  ['READING', 'FINISHED'].includes(
                    existingTier.readingStatus
                  ) &&
                  existingTier.tier && (
                    <div
                      className={`px-2 py-1 rounded text-white text-xs font-bold ${TIER_CONFIG[existingTier.tier].color}`}
                      title={`In ${TIER_CONFIG[existingTier.tier].name}`}>
                      {existingTier.tier}
                    </div>
                  )}
                {/* Manage button */}
                <button
                  onClick={() => setShowBookActions(!showBookActions)}
                  className='bg-copper text-dark-blue px-2 py-1 rounded text-xs font-medium hover:bg-light-gray transition-colors opacity-0 group-hover:opacity-100'>
                  Manage
                </button>
              </div>
            ) : (
              <div className='relative flex flex-col gap-1'>
                <button
                  onClick={() => setShowBookActions(!showBookActions)}
                  className='bg-copper text-dark-blue px-2 py-1 rounded text-xs font-medium hover:bg-light-gray transition-colors opacity-0 group-hover:opacity-100'>
                  Manage Book
                </button>

                {showBookActions && (
                  <div className='absolute top-full right-0 mt-1 bg-slate border border-medium-gray rounded-lg shadow-lg z-50 min-w-[220px]'>
                    <div className='p-3'>
                      {/* Tier Assignment Section - Always visible */}
                      <div className='mb-3'>
                        <div className='text-xs text-light-gray mb-2 font-medium'>
                          Assign Tier (auto-marks as Finished):
                        </div>
                        <div className='grid grid-cols-2 gap-1'>
                          {Object.entries(TIER_CONFIG).map(
                            ([tier, config]) => {
                              const currentCount = userTiers.filter(
                                t => t.tier === tier
                              ).length
                              const isDisabled = config.maxBooks
                                ? currentCount >= config.maxBooks
                                : false

                              return (
                                <button
                                  key={tier}
                                  onClick={() => handleAddToTier(tier as TierLevel)}
                                  disabled={
                                    isDisabled || assignTierMutation.isPending
                                  }
                                  className={`px-2 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                    isDisabled
                                      ? 'bg-gray-600 text-gray-400'
                                      : 'bg-medium-gray text-light-gray hover:bg-light-gray hover:text-dark-blue'
                                  }`}
                                  title={
                                    config.maxBooks
                                      ? `${currentCount}/${config.maxBooks} used`
                                      : config.name
                                  }>
                                  {tier}
                                  {config.maxBooks && (
                                    <span className='text-xs opacity-75 ml-1'>
                                      ({currentCount}/{config.maxBooks})
                                    </span>
                                  )}
                                </button>
                              )
                            }
                          )}
                        </div>
                      </div>

                      {/* Reading Status Section */}
                      <div className='mb-3 border-t border-medium-gray pt-3'>
                        <div className='text-xs text-light-gray mb-2 font-medium'>
                          Or set Reading Status:
                        </div>
                        <div className='grid grid-cols-1 gap-1'>
                          {Object.entries(READING_STATUS_CONFIG).map(
                            ([status, config]) => (
                              <button
                                key={status}
                                onClick={() =>
                                  handleUpdateReadingStatus(
                                    status as ReadingStatus
                                  )
                                }
                                disabled={readingStatusMutation.isPending}
                                className={`px-3 py-2 rounded text-xs font-medium transition-colors disabled:opacity-50 text-left ${'bg-medium-gray text-light-gray hover:bg-light-gray hover:text-dark-blue'}`}>
                                {config.name}
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => setShowBookActions(false)}
                        className='w-full px-2 py-1 bg-medium-gray text-light-gray rounded text-xs hover:bg-light-gray hover:text-dark-blue'>
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Special handling for Amazon books - show affiliate disclaimer */}
        {isAmazonBook && (
          <div className='absolute bottom-2 right-2'>
            <div className='text-xs text-copper opacity-80 font-medium uppercase tracking-wider bg-black bg-opacity-70 px-2 py-1 rounded'>
              Affiliate →
            </div>
          </div>
        )}
      </div>

      <div className='p-4'>
        {isAmazonBook ? (
          <a
            href={book.url}
            target='_blank'
            rel='noopener noreferrer'
            className='block'>
            <h3 className='text-copper text-xl font-serif mb-2 hover:text-amber-400 transition-colors'>
              {book.title}
            </h3>
          </a>
        ) : (
          <h3 className='text-copper text-xl font-serif mb-2'>{book.title}</h3>
        )}

        <button
          onClick={() => onAuthorClick?.(book.author.name)}
          className='text-light-gray hover:text-copper transition-colors duration-200 mb-2 block'>
          by {book.author.name}
        </button>

        {/* Only show rating and stats for Royal Road books */}
        {!isAmazonBook && (
          <div className='flex items-center mb-2 text-light-gray'>
            <span className='text-copper'>★</span>
            <span className='ml-1'>{book.rating.toFixed(1)}</span>
            <span className='mx-2 text-medium-gray'>•</span>
            <span>{book.stats?.pages || 0} pages</span>
          </div>
        )}

        <div className='flex flex-wrap gap-1 mb-3'>
          {book.tags.map(tag => (
            <span
              key={tag}
              className='px-2 py-1 bg-slate text-light-gray text-sm rounded'>
              {tag}
            </span>
          ))}
        </div>
        <p className='text-medium-gray text-sm line-clamp-3'>
          {book.description}
        </p>

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

        {/* Amazon affiliate disclaimer */}
        {isAmazonBook && (
          <div className='mt-3 text-xs text-copper opacity-80'>
            As an Amazon Associate I earn from qualifying purchases
          </div>
        )}
      </div>
    </div>
  )
}

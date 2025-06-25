import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  rectIntersection,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { useDraggable, useDroppable } from '@dnd-kit/core'
import { updateBookTier } from '../services/api'
import { CSS } from '@dnd-kit/utilities'
import {
  fetchBookDetails,
  fetchSimilarBooks,
  fetchUserBookTiers,
  assignBookToTier,
  updateReadingStatus,
  fetchBookReviews,
  createBookReview,
  updateBookReview,
  deleteBookReview,
} from '../services/api'
import { useAuthContext } from '../contexts/AuthContext'
import type {
  Book,
  TierLevel,
  ReadingStatus,
  BookTier,
  BookReview,
} from '../types/book'
import { TIER_CONFIG, READING_STATUS_CONFIG } from '../types/book'

// Draggable Book Poster Component
interface DraggableBookPosterProps {
  book: Book
  bookId: string
}

const DraggableBookPoster: React.FC<DraggableBookPosterProps> = ({
  book,
  bookId,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: `book-${bookId}` })

  const style = {
    transform: CSS.Transform.toString(transform),
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50' : ''}`}>
      <div className='relative group'>
        <div className='w-16 h-24 bg-slate rounded overflow-hidden shadow-md hover:shadow-lg transition-shadow'>
          <img
            src={book.coverUrl || '/placeholder-cover.jpg'}
            alt={`Cover for ${book.title}`}
            className='w-full h-full object-cover'
            onError={e => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              const parent = target.parentElement
              if (parent) {
                parent.innerHTML = `<div class="w-full h-full bg-gradient-to-b from-slate-600 to-slate-800 flex items-center justify-center text-[8px] text-copper font-bold text-center px-1 leading-tight">${book.title?.slice(0, 15) || 'Book'}</div>`
              }
            }}
          />
        </div>
        {/* Drag hint */}
        <div className='absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-medium-gray opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap'>
          Drag to tier
        </div>
      </div>
    </div>
  )
}

// Droppable Tier Button Component
interface DroppableTierButtonProps {
  tier: TierLevel
  config: { name: string; maxBooks?: number; color: string }
  currentCount: number
  isDisabled: boolean
  isCurrentTier: boolean
  tierBooks: BookTier[]
  showBookPosters: boolean
  onClick: () => void
  isPending: boolean
  navigate: any
}

const DroppableTierButton: React.FC<DroppableTierButtonProps> = ({
  tier,
  config,
  currentCount,
  isDisabled,
  isCurrentTier,
  tierBooks,
  showBookPosters,
  onClick,
  isPending,
  navigate,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: tier })

  return (
    <div ref={setNodeRef} className='relative'>
      <button
        onClick={onClick}
        disabled={isDisabled || isPending}
        className={`w-full flex items-center justify-between p-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
          isCurrentTier
            ? 'ring-2 ring-copper/70 shadow-lg transform scale-102'
            : isDisabled
              ? 'bg-gray-700/50 text-gray-500'
              : 'hover:transform hover:scale-101 hover:shadow-md'
        } ${config.color} ${isOver ? 'ring-2 ring-blue-400 ring-opacity-70' : ''}`}
        title={
          config.maxBooks
            ? `${currentCount}/${config.maxBooks} used - ${config.name}`
            : config.name
        }>
        {/* Left side - Tier label and name */}
        <div className='flex items-center gap-3'>
          <div className='text-white font-bold text-lg min-w-[3rem] text-center bg-black/20 rounded px-2 py-1'>
            {tier}
          </div>
          <div className='text-white font-medium'>{config.name}</div>
        </div>

        {/* Right side - Status and count */}
        <div className='flex items-center gap-2'>
          {isCurrentTier && (
            <div className='bg-copper text-dark-blue px-3 py-1 rounded-full text-xs font-bold shadow-lg'>
              ✓ CURRENT
            </div>
          )}
          {config.maxBooks && (
            <div className='bg-black/30 text-white px-2 py-1 rounded text-xs'>
              {currentCount}/{config.maxBooks}
            </div>
          )}
          {!isCurrentTier && !isDisabled && (
            <div className='text-white/70 text-xs'>Click to assign</div>
          )}
        </div>
      </button>

      {/* Small book posters for all tiers */}
      {showBookPosters && (
        <div className='mt-2 px-3'>
          <div className='relative'>
            <div
              className='flex gap-1 overflow-x-auto pb-2 tier-books-scroll'
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: '#d4a574 #475569',
              }}>
              {tierBooks.map(tierBook => (
                <DraggableTierBookPoster
                  key={tierBook.id}
                  tierBook={tierBook}
                  navigate={navigate}
                />
              ))}
            </div>
            {/* Scroll indicator for many books */}
            {tierBooks.length > 6 && (
              <div className='absolute right-0 top-0 bottom-2 w-4 bg-gradient-to-l from-slate-800/80 to-transparent pointer-events-none flex items-center justify-end pr-1'>
                <div className='text-copper text-xs'>→</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Draggable Tier Book Poster Component
interface DraggableTierBookPosterProps {
  tierBook: BookTier
  navigate: any
}

const DraggableTierBookPoster: React.FC<DraggableTierBookPosterProps> = ({
  tierBook,
  navigate,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: `tier-book-${tierBook.id}` })

  const style = {
    transform: CSS.Transform.toString(transform),
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative group flex-shrink-0 cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50' : ''}`}>
      <button
        onClick={e => {
          e.stopPropagation()
          navigate({ to: '/book/$bookId', params: { bookId: tierBook.bookId } })
        }}
        className='w-8 h-12 bg-slate rounded overflow-hidden shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-copper'>
        <img
          src={tierBook.book?.coverUrl || '/placeholder-cover.jpg'}
          alt={tierBook.book?.title || 'Book cover'}
          className='w-full h-full object-cover'
          onError={e => {
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            const parent = target.parentElement
            if (parent) {
              parent.innerHTML = `<div class="w-full h-full bg-gradient-to-b from-slate-600 to-slate-800 flex items-center justify-center text-[6px] text-copper font-bold text-center px-1 leading-tight">${tierBook.book?.title?.slice(0, 20) || 'Book'}</div>`
            }
          }}
        />
      </button>
      {/* Tooltip on hover */}
      <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10'>
        {tierBook.book?.title}
      </div>
    </div>
  )
}

export function BookDetailPage() {
  const { bookId } = useParams({ from: '/book/$bookId' })
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const queryClient = useQueryClient()

  // Scroll to top when component mounts or bookId changes
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [bookId])

  // Store the current page in navigation history when component mounts
  useEffect(() => {
    // Get the previous page from sessionStorage
    const navigationHistory = JSON.parse(
      sessionStorage.getItem('navigationHistory') || '[]'
    )

    const currentPath = window.location.pathname

    // Only add to history if it's different from the last entry
    const lastEntry = navigationHistory[navigationHistory.length - 1]
    if (!lastEntry || lastEntry.path !== currentPath) {
      const currentPage = {
        path: currentPath,
        timestamp: Date.now(),
      }

      navigationHistory.push(currentPage)

      // Keep only the last 10 pages to avoid memory issues
      if (navigationHistory.length > 10) {
        navigationHistory.shift()
      }

      sessionStorage.setItem(
        'navigationHistory',
        JSON.stringify(navigationHistory)
      )
    }
  }, [bookId])

  const handleGoBack = () => {
    const navigationHistory = JSON.parse(
      sessionStorage.getItem('navigationHistory') || '[]'
    )
    const currentPath = window.location.pathname

    // Find the most recent page that's different from current
    let previousPage = null
    for (let i = navigationHistory.length - 2; i >= 0; i--) {
      if (navigationHistory[i].path !== currentPath) {
        previousPage = navigationHistory[i]
        break
      }
    }

    // If we found a different previous page, go back
    if (previousPage) {
      window.history.back()
    } else {
      navigate({ to: '/books' })
    }
  }

  const [reviewText, setReviewText] = useState('')
  const [editingReview, setEditingReview] = useState<BookReview | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 15, // Require more movement to start drag
        delay: 100, // Small delay to prevent accidental drags
      },
    }),
    useSensor(KeyboardSensor)
  )

  // Custom collision detection that only triggers on actual overlap
  const customCollisionDetection = (args: any) => {
    // First try rectangle intersection (requires actual overlap)
    const intersectionCollisions = rectIntersection(args)

    if (intersectionCollisions.length > 0) {
      // Return the first intersection collision
      return intersectionCollisions
    }

    // If no intersections, return empty array (no collision)
    return []
  }

  // Fetch book details
  const {
    data: book,
    isLoading: bookLoading,
    error: bookError,
  } = useQuery({
    queryKey: ['book', bookId],
    queryFn: () => fetchBookDetails(bookId),
    enabled: !!bookId,
  })

  // Fetch similar books
  const { data: similarBooks = [] } = useQuery({
    queryKey: ['similarBooks', bookId],
    queryFn: () => fetchSimilarBooks(bookId, 6),
    enabled: !!bookId && !!book,
  })

  // Fetch user's book tiers
  const { data: userTiers = [] } = useQuery({
    queryKey: ['userBookTiers', user?.id],
    queryFn: () => (user ? fetchUserBookTiers(user.id) : Promise.resolve([])),
    enabled: !!user,
  })

  // Fetch book reviews
  const { data: reviews = [] } = useQuery({
    queryKey: ['bookReviews', bookId],
    queryFn: () => fetchBookReviews(bookId),
    enabled: !!bookId,
  })

  // Check if book is in user's collection
  const existingTier = userTiers.find(tier => tier.bookId === bookId)
  const userReview = Array.isArray(reviews)
    ? reviews.find(review => review.userId === user?.id)
    : undefined

  // Mutations
  const assignTierMutation = useMutation({
    mutationFn: ({
      tier,
      readingStatus,
    }: {
      tier: TierLevel
      readingStatus?: ReadingStatus
    }) => assignBookToTier(bookId, tier, readingStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBookTiers'] })
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: (readingStatus: ReadingStatus) =>
      updateReadingStatus(bookId, readingStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBookTiers'] })
    },
  })

  const updateTierMutation = useMutation({
    mutationFn: ({ tierId, tier }: { tierId: string; tier: TierLevel }) =>
      updateBookTier(tierId, tier),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBookTiers'] })
    },
  })

  const createReviewMutation = useMutation({
    mutationFn: (review: string) => createBookReview(bookId, review),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookReviews'] })
      setReviewText('')
      setShowReviewForm(false)
    },
  })

  const updateReviewMutation = useMutation({
    mutationFn: ({ reviewId, review }: { reviewId: string; review: string }) =>
      updateBookReview(reviewId, review),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookReviews'] })
      setEditingReview(null)
      setReviewText('')
    },
  })

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: string) => deleteBookReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookReviews'] })
    },
  })

  const handleAddToTier = (tier: TierLevel) => {
    // If clicking on the current tier, remove from tier but keep in finished state
    if (existingTier?.tier === tier) {
      // Use updateReadingStatus to set tier to null while keeping FINISHED status
      updateStatusMutation.mutate('FINISHED')
      return
    }

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

    assignTierMutation.mutate({ tier, readingStatus: 'FINISHED' })
  }

  const handleUpdateStatus = (status: ReadingStatus) => {
    updateStatusMutation.mutate(status)
  }

  const handleSubmitReview = () => {
    if (!reviewText.trim()) return

    if (editingReview) {
      updateReviewMutation.mutate({
        reviewId: editingReview.id,
        review: reviewText,
      })
    } else {
      createReviewMutation.mutate(reviewText)
    }
  }

  const handleEditReview = (review: BookReview) => {
    setEditingReview(review)
    setReviewText(review.review)
    setShowReviewForm(true)
  }

  const handleDeleteReview = (reviewId: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      deleteReviewMutation.mutate(reviewId)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    const activeId = active.id as string

    // Cancel if not dropped over a valid tier (no over means dropped in empty space)
    if (!over) {
      return
    }

    const overId = over.id as string

    // Only proceed if dropped specifically on a tier button
    if (!Object.keys(TIER_CONFIG).includes(overId)) {
      return
    }

    const targetTier = overId as TierLevel

    // Handle dragging the current book (not yet in tiers)
    if (activeId === `book-${bookId}`) {
      // Don't assign to same tier
      if (existingTier?.tier === targetTier) {
        return
      }

      // Check tier limits
      const tierConfig = TIER_CONFIG[targetTier]
      const currentBooksInTier = userTiers.filter(
        userTier => userTier.tier === targetTier
      ).length

      if (tierConfig.maxBooks && currentBooksInTier >= tierConfig.maxBooks) {
        alert(
          `Tier ${targetTier} is full! Maximum ${tierConfig.maxBooks} books allowed.`
        )
        return
      }

      assignTierMutation.mutate({ tier: targetTier, readingStatus: 'FINISHED' })
      return
    }

    // Handle dragging existing tier books
    if (activeId.startsWith('tier-book-')) {
      const tierId = activeId.replace('tier-book-', '')
      const draggedBookTier = userTiers.find(bt => bt.id === tierId)

      if (!draggedBookTier) {
        return
      }

      // Don't move to same tier
      if (draggedBookTier.tier === targetTier) {
        return
      }

      // Check tier limits for target tier
      const tierConfig = TIER_CONFIG[targetTier]
      const currentBooksInTier = userTiers.filter(
        userTier => userTier.tier === targetTier
      ).length

      if (tierConfig.maxBooks && currentBooksInTier >= tierConfig.maxBooks) {
        alert(
          `Tier ${targetTier} is full! Maximum ${tierConfig.maxBooks} books allowed.`
        )
        return
      }

      updateTierMutation.mutate({ tierId, tier: targetTier })
    }
  }

  const isAmazonBook = book?.source === 'AMAZON'

  if (bookLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-light-gray'>Loading book details...</div>
      </div>
    )
  }

  if (bookError || !book) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen gap-4'>
        <div className='text-red-400'>Failed to load book details</div>
        <button
          onClick={() => navigate({ to: '/books' })}
          className='px-4 py-2 bg-copper text-dark-blue rounded hover:bg-light-gray transition-colors'>
                        Back to Library
        </button>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}>
      <div className='container mx-auto px-4 py-8 max-w-6xl'>
        {/* Header with back button */}
        <div className='mb-6'>
          <button
            onClick={handleGoBack}
            className='flex items-center gap-2 text-light-gray hover:text-copper transition-colors mb-4'>
            ← Back
          </button>
        </div>

        {/* Main book details */}
        <div className='grid lg:grid-cols-3 gap-8'>
          {/* Left column - Book cover and actions */}
          <div className='lg:col-span-1'>
            <div className='bg-[#1a1a1a] rounded-lg p-6 sticky top-8'>
              {/* Book cover */}
              <div className='relative mb-6'>
                <div className='aspect-[2/3] bg-slate rounded-lg overflow-hidden'>
                  <a href={book.url} target='_blank' rel='noopener noreferrer'>
                    <img
                      src={book.coverUrl || '/placeholder-cover.jpg'}
                      alt={`Cover for ${book.title}`}
                      className='w-full h-full object-cover hover:opacity-90 transition-opacity'
                    />
                  </a>
                </div>
              </div>

              {/* Source Link - Always show for both Amazon and Royal Road */}
              <div className='mb-6'>
                <a
                  href={book.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className={`block w-full px-4 py-3 text-white text-center rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    isAmazonBook
                      ? 'bg-orange-600 hover:bg-orange-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}>
                  {isAmazonBook ? (
                    <>📚 View on Amazon</>
                  ) : (
                    <>
                      <svg
                        className='w-5 h-5'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
                        />
                      </svg>
                      📖 Read on Royal Road
                    </>
                  )}
                </a>

                {/* Amazon affiliate disclaimer */}
                {isAmazonBook && (
                  <div className='mt-2 text-xs text-copper opacity-80 text-center'>
                    As an Amazon Associate I earn from qualifying purchases
                  </div>
                )}
              </div>

              {/* Book actions */}
              {user && (
                <div className='space-y-4'>
                  {/* Draggable Book Poster */}
                  <div className='bg-slate/50 rounded-lg p-4 border border-copper/20'>
                    <div className='text-sm font-medium text-light-gray mb-3 text-center'>
                      📖 Drag to Assign
                    </div>
                    <div className='flex justify-center'>
                      <DraggableBookPoster book={book} bookId={bookId} />
                    </div>
                  </div>

                  {/* Tier Assignment */}
                  <div className='bg-slate/50 rounded-lg p-4 border border-copper/20'>
                    <div>
                      <div className='text-sm font-medium text-light-gray mb-3'>
                        ⭐ Assign to Tier
                      </div>

                      {/* Tier List Display */}
                      <div className='space-y-2'>
                        {Object.entries(TIER_CONFIG).map(([tier, config]) => {
                          const currentCount = userTiers.filter(
                            userTier => userTier.tier === tier
                          ).length
                          const isDisabled = Boolean(
                            config.maxBooks &&
                              currentCount >= config.maxBooks &&
                              existingTier?.tier !== tier
                          )
                          const isCurrentTier = existingTier?.tier === tier
                          const tierBooks = userTiers.filter(
                            userTier => userTier.tier === tier && userTier.book
                          )
                          const showBookPosters = tierBooks.length > 0

                          return (
                            <DroppableTierButton
                              key={tier}
                              tier={tier as TierLevel}
                              config={config}
                              currentCount={currentCount}
                              isDisabled={isDisabled}
                              isCurrentTier={isCurrentTier}
                              tierBooks={tierBooks}
                              showBookPosters={showBookPosters}
                              onClick={() => handleAddToTier(tier as TierLevel)}
                              isPending={assignTierMutation.isPending}
                              navigate={navigate}
                            />
                          )
                        })}
                      </div>

                      <div className='text-xs text-medium-gray mt-3 text-center'>
                        💡 Higher tiers (SSS, SS, S) are more exclusive with
                        limited slots
                      </div>

                      {/* View My Tiers Link */}
                      <div className='mt-4 pt-3 border-t border-copper/20'>
                        <button
                          onClick={() => navigate({ to: '/my-tiers' })}
                          className='w-full px-3 py-2 text-copper hover:text-light-gray text-sm font-medium transition-colors flex items-center justify-center gap-2'>
                          <svg
                            className='w-4 h-4'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'>
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 00-2-2M9 5v2a2 2 0 002 2h2a2 2 0 002-2V5'
                            />
                          </svg>
                          View My Tiers
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!user && (
                <div className='text-center py-4'>
                  <button
                    onClick={() => navigate({ to: '/signin' })}
                    className='px-4 py-2 bg-copper text-dark-blue rounded font-medium hover:bg-light-gray transition-colors'>
                    Sign In to Manage
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right column - Book details and reviews */}
          <div className='lg:col-span-2 space-y-8'>
            {/* Book info */}
            <div className='bg-[#1a1a1a] rounded-lg p-6'>
              <div className='flex items-start justify-between mb-2'>
                <h1 className='text-3xl font-serif text-copper flex-1 mr-4'>
                  {book.title}
                </h1>

                {/* Source badge moved here */}
                <div className='flex-shrink-0'>
                  <span
                    className={`px-3 py-1 rounded text-white text-sm font-bold ${
                      isAmazonBook ? 'bg-orange-600' : 'bg-blue-600'
                    }`}>
                    {isAmazonBook ? 'Amazon' : 'Royal Road'}
                  </span>
                </div>
              </div>
              <p className='text-xl text-light-gray mb-4'>
                by {book.author.name}
              </p>

              {/* Stats for Royal Road books */}
              {!isAmazonBook && book.stats && book.rating > 0 && (
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate rounded-lg'>
                  <div className='text-center'>
                    <div className='text-copper text-xl font-bold'>
                      ★ {book.rating.toFixed(1)}
                    </div>
                    <div className='text-xs text-medium-gray'>Rating</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-copper text-xl font-bold'>
                      {book.stats.pages.toLocaleString()}
                    </div>
                    <div className='text-xs text-medium-gray'>Pages</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-copper text-xl font-bold'>
                      {book.stats.followers.toLocaleString()}
                    </div>
                    <div className='text-xs text-medium-gray'>Followers</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-copper text-xl font-bold'>
                      {book.stats.views.total.toLocaleString()}
                    </div>
                    <div className='text-xs text-medium-gray'>Views</div>
                  </div>
                </div>
              )}

              {/* Stats without rating for Royal Road books */}
              {!isAmazonBook && book.stats && book.rating === 0 && (
                <div className='grid grid-cols-3 gap-4 mb-6 p-4 bg-slate rounded-lg'>
                  <div className='text-center'>
                    <div className='text-copper text-xl font-bold'>
                      {book.stats.pages.toLocaleString()}
                    </div>
                    <div className='text-xs text-medium-gray'>Pages</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-copper text-xl font-bold'>
                      {book.stats.followers.toLocaleString()}
                    </div>
                    <div className='text-xs text-medium-gray'>Followers</div>
                  </div>
                  <div className='text-center'>
                    <div className='text-copper text-xl font-bold'>
                      {book.stats.views.total.toLocaleString()}
                    </div>
                    <div className='text-xs text-medium-gray'>Views</div>
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className='flex flex-wrap gap-2 mb-6'>
                {book.tags.map(tag => (
                  <span
                    key={tag}
                    className='px-3 py-1 bg-slate text-light-gray text-sm rounded-full'>
                    {tag}
                  </span>
                ))}
              </div>

              {/* Content warnings */}
              {book.contentWarnings && book.contentWarnings.length > 0 && (
                <div className='mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg'>
                  <h3 className='text-red-400 font-medium mb-2'>
                    Content Warnings:
                  </h3>
                  <div className='flex flex-wrap gap-2'>
                    {book.contentWarnings.map(warning => (
                      <span
                        key={warning}
                        className='px-2 py-1 bg-red-800 text-red-200 text-sm rounded'>
                        {warning}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div className='prose prose-invert max-w-none'>
                <h3 className='text-light-gray font-medium mb-3'>
                  Description
                </h3>
                <p className='text-medium-gray leading-relaxed whitespace-pre-wrap'>
                  {book.description}
                </p>
              </div>

              {/* Reading Status Section */}
              {user && (
                <div className='mt-6 pt-6 border-t border-medium-gray'>
                  <h3 className='text-light-gray font-medium mb-3'>
                    📚 Reading Status
                  </h3>
                  <div className='grid grid-cols-3 gap-2'>
                    {Object.entries(READING_STATUS_CONFIG).map(
                      ([status, config]) => (
                        <button
                          key={status}
                          onClick={() =>
                            handleUpdateStatus(status as ReadingStatus)
                          }
                          disabled={updateStatusMutation.isPending}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 ${
                            existingTier?.readingStatus === status
                              ? 'bg-copper text-dark-blue shadow-lg transform scale-105'
                              : 'bg-slate text-light-gray hover:bg-medium-gray hover:text-dark-blue hover:transform hover:scale-102'
                          }`}>
                          {config.name}
                        </button>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* Detailed stats for Royal Road books with ratings */}
              {!isAmazonBook && book.stats && book.rating > 0 && (
                <div className='mt-6 pt-6 border-t border-medium-gray'>
                  <h3 className='text-light-gray font-medium mb-3'>
                    Detailed Stats
                  </h3>
                  <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                    <div>
                      <div className='text-medium-gray'>Overall Score</div>
                      <div className='text-copper font-medium'>
                        {book.stats.overall_score?.toFixed(1) || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className='text-medium-gray'>Style Score</div>
                      <div className='text-copper font-medium'>
                        {book.stats.style_score?.toFixed(1) || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className='text-medium-gray'>Story Score</div>
                      <div className='text-copper font-medium'>
                        {book.stats.story_score?.toFixed(1) || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className='text-medium-gray'>Grammar Score</div>
                      <div className='text-copper font-medium'>
                        {book.stats.grammar_score?.toFixed(1) || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className='text-medium-gray'>Character Score</div>
                      <div className='text-copper font-medium'>
                        {book.stats.character_score?.toFixed(1) || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className='text-medium-gray'>Favorites</div>
                      <div className='text-copper font-medium'>
                        {book.stats.favorites?.toLocaleString() || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className='text-medium-gray'>Ratings Count</div>
                      <div className='text-copper font-medium'>
                        {book.stats.ratings_count?.toLocaleString() || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className='text-medium-gray'>Avg Views</div>
                      <div className='text-copper font-medium'>
                        {book.stats.views.average?.toLocaleString() || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Detailed stats for Royal Road books without ratings */}
              {!isAmazonBook && book.stats && book.rating === 0 && (
                <div className='mt-6 pt-6 border-t border-medium-gray'>
                  <h3 className='text-light-gray font-medium mb-3'>
                    Book Stats
                  </h3>
                  <div className='grid grid-cols-2 md:grid-cols-3 gap-4 text-sm'>
                    <div>
                      <div className='text-medium-gray'>Favorites</div>
                      <div className='text-copper font-medium'>
                        {book.stats.favorites?.toLocaleString() || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className='text-medium-gray'>Total Views</div>
                      <div className='text-copper font-medium'>
                        {book.stats.views.total?.toLocaleString() || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className='text-medium-gray'>Avg Views</div>
                      <div className='text-copper font-medium'>
                        {book.stats.views.average?.toLocaleString() || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Reviews section */}
            <div className='bg-[#1a1a1a] rounded-lg p-6'>
              <div className='flex items-center justify-between mb-6'>
                <h3 className='text-xl font-medium text-light-gray'>
                  Community Reviews
                </h3>
                {user && !userReview && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className='px-4 py-2 bg-copper text-dark-blue rounded font-medium hover:bg-light-gray transition-colors'>
                    Write Review
                  </button>
                )}
              </div>

              {/* Review form */}
              {showReviewForm && user && (
                <div className='mb-6 p-4 bg-slate rounded-lg'>
                  <h4 className='text-light-gray font-medium mb-3'>
                    {editingReview ? 'Edit Review' : 'Write Your Review'}
                  </h4>
                  <textarea
                    value={reviewText}
                    onChange={e => setReviewText(e.target.value)}
                    placeholder='Share your thoughts about this book...'
                    className='w-full h-32 p-3 bg-dark-blue text-light-gray border border-medium-gray rounded resize-none focus:outline-none focus:border-copper'
                  />
                  <div className='flex gap-2 mt-3'>
                    <button
                      onClick={handleSubmitReview}
                      disabled={
                        !reviewText.trim() ||
                        createReviewMutation.isPending ||
                        updateReviewMutation.isPending
                      }
                      className='px-4 py-2 bg-copper text-dark-blue rounded font-medium hover:bg-light-gray transition-colors disabled:opacity-50'>
                      {editingReview ? 'Update Review' : 'Submit Review'}
                    </button>
                    <button
                      onClick={() => {
                        setShowReviewForm(false)
                        setEditingReview(null)
                        setReviewText('')
                      }}
                      className='px-4 py-2 bg-medium-gray text-light-gray rounded hover:bg-light-gray hover:text-dark-blue transition-colors'>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Reviews list */}
              <div className='space-y-4'>
                {!Array.isArray(reviews) || reviews.length === 0 ? (
                  <div className='text-center py-8 text-medium-gray'>
                    No reviews yet. Be the first to share your thoughts!
                  </div>
                ) : (
                  reviews.map(review => (
                    <div key={review.id} className='p-4 bg-slate rounded-lg'>
                      <div className='flex items-start justify-between mb-3'>
                        <div>
                          <div className='font-medium text-light-gray'>
                            {review.user
                              ? `${review.user.firstName} ${review.user.lastName.charAt(0)}.`
                              : 'Anonymous User'}
                          </div>
                          <div className='text-sm text-medium-gray'>
                            {new Date(review.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        {user?.id === review.userId && (
                          <div className='flex gap-2'>
                            <button
                              onClick={() => handleEditReview(review)}
                              className='text-copper hover:text-light-gray text-sm font-medium'>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteReview(review.id)}
                              className='text-red-400 hover:text-red-300 text-sm font-medium'>
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                      <p className='text-medium-gray leading-relaxed whitespace-pre-wrap'>
                        {review.review}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Similar books */}
            {similarBooks.length > 0 && (
              <div className='bg-[#1a1a1a] rounded-lg p-6'>
                <h3 className='text-xl font-medium text-light-gray mb-6'>
                  Similar Books
                </h3>
                <div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                  {similarBooks.map(similarBook => (
                    <button
                      key={similarBook.id}
                      onClick={() =>
                        navigate({
                          to: '/book/$bookId',
                          params: { bookId: similarBook.id },
                        })
                      }
                      className='group bg-slate rounded-lg p-3 hover:bg-medium-gray transition-colors text-left'>
                      <div className='aspect-[2/3] bg-dark-blue rounded mb-3 overflow-hidden'>
                        <img
                          src={similarBook.coverUrl || '/placeholder-cover.jpg'}
                          alt={`Cover for ${similarBook.title}`}
                          className='w-full h-full object-cover group-hover:opacity-90 transition-opacity'
                        />
                      </div>
                      <h4 className='text-sm font-medium text-light-gray line-clamp-2 mb-1'>
                        {similarBook.title}
                      </h4>
                      <p className='text-xs text-medium-gray line-clamp-1'>
                        by {similarBook.author.name}
                      </p>
                      {!similarBook.source ||
                      similarBook.source !== 'AMAZON' ? (
                        <div className='flex items-center mt-2 text-xs text-medium-gray'>
                          <span className='text-copper'>★</span>
                          <span className='ml-1'>
                            {similarBook.rating.toFixed(1)}
                          </span>
                        </div>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={null}>
          {activeId &&
            (() => {
              // Handle current book drag
              if (activeId === `book-${bookId}` && book) {
                return (
                  <div
                    className='bg-slate rounded overflow-hidden shadow-lg'
                    style={{
                      width: '64px',
                      height: '96px',
                      flexShrink: 0,
                      flexGrow: 0,
                      position: 'relative',
                    }}>
                    <img
                      src={book.coverUrl || '/placeholder-cover.jpg'}
                      alt={`Cover for ${book.title}`}
                      style={{
                        width: '64px',
                        height: '96px',
                        objectFit: 'cover',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                      }}
                      onError={e => {
                        const target = e.target as HTMLImageElement
                        target.style.display = 'none'
                        const parent = target.parentElement
                        if (parent) {
                          parent.innerHTML = `<div style="width: 64px; height: 96px; background: linear-gradient(to bottom, #475569, #334155); display: flex; align-items: center; justify-content: center; font-size: 8px; color: #d4a574; font-weight: bold; text-align: center; padding: 4px; line-height: 1.2; position: absolute; top: 0; left: 0;">${book.title?.slice(0, 15) || 'Book'}</div>`
                        }
                      }}
                    />
                  </div>
                )
              }

              // Handle tier book drag
              if (activeId.startsWith('tier-book-')) {
                const tierId = activeId.replace('tier-book-', '')
                const draggedBookTier = userTiers.find(bt => bt.id === tierId)

                if (draggedBookTier?.book) {
                  return (
                    <div
                      className='bg-slate rounded overflow-hidden shadow-lg'
                      style={{
                        width: '32px',
                        height: '48px',
                        flexShrink: 0,
                        flexGrow: 0,
                        position: 'relative',
                      }}>
                      <img
                        src={
                          draggedBookTier.book.coverUrl ||
                          '/placeholder-cover.jpg'
                        }
                        alt={`Cover for ${draggedBookTier.book.title}`}
                        style={{
                          width: '32px',
                          height: '48px',
                          objectFit: 'cover',
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                        }}
                        onError={e => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                          const parent = target.parentElement
                          if (parent) {
                            parent.innerHTML = `<div style="width: 32px; height: 48px; background: linear-gradient(to bottom, #475569, #334155); display: flex; align-items: center; justify-content: center; font-size: 6px; color: #d4a574; font-weight: bold; text-align: center; padding: 2px; line-height: 1.2; position: absolute; top: 0; left: 0;">${draggedBookTier.book?.title?.slice(0, 10) || 'Book'}</div>`
                          }
                        }}
                      />
                    </div>
                  )
                }
              }

              return null
            })()}
        </DragOverlay>
      </div>
    </DndContext>
  )
}

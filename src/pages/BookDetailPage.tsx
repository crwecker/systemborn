import React, { useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  fetchBookDetails, 
  fetchSimilarBooks, 
  fetchUserBookTiers,
  assignBookToTier,
  updateReadingStatus,
  fetchBookReviews,
  createBookReview,
  updateBookReview,
  deleteBookReview
} from '../services/api'
import { useAuthContext } from '../contexts/AuthContext'
import type { Book, TierLevel, ReadingStatus, BookTier, BookReview } from '../types/book'
import { TIER_CONFIG, READING_STATUS_CONFIG } from '../types/book'

export function BookDetailPage() {
  const { bookId } = useParams({ from: '/book/$bookId' })
  const navigate = useNavigate()
  const { user } = useAuthContext()
  const queryClient = useQueryClient()
  
  const [reviewText, setReviewText] = useState('')
  const [editingReview, setEditingReview] = useState<BookReview | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)

  // Fetch book details
  const { data: book, isLoading: bookLoading, error: bookError } = useQuery({
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
  const { data: reviews = [], error: reviewsError } = useQuery({
    queryKey: ['bookReviews', bookId],
    queryFn: () => fetchBookReviews(bookId),
    enabled: !!bookId,
  })

  // Check if book is in user's collection
  const existingTier = userTiers.find(tier => tier.bookId === bookId)
  const userReview = Array.isArray(reviews) ? reviews.find(review => review.userId === user?.id) : undefined

  // Mutations
  const assignTierMutation = useMutation({
    mutationFn: ({ tier, readingStatus }: { tier: TierLevel; readingStatus?: ReadingStatus }) =>
      assignBookToTier(bookId, tier, readingStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBookTiers'] })
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: (readingStatus: ReadingStatus) => updateReadingStatus(bookId, readingStatus),
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
    const tierConfig = TIER_CONFIG[tier]
    const currentBooksInTier = userTiers.filter(userTier => userTier.tier === tier).length

    if (tierConfig.maxBooks && currentBooksInTier >= tierConfig.maxBooks) {
      alert(`Tier ${tier} is full! Maximum ${tierConfig.maxBooks} books allowed.`)
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
      updateReviewMutation.mutate({ reviewId: editingReview.id, review: reviewText })
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

  const isAmazonBook = book?.source === 'AMAZON'

  if (bookLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-light-gray">Loading book details...</div>
      </div>
    )
  }

  if (bookError || !book) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="text-red-400">Failed to load book details</div>
        <button
          onClick={() => navigate({ to: '/books' })}
          className="px-4 py-2 bg-copper text-dark-blue rounded hover:bg-light-gray transition-colors"
        >
          Back to Books
        </button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header with back button */}
      <div className="mb-6">
        <button
          onClick={() => navigate({ to: '/books' })}
          className="flex items-center gap-2 text-light-gray hover:text-copper transition-colors mb-4"
        >
          ← Back to Books
        </button>
      </div>

      {/* Main book details */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left column - Book cover and actions */}
        <div className="lg:col-span-1">
          <div className="bg-[#1a1a1a] rounded-lg p-6 sticky top-8">
            {/* Book cover */}
            <div className="relative mb-6">
              <div className="aspect-[2/3] bg-slate rounded-lg overflow-hidden">
                {isAmazonBook ? (
                  <a href={book.url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={book.coverUrl || '/placeholder-cover.jpg'}
                      alt={`Cover for ${book.title}`}
                      className="w-full h-full object-cover hover:opacity-90 transition-opacity"
                    />
                  </a>
                ) : (
                  <img
                    src={book.coverUrl || '/placeholder-cover.jpg'}
                    alt={`Cover for ${book.title}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              

            </div>

            {/* Book actions */}
            {user && (
              <div className="space-y-3">
                {/* Current status display */}
                {existingTier && (
                  <div className="space-y-2">
                    {existingTier.readingStatus && (
                      <div className={`px-3 py-2 rounded text-center text-white text-sm font-medium ${
                        READING_STATUS_CONFIG[existingTier.readingStatus]?.color || 'bg-gray-500'
                      }`}>
                        {READING_STATUS_CONFIG[existingTier.readingStatus]?.name || 'Unknown Status'}
                      </div>
                    )}
                    
                    {existingTier.tier && (
                      <div className={`px-3 py-2 rounded text-center text-white text-sm font-bold ${
                        TIER_CONFIG[existingTier.tier].color
                      }`}>
                        {TIER_CONFIG[existingTier.tier].name}
                      </div>
                    )}
                  </div>
                )}

                {/* Action buttons */}
                <div className="space-y-2">
                  <div className="text-xs text-light-gray mb-2 font-medium">Reading Status:</div>
                  <div className="grid gap-2">
                    {Object.entries(READING_STATUS_CONFIG).map(([status, config]) => (
                      <button
                        key={status}
                        onClick={() => handleUpdateStatus(status as ReadingStatus)}
                        disabled={updateStatusMutation.isPending}
                        className={`px-3 py-2 rounded text-sm font-medium transition-colors disabled:opacity-50 ${
                          existingTier?.readingStatus === status
                            ? 'bg-copper text-dark-blue'
                            : 'bg-medium-gray text-light-gray hover:bg-light-gray hover:text-dark-blue'
                        }`}
                      >
                        {config.name}
                      </button>
                    ))}
                  </div>

                  {/* Tier assignment */}
                  {existingTier?.readingStatus && ['READING', 'FINISHED'].includes(existingTier.readingStatus) && (
                    <>
                      <div className="text-xs text-light-gray mb-2 font-medium border-t border-medium-gray pt-3">
                        Assign to Tier:
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {Object.entries(TIER_CONFIG).map(([tier, config]) => {
                          const currentCount = userTiers.filter(userTier => userTier.tier === tier).length
                          const isDisabled = config.maxBooks && currentCount >= config.maxBooks && existingTier?.tier !== tier
                          const isCurrentTier = existingTier?.tier === tier

                          return (
                            <button
                              key={tier}
                              onClick={() => handleAddToTier(tier as TierLevel)}
                              disabled={isDisabled || assignTierMutation.isPending}
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                isCurrentTier
                                  ? 'bg-copper text-dark-blue'
                                  : isDisabled
                                    ? 'bg-gray-600 text-gray-400'
                                    : 'bg-medium-gray text-light-gray hover:bg-light-gray hover:text-dark-blue'
                              }`}
                              title={config.maxBooks ? `${currentCount}/${config.maxBooks} used` : config.name}
                            >
                              {tier}
                            </button>
                          )
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* External link for Amazon books */}
                {isAmazonBook && (
                  <a
                    href={book.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full px-4 py-2 bg-orange-600 text-white text-center rounded font-medium hover:bg-orange-700 transition-colors"
                  >
                    View on Amazon →
                  </a>
                )}
              </div>
            )}

            {!user && (
              <div className="text-center py-4">
                <button
                  onClick={() => navigate({ to: '/signin' })}
                  className="px-4 py-2 bg-copper text-dark-blue rounded font-medium hover:bg-light-gray transition-colors"
                >
                  Sign In to Manage
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right column - Book details and reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* Book info */}
          <div className="bg-[#1a1a1a] rounded-lg p-6">
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-serif text-copper flex-1 mr-4">{book.title}</h1>
              
              {/* Source badge moved here */}
              <div className="flex-shrink-0">
                <span className={`px-3 py-1 rounded text-white text-sm font-bold ${
                  isAmazonBook ? 'bg-orange-600' : 'bg-blue-600'
                }`}>
                  {isAmazonBook ? 'Amazon' : 'Royal Road'}
                </span>
              </div>
            </div>
            <p className="text-xl text-light-gray mb-4">by {book.author.name}</p>

            {/* Stats for Royal Road books */}
            {!isAmazonBook && book.stats && book.rating > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate rounded-lg">
                <div className="text-center">
                  <div className="text-copper text-xl font-bold">★ {book.rating.toFixed(1)}</div>
                  <div className="text-xs text-medium-gray">Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-copper text-xl font-bold">{book.stats.pages.toLocaleString()}</div>
                  <div className="text-xs text-medium-gray">Pages</div>
                </div>
                <div className="text-center">
                  <div className="text-copper text-xl font-bold">{book.stats.followers.toLocaleString()}</div>
                  <div className="text-xs text-medium-gray">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-copper text-xl font-bold">{book.stats.views.total.toLocaleString()}</div>
                  <div className="text-xs text-medium-gray">Views</div>
                </div>
              </div>
            )}

            {/* Stats without rating for Royal Road books */}
            {!isAmazonBook && book.stats && book.rating === 0 && (
              <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-slate rounded-lg">
                <div className="text-center">
                  <div className="text-copper text-xl font-bold">{book.stats.pages.toLocaleString()}</div>
                  <div className="text-xs text-medium-gray">Pages</div>
                </div>
                <div className="text-center">
                  <div className="text-copper text-xl font-bold">{book.stats.followers.toLocaleString()}</div>
                  <div className="text-xs text-medium-gray">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-copper text-xl font-bold">{book.stats.views.total.toLocaleString()}</div>
                  <div className="text-xs text-medium-gray">Views</div>
                </div>
              </div>
            )}

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {book.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-slate text-light-gray text-sm rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Content warnings */}
            {book.contentWarnings && book.contentWarnings.length > 0 && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg">
                <h3 className="text-red-400 font-medium mb-2">Content Warnings:</h3>
                <div className="flex flex-wrap gap-2">
                  {book.contentWarnings.map(warning => (
                    <span key={warning} className="px-2 py-1 bg-red-800 text-red-200 text-sm rounded">
                      {warning}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="prose prose-invert max-w-none">
              <h3 className="text-light-gray font-medium mb-3">Description</h3>
              <p className="text-medium-gray leading-relaxed whitespace-pre-wrap">
                {book.description}
              </p>
            </div>

            {/* Detailed stats for Royal Road books with ratings */}
            {!isAmazonBook && book.stats && book.rating > 0 && (
              <div className="mt-6 pt-6 border-t border-medium-gray">
                <h3 className="text-light-gray font-medium mb-3">Detailed Stats</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-medium-gray">Overall Score</div>
                    <div className="text-copper font-medium">{book.stats.overall_score?.toFixed(1) || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-medium-gray">Style Score</div>
                    <div className="text-copper font-medium">{book.stats.style_score?.toFixed(1) || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-medium-gray">Story Score</div>
                    <div className="text-copper font-medium">{book.stats.story_score?.toFixed(1) || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-medium-gray">Grammar Score</div>
                    <div className="text-copper font-medium">{book.stats.grammar_score?.toFixed(1) || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-medium-gray">Character Score</div>
                    <div className="text-copper font-medium">{book.stats.character_score?.toFixed(1) || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-medium-gray">Favorites</div>
                    <div className="text-copper font-medium">{book.stats.favorites?.toLocaleString() || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-medium-gray">Ratings Count</div>
                    <div className="text-copper font-medium">{book.stats.ratings_count?.toLocaleString() || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-medium-gray">Avg Views</div>
                    <div className="text-copper font-medium">{book.stats.views.average?.toLocaleString() || 'N/A'}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Detailed stats for Royal Road books without ratings */}
            {!isAmazonBook && book.stats && book.rating === 0 && (
              <div className="mt-6 pt-6 border-t border-medium-gray">
                <h3 className="text-light-gray font-medium mb-3">Book Stats</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-medium-gray">Favorites</div>
                    <div className="text-copper font-medium">{book.stats.favorites?.toLocaleString() || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-medium-gray">Total Views</div>
                    <div className="text-copper font-medium">{book.stats.views.total?.toLocaleString() || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-medium-gray">Avg Views</div>
                    <div className="text-copper font-medium">{book.stats.views.average?.toLocaleString() || 'N/A'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Reviews section */}
          <div className="bg-[#1a1a1a] rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-medium text-light-gray">Community Reviews</h3>
              {user && !userReview && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="px-4 py-2 bg-copper text-dark-blue rounded font-medium hover:bg-light-gray transition-colors"
                >
                  Write Review
                </button>
              )}
            </div>

            {/* Review form */}
            {showReviewForm && user && (
              <div className="mb-6 p-4 bg-slate rounded-lg">
                <h4 className="text-light-gray font-medium mb-3">
                  {editingReview ? 'Edit Review' : 'Write Your Review'}
                </h4>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your thoughts about this book..."
                  className="w-full h-32 p-3 bg-dark-blue text-light-gray border border-medium-gray rounded resize-none focus:outline-none focus:border-copper"
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={handleSubmitReview}
                    disabled={!reviewText.trim() || createReviewMutation.isPending || updateReviewMutation.isPending}
                    className="px-4 py-2 bg-copper text-dark-blue rounded font-medium hover:bg-light-gray transition-colors disabled:opacity-50"
                  >
                    {editingReview ? 'Update Review' : 'Submit Review'}
                  </button>
                  <button
                    onClick={() => {
                      setShowReviewForm(false)
                      setEditingReview(null)
                      setReviewText('')
                    }}
                    className="px-4 py-2 bg-medium-gray text-light-gray rounded hover:bg-light-gray hover:text-dark-blue transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Reviews list */}
            <div className="space-y-4">
              {!Array.isArray(reviews) || reviews.length === 0 ? (
                <div className="text-center py-8 text-medium-gray">
                  No reviews yet. Be the first to share your thoughts!
                </div>
              ) : (
                reviews.map(review => (
                  <div key={review.id} className="p-4 bg-slate rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-medium text-light-gray">Anonymous User</div>
                        <div className="text-sm text-medium-gray">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      {user?.id === review.userId && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditReview(review)}
                            className="text-copper hover:text-light-gray text-sm font-medium"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="text-red-400 hover:text-red-300 text-sm font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-medium-gray leading-relaxed whitespace-pre-wrap">
                      {review.review}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Similar books */}
          {similarBooks.length > 0 && (
            <div className="bg-[#1a1a1a] rounded-lg p-6">
              <h3 className="text-xl font-medium text-light-gray mb-6">Similar Books</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {similarBooks.map(similarBook => (
                  <button
                    key={similarBook.id}
                    onClick={() => navigate({ to: '/book/$bookId', params: { bookId: similarBook.id } })}
                    className="group bg-slate rounded-lg p-3 hover:bg-medium-gray transition-colors text-left"
                  >
                    <div className="aspect-[2/3] bg-dark-blue rounded mb-3 overflow-hidden">
                      <img
                        src={similarBook.coverUrl || '/placeholder-cover.jpg'}
                        alt={`Cover for ${similarBook.title}`}
                        className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                      />
                    </div>
                    <h4 className="text-sm font-medium text-light-gray line-clamp-2 mb-1">
                      {similarBook.title}
                    </h4>
                    <p className="text-xs text-medium-gray line-clamp-1">
                      by {similarBook.author.name}
                    </p>
                    {!similarBook.source || similarBook.source !== 'AMAZON' ? (
                      <div className="flex items-center mt-2 text-xs text-medium-gray">
                        <span className="text-copper">★</span>
                        <span className="ml-1">{similarBook.rating.toFixed(1)}</span>
                      </div>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 
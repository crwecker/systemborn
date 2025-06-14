import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchUserBookReviews,
  createBookReview,
  updateBookReview,
  deleteBookReview,
} from '../services/api'
import { useAuthContext } from '../contexts/AuthContext'
import type { BookReview } from '../types/book'
import { BookCard } from './BookCard'

const BookReviews: React.FC = () => {
  const { user } = useAuthContext()
  const queryClient = useQueryClient()
  const [editingReview, setEditingReview] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ['userBookReviews', user?.id],
    queryFn: () => (user ? fetchUserBookReviews(user.id) : Promise.resolve([])),
    enabled: !!user,
  })

  const updateReviewMutation = useMutation({
    mutationFn: ({ reviewId, review }: { reviewId: string; review: string }) =>
      updateBookReview(reviewId, review),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBookReviews'] })
      setEditingReview(null)
      setEditText('')
    },
  })

  const deleteReviewMutation = useMutation({
    mutationFn: (reviewId: string) => deleteBookReview(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBookReviews'] })
    },
  })

  const handleStartEdit = (review: BookReview) => {
    setEditingReview(review.id)
    setEditText(review.review)
  }

  const handleSaveEdit = (reviewId: string) => {
    if (editText.trim()) {
      updateReviewMutation.mutate({ reviewId, review: editText.trim() })
    }
  }

  const handleCancelEdit = () => {
    setEditingReview(null)
    setEditText('')
  }

  const handleDeleteReview = (reviewId: string) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      deleteReviewMutation.mutate(reviewId)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (!user) {
    return (
      <div className='text-center py-8'>
        <p className='text-gray-600'>Please sign in to view your reviews.</p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='text-center py-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
        <p className='mt-2 text-gray-600'>Loading your reviews...</p>
      </div>
    )
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-4'>
          My Book Reviews
        </h1>
        <p className='text-gray-600'>
          Your thoughts and opinions on the books you've read.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className='text-center py-12'>
          <div className='text-gray-400 mb-4'>
            <svg
              className='mx-auto h-12 w-12'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
              />
            </svg>
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            No reviews yet
          </h3>
          <p className='text-gray-600 mb-4'>
            You haven't written any book reviews yet.
          </p>
          <p className='text-sm text-gray-500'>
            Visit individual book pages to write your first review!
          </p>
        </div>
      ) : (
        <div className='space-y-6'>
          {reviews.map(review => (
            <div
              key={review.id}
              className='bg-white rounded-lg shadow-sm border p-6'>
              <div className='flex flex-col md:flex-row gap-6'>
                {/* Book Card */}
                <div className='flex-shrink-0 w-full md:w-48'>
                  {review.book && <BookCard book={review.book} />}
                </div>

                {/* Review Content */}
                <div className='flex-1'>
                  <div className='flex items-start justify-between mb-4'>
                    <div>
                      <h3 className='text-xl font-semibold text-gray-900'>
                        {review.book?.title}
                      </h3>
                      <p className='text-gray-600'>
                        by {review.book?.author.name}
                      </p>
                      <p className='text-sm text-gray-500 mt-1'>
                        Reviewed on {formatDate(review.createdAt)}
                        {review.updatedAt !== review.createdAt && (
                          <span> • Updated {formatDate(review.updatedAt)}</span>
                        )}
                      </p>
                    </div>

                    <div className='flex space-x-2'>
                      <button
                        onClick={() => handleStartEdit(review)}
                        className='text-blue-600 hover:text-blue-800 text-sm font-medium'>
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className='text-red-600 hover:text-red-800 text-sm font-medium'>
                        Delete
                      </button>
                    </div>
                  </div>

                  {editingReview === review.id ? (
                    <div className='space-y-4'>
                      <textarea
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        className='w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        rows={6}
                        placeholder='Write your review...'
                      />
                      <div className='flex space-x-3'>
                        <button
                          onClick={() => handleSaveEdit(review.id)}
                          disabled={
                            !editText.trim() || updateReviewMutation.isPending
                          }
                          className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'>
                          {updateReviewMutation.isPending
                            ? 'Saving...'
                            : 'Save Changes'}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className='px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400'>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className='prose max-w-none'>
                      <p className='text-gray-800 whitespace-pre-wrap'>
                        {review.review}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BookReviews

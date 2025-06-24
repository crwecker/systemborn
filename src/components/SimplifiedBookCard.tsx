import React from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { Book, TierLevel } from '../types/book'
import { TIER_CONFIG } from '../types/book'

interface SimplifiedBookCardProps {
  book: Book
  tier?: TierLevel
  compact?: boolean
}

export const SimplifiedBookCard: React.FC<SimplifiedBookCardProps> = ({
  book,
  tier,
  compact = false,
}) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate({ to: '/book/$bookId', params: { bookId: book.id } })
  }

  if (compact) {
    return (
      <div
        className='bg-white rounded shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 border w-full h-full cursor-pointer'
        onClick={handleClick}>
        <div className='relative h-full bg-gray-100'>
          <img
            src={book.coverUrl || '/placeholder-cover.jpg'}
            alt={`Cover for ${book.title}`}
            className='absolute inset-0 w-full h-full object-cover'
          />
          {tier && (
            <div
              className={`absolute top-0.5 left-0.5 px-1 py-0.5 rounded text-white text-[8px] font-bold ${TIER_CONFIG[tier].color}`}>
              {tier}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className='bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 border cursor-pointer'
      onClick={handleClick}>
      <div className='relative pb-[140%] bg-gray-100'>
        <img
          src={book.coverUrl || '/placeholder-cover.jpg'}
          alt={`Cover for ${book.title}`}
          className='absolute inset-0 w-full h-full object-cover'
        />
        {tier && (
          <div
            className={`absolute top-2 left-2 px-2 py-1 rounded text-white text-xs font-bold ${TIER_CONFIG[tier].color}`}>
            {tier}
          </div>
        )}
      </div>
      <div className='p-3'>
        <h3
          className='text-sm font-semibold text-gray-900 line-clamp-2 mb-1'
          title={book.title}>
          {book.title}
        </h3>
        <p className='text-xs text-gray-600 mb-2' title={book.author.name}>
          by {book.author.name}
        </p>
        <div className='flex items-center justify-between text-xs text-gray-500'>
          <div className='flex items-center'>
            <span className='text-yellow-500'>★</span>
            <span className='ml-1'>{book.rating.toFixed(1)}</span>
          </div>
          <span>{book.stats?.pages || 0}p</span>
        </div>
      </div>
    </div>
  )
}

import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  DndContext,
  closestCenter,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
  fetchUserBookTiers,
  removeBookFromTiers,
  updateBookTier,
} from '../services/api'
import { useAuthContext } from '../contexts/AuthContext'
import type { BookTier, TierLevel, TierData } from '../types/book'
import { TIER_CONFIG } from '../types/book'
import { SimplifiedBookCard } from './SimplifiedBookCard'
import { BookSearchModal } from './BookSearchModal'

// Compact Premium Tier Component
interface CompactPremiumTierProps {
  tier: TierLevel
  books: BookTier[]
  maxBooks: number
  onRemove: (tierId: string) => void
  onSearchAdd: (tier: TierLevel) => void
}

const CompactPremiumTier: React.FC<CompactPremiumTierProps> = ({
  tier,
  books,
  maxBooks,
  onRemove,
  onSearchAdd,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: tier })
  const config = TIER_CONFIG[tier]

  // Create slots array to show placeholders
  const slots = Array.from({ length: maxBooks }, (_, index) => {
    const book = books[index]
    return book || null
  })

  return (
    <div
      ref={setNodeRef}
      className={`md:relative p-3 rounded-lg border-2 ${isOver ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'} transition-colors cursor-pointer hover:bg-gray-50`}
      onClick={e => {
        // Only trigger search if clicking on the background, not on books
        if (
          e.target === e.currentTarget ||
          (e.target as Element).closest?.('.tier-background')
        ) {
          onSearchAdd(tier)
        }
      }}>
      {/* Mobile: Traditional header layout */}
      <div className='flex items-center justify-between mb-2 md:hidden'>
        <div
          className={`px-2 py-1 rounded text-white font-bold text-xs ${config.color}`}>
          {config.name}
        </div>
        <span className='text-xs text-gray-500'>
          {books.length}/{maxBooks}
        </span>
      </div>

      {/* Desktop: Absolutely positioned badges */}
      <div
        className={`hidden md:block absolute top-2 left-2 px-2 py-1 rounded text-white font-bold text-xs ${config.color} z-10`}>
        {config.name}
      </div>
      <span className='hidden md:block absolute top-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow-sm z-10'>
        {books.length}/{maxBooks}
      </span>

      <div className='flex gap-2 justify-center h-24 md:h-32'>
        <SortableContext
          items={books.map(b => b.id)}
          strategy={rectSortingStrategy}>
          {slots.map((bookTier, index) => (
            <div
              key={bookTier?.id || `empty-${tier}-${index}`}
              className='w-16 md:w-20 h-full'>
              {bookTier ? (
                <DraggableBookItem
                  bookTier={bookTier}
                  onRemove={onRemove}
                  compact={true}
                />
              ) : (
                <div
                  className='w-full h-full border-2 border-dashed border-gray-300 rounded flex items-center justify-center bg-gray-50 hover:border-gray-400 hover:bg-gray-100 transition-colors group cursor-pointer'
                  onClick={e => {
                    e.stopPropagation()
                    onSearchAdd(tier)
                  }}>
                  <div className='text-xs text-gray-400 text-center group-hover:text-gray-600'>
                    <div className='text-2xl'>+</div>
                    <div className='mt-1'>Click to search</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </SortableContext>
      </div>
    </div>
  )
}

// Tier Droppable Component
interface TierDroppableProps {
  tier: TierLevel
  children: React.ReactNode
  className?: string
}

const TierDroppable: React.FC<TierDroppableProps> = ({
  tier,
  children,
  className,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id: tier })

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
      {children}
    </div>
  )
}

// Draggable Book Item Component
interface DraggableBookItemProps {
  bookTier: BookTier
  onRemove: (tierId: string) => void
  compact?: boolean
}

const DraggableBookItem: React.FC<DraggableBookItemProps> = ({
  bookTier,
  onRemove,
  compact = false,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: bookTier.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50' : ''} ${compact ? 'w-full h-full' : ''}`}
      onClick={e => e.stopPropagation()}>
      {bookTier.book && (
        <div className='relative w-full h-full'>
          <SimplifiedBookCard
            book={bookTier.book}
            tier={bookTier.tier}
            compact={compact}
          />
          <button
            onClick={e => {
              e.stopPropagation()
              onRemove(bookTier.id)
            }}
            className={`absolute bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10 ${
              compact
                ? 'top-0.5 right-0.5 w-3 h-3 text-[8px]'
                : 'top-2 right-2 w-6 h-6 text-sm'
            }`}
            title='Remove from tier'>
            ×
          </button>
        </div>
      )}
    </div>
  )
}

const TierList: React.FC = () => {
  const { user } = useAuthContext()
  const queryClient = useQueryClient()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [targetTier, setTargetTier] = useState<TierLevel | null>(null)

  const { data: bookTiers = [], isLoading } = useQuery({
    queryKey: ['userBookTiers', user?.id],
    queryFn: () => (user ? fetchUserBookTiers(user.id) : Promise.resolve([])),
    enabled: !!user,
  })

  const removeTierMutation = useMutation({
    mutationFn: (tierId: string) => removeBookFromTiers(tierId),
    onMutate: async tierId => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['userBookTiers', user?.id] })

      // Snapshot the previous value
      const previousBookTiers = queryClient.getQueryData<BookTier[]>([
        'userBookTiers',
        user?.id,
      ])

      // Optimistically remove the book tier
      if (previousBookTiers) {
        const updatedBookTiers = previousBookTiers.filter(
          bookTier => bookTier.id !== tierId
        )
        queryClient.setQueryData(['userBookTiers', user?.id], updatedBookTiers)
      }

      return { previousBookTiers }
    },
    onError: (err, tierId, context) => {
      // Rollback on error
      if (context?.previousBookTiers) {
        queryClient.setQueryData(
          ['userBookTiers', user?.id],
          context.previousBookTiers
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['userBookTiers', user?.id] })
    },
  })

  const updateTierMutation = useMutation({
    mutationFn: ({ tierId, tier }: { tierId: string; tier: TierLevel }) =>
      updateBookTier(tierId, tier),
    onMutate: async ({ tierId, tier }) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['userBookTiers', user?.id] })

      // Snapshot the previous value
      const previousBookTiers = queryClient.getQueryData<BookTier[]>([
        'userBookTiers',
        user?.id,
      ])

      // Optimistically update to the new value
      if (previousBookTiers) {
        const updatedBookTiers = previousBookTiers.map(bookTier =>
          bookTier.id === tierId ? { ...bookTier, tier } : bookTier
        )
        queryClient.setQueryData(['userBookTiers', user?.id], updatedBookTiers)
      }

      // Return a context object with the snapshotted value
      return { previousBookTiers }
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousBookTiers) {
        queryClient.setQueryData(
          ['userBookTiers', user?.id],
          context.previousBookTiers
        )
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['userBookTiers', user?.id] })
    },
  })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  // Organize books by tier
  const tierData: TierData[] = Object.entries(TIER_CONFIG).map(
    ([tierLevel, config]) => ({
      tier: tierLevel as TierLevel,
      books: bookTiers.filter(bt => bt.tier === tierLevel),
      maxBooks: config.maxBooks,
    })
  )

  // Separate premium tiers (SSS, SS, S), read tier, and regular tiers
  const premiumTiers = tierData.filter(t => ['SSS', 'SS', 'S'].includes(t.tier))
  const readTier = tierData.find(t => t.tier === 'READ')
  const regularTiers = tierData.filter(
    t => !['SSS', 'SS', 'S', 'READ'].includes(t.tier)
  )

  const handleRemoveFromTier = (tierId: string) => {
    if (window.confirm('Remove this book from your tier list?')) {
      removeTierMutation.mutate(tierId)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find the book tier being dragged
    const activeBookTier = bookTiers.find(bt => bt.id === activeId)
    if (!activeBookTier) return

    // Determine the target tier from the droppable area
    let targetTier: TierLevel | null = null

    // If dropped on another book, get that book's tier
    const overBookTier = bookTiers.find(bt => bt.id === overId)
    if (overBookTier) {
      targetTier = overBookTier.tier
    } else {
      // If dropped on a tier container, use that tier
      targetTier = overId as TierLevel
    }

    if (!targetTier || targetTier === activeBookTier.tier) return

    // Check tier limits
    const tierConfig = TIER_CONFIG[targetTier]
    const currentBooksInTier = bookTiers.filter(
      bt => bt.tier === targetTier
    ).length

    if (tierConfig.maxBooks && currentBooksInTier >= tierConfig.maxBooks) {
      alert(
        `Tier ${targetTier} is full! Maximum ${tierConfig.maxBooks} books allowed.`
      )
      return
    }

    // Update the tier
    updateTierMutation.mutate({ tierId: activeId, tier: targetTier })
  }

  // Get the active book for drag overlay
  const activeBookTier = activeId
    ? bookTiers.find(bt => bt.id === activeId)
    : null

  // Handle opening search modal for a specific tier
  const handleSearchAdd = (tier: TierLevel) => {
    setTargetTier(tier)
    setSearchModalOpen(true)
  }

  if (!user) {
    return (
      <div className='text-center py-8'>
        <p className='text-gray-600'>
          Please sign in to manage your book tiers.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='text-center py-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
        <p className='mt-2 text-gray-600'>Loading your book tiers...</p>
      </div>
    )
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-4'>
          My Book Tier List
        </h1>
        <p className='text-gray-600'>
          Your books organized into tiers based on your preferences. Drag books
          between tiers to reorganize them.
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}>
        <div className='space-y-3'>
          {/* Premium Tiers - Compact Layout */}
          <div className='bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border-2 border-purple-100'>
            <div className='mb-3'>
              <h2 className='text-xl font-bold text-gray-900 mb-1'>
                Premium Tiers
              </h2>
              <p className='text-sm text-gray-600 mb-2'>
                Your absolute favorites - fill all 9 slots!{' '}
                {premiumTiers.reduce((sum, t) => sum + t.books.length, 0)}/9
                completed
              </p>
              <div className='flex items-center gap-2 text-xs text-purple-700 bg-purple-100 rounded-lg px-3 py-2'>
                <svg
                  className='w-4 h-4 flex-shrink-0'
                  fill='currentColor'
                  viewBox='0 0 20 20'>
                  <path
                    fillRule='evenodd'
                    d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                    clipRule='evenodd'
                  />
                </svg>
                <span>
                  <strong>Public Visibility:</strong> Your premium tier books
                  will be visible to other users in Community Favorites
                </span>
              </div>
            </div>

            <div className='space-y-3'>
              {premiumTiers.map(({ tier, books, maxBooks }) => (
                <CompactPremiumTier
                  key={tier}
                  tier={tier}
                  books={books}
                  maxBooks={maxBooks!}
                  onRemove={handleRemoveFromTier}
                  onSearchAdd={handleSearchAdd}
                />
              ))}
            </div>
          </div>

          {/* Read but Unranked Collection */}
          {readTier && (
            <div className='bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-100'>
              <div className='mb-3'>
                <h2 className='text-xl font-bold text-gray-900 mb-1'>
                  Read Collection
                </h2>
                <div className='flex items-center gap-2 text-xs text-blue-700 bg-blue-100 rounded-lg px-3 py-2'>
                  <svg
                    className='w-4 h-4 flex-shrink-0'
                    fill='currentColor'
                    viewBox='0 0 20 20'>
                    <path
                      fillRule='evenodd'
                      d='M12 2C13.1 2 14 2.9 14 4V5H16C17.1 5 18 5.9 18 7V19C18 20.1 17.1 21 16 21H8C6.9 21 6 20.1 6 19V7C6 5.9 6.9 5 8 5H10V4C10 2.9 10.9 2 12 2ZM12 4V5H12V4ZM8 7V19H16V7H8Z'
                      clipRule='evenodd'
                    />
                  </svg>
                  <span>
                    <strong>Staging Area:</strong> These books are marked as
                    read and ready to be ranked by dragging them into other
                    tiers
                  </span>
                </div>
              </div>

              <TierDroppable
                tier='READ'
                className='border rounded-lg bg-white shadow-sm'>
                <div className='flex items-stretch'>
                  {/* Tier Label Column */}
                  <div className='flex flex-col items-center justify-center p-4 min-w-[120px] border-r border-gray-200'>
                    <div
                      className={`px-3 py-2 rounded-lg text-white font-bold text-sm ${TIER_CONFIG.READ.color} mb-2`}>
                      READ
                    </div>
                    <div className='text-xs text-gray-500 text-center'>
                      {readTier.books.length} book
                      {readTier.books.length !== 1 ? 's' : ''}
                    </div>
                  </div>

                  {/* Books Content Column */}
                  <div className='flex-1 p-4'>
                    <div
                      className='min-h-[120px] p-4 rounded-lg bg-blue-50 border-2 border-dashed border-blue-200 cursor-pointer hover:bg-blue-100 transition-colors'
                      onClick={e => {
                        // Only trigger search if clicking on the background, not on books
                        if (
                          e.target === e.currentTarget ||
                          (e.target as Element).closest?.('.tier-background')
                        ) {
                          handleSearchAdd('READ')
                        }
                      }}>
                      <SortableContext
                        items={readTier.books.map(b => b.id)}
                        strategy={rectSortingStrategy}>
                        {readTier.books.length === 0 ? (
                          <div
                            className='flex flex-col items-center justify-center h-32 text-blue-400 cursor-pointer hover:bg-blue-100 transition-colors rounded-lg'
                            onClick={e => {
                              e.stopPropagation()
                              handleSearchAdd('READ')
                            }}>
                            <div className='text-4xl mb-2'>+</div>
                            <p>Click to search and mark books as read</p>
                          </div>
                        ) : (
                          <div
                            className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 cursor-pointer hover:bg-blue-100 rounded p-2 -m-2 transition-colors'
                            onClick={e => {
                              // Only trigger search if clicking on the grid background, not on books
                              if (e.target === e.currentTarget) {
                                handleSearchAdd('READ')
                              }
                            }}>
                            {readTier.books.map(bookTier => (
                              <DraggableBookItem
                                key={bookTier.id}
                                bookTier={bookTier}
                                onRemove={handleRemoveFromTier}
                              />
                            ))}
                            <div
                              className='w-full h-full min-h-[120px] border-2 border-dashed border-blue-300 rounded-lg flex flex-col items-center justify-center text-blue-600 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer group'
                              onClick={e => {
                                e.stopPropagation()
                                handleSearchAdd('READ')
                              }}>
                              <div className='text-2xl group-hover:scale-110 transition-transform'>
                                +
                              </div>
                              <div className='text-xs mt-1'>Search</div>
                            </div>
                          </div>
                        )}
                      </SortableContext>
                    </div>
                  </div>
                </div>
              </TierDroppable>
            </div>
          )}

          {/* Regular Tiers - Standard Layout */}
          <div>
            <h2 className='text-xl font-bold text-gray-900 mb-4'>
              Organization Tiers
            </h2>
            <div className='space-y-2'>
              {regularTiers.map(({ tier, books, maxBooks }) => {
                const config = TIER_CONFIG[tier]

                return (
                  <TierDroppable
                    key={tier}
                    tier={tier}
                    className='border rounded-lg bg-white shadow-sm'>
                    <div className='flex items-stretch'>
                      {/* Tier Label Column */}
                      <div className='flex flex-col items-center justify-center p-4 min-w-[120px] border-r border-gray-200'>
                        <div
                          className={`px-3 py-2 rounded-lg text-white font-bold text-sm ${config.color} mb-2`}>
                          {tier}
                        </div>
                        <div className='text-xs text-gray-500 text-center'>
                          {books.length} book{books.length !== 1 ? 's' : ''}
                        </div>
                      </div>

                      {/* Books Content Column */}
                      <div className='flex-1 p-4'>
                        <div
                          className='min-h-[120px] p-4 rounded-lg bg-gray-50 border-2 border-dashed border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors'
                          onClick={e => {
                            // Only trigger search if clicking on the background, not on books
                            if (
                              e.target === e.currentTarget ||
                              (e.target as Element).closest?.(
                                '.tier-background'
                              )
                            ) {
                              handleSearchAdd(tier)
                            }
                          }}>
                          <SortableContext
                            items={books.map(b => b.id)}
                            strategy={rectSortingStrategy}>
                            {books.length === 0 ? (
                              <div
                                className='flex flex-col items-center justify-center h-32 text-gray-400 cursor-pointer hover:bg-gray-100 transition-colors rounded-lg'
                                onClick={e => {
                                  e.stopPropagation()
                                  handleSearchAdd(tier)
                                }}>
                                <div className='text-4xl mb-2'>+</div>
                                <p>Click to search or drag books here</p>
                              </div>
                            ) : (
                              <div
                                className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 cursor-pointer hover:bg-gray-100 rounded p-2 -m-2 transition-colors'
                                onClick={e => {
                                  // Only trigger search if clicking on the grid background, not on books
                                  if (e.target === e.currentTarget) {
                                    handleSearchAdd(tier)
                                  }
                                }}>
                                {books.map(bookTier => (
                                  <DraggableBookItem
                                    key={bookTier.id}
                                    bookTier={bookTier}
                                    onRemove={handleRemoveFromTier}
                                  />
                                ))}
                                <div
                                  className='w-full h-full min-h-[120px] border-2 border-dashed border-blue-300 rounded-lg flex flex-col items-center justify-center text-blue-600 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-colors cursor-pointer group'
                                  onClick={e => {
                                    e.stopPropagation()
                                    handleSearchAdd(tier)
                                  }}>
                                  <div className='text-2xl group-hover:scale-110 transition-transform'>
                                    +
                                  </div>
                                  <div className='text-xs mt-1'>Search</div>
                                </div>
                              </div>
                            )}
                          </SortableContext>
                        </div>
                      </div>
                    </div>
                  </TierDroppable>
                )
              })}
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeBookTier?.book && (
            <div className='opacity-80'>
              <SimplifiedBookCard
                book={activeBookTier.book}
                tier={activeBookTier.tier}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Instructions */}
      <div className='mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4'>
        <h3 className='font-semibold text-blue-900 mb-2'>
          How to use your tier list:
        </h3>
        <ul className='text-sm text-blue-800 space-y-1'>
          <li>
            • <strong>Premium Tiers:</strong> Your absolute favorites (9 slots
            total - publicly visible to other users)
          </li>
          <li>
            • <strong>Read Collection:</strong> Books you've marked as read but
            haven't ranked yet (staging area)
          </li>
          <li>
            • <strong>Organization Tiers:</strong> Categorize the rest of your
            books (private, unlimited slots)
          </li>
          <li>
            • Mark books as "Read" from book pages or add them directly to tiers
          </li>
          <li>• Drag books between tiers and collections to reorganize them</li>
          <li>• Click the × button to remove books from your tier list</li>
        </ul>
      </div>

      {/* Search Modal */}
      {targetTier && (
        <BookSearchModal
          isOpen={searchModalOpen}
          onClose={() => {
            setSearchModalOpen(false)
            setTargetTier(null)
          }}
          targetTier={targetTier}
        />
      )}
    </div>
  )
}

export default TierList

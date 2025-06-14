import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthContext } from '../contexts/AuthContext'
import type { BookTier, TierLevel } from '../types/book'
import { TIER_CONFIG } from '../types/book'
import { SimplifiedBookCard } from '../components/SimplifiedBookCard'

// API function to fetch community favorites
async function fetchCommunityFavorites(): Promise<{
  [userId: string]: { user: { name: string; id: string }; tiers: BookTier[] }
}> {
  const USER_API_BASE_URL = import.meta.env.PROD
    ? '/.netlify/functions/user-api'
    : 'http://localhost:3000/.netlify/functions/user-api'

  const authToken = localStorage.getItem('authToken')
  if (!authToken) {
    throw new Error('No authentication token found')
  }

  const response = await fetch(`${USER_API_BASE_URL}/community-favorites`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch community favorites')
  }

  return response.json()
}

const CommunityFavorites: React.FC = () => {
  const { user } = useAuthContext()

  const {
    data: communityData = {},
    isLoading,
    error,
  } = useQuery({
    queryKey: ['communityFavorites'],
    queryFn: fetchCommunityFavorites,
    enabled: !!user,
  })

  if (!user) {
    return (
      <div className='text-center py-8'>
        <p className='text-gray-600'>
          Please sign in to see community favorites.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className='text-center py-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
        <p className='mt-2 text-gray-600'>Loading community favorites...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className='text-center py-8'>
        <p className='text-red-600'>
          Error loading community favorites: {error.message}
        </p>
      </div>
    )
  }

  const users = Object.values(communityData)

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900 mb-4'>
          Community Favorites
        </h1>
        <p className='text-gray-600'>
          Discover what books the community loves most - their SSS, SS, and S
          tier picks.
        </p>
      </div>

      {users.length === 0 ? (
        <div className='text-center py-12'>
          <p className='text-gray-500'>No community favorites available yet.</p>
          <p className='text-sm text-gray-400 mt-2'>
            Be the first to add books to your tier list!
          </p>
        </div>
      ) : (
        <div className='space-y-8'>
          {users.map(userData => {
            const premiumTiers = userData.tiers.filter(t =>
              ['SSS', 'SS', 'S'].includes(t.tier)
            )

            if (premiumTiers.length === 0) return null

            // Organize by tier
            const tierGroups: Record<'SSS' | 'SS' | 'S', BookTier[]> = {
              SSS: premiumTiers.filter(t => t.tier === 'SSS'),
              SS: premiumTiers.filter(t => t.tier === 'SS'),
              S: premiumTiers.filter(t => t.tier === 'S'),
            }

            return (
              <div
                key={userData.user.id}
                className='bg-white rounded-lg shadow-sm border p-6'>
                <div className='mb-4'>
                  <h2 className='text-xl font-semibold text-gray-900'>
                    {userData.user.name}'s Favorites
                  </h2>
                </div>

                {/* Mobile: Vertical Layout */}
                <div className='space-y-4 lg:hidden'>
                  {/* SSS Tier - Regular Cards */}
                  {tierGroups.SSS.length > 0 && (
                    <div>
                      <div className='flex items-center mb-3'>
                        <div
                          className={`px-3 py-1 rounded text-white font-bold text-sm ${TIER_CONFIG.SSS.color}`}>
                          {TIER_CONFIG.SSS.name}
                        </div>
                      </div>

                      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'>
                        {tierGroups.SSS.map((bookTier: BookTier) => (
                          <div key={bookTier.id}>
                            {bookTier.book && (
                              <SimplifiedBookCard
                                book={bookTier.book}
                                tier={bookTier.tier}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SS and S Tiers - Compact Cards */}
                  {(tierGroups.SS.length > 0 || tierGroups.S.length > 0) && (
                    <div className='space-y-3'>
                      {(['SS', 'S'] as const).map(tier => {
                        const books = tierGroups[tier]
                        if (books.length === 0) return null

                        const config = TIER_CONFIG[tier]
                        const maxBooks = config.maxBooks || 5

                        // Create slots array to show placeholders for missing books
                        const slots = Array.from(
                          { length: maxBooks },
                          (_, index) => {
                            const book = books[index]
                            return book || null
                          }
                        )

                        return (
                          <div
                            key={tier}
                            className='relative p-3 rounded-lg border-2 border-gray-200 bg-white'>
                            {/* Mobile: Traditional header layout */}
                            <div className='flex items-center justify-between mb-2'>
                              <div
                                className={`px-2 py-1 rounded text-white font-bold text-xs ${config.color}`}>
                                {config.name}
                              </div>
                              <span className='text-xs text-gray-500'>
                                {books.length}/{maxBooks}
                              </span>
                            </div>

                            <div className='flex gap-2 justify-center h-24'>
                              {slots.map((bookTier, index) => (
                                <div
                                  key={bookTier?.id || `empty-${tier}-${index}`}
                                  className='w-16 h-full'>
                                  {bookTier ? (
                                    <div className='relative w-full h-full'>
                                      {bookTier.book && (
                                        <SimplifiedBookCard
                                          book={bookTier.book}
                                          tier={bookTier.tier}
                                          compact={true}
                                        />
                                      )}
                                    </div>
                                  ) : (
                                    <div className='w-full h-full border-2 border-dashed border-gray-300 rounded flex items-center justify-center bg-gray-50'>
                                      <div className='text-xs text-gray-300 text-center'>
                                        <div className='text-lg'>•</div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Desktop: Horizontal Layout (lg and above) */}
                <div className='hidden lg:block'>
                  <div className='flex gap-6'>
                    {/* Left Side: SSS Tier */}
                    {tierGroups.SSS.length > 0 && (
                      <div className='flex-shrink-0'>
                        <div className='flex items-center mb-3'>
                          <div
                            className={`px-3 py-1 rounded text-white font-bold text-sm ${TIER_CONFIG.SSS.color}`}>
                            {TIER_CONFIG.SSS.name}
                          </div>
                        </div>

                        <div className='w-48'>
                          {tierGroups.SSS.map((bookTier: BookTier) => (
                            <div key={bookTier.id}>
                              {bookTier.book && (
                                <SimplifiedBookCard
                                  book={bookTier.book}
                                  tier={bookTier.tier}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Right Side: SS and S Tiers */}
                    {(tierGroups.SS.length > 0 || tierGroups.S.length > 0) && (
                      <div className='flex-1 space-y-3'>
                        {(['SS', 'S'] as const).map(tier => {
                          const books = tierGroups[tier]
                          if (books.length === 0) return null

                          const config = TIER_CONFIG[tier]
                          const maxBooks = config.maxBooks || 5

                          // Create slots array to show placeholders for missing books
                          const slots = Array.from(
                            { length: maxBooks },
                            (_, index) => {
                              const book = books[index]
                              return book || null
                            }
                          )

                          return (
                            <div
                              key={tier}
                              className='relative p-3 rounded-lg border-2 border-gray-200 bg-white'>
                              {/* Desktop: Absolutely positioned badges */}
                              <div
                                className={`absolute top-2 left-2 px-2 py-1 rounded text-white font-bold text-xs ${config.color} z-10`}>
                                {config.name}
                              </div>
                              <span className='absolute top-2 right-2 text-xs text-gray-500 bg-white px-2 py-1 rounded shadow-sm z-10'>
                                {books.length}/{maxBooks}
                              </span>

                              <div className='flex gap-2 justify-center h-32'>
                                {slots.map((bookTier, index) => (
                                  <div
                                    key={
                                      bookTier?.id || `empty-${tier}-${index}`
                                    }
                                    className='w-20 h-full'>
                                    {bookTier ? (
                                      <div className='relative w-full h-full'>
                                        {bookTier.book && (
                                          <SimplifiedBookCard
                                            book={bookTier.book}
                                            tier={bookTier.tier}
                                            compact={true}
                                          />
                                        )}
                                      </div>
                                    ) : (
                                      <div className='w-full h-full border-2 border-dashed border-gray-300 rounded flex items-center justify-center bg-gray-50'>
                                        <div className='text-xs text-gray-300 text-center'>
                                          <div className='text-lg'>•</div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default CommunityFavorites

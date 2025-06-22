import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { fetchTopTierBooks } from '../services/api'
import type { TopTierBook } from '../services/api'
import type { TierLevel } from '../types/book'
import { TIER_CONFIG } from '../types/book'

interface TopTierSwimlaneProps {
  realmId: string
  realmName: string
  realmColor: string
  realmAccent: string
  realmTags: string[]
}

export function TopTierSwimlane({ realmId, realmName, realmColor, realmAccent, realmTags }: TopTierSwimlaneProps) {
  const { data: topTierBooks = [], isLoading, error } = useQuery({
    queryKey: ['topTierBooks', realmId, realmTags],
    queryFn: () => fetchTopTierBooks(realmTags),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    enabled: true, // Always enabled, let the backend handle filtering
  })

  // Debug logging
  console.log('TopTierSwimlane Debug:', {
    realmId,
    realmTags,
    topTierBooksCount: topTierBooks.length,
    isLoading,
    error
  })

  if (isLoading) {
    return (
      <div className="mt-8 p-6 rounded-lg border" style={{ 
        backgroundColor: `${realmColor}20`,
        borderColor: `${realmAccent}40`
      }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold" style={{ color: realmAccent }}>
            ⭐ Community Top Picks
          </h3>
          <div className="animate-pulse bg-gray-600 h-8 w-20 rounded"></div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-32 animate-pulse">
              <div className="bg-gray-700 w-32 h-48 rounded-lg mb-2"></div>
              <div className="bg-gray-600 h-4 w-full rounded mb-1"></div>
              <div className="bg-gray-600 h-3 w-3/4 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-8 p-6 rounded-lg border" style={{ 
        backgroundColor: `${realmColor}20`,
        borderColor: `${realmAccent}40`
      }}>
        <h3 className="text-xl font-bold mb-4" style={{ color: realmAccent }}>
          ⭐ Community Top Picks
        </h3>
        <div className="text-center py-8 text-gray-400">
          <p>Error loading community picks.</p>
          <p className="text-sm mt-2">Please try again later.</p>
        </div>
      </div>
    )
  }

  if (topTierBooks.length === 0) {
    return (
      <div className="mt-8 p-6 rounded-lg border" style={{ 
        backgroundColor: `${realmColor}20`,
        borderColor: `${realmAccent}40`
      }}>
        <h3 className="text-xl font-bold mb-4" style={{ color: realmAccent }}>
          ⭐ Community Top Picks
        </h3>
        <div className="text-center py-8 text-gray-400">
          <p>No top-tier books found yet.</p>
          <p className="text-sm mt-2">Be the first to add books to SSS, SS, or S tiers!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-8 p-6 rounded-lg border" style={{ 
      backgroundColor: `${realmColor}20`,
      borderColor: `${realmAccent}40`
    }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold" style={{ color: realmAccent }}>
            ⭐ Community Top Picks
          </h3>
          <p className="text-xs mt-1 opacity-75" style={{ color: realmAccent }}>
            Books rated SSS, SS, or S by LitRPG Academy students
          </p>
        </div>
        <Link
          to="/community-favorites"
          className="px-4 py-2 rounded-lg font-medium transition-all duration-200 border-2 hover:opacity-80"
          style={{
            backgroundColor: realmAccent,
            borderColor: realmAccent,
            color: 'white'
          }}
        >
          View All
        </Link>
      </div>
      
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-gray-600">
        {topTierBooks.map((topTierBook) => (
          <TopTierBookCard 
            key={topTierBook.book.id} 
            topTierBook={topTierBook} 
            realmAccent={realmAccent}
          />
        ))}
      </div>
    </div>
  )
}

interface TopTierBookCardProps {
  topTierBook: TopTierBook
  realmAccent: string
}

function TopTierBookCard({ topTierBook, realmAccent }: TopTierBookCardProps) {
  const { book, tierAssignments } = topTierBook
  
  // Get the highest tier for display
  const highestTier = tierAssignments[0]
  const totalUsers = tierAssignments.reduce((sum, assignment) => sum + assignment.userCount, 0)

  return (
    <Link
      to="/book/$bookId"
      params={{ bookId: book.id }}
      className="flex-shrink-0 w-32 group"
    >
      <div className="relative mb-2">
        <img
          src={book.coverUrl || book.image || '/placeholder-book.jpg'}
          alt={book.title}
          className="w-32 h-48 object-cover rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = '/placeholder-book.jpg'
          }}
        />
        
        {/* Tier badge overlay */}
        <div className="absolute top-2 left-2">
          <div 
            className={`px-2 py-1 rounded text-xs font-bold text-white shadow-lg ${TIER_CONFIG[highestTier.tier as TierLevel].color}`}
          >
            {highestTier.tier}
          </div>
        </div>

        {/* User count overlay */}
        <div className="absolute bottom-2 right-2">
          <div className="bg-black/70 text-white px-2 py-1 rounded text-xs font-bold">
            {totalUsers} {totalUsers === 1 ? 'student' : 'students'}
          </div>
        </div>
      </div>
      
      <div className="text-white">
        <div className="flex items-start justify-between mb-1">
          <h4 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-opacity-80 transition-colors flex-1 mr-1">
            {book.title}
          </h4>
          
          {/* Source badge */}
          {book.source && (
            <div className="flex-shrink-0">
              <div className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                book.source === 'AMAZON' 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-blue-500 text-white'
              }`}>
                {book.source === 'AMAZON' ? 'AMZ' : 'RR'}
              </div>
            </div>
          )}
        </div>
        
        <p className="text-xs text-gray-400 line-clamp-1 mb-1">
          {book.author?.name || 'Unknown Author'}
        </p>

        {/* Tier breakdown */}
        <div className="text-xs text-gray-500 space-y-0.5">
          {tierAssignments.map((assignment) => (
            <div key={assignment.tier} className="flex items-center justify-between">
              <span className="font-medium" style={{ color: realmAccent }}>
                {assignment.tier}:
              </span>
              <span>
                {assignment.userCount > 3 
                  ? `${assignment.userCount} students`
                  : assignment.users.map(user => user.name).join(', ')
                }
              </span>
            </div>
          ))}
        </div>
      </div>
    </Link>
  )
} 
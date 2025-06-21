import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { searchBooks, fetchAllTags } from '../services/api'
import type { Book } from '../types/book'

interface BookSwimlaneProps {
  realmId: string
  realmName: string
  realmColor: string
  realmAccent: string
}

// Map realm IDs to search terms that will be used to find matching tags
const REALM_SEARCH_TERMS = {
  xianxia: ['xianxia', 'cultivation', 'eastern', 'wuxia', 'martial', 'dao'],
  gamelit: ['gamelit', 'litrpg', 'game', 'rpg', 'system', 'level'],
  apocalypse: ['apocalypse', 'post-apocalyptic', 'zombie', 'survival', 'end', 'disaster'],
  isekai: ['isekai', 'reincarnation', 'transmigration', 'rebirth', 'another world', 'transported']
}

export function BookSwimlane({ realmId, realmName, realmColor, realmAccent }: BookSwimlaneProps) {
  // Fetch all available tags from the database
  const { data: allTags = [] } = useQuery({
    queryKey: ['all-tags'],
    queryFn: fetchAllTags,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  // Find matching tags for this realm based on search terms
  const getRealmTags = (realmId: string, allTags: string[]): string[] => {
    const searchTerms = REALM_SEARCH_TERMS[realmId as keyof typeof REALM_SEARCH_TERMS] || []
    
    const matchingTags = allTags.filter(tag => {
      const lowerTag = tag.toLowerCase()
      return searchTerms.some(term => 
        lowerTag.includes(term.toLowerCase()) || 
        term.toLowerCase().includes(lowerTag)
      )
    })

    // If no matching tags found, fallback to LitRPG
    return matchingTags.length > 0 ? matchingTags : ['LitRPG']
  }

  const realmTags = getRealmTags(realmId, allTags)
  
  const { data: books = [], isLoading } = useQuery({
    queryKey: ['realmBooks', realmId, realmTags],
    queryFn: () => searchBooks({
      tags: realmTags,
      sortBy: 'followers',
      limit: 20
    }),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    enabled: realmTags.length > 0, // Only run when we have tags
  })

  if (isLoading) {
    return (
      <div className="mt-8 p-6 rounded-lg" style={{ backgroundColor: `${realmColor}20` }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold" style={{ color: realmAccent }}>
            📚 Top {realmName} Books
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

  if (books.length === 0) {
    return (
      <div className="mt-8 p-6 rounded-lg" style={{ backgroundColor: `${realmColor}20` }}>
        <h3 className="text-xl font-bold mb-4" style={{ color: realmAccent }}>
          📚 Top {realmName} Books
        </h3>
        <div className="text-center py-8 text-gray-400">
          <p>No books found for this realm yet.</p>
          <p className="text-sm mt-2">Check back later as our library grows!</p>
          {realmTags.length > 0 && (
            <p className="text-xs mt-2 opacity-75">
              Searching for: {realmTags.join(', ')}
            </p>
          )}
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
            📚 Top {realmName} Books
          </h3>
          {realmTags.length > 0 && (
            <p className="text-xs mt-1 opacity-75" style={{ color: realmAccent }}>
              Matching tags: {realmTags.slice(0, 3).join(', ')}{realmTags.length > 3 ? '...' : ''}
            </p>
          )}
        </div>
        <Link
          to="/books"
          search={{ 
            tags: realmTags,
            sortBy: 'followers'
          }}
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
        {books.map((book) => (
          <Link
            key={book.id}
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
              
              {/* Rating overlay if available */}
              {book.rating > 0 && (
                <div className="absolute bottom-2 left-2">
                  <div className="bg-black/70 text-white px-2 py-1 rounded text-xs font-bold">
                    ⭐ {book.rating.toFixed(1)}
                  </div>
                </div>
              )}
            </div>
            
            <div className="text-white">
              <div className="flex items-start justify-between mb-1">
                <h4 className="font-medium text-sm leading-tight line-clamp-2 group-hover:text-opacity-80 transition-colors flex-1 mr-1">
                  {book.title}
                </h4>
                
                {/* Source badge moved here */}
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
              
              <p className="text-xs text-gray-400 line-clamp-1">
                {book.author?.name || 'Unknown Author'}
              </p>
              
              {/* Stats if available */}
              {book.stats && (book.stats.followers > 0 || book.stats.favorites > 0) && (
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  {book.stats.followers > 0 && (
                    <span>👥 {book.stats.followers.toLocaleString()}</span>
                  )}
                  {book.stats.favorites > 0 && (
                    <span>❤️ {book.stats.favorites.toLocaleString()}</span>
                  )}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
} 
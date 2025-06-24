import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BattleStoryConsole } from '../components/BattleStoryConsole'
import { BookSwimlane } from '../components/BookSwimlane'
import { TopTierSwimlane } from '../components/TopTierSwimlane'
import { searchBooks, fetchAllTags } from '../services/api'
import type { Book } from '../types/book'

interface RealmBattlePageProps {
  realmId: string
}

interface RealmBoss {
  id: string
  realm: string
  name: string
  maxHitpoints: number
  currentHitpoints: number
}

interface BattleStats {
  totalDamageToday: number
  totalMinutesToday: number
  uniqueContributors: number
  recentBattles: Array<{
    damage: number
    minutesRead: number
    user: string
    book: string | null
    createdAt: string
  }>
}

interface DailyLimits {
  usedMinutes: number
  remainingMinutes: number
  dailyLimit: number
}

const REALM_CONFIG = {
  xianxia: {
    name: 'Xianxia (Cultivation) Realm',
    boss: 'Longzu, The Heaven-Scourging Flame',
    image: '/assets/images/xianxia/xianxia_realm.png',
    bgGradient: 'from-emerald-800 to-slate-900',
    color: 'emerald',
    primary: '#1a4c3e', // Deep Jade
    accent: '#d4af37', // Imperial Gold
    description: 'Face the Ancestor Dragon who scorches paths to ascension',
  },
  gamelit: {
    name: 'GameLit Realm',
    boss: 'Glitchlord Exeon',
    image: '/assets/images/gamelit/gamelit_realm.png',
    bgGradient: 'from-indigo-900 to-slate-900',
    color: 'indigo',
    primary: '#6c00ff', // Electric Indigo
    accent: '#00f7ff', // Neon Cyan
    description: 'Battle the corrupted NPC who gained sentience',
  },
  apocalypse: {
    name: 'LitRPG Apocalypse Realm',
    boss: 'Zereth, Dungeon Architect of the End',
    image: '/assets/images/apocalypse/apocalypse_realm.png',
    bgGradient: 'from-slate-800 to-slate-900',
    color: 'orange',
    primary: '#3a3f4b', // Terminal Gray
    accent: '#ff7300', // Warning Orange
    description: 'Challenge the System herald who reshapes reality',
  },
  isekai: {
    name: 'Isekai / Rebirth Realm',
    boss: 'Aurelion the Eternal Return',
    image: '/assets/images/isekai/isekai_realm.png',
    bgGradient: 'from-violet-800 to-slate-900',
    color: 'violet',
    primary: '#b892ff', // Celestial Lavender
    accent: '#ffd369', // Soulfire Gold
    description: 'Confront the Reincarnator King of 10,000 lives',
  },
}

// Map realm IDs to search terms that will be used to find matching tags
const REALM_SEARCH_TERMS = {
  xianxia: ['xianxia', 'cultivation', 'eastern', 'wuxia', 'martial', 'dao'],
  gamelit: ['gamelit', 'litrpg', 'game', 'rpg', 'system', 'level'],
  apocalypse: [
    'apocalypse',
    'post-apocalyptic',
    'post apocalyptic',
    'dystopia',
    'zombie',
    'survival',
    'end',
    'disaster',
  ],
  isekai: [
    'isekai',
    'reincarnation',
    'transmigration',
    'rebirth',
    'another world',
    'transported',
  ],
}

export function RealmBattlePage({ realmId }: RealmBattlePageProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [minutesRead, setMinutesRead] = useState('')
  const [selectedBookId, setSelectedBookId] = useState('')
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [timelineHp, setTimelineHp] = useState<number | null>(null)
  const [isViewingTimeline, setIsViewingTimeline] = useState(false)
  const [isBookSearchOpen, setIsBookSearchOpen] = useState(false)
  const [bookSearchQuery, setBookSearchQuery] = useState('')

  const realmConfig = REALM_CONFIG[realmId as keyof typeof REALM_CONFIG]

  // Fetch all available tags from the database
  const { data: allTags = [] } = useQuery({
    queryKey: ['all-tags'],
    queryFn: fetchAllTags,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  // Find matching tags for this realm based on search terms
  const getRealmTags = (realmId: string, allTags: string[]): string[] => {
    const searchTerms =
      REALM_SEARCH_TERMS[realmId as keyof typeof REALM_SEARCH_TERMS] || []

    const matchingTags = allTags.filter(tag => {
      const lowerTag = tag.toLowerCase()
      return searchTerms.some(
        term =>
          lowerTag.includes(term.toLowerCase()) ||
          term.toLowerCase().includes(lowerTag)
      )
    })

    // Filter out tags that don't belong in this realm (specifically for apocalypse)
    const filteredTags = matchingTags.filter(tag => {
      const lowerTag = tag.toLowerCase()

      // For apocalypse realm, exclude tags that are clearly not apocalyptic
      if (realmId === 'apocalypse') {
        const excludedTerms = [
          'gender',
          'bender',
          'romance',
          'harem',
          'slice of life',
        ]
        return !excludedTerms.some(excluded => lowerTag.includes(excluded))
      }

      return true
    })

    // If no matching tags found, fallback to LitRPG
    return filteredTags.length > 0 ? filteredTags : ['LitRPG']
  }

  const realmTags = getRealmTags(realmId, allTags)

  if (!realmConfig) {
    return <div>Realm not found</div>
  }

  // Fetch realm boss data
  const { data: realmBoss, isLoading: bossLoading } = useQuery({
    queryKey: ['realmBoss', realmId],
    queryFn: async (): Promise<RealmBoss> => {
      const response = await fetch(
        `/.netlify/functions/api/realms/boss/${realmId}`
      )
      if (!response.ok) throw new Error('Failed to fetch boss')
      return response.json()
    },
  })

  // Debounced search query for better performance
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(bookSearchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [bookSearchQuery])

  // Search for books when user is actively searching
  const { data: searchResults = [], isLoading: isSearching } = useQuery({
    queryKey: ['bookSearch', debouncedSearchQuery],
    queryFn: () => searchBooks({ query: debouncedSearchQuery, limit: 50 }),
    enabled: debouncedSearchQuery.length > 2, // Only search when user has typed at least 3 characters
  })

  // Fetch battle statistics
  const { data: battleStats } = useQuery({
    queryKey: ['battleStats', realmId],
    queryFn: async (): Promise<BattleStats> => {
      const response = await fetch(
        `/.netlify/functions/api/realms/boss/${realmId}/stats`
      )
      if (!response.ok) throw new Error('Failed to fetch battle stats')
      return response.json()
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  // Fetch user's daily limits
  const { data: dailyLimits } = useQuery({
    queryKey: ['dailyLimits', user?.id],
    queryFn: async (): Promise<DailyLimits | null> => {
      if (!user?.id) return null
      const response = await fetch(
        `/.netlify/functions/api/realms/user/${user.id}/daily-minutes`
      )
      if (!response.ok) throw new Error('Failed to fetch daily limits')
      return response.json()
    },
    enabled: !!user?.id,
  })

  // Battle mutation
  const battleMutation = useMutation({
    mutationFn: async ({
      minutes,
      bookId,
    }: {
      minutes: number
      bookId?: string
    }) => {
      const response = await fetch(
        `/.netlify/functions/api/realms/boss/${realmId}/battle`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            minutesRead: minutes,
            bookId: bookId || null,
            userId: user?.id || null,
          }),
        }
      )
      if (!response.ok) throw new Error('Battle failed')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['realmBoss', realmId] })
      queryClient.invalidateQueries({ queryKey: ['battleStats', realmId] })
      queryClient.invalidateQueries({ queryKey: ['dailyLimits', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['battleStory', realmId] })
      setMinutesRead('')
      setSelectedBookId('')
    },
  })

  const handleBattle = () => {
    const minutes = parseInt(minutesRead)

    // Validate minutes
    if (minutes <= 0) return
    if (minutes > 300) {
      alert('Maximum 300 minutes per battle session')
      return
    }

    // Check daily limits for signed-in users
    if (user && dailyLimits && minutes > dailyLimits.remainingMinutes) {
      alert(
        `You only have ${dailyLimits.remainingMinutes} minutes remaining today (daily limit: 500 minutes)`
      )
      return
    }

    battleMutation.mutate({ minutes, bookId: selectedBookId })
  }

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book)
    setSelectedBookId(book.id)
    setIsBookSearchOpen(false)
    setBookSearchQuery('')
  }

  const clearBookSelection = () => {
    setSelectedBook(null)
    setSelectedBookId('')
  }

  // Use timeline HP if viewing a specific point, otherwise use current HP
  const displayHp =
    isViewingTimeline && timelineHp !== null
      ? timelineHp
      : realmBoss?.currentHitpoints || 0
  const hpPercentage = realmBoss
    ? (displayHp / realmBoss.maxHitpoints) * 100
    : 100

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${realmConfig.bgGradient} text-white`}>
      <div className='container mx-auto px-4 py-4'>
        {/* Compact Header */}
        <div className='text-center mb-6'>
          <h1 className='text-2xl font-bold mb-1 text-white drop-shadow-lg'>
            {realmConfig.name}
          </h1>
          <p className='text-sm opacity-90 mb-1'>{realmConfig.description}</p>
        </div>

        {/* Dashboard Grid Layout */}
        <div className='grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-7xl mx-auto'>
          {/* Left Column: Boss & Battle Interface */}
          <div className='xl:col-span-1 space-y-4'>
            {/* Boss Card */}
            {realmBoss && (
              <div
                className='rounded-lg border-2 overflow-hidden relative'
                style={{
                  backgroundColor: `${realmConfig.primary}80`,
                  borderColor: realmConfig.accent,
                }}>
                {/* Boss Image */}
                <div className='relative'>
                  <img
                    src={realmConfig.image}
                    alt={realmConfig.name}
                    className='w-full aspect-square object-cover'
                  />

                  {/* Overlay gradient for better text visibility */}
                  <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent' />

                  {/* Boss name overlay */}
                  <div className='absolute top-4 left-4 right-4'>
                    <h2
                      className='text-xl font-bold text-white drop-shadow-lg'
                      style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
                      {realmConfig.boss}
                    </h2>
                    {isViewingTimeline && (
                      <p className='text-blue-300 text-sm drop-shadow-lg'>
                        📍 Historical view
                      </p>
                    )}
                  </div>

                  {/* HP Bar Overlay */}
                  <div className='absolute bottom-4 left-4 right-4'>
                    <div className='bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-white/20'>
                      <div className='bg-gray-900 rounded-full h-6 mb-2 overflow-hidden border border-gray-600'>
                        <div
                          className='h-full transition-all duration-1000 ease-out'
                          style={{
                            width: `${hpPercentage}%`,
                            background: `linear-gradient(90deg, #dc2626, ${realmConfig.accent})`,
                          }}
                        />
                      </div>
                      <div className='flex justify-between text-xs text-white'>
                        <span className='font-medium'>
                          {displayHp.toLocaleString()} HP
                        </span>
                        <span
                          className='font-bold'
                          style={{ color: realmConfig.accent }}>
                          {(hpPercentage || 0).toFixed(1)}%
                        </span>
                        <span className='opacity-75'>
                          Max: {(realmBoss.maxHitpoints || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {displayHp <= 0 && (
                  <div className='absolute inset-0 bg-black/80 flex items-center justify-center'>
                    <div className='text-center'>
                      <p className='text-yellow-400 text-2xl font-bold mb-2'>
                        🎉 DEFEATED! 🎉
                      </p>
                      <p className='text-white text-sm opacity-75'>
                        The boss will respawn soon...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Battle Interface Card */}
            <div
              className='rounded-lg p-4 border-2'
              style={{
                backgroundColor: `${realmConfig.primary}60`,
                borderColor: realmConfig.accent,
              }}>
              <h3
                className='text-lg font-bold mb-3 text-center'
                style={{ color: realmConfig.accent }}>
                ⚔️ Battle Interface
              </h3>

              <div className='space-y-3'>
                <div>
                  <label className='block text-xs font-medium mb-1'>
                    Minutes Read
                  </label>
                  <input
                    type='number'
                    min='1'
                    max='300'
                    value={minutesRead}
                    onChange={e => setMinutesRead(e.target.value)}
                    className='w-full px-3 py-2 bg-gray-800 rounded-lg text-white text-sm'
                    placeholder='Minutes read today'
                  />
                </div>

                <div>
                  <label className='block text-xs font-medium mb-1'>
                    Book (Optional)
                  </label>
                  {selectedBook ? (
                    <div className='flex items-center justify-between p-2 bg-gray-800 rounded-lg border border-gray-600'>
                      <div className='flex-1 min-w-0'>
                        <div className='text-white text-sm font-medium truncate'>
                          {selectedBook.title}
                        </div>
                        <div className='text-gray-400 text-xs truncate'>
                          {selectedBook.author?.name || 'Unknown Author'}
                        </div>
                      </div>
                      <button
                        onClick={clearBookSelection}
                        className='ml-2 text-gray-400 hover:text-white transition-colors'
                        title='Remove book'>
                        <svg
                          className='w-4 h-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M6 18L18 6M6 6l12 12'
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsBookSearchOpen(true)}
                      className='w-full p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-left transition-colors border border-gray-600 hover:border-gray-500 text-sm'>
                      <div className='flex items-center justify-between'>
                        <span>Select book</span>
                        <svg
                          className='w-4 h-4 text-gray-400'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'>
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                          />
                        </svg>
                      </div>
                    </button>
                  )}
                </div>

                <button
                  onClick={handleBattle}
                  disabled={
                    !minutesRead ||
                    parseInt(minutesRead) <= 0 ||
                    battleMutation.isPending
                  }
                  className={`w-full py-2 px-4 rounded-lg font-bold transition-all duration-200 border-2 text-white text-sm
                    ${
                      minutesRead && parseInt(minutesRead) > 0
                        ? 'hover:opacity-80'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  style={{
                    backgroundColor:
                      minutesRead && parseInt(minutesRead) > 0
                        ? realmConfig.accent
                        : '#4b5563',
                    borderColor:
                      minutesRead && parseInt(minutesRead) > 0
                        ? realmConfig.accent
                        : '#6b7280',
                  }}>
                  {battleMutation.isPending
                    ? 'Attacking...'
                    : `Deal ${minutesRead || 0} Damage!`}
                </button>
              </div>

              <div className='mt-3 text-center text-xs opacity-75'>
                <p>1 minute = 1 damage point</p>
                {user ? (
                  dailyLimits && (
                    <div className='mt-2 space-y-1'>
                      <p>
                        {dailyLimits.remainingMinutes}/500 minutes remaining
                      </p>
                      <div className='w-full bg-gray-800 rounded-full h-1'>
                        <div
                          className='h-1 rounded-full transition-all duration-300'
                          style={{
                            width: `${(dailyLimits.usedMinutes / dailyLimits.dailyLimit) * 100}%`,
                            backgroundColor: realmConfig.accent,
                          }}
                        />
                      </div>
                    </div>
                  )
                ) : (
                  <p className='mt-2'>Sign in to track contributions!</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Battle Chronicle */}
          <div className='xl:col-span-2'>
            <BattleStoryConsole
              realmId={realmId}
              realmConfig={realmConfig}
              onTimelineChange={(hp: number, isViewing: boolean) => {
                setTimelineHp(hp)
                setIsViewingTimeline(isViewing)
              }}
            />
          </div>
        </div>

        {/* Book Search Modal */}
        {isBookSearchOpen && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-lg max-w-md w-full max-h-[60vh] overflow-hidden'>
              <div className='p-4 border-b'>
                <div className='flex items-center justify-between mb-3'>
                  <h3 className='text-lg font-semibold text-gray-900'>
                    Select a Book
                  </h3>
                  <button
                    onClick={() => setIsBookSearchOpen(false)}
                    className='text-gray-400 hover:text-gray-600'>
                    <svg
                      className='w-6 h-6'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M6 18L18 6M6 6l12 12'
                      />
                    </svg>
                  </button>
                </div>
                <input
                  type='text'
                  value={bookSearchQuery}
                  onChange={e => setBookSearchQuery(e.target.value)}
                  placeholder='Search books by title or author...'
                  className='w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500'
                  autoFocus
                />
              </div>
              <div className='max-h-80 overflow-y-auto p-4'>
                {debouncedSearchQuery.length < 3 ? (
                  <div className='text-center py-8 text-gray-500'>
                    <svg
                      className='w-12 h-12 mx-auto mb-4 text-gray-300'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                      />
                    </svg>
                    <p>Type at least 3 characters to search</p>
                  </div>
                ) : isSearching ? (
                  <div className='text-center py-8 text-gray-500'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
                    <p>Searching all books...</p>
                  </div>
                ) : searchResults.length === 0 ? (
                  <div className='text-center py-8 text-gray-500'>
                    <svg
                      className='w-12 h-12 mx-auto mb-4 text-gray-300'
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
                    <p>No books found matching "{debouncedSearchQuery}"</p>
                  </div>
                ) : (
                  searchResults.map((book: Book) => (
                    <div
                      key={book.id}
                      onClick={() => handleBookSelect(book)}
                      className='p-3 hover:bg-gray-100 cursor-pointer rounded-lg border-b border-gray-100 last:border-b-0'>
                      <div className='font-medium text-gray-900'>
                        {book.title || 'Untitled'}
                      </div>
                      <div className='text-sm text-gray-600'>
                        {book.author?.name || 'Unknown Author'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Book Swimlane */}
        <BookSwimlane
          realmId={realmId}
          realmName={realmConfig.name}
          realmColor={realmConfig.primary}
          realmAccent={realmConfig.accent}
        />

        {/* Top Tier Swimlane */}
        <TopTierSwimlane
          realmId={realmId}
          realmName={realmConfig.name}
          realmColor={realmConfig.primary}
          realmAccent={realmConfig.accent}
          realmTags={realmTags}
        />
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { fetchUserRealmProgress, searchBooks } from '../services/api'
import type { Book } from '../types/book'

// Define realm configurations

const REALM_CONFIGS = {
  cultivation: {
    name: 'Cultivation Academy',
    icon: '/assets/images/cultivation/cultivation_realm_icon.png',
    bgColor: 'from-emerald-800 to-slate-900',
    accentColor: '#d4af37',
    description: 'Cultivate your way to immortality',
  },
  gamelit: {
    name: 'GameLit Academy',
    icon: '/assets/images/gamelit/gamelit_realm_icon.png',
    bgColor: 'from-indigo-900 to-slate-900',
    accentColor: '#00f7ff',
    description: 'Level up through the game world',
  },
  apocalypse: {
    name: 'Apocalypse Academy',
    icon: '/assets/images/apocalypse/apocalypse_realm_icon.png',
    bgColor: 'from-slate-800 to-slate-900',
    accentColor: '#ff7300',
    description: 'Survive the end times',
  },
  portal: {
    name: 'Portal Academy',
    icon: '/assets/images/portal/portal_realm_icon.png',
    bgColor: 'from-violet-800 to-slate-900',
    accentColor: '#ffd369',
    description: 'Reincarnate and grow stronger',
  },
}

export function AcademyPage() {
  const { user } = useAuth()

  // Fetch user's real progress across all realms
  const { data: userRealmProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['userRealmProgress', user?.id],
    queryFn: () => fetchUserRealmProgress(user!.id),
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  // State for collapsible book details and bonus activities
  const [expandedRealms, setExpandedRealms] = useState<Record<string, boolean>>({})
  const [showBonusActivities, setShowBonusActivities] = useState(false)
  
  // State for realm-specific inputs
  type RealmKey = 'cultivation' | 'gamelit' | 'apocalypse' | 'portal'
  
  const [realmInputs, setRealmInputs] = useState({
    cultivation: { writing: '', reading: '', selectedBook: null as Book | null, isBookSearchOpen: false, bookSearchQuery: '' },
    gamelit: { writing: '', reading: '', selectedBook: null as Book | null, isBookSearchOpen: false, bookSearchQuery: '' },
    apocalypse: { writing: '', reading: '', selectedBook: null as Book | null, isBookSearchOpen: false, bookSearchQuery: '' },
    portal: { writing: '', reading: '', selectedBook: null as Book | null, isBookSearchOpen: false, bookSearchQuery: '' }
  })
  const [isSubmitting, setIsSubmitting] = useState({
    cultivation: false,
    gamelit: false,
    apocalypse: false,
    portal: false
  })

  // Debounced search queries for each realm
  const [debouncedSearchQueries, setDebouncedSearchQueries] = useState({
    cultivation: '',
    gamelit: '',
    apocalypse: '',
    portal: ''
  })

  const toggleRealmExpansion = (realmId: string) => {
    setExpandedRealms(prev => ({
      ...prev,
      [realmId]: !prev[realmId]
    }))
  }

  // Helper to update realm input values
  const updateRealmInput = (realm: RealmKey, type: keyof typeof realmInputs[RealmKey], value: any) => {
    setRealmInputs(prev => ({
      ...prev,
      [realm]: {
        ...prev[realm],
        [type]: value
      }
    }))
  }

  // Debouncing effect for search queries
  useEffect(() => {
    const timers: Record<RealmKey, NodeJS.Timeout> = {} as any

    Object.keys(realmInputs).forEach(realm => {
      const realmKey = realm as RealmKey
      timers[realmKey] = setTimeout(() => {
        setDebouncedSearchQueries(prev => ({
          ...prev,
          [realmKey]: realmInputs[realmKey].bookSearchQuery
        }))
      }, 300)
    })

    return () => {
      Object.values(timers).forEach(timer => clearTimeout(timer))
    }
  }, [realmInputs])

  // Book search handlers
  const handleBookSelect = (realm: RealmKey, book: Book) => {
    updateRealmInput(realm, 'selectedBook', book)
    updateRealmInput(realm, 'isBookSearchOpen', false)
    updateRealmInput(realm, 'bookSearchQuery', '')
  }

  const clearBookSelection = (realm: RealmKey) => {
    updateRealmInput(realm, 'selectedBook', null)
  }

  // Search queries for each realm
  const realmSearchQueries = useQuery({
    queryKey: ['bookSearchRealm', debouncedSearchQueries],
    queryFn: async () => {
      const results: Record<RealmKey, Book[]> = {} as any
      
      await Promise.all(Object.entries(debouncedSearchQueries).map(async ([realm, query]) => {
        if (query.length >= 3) {
          try {
            const books = await searchBooks({ query, limit: 20 })
            results[realm as RealmKey] = books
          } catch (error) {
            results[realm as RealmKey] = []
          }
        } else {
          results[realm as RealmKey] = []
        }
      }))
      
      return results
    },
    enabled: Object.values(debouncedSearchQueries).some(query => query.length >= 3),
  })

  // Submit writing minutes for a specific realm
  const submitWritingMinutes = async (realm: RealmKey) => {
    const minutes = parseInt(realmInputs[realm].writing)
    if (isNaN(minutes) || minutes <= 0) {
      alert('Please enter a valid number of minutes')
      return
    }

    setIsSubmitting(prev => ({ ...prev, [realm]: true }))

    try {
      const response = await fetch('/.netlify/functions/user-api/writing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          realmName: realm.toUpperCase(),
          minutes: minutes
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit writing time')
      }

      const result = await response.json()
      
      // Clear input
      updateRealmInput(realm, 'writing', '')
      
      // Show success message
      alert(`Success! Added ${result.minutesAwarded} writing minutes to ${result.realmName} realm!`)
      
      // Trigger a refetch
      window.location.reload()
      
    } catch (error) {
      console.error('Error submitting writing time:', error)
      alert('Failed to submit writing time. Please try again.')
    } finally {
      setIsSubmitting(prev => ({ ...prev, [realm]: false }))
    }
  }

  // Submit reading minutes for a specific realm
  const submitReadingMinutes = async (realm: RealmKey) => {
    const minutes = parseInt(realmInputs[realm].reading)
    const selectedBook = realmInputs[realm].selectedBook
    
    if (isNaN(minutes) || minutes <= 0) {
      alert('Please enter a valid number of minutes')
      return
    }

    setIsSubmitting(prev => ({ ...prev, [realm]: true }))

    try {
      const response = await fetch('/.netlify/functions/user-api/reading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          realmName: realm.toUpperCase(),
          minutes: minutes,
          bookId: selectedBook?.id || null
        })
      })

      if (!response.ok) {
        throw new Error('Failed to submit reading time')
      }

      const result = await response.json()
      
      // Clear inputs
      updateRealmInput(realm, 'reading', '')
      updateRealmInput(realm, 'selectedBook', null)
      
      // Show success message
      const bookText = selectedBook ? ` for "${selectedBook.title}"` : ''
      alert(`Success! Added ${result.minutesAwarded} reading minutes to ${result.realmName} realm${bookText}!`)
      
      // Trigger a refetch
      window.location.reload()
      
    } catch (error) {
      console.error('Error submitting reading time:', error)
      alert('Failed to submit reading time. Please try again.')
    } finally {
      setIsSubmitting(prev => ({ ...prev, [realm]: false }))
    }
  }

  // Render input fields for adding minutes to a realm
  const renderRealmInputs = (realm: RealmKey) => {
    return (
      <div className="bg-black/30 rounded-lg p-4 mt-3 space-y-4">
        <div className="text-sm font-medium text-white mb-3">
          Track Activity Minutes
        </div>
        
        {/* Reading input with book search */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-blue-400 text-lg">R</span>
            <span className="text-blue-300 text-sm font-medium">Reading/Listening</span>
          </div>
          
          {/* Book selection */}
          {realmInputs[realm].selectedBook ? (
            <div className="flex items-center justify-between p-2 bg-gray-800 rounded-lg border border-gray-600">
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-medium truncate">
                  {realmInputs[realm].selectedBook!.title}
                </div>
                <div className="text-gray-400 text-xs truncate">
                  {realmInputs[realm].selectedBook!.author?.name || 'Unknown Author'}
                </div>
              </div>
              <button
                onClick={() => clearBookSelection(realm)}
                className="ml-2 text-gray-400 hover:text-white transition-colors"
                title="Remove book">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : (
            <button
              onClick={() => updateRealmInput(realm, 'isBookSearchOpen', true)}
              className="w-full p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white text-left transition-colors border border-gray-600 hover:border-gray-500 text-xs">
              <div className="flex items-center justify-between">
                <span>Select book (optional)</span>
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </button>
          )}
          
          <div className="flex gap-2">
            <input
              type="number"
              value={realmInputs[realm].reading}
              onChange={(e) => updateRealmInput(realm, 'reading', e.target.value)}
              placeholder="Minutes"
              min="1"
              max="240"
              className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={() => submitReadingMinutes(realm)}
              disabled={isSubmitting[realm] || !user || !realmInputs[realm].reading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg font-medium text-sm transition-colors"
            >
              {isSubmitting[realm] ? '...' : 'Add'}
            </button>
          </div>
        </div>
        
        {/* Writing input */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-green-400 text-lg">W</span>
            <span className="text-green-300 text-sm font-medium">Writing</span>
          </div>
          
          <div className="flex gap-2">
            <input
              type="number"
              value={realmInputs[realm].writing}
              onChange={(e) => updateRealmInput(realm, 'writing', e.target.value)}
              placeholder="Minutes"
              min="1"
              max="240"
              className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 text-sm focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
            />
            <button
              onClick={() => submitWritingMinutes(realm)}
              disabled={isSubmitting[realm] || !user || !realmInputs[realm].writing}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg font-medium text-sm transition-colors"
            >
              {isSubmitting[realm] ? '...' : 'Add'}
            </button>
          </div>
          
          <div className="text-xs text-gray-300">
            Fan fiction, reviews, analysis, world-building notes, etc.
          </div>
        </div>
      </div>
    )
  }

  const renderBookDetails = (realmId: string, books: Array<{bookId: string, title: string, minutes: number}>) => {
    if (!books || books.length === 0) return null
    
    const isExpanded = expandedRealms[realmId]
    const totalBooks = books.length
    const totalMinutes = books.reduce((sum, book) => sum + book.minutes, 0)
    
    return (
      <div className='mt-3 pt-3 border-t border-gray-600/30'>
        <button 
          onClick={() => toggleRealmExpansion(realmId)}
          className='flex items-center justify-between w-full text-xs text-gray-400 hover:text-gray-300 transition-colors'
        >
          <span>{totalBooks} book{totalBooks === 1 ? '' : 's'} read ({totalMinutes} min)</span>
          <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        
        {isExpanded && (
          <div className='mt-2 space-y-1 max-h-32 overflow-y-auto'>
            {books
              .sort((a, b) => b.minutes - a.minutes) // Sort by minutes read (highest first)
              .map((book) => (
                <Link
                  key={book.bookId}
                  to='/book/$bookId'
                  params={{ bookId: book.bookId }}
                  className='flex justify-between items-center p-2 rounded bg-gray-800/50 hover:bg-gray-700/50 transition-colors text-xs group'
                >
                  <span className='text-gray-300 group-hover:text-white truncate pr-2'>
                    {book.title}
                  </span>
                  <span className='text-gray-500 group-hover:text-gray-300 whitespace-nowrap'>
                    {book.minutes}m
                  </span>
                </Link>
              ))
            }
          </div>
        )}
      </div>
    )
  }

  const renderBonusActivities = () => {
    if (!userRealmProgress?.bonusActivities || userRealmProgress.bonusActivities.length === 0) {
      return null
    }

    const activityTypeIcons = {
      'Marked Book as Read or Reading': 'R',
      'Review': 'S',
      'First S Tier': '3',
      'Boss Victory': 'B',
      'First SS Tier': '2', 
      'First SSS Tier': '1',
      'Writing': 'W',
      'Bonus': '*'
    }

    const activityTypeColors = {
      'Marked Book as Read or Reading': 'text-blue-400',
      'Review': 'text-yellow-400',
      'First S Tier': 'text-amber-400',
      'Boss Victory': 'text-red-400',
      'First SS Tier': 'text-gray-300',
      'First SSS Tier': 'text-yellow-500',
      'Writing': 'text-green-400',
      'Bonus': 'text-purple-400'
    }

    return (
      <div className='bg-purple-900/30 border border-purple-500/50 rounded-lg p-4 mb-6'>
        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center space-x-2'>
            <span className='text-purple-400'>A</span>
            <h3 className='text-lg font-bold text-purple-200'>
              Bonus Achievements
            </h3>
            <span className='text-sm text-purple-300'>
              ({userRealmProgress.totalBonusMinutes} min to all realms)
            </span>
          </div>
          <button
            onClick={() => setShowBonusActivities(!showBonusActivities)}
            className='text-purple-400 hover:text-purple-300 transition-colors'
          >
            <span className={`transform transition-transform ${showBonusActivities ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
        </div>
        
        <div className='text-xs text-purple-300 mb-3'>
          Special achievements that boost progression across all realms simultaneously!
        </div>

        {showBonusActivities && (
          <div className='space-y-2 max-h-64 overflow-y-auto'>
            {userRealmProgress.bonusActivities.map((activity, index) => (
              <Link
                key={index}
                to='/book/$bookId'
                params={{ bookId: activity.bookId }}
                className='flex items-center justify-between p-3 rounded-lg bg-purple-800/30 hover:bg-purple-700/40 transition-colors group'
              >
                <div className='flex items-center space-x-3'>
                  <span className='text-lg'>
                    {activityTypeIcons[activity.activityType as keyof typeof activityTypeIcons] || '*'}
                  </span>
                  <div>
                    <div className={`text-sm font-medium ${activityTypeColors[activity.activityType as keyof typeof activityTypeColors] || 'text-purple-400'}`}>
                      {activity.activityType}
                    </div>
                    <div className='text-xs text-gray-300 group-hover:text-white transition-colors'>
                      {activity.bookTitle}
                    </div>
                    <div className='text-xs text-gray-500'>
                      {new Date(activity.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className='text-purple-400 font-bold text-sm'>
                  +{activity.minutes}m
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderBonusExperienceGuide = () => {
    // Define all possible bonus activities
    const allBonusActivities = [
      {
        type: 'Marked Book as Read or Reading',
        icon: 'R',
        color: 'text-blue-400',
        minutes: 15,
        description: 'Mark any book as "Read" or "Reading"',
        action: 'Go to a book page and set reading status'
      },
      {
        type: 'Review',
        icon: 'S',
        color: 'text-yellow-400', 
        minutes: 30,
        description: 'Write a review for any book',
        action: 'Go to a book page and write a review'
      },
      {
        type: 'First S Tier',
        icon: '3',
        color: 'text-amber-400',
        minutes: 45,
        description: 'Assign your first S tier rating',
        action: 'Go to a book page and assign S tier'
      },
      {
        type: 'Boss Victory',
        icon: 'B',
        color: 'text-red-400',
        minutes: 60,
        description: 'Participate in defeating a realm boss',
        action: 'Battle in any realm until boss is defeated'
      },
      {
        type: 'First SS Tier',
        icon: '2',
        color: 'text-gray-300',
        minutes: 75,
        description: 'Assign your first SS tier rating',
        action: 'Go to a book page and assign SS tier'
      },
      {
        type: 'First SSS Tier',
        icon: '1',
        color: 'text-yellow-500',
        minutes: 120,
        description: 'Assign your first SSS tier rating',
        action: 'Go to a book page and assign SSS tier'
      },
      {
        type: 'Writing',
        icon: 'W',
        color: 'text-green-400',
        minutes: '1:1',
        description: 'Write content for a specific realm (1 min written = 1 min XP)',
        action: 'Use the writing tracker below to select a realm'
      }
    ]

    // Check which activities the user has completed
    const completedActivities = new Set(
      userRealmProgress?.bonusActivities?.map(activity => activity.activityType) || []
    )

    return (
      <div className='bg-slate-800/50 rounded-lg border border-slate-700 p-6 mb-6'>
        <div className='flex items-center space-x-2 mb-4'>
          <span className='text-2xl'>G</span>
          <h3 className='text-xl font-bold text-white'>
            Bonus Experience Guide
          </h3>
        </div>
        
        <div className='text-sm text-gray-400 mb-4'>
          Complete these activities to earn bonus experience that applies to ALL realms:
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
          {allBonusActivities.map((activity, index) => {
            const isCompleted = completedActivities.has(activity.type)
            
            return (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                  isCompleted 
                    ? 'bg-green-900/30 border-green-500/50' 
                    : 'bg-gray-800/30 border-gray-600/50 hover:border-gray-500/50'
                }`}
              >
                <div className='flex items-center space-x-3'>
                  <div className='flex items-center space-x-2'>
                    <span className='text-lg'>{activity.icon}</span>
                    {isCompleted ? (
                      <span className='text-green-400 text-sm'>✓</span>
                    ) : (
                      <span className='text-gray-500 text-sm'>○</span>
                    )}
                  </div>
                  <div>
                    <div className={`text-sm font-medium ${isCompleted ? 'text-green-300' : activity.color}`}>
                      {activity.description}
                    </div>
                    <div className='text-xs text-gray-400'>
                      {activity.action}
                    </div>
                  </div>
                </div>
                <div className={`text-xs font-bold ${isCompleted ? 'text-green-400' : 'text-gray-500'}`}>
                  {typeof activity.minutes === 'number' ? `+${activity.minutes}m` : activity.minutes}
                </div>
              </div>
            )
          })}
        </div>

        <div className='mt-4 p-3 bg-amber-900/30 border border-amber-500/50 rounded-lg'>
          <div className='flex items-center space-x-2 mb-1'>
            <span className='text-amber-400'>T</span>
            <span className='text-amber-200 text-sm font-medium'>Pro Tip:</span>
          </div>
          <div className='text-amber-200 text-xs'>
            Bonus experience applies to ALL realms simultaneously, making it the most efficient way to boost your overall progress!
          </div>
        </div>
      </div>
    )
  }



  const renderCultivationStats = () => {
    const stats = userRealmProgress?.progress.cultivation
    const books = userRealmProgress?.realmBooks.cultivation || []
    if (!stats) return null
    
    return (
      <div className='bg-black/30 rounded-lg p-4 border border-emerald-500/30'>
        <div className='flex items-center space-x-3 mb-3'>
          <img
                    src='/assets/images/cultivation/cultivation_realm_icon.png'
        alt='Cultivation'
            className='w-8 h-8'
          />
          <h3 className='text-lg font-bold text-yellow-400'>
            Cultivation Arts
          </h3>
        </div>
        <div className='text-sm font-semibold text-emerald-300'>
          {stats.currentRealm} - Level {stats.currentLevel}
        </div>
        <div className='text-xs text-gray-300 mt-1'>
          Reading/Listening Minutes: {stats.totalMinutes}
        </div>
        <div className='mt-2'>
          <div className='bg-gray-800 rounded-full h-2'>
            <div
              className='bg-gradient-to-r from-emerald-500 to-yellow-400 h-2 rounded-full'
              style={{ width: `${Math.min(stats.progressPercent, 100)}%` }}
            />
          </div>
          <div className='text-xs text-gray-400 mt-1'>
            Progress to next level ({Math.round(stats.progressPercent)}%)
          </div>
        </div>
        {renderBookDetails('cultivation', books)}
      </div>
    )
  }

  const renderGamelitStats = () => {
    const stats = userRealmProgress?.progress.gamelit
    const books = userRealmProgress?.realmBooks.gamelit || []
    if (!stats) return null
    
    return (
      <div className='bg-black/30 rounded-lg p-4 border border-cyan-500/30'>
        <div className='flex items-center space-x-3 mb-3'>
          <img
            src='/assets/images/gamelit/gamelit_realm_icon.png'
            alt='GameLit'
            className='w-8 h-8'
          />
          <h3 className='text-lg font-bold text-cyan-400'>GameLit Character</h3>
        </div>
        <div className='text-lg font-bold text-cyan-300'>
          Level {stats.level}
        </div>
        <div className='text-xs text-gray-300 mt-1'>
          Reading/Listening Minutes: {stats.totalMinutes}
        </div>
        <div className='mt-2'>
          <div className='bg-gray-800 rounded-full h-2'>
            <div
              className='bg-gradient-to-r from-indigo-500 to-cyan-400 h-2 rounded-full'
              style={{
                width: `${Math.min(stats.progressPercent, 100)}%`,
              }}
            />
          </div>
          <div className='text-xs text-gray-400 mt-1'>
            {stats.experience} / {stats.experienceToNext} XP ({Math.round(stats.progressPercent)}%)
          </div>
        </div>
        {renderBookDetails('gamelit', books)}
      </div>
    )
  }

  const renderPortalStats = () => {
    const stats = userRealmProgress?.progress.portal
    const books = userRealmProgress?.realmBooks.portal || []
    if (!stats) return null
    
    return (
      <div className='bg-black/30 rounded-lg p-4 border border-purple-500/30'>
        <div className='flex items-center space-x-3 mb-3'>
          <img
                    src='/assets/images/portal/portal_realm_icon.png'
        alt='Portal'
            className='w-8 h-8'
          />
          <h3 className='text-lg font-bold text-purple-400'>Portal Lives</h3>
        </div>
        <div className='text-sm font-semibold text-purple-300'>
          Life #{stats.reincarnations + 1}: {stats.currentLife}
        </div>
        <div className='text-xs text-gray-300 mt-1'>
          Life Level: {stats.lifeLevel}
        </div>
        <div className='text-xs text-gray-300 mt-1'>
          Reading/Listening Minutes: {stats.totalMinutes}
        </div>
        <div className='text-xs text-gray-400 mt-1'>
          Previous Reincarnations: {stats.reincarnations}
        </div>
        {renderBookDetails('portal', books)}
      </div>
    )
  }

  const renderApocalypseStats = () => {
    const stats = userRealmProgress?.progress.apocalypse
    const books = userRealmProgress?.realmBooks.apocalypse || []
    if (!stats) return null
    
    return (
      <div className='bg-black/30 rounded-lg p-4 border border-orange-500/30'>
        <div className='flex items-center space-x-3 mb-3'>
          <img
            src='/assets/images/apocalypse/apocalypse_realm_icon.png'
            alt='Apocalypse'
            className='w-8 h-8'
          />
          <h3 className='text-lg font-bold text-orange-400'>
            Apocalypse Survival
          </h3>
        </div>
        <div className='text-sm font-semibold text-orange-300 mb-1'>
          Day {stats.survivalDays}
        </div>
        <div className='text-xs text-gray-300 mb-2'>
          Reading/Listening Minutes: {stats.totalMinutes}
        </div>
        <div className='grid grid-cols-4 gap-1 text-xs'>
          {Object.entries(stats.stats).map(([stat, value]) => (
            <div key={stat} className='text-center'>
              <div className='text-gray-400'>{stat}</div>
              <div className='text-white font-bold'>{value}</div>
            </div>
          ))}
        </div>
        {renderBookDetails('apocalypse', books)}
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'>
      {/* Classroom Header */}
      <div className='bg-gradient-to-r from-amber-900/50 to-amber-800/50 border-b border-amber-700/30'>
        <div className='container mx-auto px-4 py-6'>
          <div className='text-center'>
            <h1 className='text-4xl font-bold text-amber-100 mb-2'>
              LitRPG Academy Classroom
            </h1>
            {user && (
              <p className='text-amber-300 mt-2'>
                Welcome back, Student {user.firstName}!
              </p>
            )}
          </div>
        </div>
      </div>

      <div className='container mx-auto px-4 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Left Column: Progress */}
          <div className='lg:col-span-2'>
            <div className='bg-slate-800/50 rounded-lg border border-slate-700 p-6'>
              <h2 className='text-2xl font-bold text-white mb-2'>
                Your Progress Across All Realms
              </h2>
              {user ? (
                progressLoading ? (
                  <div className='text-center py-8'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400 mx-auto mb-4'></div>
                    <p className='text-gray-400'>Loading your progress...</p>
                  </div>
                ) : userRealmProgress ? (
                  <>
                    {/* Show progress first - the main experience display */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-8'>
                  {renderCultivationStats()}
                  {renderGamelitStats()}
                  {renderPortalStats()}
                  {renderApocalypseStats()}
                </div>

                    {/* Then show explanations and details */}
                    <div className='bg-green-900/30 border border-green-500/50 rounded-lg p-3 mb-6'>
                      <div className='flex items-center space-x-2'>
                        <span className='text-green-400'>*</span>
                        <p className='text-green-200 text-sm'>
                          <strong>Real Progress:</strong> Your advancement is calculated from {userRealmProgress.totalMinutes} total minutes of reading, listening, and writing across all genres!
                          {userRealmProgress.totalBonusMinutes > 0 && (
                            <span className='block mt-1'>
                              <strong>Bonus:</strong> +{userRealmProgress.totalBonusMinutes} minutes from achievements applied to all realms!
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    {renderBonusExperienceGuide()}
                    {renderBonusActivities()}
                  </>
                ) : (
                  <div className='bg-gray-800/30 border border-gray-500/50 rounded-lg p-6 text-center'>
                    <p className='text-gray-400 mb-4'>
                      No progress yet! Start tracking your reading and writing to begin your advancement.
                    </p>
                    <div className='text-sm text-gray-500'>
                      Your progress will be calculated based on the minutes you spend reading, listening to, or writing about books from each genre.
                    </div>
                  </div>
                )
              ) : (
                <div className='text-center py-8'>
                  <p className='text-gray-400 mb-4'>
                    Sign in to track your progress!
                  </p>
                  <Link
                    to='/signin'
                    className='px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors'>
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Realm Portals with Tracking */}
          <div className='lg:col-span-1'>
            <div className='bg-slate-800/50 rounded-lg border border-slate-700 p-6'>
              <h2 className='text-2xl font-bold text-white mb-6'>
                Realm Portals
              </h2>

              {user ? (
                <div className='space-y-6'>
                {Object.entries(REALM_CONFIGS).map(([realmId, config]) => (
                    <div key={realmId} className='bg-black/20 rounded-lg p-4 border border-gray-600/30'>
                  <Link
                    to='/realm/$realmId'
                    params={{ realmId }}
                        className='flex items-center space-x-3 mb-3 group'>
                      <img
                        src={config.icon}
                        alt={config.name}
                          className='w-8 h-8 group-hover:scale-110 transition-transform'
                        />
                        <div>
                          <div className='text-white font-semibold group-hover:text-amber-300 transition-colors'>
                            {config.name.replace(' Academy', '')}
                          </div>
                          <div className='text-gray-400 text-xs'>
                            {config.description}
                          </div>
                        </div>
                      </Link>
                      {renderRealmInputs(realmId as RealmKey)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className='text-center py-8'>
                  <p className='text-gray-400 mb-4'>
                    Sign in to track activity and battle in the realms!
                  </p>
                  <Link
                    to='/signin'
                    className='px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors text-sm'>
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Book Search Modals for each realm */}
        {Object.entries(realmInputs).map(([realmKey, inputs]) => {
          const realm = realmKey as RealmKey
          const searchResults = realmSearchQueries.data?.[realm] || []
          const isSearching = realmSearchQueries.isLoading && debouncedSearchQueries[realm].length >= 3
          
          return inputs.isBookSearchOpen ? (
            <div key={realm} className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
              <div className='bg-white rounded-lg max-w-md w-full max-h-[60vh] overflow-hidden'>
                <div className='p-4 border-b'>
                  <div className='flex items-center justify-between mb-3'>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      Select a Book for {REALM_CONFIGS[realm].name.replace(' Academy', '')}
                    </h3>
                    <button
                      onClick={() => updateRealmInput(realm, 'isBookSearchOpen', false)}
                      className='text-gray-400 hover:text-gray-600'>
                      <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
                      </svg>
                    </button>
                  </div>
                  <input
                    type='text'
                    value={inputs.bookSearchQuery}
                    onChange={e => updateRealmInput(realm, 'bookSearchQuery', e.target.value)}
                    placeholder='Search books by title or author...'
                    className='w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500'
                    autoFocus
                  />
                </div>
                <div className='max-h-80 overflow-y-auto p-4'>
                  {debouncedSearchQueries[realm].length < 3 ? (
                    <div className='text-center py-8 text-gray-500'>
                      <svg className='w-12 h-12 mx-auto mb-4 text-gray-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' />
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
                      <svg className='w-12 h-12 mx-auto mb-4 text-gray-300' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' />
                      </svg>
                      <p>No books found matching "{debouncedSearchQueries[realm]}"</p>
                    </div>
                  ) : (
                    searchResults.map((book: Book) => (
                      <div
                        key={book.id}
                        onClick={() => handleBookSelect(realm, book)}
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
          ) : null
        })}
      </div>
    </div>
  )
}

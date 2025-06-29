import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '../hooks/useAuth'
import { fetchUserRealmProgress, type UserRealmProgress } from '../services/api'

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

  const toggleRealmExpansion = (realmId: string) => {
    setExpandedRealms(prev => ({
      ...prev,
      [realmId]: !prev[realmId]
    }))
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
          <span>📚 {totalBooks} book{totalBooks === 1 ? '' : 's'} read ({totalMinutes} min)</span>
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
      'Marked Book as Read or Reading': '📖',
      'Review': '⭐',
      'First S Tier': '🥉',
      'Boss Victory': '⚔️',
      'First SS Tier': '🥈', 
      'First SSS Tier': '🥇',
      'Bonus': '✨'
    }

    const activityTypeColors = {
      'Marked Book as Read or Reading': 'text-blue-400',
      'Review': 'text-yellow-400',
      'First S Tier': 'text-amber-400',
      'Boss Victory': 'text-red-400',
      'First SS Tier': 'text-gray-300',
      'First SSS Tier': 'text-yellow-500',
      'Bonus': 'text-purple-400'
    }

    return (
      <div className='bg-purple-900/30 border border-purple-500/50 rounded-lg p-4 mb-6'>
        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center space-x-2'>
            <span className='text-purple-400'>🏆</span>
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
                    {activityTypeIcons[activity.activityType as keyof typeof activityTypeIcons] || '✨'}
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
          Reading Minutes: {stats.totalMinutes}
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
          Reading Minutes: {stats.totalMinutes}
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
          Reading Minutes: {stats.totalMinutes}
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
          Reading Minutes: {stats.totalMinutes}
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
              🏛️ LitRPG Academy Classroom
            </h1>
            <p className='text-amber-200/80'>
              Track your progress across all realms
            </p>
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
          {/* Left Column: All Realm Progress */}
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
                    <div className='bg-green-900/30 border border-green-500/50 rounded-lg p-3 mb-6'>
                      <div className='flex items-center space-x-2'>
                        <span className='text-green-400'>✨</span>
                        <p className='text-green-200 text-sm'>
                          <strong>Real Progress:</strong> Your advancement is calculated from {userRealmProgress.totalMinutes} total minutes of reading across all genres!
                          {userRealmProgress.totalBonusMinutes > 0 && (
                            <span className='block mt-1'>
                              <strong>Bonus:</strong> +{userRealmProgress.totalBonusMinutes} minutes from achievements applied to all realms!
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    {renderBonusActivities()}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {renderCultivationStats()}
                      {renderGamelitStats()}
                      {renderPortalStats()}
                      {renderApocalypseStats()}
                    </div>
                  </>
                ) : (
                  <div className='bg-gray-800/30 border border-gray-500/50 rounded-lg p-6 text-center'>
                    <p className='text-gray-400 mb-4'>
                      No reading progress yet! Start battling in the realms to track your advancement.
                    </p>
                    <div className='text-sm text-gray-500'>
                      Your progress will be calculated based on the minutes you spend reading books from each genre.
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

          {/* Right Column: Realm Portals */}
          <div className='lg:col-span-1'>
            <div className='bg-slate-800/50 rounded-lg border border-slate-700 p-6'>
              <h2 className='text-2xl font-bold text-white mb-6'>
                Realm Portals
              </h2>

              {/* Realm Icons Grid */}
              <div className='grid grid-cols-2 gap-6 mb-6'>
                {Object.entries(REALM_CONFIGS).map(([realmId, config]) => (
                  <Link
                    key={realmId}
                    to='/realm/$realmId'
                    params={{ realmId }}
                    className='group'>
                    <div className='relative'>
                      <img
                        src={config.icon}
                        alt={config.name}
                        className='w-full aspect-square object-contain group-hover:scale-110 transition-all duration-300 group-hover:drop-shadow-2xl'
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-lg' />
                      <div className='absolute bottom-2 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity'>
                        <div className='text-white text-sm font-semibold drop-shadow-lg'>
                          Enter Realm
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Books Portal */}
              <Link
                to='/books'
                className='block p-4 rounded-lg border border-slate-600 bg-slate-700/30 hover:border-slate-500 hover:bg-slate-700/50 transition-all duration-200 group'>
                <div className='flex items-center space-x-3'>
                  <div className='w-10 h-10 flex items-center justify-center group-hover:scale-110 transition-transform'>
                    <img
                      src='/assets/images/library.png'
                      alt='Library'
                      className='w-10 h-10 object-contain'
                    />
                  </div>
                  <div>
                    <div className='text-white font-semibold'>Library</div>
                    <div className='text-gray-400 text-sm'>
                      Browse Library
                    </div>
                  </div>
                  <div className='ml-auto text-gray-500 group-hover:text-white transition-colors'>
                    →
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

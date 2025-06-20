import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { BattleStoryConsole } from '../components/BattleStoryConsole'

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

interface Book {
  id: string
  title: string
  authorName: string
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
    description: 'Face the Ancestor Dragon who scorches paths to ascension'
  },
  gamelit: {
    name: 'GameLit Realm', 
    boss: 'Glitchlord Exeon',
    image: '/assets/images/gamelit/gamelit_realm.png',
    bgGradient: 'from-indigo-900 to-slate-900',
    color: 'indigo',
    primary: '#6c00ff', // Electric Indigo
    accent: '#00f7ff', // Neon Cyan
    description: 'Battle the corrupted NPC who gained sentience'
  },
  apocalypse: {
    name: 'LitRPG Apocalypse Realm',
    boss: 'Zereth, Dungeon Architect of the End',
    image: '/assets/images/apocalypse/apocalypse_realm.png',
    bgGradient: 'from-slate-800 to-slate-900',
    color: 'orange',
    primary: '#3a3f4b', // Terminal Gray
    accent: '#ff7300', // Warning Orange
    description: 'Challenge the System herald who reshapes reality'
  },
  isekai: {
    name: 'Isekai / Rebirth Realm',
    boss: 'Aurelion the Eternal Return',
    image: '/assets/images/isekai/isekai_realm.png',
    bgGradient: 'from-violet-800 to-slate-900',
    color: 'violet',
    primary: '#b892ff', // Celestial Lavender
    accent: '#ffd369', // Soulfire Gold
    description: 'Confront the Reincarnator King of 10,000 lives'
  }
}

export function RealmBattlePage({ realmId }: RealmBattlePageProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [minutesRead, setMinutesRead] = useState('')
  const [selectedBookId, setSelectedBookId] = useState('')
  const [timelineHp, setTimelineHp] = useState<number | null>(null)
  const [isViewingTimeline, setIsViewingTimeline] = useState(false)
  
  const realmConfig = REALM_CONFIG[realmId as keyof typeof REALM_CONFIG]
  
  if (!realmConfig) {
    return <div>Realm not found</div>
  }

  // Fetch realm boss data
  const { data: realmBoss, isLoading: bossLoading } = useQuery({
    queryKey: ['realmBoss', realmId],
    queryFn: async (): Promise<RealmBoss> => {
      const response = await fetch(`/.netlify/functions/api/realms/boss/${realmId}`)
      if (!response.ok) throw new Error('Failed to fetch boss')
      return response.json()
    }
  })

  // Fetch books for dropdown
  const { data: books } = useQuery({
    queryKey: ['books-simple'],
    queryFn: async (): Promise<Book[]> => {
      const response = await fetch('/.netlify/functions/api/books?limit=100')
      if (!response.ok) throw new Error('Failed to fetch books')
      const data = await response.json()
      return data.books || []
    }
  })

  // Fetch battle statistics
  const { data: battleStats } = useQuery({
    queryKey: ['battleStats', realmId],
    queryFn: async (): Promise<BattleStats> => {
      const response = await fetch(`/.netlify/functions/api/realms/boss/${realmId}/stats`)
      if (!response.ok) throw new Error('Failed to fetch battle stats')
      return response.json()
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  })

  // Fetch user's daily limits
  const { data: dailyLimits } = useQuery({
    queryKey: ['dailyLimits', user?.id],
    queryFn: async (): Promise<DailyLimits | null> => {
      if (!user?.id) return null
      const response = await fetch(`/.netlify/functions/api/realms/user/${user.id}/daily-minutes`)
      if (!response.ok) throw new Error('Failed to fetch daily limits')
      return response.json()
    },
    enabled: !!user?.id
  })

  // Battle mutation
  const battleMutation = useMutation({
    mutationFn: async ({ minutes, bookId }: { minutes: number, bookId?: string }) => {
      const response = await fetch(`/.netlify/functions/api/realms/boss/${realmId}/battle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          minutesRead: minutes,
          bookId: bookId || null,
          userId: user?.id || null
        })
      })
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
    }
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
      alert(`You only have ${dailyLimits.remainingMinutes} minutes remaining today (daily limit: 500 minutes)`)
      return
    }
    
    battleMutation.mutate({ minutes, bookId: selectedBookId })
  }

  // Use timeline HP if viewing a specific point, otherwise use current HP
  const displayHp = isViewingTimeline && timelineHp !== null ? timelineHp : realmBoss?.currentHitpoints || 0
  const hpPercentage = realmBoss ? (displayHp / realmBoss.maxHitpoints) * 100 : 100

  return (
    <div className={`min-h-screen bg-gradient-to-br ${realmConfig.bgGradient} text-white`}>
      <div className="container mx-auto px-4 py-8 pt-36">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 text-white drop-shadow-lg">{realmConfig.name}</h1>
          <p className="text-xl opacity-90 mb-2">{realmConfig.description}</p>
          <p className="text-lg" style={{ color: realmConfig.accent }}>Face the mighty {realmConfig.boss}!</p>
        </div>

        {/* Collaborative Battle Info */}
        {battleStats && (
          <div className="max-w-4xl mx-auto mb-8">
            <div 
              className="rounded-lg p-6 border-2"
              style={{ 
                backgroundColor: `${realmConfig.primary}40`,
                borderColor: realmConfig.accent
              }}
            >
              <h2 
                className="text-2xl font-bold text-center mb-4"
                style={{ color: realmConfig.accent }}
              >
                🌟 Community Battle Progress - Today 🌟
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-black bg-opacity-30 rounded-lg p-4">
                  <div className="text-2xl font-bold" style={{ color: realmConfig.accent }}>
                    {(battleStats.totalDamageToday || 0).toLocaleString()}
                  </div>
                  <div className="text-sm opacity-75">Total Damage Dealt</div>
                </div>
                
                <div className="bg-black bg-opacity-30 rounded-lg p-4">
                  <div className="text-2xl font-bold" style={{ color: realmConfig.accent }}>
                    {battleStats.uniqueContributors || 0}
                  </div>
                  <div className="text-sm opacity-75">Heroes Contributing</div>
                </div>
                
                <div className="bg-black bg-opacity-30 rounded-lg p-4">
                  <div className="text-2xl font-bold" style={{ color: realmConfig.accent }}>
                    {Math.round((battleStats.totalMinutesToday || 0) / 60)} hrs
                  </div>
                  <div className="text-sm opacity-75">Reading Time Combined</div>
                </div>
              </div>

              {battleStats.recentBattles && battleStats.recentBattles.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2 text-center" style={{ color: realmConfig.accent }}>
                    Recent Battle Activity
                  </h3>
                  <div className="max-h-40 overflow-y-auto space-y-1">
                    {battleStats.recentBattles.slice(0, 5).map((battle, index) => (
                      <div key={index} className="text-sm opacity-80 text-center">
                        <span className="font-medium">{battle.user}</span> dealt{' '}
                        <span style={{ color: realmConfig.accent }}>{battle.damage} damage</span>
                        {battle.book && <span className="opacity-60"> reading "{battle.book}"</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Realm Image */}
        <div className="flex justify-center mb-8">
          <img 
            src={realmConfig.image} 
            alt={realmConfig.name}
            className="max-w-md rounded-lg shadow-2xl"
          />
        </div>

        {/* Boss HP Bar */}
        {realmBoss && (
          <div className="max-w-2xl mx-auto mb-8">
            <div 
              className="rounded-lg p-6 border-2"
              style={{ 
                backgroundColor: `${realmConfig.primary}80`,
                borderColor: realmConfig.accent
              }}
            >
              <h2 
                className="text-2xl font-bold text-center mb-4"
                style={{ color: realmConfig.accent }}
              >
                {realmConfig.boss}
              </h2>
              <div className="bg-gray-900 rounded-full h-8 mb-2 overflow-hidden border">
                <div 
                  className="h-full transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${hpPercentage}%`,
                    background: `linear-gradient(90deg, #dc2626, ${realmConfig.accent})`
                  }}
                />
              </div>
              <div className="flex justify-between text-sm text-white">
                <span>HP: {displayHp.toLocaleString()}</span>
                <span>Max: {(realmBoss.maxHitpoints || 0).toLocaleString()}</span>
              </div>
              {isViewingTimeline && (
                <div className="text-center mt-2">
                  <p className="text-blue-400 text-sm">📍 Viewing historical battle state</p>
                </div>
              )}
              {displayHp <= 0 && (
                <div className="text-center mt-4">
                  <p className="text-yellow-400 text-xl font-bold">🎉 BOSS DEFEATED! 🎉</p>
                  <p className="text-sm opacity-75">The boss will respawn soon...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Battle Interface */}
        <div 
          className="max-w-md mx-auto rounded-lg p-6 border-2"
          style={{ 
            backgroundColor: `${realmConfig.primary}60`,
            borderColor: realmConfig.accent
          }}
        >
          <h3 
            className="text-xl font-bold mb-4 text-center"
            style={{ color: realmConfig.accent }}
          >
            Battle the Boss!
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Minutes Read Today
              </label>
              <input
                type="number"
                min="1"
                max="300"
                value={minutesRead}
                onChange={(e) => setMinutesRead(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white"
                placeholder="How many minutes did you read?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Book (Optional)
              </label>
              <select
                value={selectedBookId}
                onChange={(e) => setSelectedBookId(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 rounded-lg text-white"
              >
                <option value="">Select a book (optional)</option>
                {books?.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title} - {book.authorName}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleBattle}
              disabled={!minutesRead || parseInt(minutesRead) <= 0 || battleMutation.isPending}
              className={`w-full py-3 px-4 rounded-lg font-bold transition-all duration-200 border-2 text-white
                ${minutesRead && parseInt(minutesRead) > 0 
                  ? 'hover:opacity-80' 
                  : 'opacity-50 cursor-not-allowed'
                }`}
              style={{
                backgroundColor: minutesRead && parseInt(minutesRead) > 0 ? realmConfig.accent : '#4b5563',
                borderColor: minutesRead && parseInt(minutesRead) > 0 ? realmConfig.accent : '#6b7280'
              }}
            >
              {battleMutation.isPending ? 'Attacking...' : `Deal ${minutesRead || 0} Damage!`}
            </button>
          </div>

          <div className="mt-4 text-center text-sm opacity-75">
            <p>Each minute read = 1 damage point!</p>
            {user ? (
              dailyLimits && (
                <div className="mt-2 space-y-1">
                  <p>Daily limit: {dailyLimits.remainingMinutes} of 500 minutes remaining</p>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(dailyLimits.usedMinutes / dailyLimits.dailyLimit) * 100}%`,
                        backgroundColor: realmConfig.accent
                      }}
                    />
                  </div>
                </div>
              )
            ) : (
              <p className="mt-2">Sign in to track your contributions and unlock daily progress!</p>
            )}
          </div>
        </div>

        {/* Battle Story Console */}
        <div className="max-w-4xl mx-auto mt-8">
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
    </div>
  )
} 
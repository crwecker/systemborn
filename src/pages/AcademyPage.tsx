import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useAuth } from '../hooks/useAuth'

// Define realm-specific progression systems
const XIANXIA_REALMS = {
  mortal: [
    { name: 'Body Refining', maxLevel: 9 },
    { name: 'Qi Gathering', maxLevel: 9 },
    { name: 'Foundation Establishment', maxLevel: 9 },
  ],
  core: [
    { name: 'Core Formation', maxLevel: 9 },
    { name: 'Nascent Soul', maxLevel: 9 },
    { name: 'Spirit Severing', maxLevel: 9 },
  ],
  heavenly: [
    { name: 'Void Refining', maxLevel: 9 },
    { name: 'Immortal Ascension', maxLevel: 9 },
    { name: 'Immortal Stages', maxLevel: 9 },
  ],
}

const BASE_STATS = {
  STR: 10,
  CON: 10,
  DEX: 10,
  WIS: 10,
  INT: 10,
  CHA: 10,
  LUCK: 10,
}

const REALM_CONFIGS = {
  xianxia: {
    name: 'Xianxia Academy',
    icon: '/assets/images/xianxia/xianxia_realm_icon.png',
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
  isekai: {
    name: 'Isekai Academy',
    icon: '/assets/images/isekai/isekai_realm_icon.png',
    bgColor: 'from-violet-800 to-slate-900',
    accentColor: '#ffd369',
    description: 'Reincarnate and grow stronger',
  },
}

export function AcademyPage() {
  const { user } = useAuth()

  // Mock user stats - in real app these would come from API
  const [userStats, setUserStats] = useState({
    xianxia: {
      currentRealm: 'mortal',
      currentStage: 'Body Refining',
      currentLevel: 2,
    },
    gamelit: {
      level: 15,
      experience: 2450,
      experienceToNext: 3000,
    },
    isekai: {
      reincarnations: 3,
      currentLife: 'Noble Scholar',
      lifeLevel: 8,
    },
    apocalypse: {
      survivalDays: 127,
      stats: { ...BASE_STATS, STR: 15, CON: 18, LUCK: 8 },
    },
  })

  const renderXianxiaStats = () => {
    const stats = userStats.xianxia
    return (
      <div className='bg-black/30 rounded-lg p-4 border border-emerald-500/30'>
        <div className='flex items-center space-x-3 mb-3'>
          <img
            src='/assets/images/xianxia/xianxia_realm_icon.png'
            alt='Xianxia'
            className='w-8 h-8'
          />
          <h3 className='text-lg font-bold text-yellow-400'>
            Xianxia Cultivation
          </h3>
        </div>
        <div className='text-sm font-semibold text-emerald-300'>
          {stats.currentStage} - Level {stats.currentLevel}
        </div>
        <div className='text-xs text-gray-300 mt-1'>
          Current Realm:{' '}
          {stats.currentRealm.charAt(0).toUpperCase() +
            stats.currentRealm.slice(1)}
        </div>
        <div className='mt-2'>
          <div className='bg-gray-800 rounded-full h-2'>
            <div
              className='bg-gradient-to-r from-emerald-500 to-yellow-400 h-2 rounded-full'
              style={{ width: `${(stats.currentLevel / 9) * 100}%` }}
            />
          </div>
          <div className='text-xs text-gray-400 mt-1'>
            Progress to next level
          </div>
        </div>
      </div>
    )
  }

  const renderGamelitStats = () => {
    const stats = userStats.gamelit
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
        <div className='mt-2'>
          <div className='bg-gray-800 rounded-full h-2'>
            <div
              className='bg-gradient-to-r from-indigo-500 to-cyan-400 h-2 rounded-full'
              style={{
                width: `${(stats.experience / stats.experienceToNext) * 100}%`,
              }}
            />
          </div>
          <div className='text-xs text-gray-400 mt-1'>
            {stats.experience} / {stats.experienceToNext} XP
          </div>
        </div>
      </div>
    )
  }

  const renderIsekaiStats = () => {
    const stats = userStats.isekai
    return (
      <div className='bg-black/30 rounded-lg p-4 border border-purple-500/30'>
        <div className='flex items-center space-x-3 mb-3'>
          <img
            src='/assets/images/isekai/isekai_realm_icon.png'
            alt='Isekai'
            className='w-8 h-8'
          />
          <h3 className='text-lg font-bold text-purple-400'>Isekai Lives</h3>
        </div>
        <div className='text-sm font-semibold text-purple-300'>
          Life #{stats.reincarnations + 1}: {stats.currentLife}
        </div>
        <div className='text-xs text-gray-300 mt-1'>
          Life Level: {stats.lifeLevel}
        </div>
        <div className='text-xs text-gray-400 mt-1'>
          Previous Reincarnations: {stats.reincarnations}
        </div>
      </div>
    )
  }

  const renderApocalypseStats = () => {
    const stats = userStats.apocalypse
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
        <div className='text-sm font-semibold text-orange-300 mb-2'>
          Day {stats.survivalDays}
        </div>
        <div className='grid grid-cols-4 gap-1 text-xs'>
          {Object.entries(stats.stats).map(([stat, value]) => (
            <div key={stat} className='text-center'>
              <div className='text-gray-400'>{stat}</div>
              <div className='text-white font-bold'>{value}</div>
            </div>
          ))}
        </div>
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
              <div className='bg-blue-900/30 border border-blue-500/50 rounded-lg p-3 mb-6'>
                <div className='flex items-center space-x-2'>
                  <span className='text-blue-400'>ℹ️</span>
                  <p className='text-blue-200 text-sm'>
                    <strong>Note:</strong> This is example data. Actual progress
                    tracking based on your reading activity is coming soon!
                  </p>
                </div>
              </div>
              {user ? (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {renderXianxiaStats()}
                  {renderGamelitStats()}
                  {renderIsekaiStats()}
                  {renderApocalypseStats()}
                </div>
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
                  <div className='w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform'>
                    <span className='text-white text-xl'>📚</span>
                  </div>
                  <div>
                    <div className='text-white font-semibold'>Library</div>
                    <div className='text-gray-400 text-sm'>
                      Browse all books
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

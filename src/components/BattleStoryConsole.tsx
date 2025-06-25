import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'

interface BattleStoryEntry {
  id: string
  entryType: string
  content: string
  metadata: any
  createdAt: string
}

interface BattleStoryData {
  boss: {
    name: string
    currentHp: number
    maxHp: number
    realm: string
  }
  story: BattleStoryEntry[]
}

interface BattleStoryConsoleProps {
  realmId: string
  realmConfig: {
    accent: string
    primary: string
  }
  onTimelineChange?: (hp: number, isViewing: boolean) => void
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

interface TimelineEntry {
  entry: BattleStoryEntry
  hpAtThisPoint: number
  index: number
}

export function BattleStoryConsole({
  realmId,
  realmConfig,
  onTimelineChange,
}: BattleStoryConsoleProps) {
  const [autoScroll, setAutoScroll] = useState(true)
  const [selectedEntryIndex, setSelectedEntryIndex] = useState<number | null>(
    null
  )
  const scrollRef = useRef<HTMLDivElement>(null)

  // Map new realm IDs to legacy database realm IDs for API compatibility
  const getApiRealmId = (frontendRealmId: string): string => {
    const realmMapping: Record<string, string> = {
      'cultivation': 'xianxia',
      'portal': 'isekai',
      'gamelit': 'gamelit',
      'apocalypse': 'apocalypse'
    }
    return realmMapping[frontendRealmId] || frontendRealmId
  }

  const apiRealmId = getApiRealmId(realmId)

  const { data: storyData } = useQuery({
    queryKey: ['battleStory', realmId],
    queryFn: async (): Promise<BattleStoryData> => {
      const response = await fetch(
        `/.netlify/functions/api/realms/boss/${apiRealmId}/story`
      )
      if (!response.ok) throw new Error('Failed to fetch battle story')
      return response.json()
    },
    refetchInterval: 15000, // Refresh every 15 seconds
  })

  // Fetch battle statistics
  const { data: battleStats } = useQuery({
    queryKey: ['battleStats', realmId],
    queryFn: async (): Promise<BattleStats> => {
      const response = await fetch(
        `/.netlify/functions/api/realms/boss/${apiRealmId}/stats`
      )
      if (!response.ok) throw new Error('Failed to fetch battle stats')
      return response.json()
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  })

  // Calculate HP at each point in the battle
  const calculateTimelineEntries = (): TimelineEntry[] => {
    if (!storyData?.story || !storyData.boss) return []

    const timeline: TimelineEntry[] = []
    let currentHp = storyData.boss.maxHp

    storyData.story.forEach((entry, index) => {
      // For non-damage entries (like introduction), show HP before the entry
      // For battle actions, show HP after the damage is applied
      let hpToShow = currentHp

      if (entry.entryType === 'BATTLE_ACTION' && entry.metadata?.damage) {
        // Apply damage and show the result
        currentHp = Math.max(0, currentHp - entry.metadata.damage)
        hpToShow = currentHp
      }

      // Reset HP on boss defeat
      if (entry.entryType === 'BOSS_DEFEAT') {
        currentHp = storyData.boss.maxHp
        hpToShow = currentHp
      }

      timeline.push({
        entry,
        hpAtThisPoint: hpToShow,
        index,
      })
    })

    return timeline
  }

  const timelineEntries = calculateTimelineEntries()

  // Auto-scroll to bottom when new entries appear
  useEffect(() => {
    if (autoScroll && scrollRef.current && selectedEntryIndex === null) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [storyData?.story, autoScroll, selectedEntryIndex])

  // Scroll to selected entry
  useEffect(() => {
    if (selectedEntryIndex !== null && scrollRef.current) {
      const entryElement = scrollRef.current.querySelector(
        `[data-entry-index="${selectedEntryIndex}"]`
      )
      if (entryElement) {
        entryElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, [selectedEntryIndex])

  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10
      setAutoScroll(isAtBottom)
    }
  }

  const handleTimelineClick = (index: number) => {
    setSelectedEntryIndex(index)
    setAutoScroll(false)

    // Notify parent of timeline HP at this point
    if (onTimelineChange && timelineEntries[index]) {
      onTimelineChange(timelineEntries[index].hpAtThisPoint, true)
    }
  }

  const getEntryIcon = (entryType: string) => {
    switch (entryType) {
      case 'BOSS_INTRODUCTION':
        return '🎭'
      case 'BATTLE_ACTION':
        return '⚔️'
      case 'BOSS_DEFEAT':
        return '💀'
      case 'BOSS_RESPAWN':
        return '🔄'
      case 'MILESTONE':
        return '🏆'
      default:
        return '📜'
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const getHpPercentage = (hp: number) => {
    if (!storyData?.boss?.maxHp) return 100
    return (hp / storyData.boss.maxHp) * 100
  }

  const getHpColor = (percentage: number) => {
    if (percentage > 75) return '#10b981' // green
    if (percentage > 50) return '#f59e0b' // yellow
    if (percentage > 25) return '#f97316' // orange
    return '#ef4444' // red
  }

  if (!storyData) {
    return (
      <div
        className='rounded-lg p-6 border-2 animate-pulse'
        style={{
          backgroundColor: `${realmConfig.primary}20`,
          borderColor: realmConfig.accent,
        }}>
        <div className='text-center text-lg opacity-60'>
          Loading battle chronicle...
        </div>
      </div>
    )
  }

  return (
    <div
      className='rounded-lg border-2 overflow-hidden'
      style={{
        backgroundColor: `${realmConfig.primary}20`,
        borderColor: realmConfig.accent,
      }}>
      {/* Console Header */}
      <div className='border-b-2' style={{ borderColor: realmConfig.accent }}>
        {/* Title Bar */}
        <div className='p-4 flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <div
              className='w-3 h-3 rounded-full bg-red-500 cursor-pointer'
              onClick={() => setAutoScroll(!autoScroll)}
              title={autoScroll ? 'Disable auto-scroll' : 'Enable auto-scroll'}
            />
            <div className='w-3 h-3 rounded-full bg-yellow-500' />
            <div className='w-3 h-3 rounded-full bg-green-500' />
            <span
              className='ml-4 font-mono text-lg font-bold'
              style={{ color: realmConfig.accent }}>
              BATTLE CHRONICLE -{' '}
              {storyData?.boss?.realm || realmId.toUpperCase()}
            </span>
          </div>
          <div className='flex items-center space-x-3'>
            {selectedEntryIndex !== null && (
              <button
                onClick={() => {
                  setSelectedEntryIndex(null)
                  setAutoScroll(true)
                  if (onTimelineChange) {
                    onTimelineChange(0, false)
                  }
                }}
                className='text-xs px-2 py-1 rounded border'
                style={{
                  borderColor: realmConfig.accent,
                  color: realmConfig.accent,
                }}>
                Return to Live
              </button>
            )}
            <div className='text-sm opacity-75'>
              {selectedEntryIndex !== null
                ? `📍 Point ${selectedEntryIndex + 1}/${timelineEntries.length}`
                : autoScroll
                  ? '🔄 Live'
                  : '⏸️ Paused'}
            </div>
          </div>
        </div>

        {/* Daily Progress Stats */}
        {battleStats && (
          <div
            className='px-4 pb-3 border-t'
            style={{ borderColor: `${realmConfig.accent}40` }}>
            <div className='flex items-center justify-center space-x-6 text-xs'>
              <div className='flex items-center space-x-1'>
                <span className='opacity-60'>📊 TODAY:</span>
                <span
                  style={{ color: realmConfig.accent }}
                  className='font-bold'>
                  {(battleStats.totalDamageToday || 0).toLocaleString()} DMG
                </span>
              </div>
              <div className='flex items-center space-x-1'>
                <span className='opacity-60'>👥</span>
                <span
                  style={{ color: realmConfig.accent }}
                  className='font-bold'>
                  {battleStats.uniqueContributors || 0} HEROES
                </span>
              </div>
              <div className='flex items-center space-x-1'>
                <span className='opacity-60'>📚</span>
                <span
                  style={{ color: realmConfig.accent }}
                  className='font-bold'>
                  {Math.round((battleStats.totalMinutesToday || 0) / 60)}H READ
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chronicle Content */}
      <div
        ref={scrollRef}
        className='overflow-y-auto p-4 font-mono text-sm leading-relaxed space-y-3 min-h-[400px] max-h-[80vh]'
        onScroll={handleScroll}
        style={{
          backgroundColor: '#0a0a0a',
          scrollbarWidth: 'thin',
          scrollbarColor: `${realmConfig.accent} transparent`,
        }}>
        {storyData?.story?.map((entry, index) => {
          const isSelected = selectedEntryIndex === index
          return (
            <div
              key={entry.id}
              data-entry-index={index}
              onClick={() => handleTimelineClick(index)}
              className={`flex items-start space-x-3 p-3 rounded transition-all duration-300 cursor-pointer hover:bg-gray-800/30 ${
                isSelected
                  ? 'ring-2 ring-blue-500 bg-blue-900/20'
                  : entry.entryType === 'BOSS_INTRODUCTION'
                    ? 'bg-purple-900/30'
                    : entry.entryType === 'MILESTONE'
                      ? 'bg-yellow-900/30'
                      : entry.entryType === 'BOSS_DEFEAT'
                        ? 'bg-red-900/30'
                        : 'bg-gray-900/30'
              }`}>
              <span className='text-gray-400 text-xs min-w-[50px]'>
                {formatTimestamp(entry.createdAt)}
              </span>
              <span className='text-lg'>{getEntryIcon(entry.entryType)}</span>
              <div className='flex-1'>
                <div
                  className={`${
                    entry.entryType === 'BOSS_INTRODUCTION'
                      ? 'text-purple-300'
                      : entry.entryType === 'MILESTONE'
                        ? 'text-yellow-300'
                        : entry.entryType === 'BOSS_DEFEAT'
                          ? 'text-red-300'
                          : 'text-green-300'
                  }`}>
                  {entry.content}
                </div>
                {entry.metadata && entry.metadata.damage && (
                  <div className='text-xs text-gray-400 mt-1'>
                    [DMG: {entry.metadata.damage} | HP:{' '}
                    {entry.metadata.bossHpAfter}/
                    {storyData?.boss?.maxHp || '???'}]
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {(!storyData?.story || storyData.story.length === 0) && (
          <div className='text-center text-gray-400 py-8'>
            <div className='text-2xl mb-2'>📜</div>
            <div>The battle chronicle awaits the first hero...</div>
          </div>
        )}
      </div>

      {/* Console Footer */}
      <div
        className='p-3 border-t-2 text-center text-xs opacity-60'
        style={{ borderColor: realmConfig.accent }}>
        {selectedEntryIndex !== null
          ? `Viewing battle state at point ${selectedEntryIndex + 1} of ${timelineEntries.length}`
          : `Battle events appear in real-time as heroes engage ${storyData?.boss?.name || 'the realm boss'}`}
      </div>
    </div>
  )
}

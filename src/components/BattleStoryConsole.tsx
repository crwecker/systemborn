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

interface TimelineEntry {
  entry: BattleStoryEntry
  hpAtThisPoint: number
  index: number
}

export function BattleStoryConsole({ realmId, realmConfig, onTimelineChange }: BattleStoryConsoleProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const [selectedEntryIndex, setSelectedEntryIndex] = useState<number | null>(null)
  const [showTimeline, setShowTimeline] = useState(false)

  const { data: storyData } = useQuery({
    queryKey: ['battleStory', realmId],
    queryFn: async (): Promise<BattleStoryData> => {
      const response = await fetch(`/.netlify/functions/api/realms/boss/${realmId}/story`)
      if (!response.ok) throw new Error('Failed to fetch battle story')
      return response.json()
    },
    refetchInterval: 15000 // Refresh every 15 seconds
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
        index
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
      const entryElement = scrollRef.current.querySelector(`[data-entry-index="${selectedEntryIndex}"]`)
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
      case 'BOSS_INTRODUCTION': return '🎭'
      case 'BATTLE_ACTION': return '⚔️'
      case 'BOSS_DEFEAT': return '💀'
      case 'BOSS_RESPAWN': return '🔄'
      case 'MILESTONE': return '🏆'
      default: return '📜'
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
        className="rounded-lg p-6 border-2 animate-pulse"
        style={{ 
          backgroundColor: `${realmConfig.primary}20`,
          borderColor: realmConfig.accent
        }}
      >
        <div className="text-center text-lg opacity-60">Loading battle chronicle...</div>
      </div>
    )
  }

      return (
      <div className="flex gap-4">
        {/* Battle History Timeline Sidebar */}
        <div className="w-80 flex-shrink-0">
        <div 
          className="rounded-lg border-2"
          style={{ 
            backgroundColor: `${realmConfig.primary}20`,
            borderColor: realmConfig.accent
          }}
        >
          {/* Timeline Header */}
          <div 
            className="p-3 border-b-2 flex items-center justify-between"
            style={{ borderColor: realmConfig.accent }}
          >
            <span 
              className="font-mono text-sm font-bold"
              style={{ color: realmConfig.accent }}
            >
              ⏱️ BATTLE TIMELINE
            </span>
            <span className="text-xs opacity-75">
              {timelineEntries.length} events
            </span>
          </div>

          {/* Timeline Entries */}
          <div className="max-h-96 overflow-y-auto">
            {timelineEntries.map((timelineEntry, index) => {
              const { entry, hpAtThisPoint } = timelineEntry
              const hpPercentage = getHpPercentage(hpAtThisPoint)
              const isSelected = selectedEntryIndex === index
              
              return (
                <div
                  key={entry.id}
                  onClick={() => handleTimelineClick(index)}
                  className={`p-2 border-b border-gray-700 cursor-pointer transition-all duration-200 hover:bg-gray-800/50 ${
                    isSelected ? 'bg-blue-900/30 ring-1 ring-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400">
                      {formatTimestamp(entry.createdAt)}
                    </span>
                    <span className="text-lg">
                      {getEntryIcon(entry.entryType)}
                    </span>
                  </div>
                  
                  {/* HP Bar for this point in time */}
                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">HP</span>
                      <span 
                        className="font-mono"
                        style={{ color: getHpColor(hpPercentage) }}
                      >
                        {hpAtThisPoint.toLocaleString()}/{storyData.boss.maxHp.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${hpPercentage}%`,
                          backgroundColor: getHpColor(hpPercentage)
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Entry Summary */}
                  <div className="text-xs text-gray-300">
                    {entry.entryType === 'BOSS_INTRODUCTION' ? '🎭 Boss Introduction' :
                     entry.entryType === 'BATTLE_ACTION' ? `⚔️ ${entry.metadata?.damage || '?'} damage dealt` :
                     entry.entryType === 'BOSS_DEFEAT' ? '💀 Boss Defeated!' :
                     entry.entryType === 'MILESTONE' ? '🏆 Milestone Reached' :
                     '📜 Story Event'}
                  </div>
                  
                  {entry.metadata?.userName && (
                    <div className="text-xs text-blue-400 truncate">
                      {entry.metadata.userName}
                      {entry.metadata?.bookTitle && (
                        <span className="text-gray-500"> • {entry.metadata.bookTitle}</span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
            
            {timelineEntries.length === 0 && (
              <div className="p-4 text-center text-gray-400 text-sm">
                No battle history yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Console */}
      <div 
        className="flex-1 rounded-lg border-2"
        style={{ 
          backgroundColor: `${realmConfig.primary}20`,
          borderColor: realmConfig.accent
        }}
      >
        {/* Console Header */}
        <div 
          className="p-4 border-b-2 flex items-center justify-between"
          style={{ borderColor: realmConfig.accent }}
        >
          <div className="flex items-center space-x-3">
            <div 
              className="w-3 h-3 rounded-full bg-red-500 cursor-pointer"
              onClick={() => setAutoScroll(!autoScroll)}
              title={autoScroll ? "Disable auto-scroll" : "Enable auto-scroll"}
            />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span 
              className="ml-4 font-mono text-lg font-bold"
              style={{ color: realmConfig.accent }}
            >
              BATTLE CHRONICLE - {storyData?.boss?.realm || realmId.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center space-x-3">
            {selectedEntryIndex !== null && (
              <button
                onClick={() => {
                  setSelectedEntryIndex(null)
                  setAutoScroll(true)
                  // Notify parent to return to live HP
                  if (onTimelineChange) {
                    onTimelineChange(0, false) // HP doesn't matter when not viewing timeline
                  }
                }}
                className="text-xs px-2 py-1 rounded border"
                style={{ 
                  borderColor: realmConfig.accent,
                  color: realmConfig.accent
                }}
              >
                Return to Live
              </button>
            )}
            <div className="text-sm opacity-75">
              {selectedEntryIndex !== null ? 
                `📍 Point ${selectedEntryIndex + 1}/${timelineEntries.length}` :
                autoScroll ? "🔄 Live" : "⏸️ Paused"
              }
            </div>
          </div>
        </div>

        {/* Console Content */}
        <div 
          ref={scrollRef}
          className="h-80 overflow-y-auto p-4 font-mono text-sm leading-relaxed space-y-3"
          onScroll={handleScroll}
          style={{ 
            backgroundColor: '#0a0a0a',
            scrollbarWidth: 'thin',
            scrollbarColor: `${realmConfig.accent} transparent`
          }}
        >
          {storyData?.story?.map((entry, index) => {
            const isSelected = selectedEntryIndex === index
            return (
              <div 
                key={entry.id}
                data-entry-index={index}
                className={`flex items-start space-x-3 p-2 rounded transition-all duration-300 ${
                  isSelected ? 'ring-2 ring-blue-500 bg-blue-900/20' :
                  entry.entryType === 'BOSS_INTRODUCTION' ? 'bg-purple-900/30' :
                  entry.entryType === 'MILESTONE' ? 'bg-yellow-900/30' :
                  entry.entryType === 'BOSS_DEFEAT' ? 'bg-red-900/30' :
                  'bg-gray-900/30'
                }`}
              >
                <span className="text-gray-400 text-xs min-w-[50px]">
                  {formatTimestamp(entry.createdAt)}
                </span>
                <span className="text-lg">
                  {getEntryIcon(entry.entryType)}
                </span>
                <div className="flex-1">
                  <div 
                    className={`${
                      entry.entryType === 'BOSS_INTRODUCTION' ? 'text-purple-300' :
                      entry.entryType === 'MILESTONE' ? 'text-yellow-300' :
                      entry.entryType === 'BOSS_DEFEAT' ? 'text-red-300' :
                      'text-green-300'
                    }`}
                  >
                    {entry.content}
                  </div>
                  {entry.metadata && entry.metadata.damage && (
                    <div className="text-xs text-gray-400 mt-1">
                      [DMG: {entry.metadata.damage} | HP: {entry.metadata.bossHpAfter}/{storyData?.boss?.maxHp || '???'}]
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          
          {(!storyData?.story || storyData.story.length === 0) && (
            <div className="text-center text-gray-400 py-8">
              <div className="text-2xl mb-2">📜</div>
              <div>The battle chronicle awaits the first hero...</div>
            </div>
          )}
        </div>

        {/* Console Footer */}
        <div 
          className="p-2 border-t-2 text-center text-xs opacity-60"
          style={{ borderColor: realmConfig.accent }}
        >
          {selectedEntryIndex !== null ? 
            `Viewing battle state at point ${selectedEntryIndex + 1} of ${timelineEntries.length}` :
            `Battle events appear in real-time as heroes engage ${storyData?.boss?.name || 'the realm boss'}`
          }
        </div>
      </div>
    </div>
  )
} 
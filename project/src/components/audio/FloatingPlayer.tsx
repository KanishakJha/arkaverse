import { useEffect, useRef, useState } from 'react'
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Moon, Music2, ChevronUp, ChevronDown,
} from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { AudioVisualizer } from './AudioVisualizer'
import { Button } from '../ui/button'
import { Slider } from '../ui/slider'
import { Badge } from '../ui/badge'
import { AURA_THEMES } from '../../types'

const SPEED_STEPS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3]

export function FloatingPlayer() {
  const {
    currentBook,
    currentChapter,
    isPlaying,
    setIsPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    audioProgress,
    setAudioProgress,
    setMixerOpen,
    mixerOpen,
    auraTheme,
    route,
  } = useApp()

  const [expanded, setExpanded] = useState(false)
  const [volume, setVolume] = useState(80)
  const [muted, setMuted] = useState(false)
  const [sleepTimer, setSleepTimer] = useState(0) // minutes
  const sleepRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)
  const progressRef = useRef(audioProgress)
  progressRef.current = audioProgress
  const colors = AURA_THEMES[auraTheme]

  // Simulated audio progress when "playing"
  useEffect(() => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current)
    if (!isPlaying) return

    progressIntervalRef.current = setInterval(() => {
      const next = progressRef.current + 0.1 * playbackSpeed
      if (next >= 100) {
        setIsPlaying(false)
        setAudioProgress(100)
      } else {
        setAudioProgress(next)
      }
    }, 100)

    return () => clearInterval(progressIntervalRef.current)
  }, [isPlaying, playbackSpeed])

  // Sleep timer
  useEffect(() => {
    if (sleepRef.current) clearTimeout(sleepRef.current)
    if (sleepTimer > 0) {
      sleepRef.current = setTimeout(() => {
        setIsPlaying(false)
        setSleepTimer(0)
      }, sleepTimer * 60 * 1000)
    }
    return () => clearTimeout(sleepRef.current)
  }, [sleepTimer])

  const currentSpeedIdx = SPEED_STEPS.indexOf(playbackSpeed)

  function cycleSpeed() {
    const next = SPEED_STEPS[(currentSpeedIdx + 1) % SPEED_STEPS.length]
    setPlaybackSpeed(next)
  }

  const elapsed = currentChapter
    ? `${Math.floor((audioProgress / 100) * (currentChapter.word_count / 200))}m`
    : '0m'
  const remaining = currentChapter
    ? `${Math.max(0, Math.ceil(((100 - audioProgress) / 100) * (currentChapter.word_count / 200)))}m`
    : '-'

  if (!currentBook && route.page !== 'reader') return null

  const title = currentBook?.title ?? 'ArkaVerse'
  const chapterTitle = currentChapter?.title ?? 'Select a chapter'

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 glass-strong"
      style={{ borderTop: `1px solid ${colors.primary}20` }}
    >
      {/* Expanded panel */}
      {expanded && (
        <div className="px-4 sm:px-6 py-4 border-b border-white/5">
          <div className="mx-auto max-w-3xl space-y-4">
            {/* Visualizer */}
            <AudioVisualizer
              isPlaying={isPlaying}
              color1={colors.primary}
              color2={colors.secondary}
              height={56}
            />

            {/* Volume */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="size-7 shrink-0"
                onClick={() => setMuted(!muted)}
              >
                {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
              </Button>
              <Slider
                min={0} max={100}
                value={[muted ? 0 : volume]}
                onValueChange={([v]) => { setVolume(v); setMuted(false) }}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-8 text-right">
                {muted ? 0 : volume}%
              </span>
            </div>

            {/* Sleep timer */}
            <div className="flex items-center gap-2 flex-wrap">
              <Moon className="size-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Sleep timer:</span>
              {[0, 15, 30, 45, 60, 90].map((mins) => (
                <Badge
                  key={mins}
                  variant={sleepTimer === mins ? 'default' : 'outline'}
                  className="cursor-pointer text-xs px-2 py-0.5"
                  style={sleepTimer === mins ? {
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                    color: 'white',
                    border: 'none',
                  } : {}}
                  onClick={() => setSleepTimer(mins)}
                >
                  {mins === 0 ? 'Off' : `${mins}m`}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main player bar */}
      <div className="px-4 sm:px-6 py-3">
        <div className="mx-auto max-w-3xl flex items-center gap-3">
          {/* Track info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate leading-tight">{chapterTitle}</p>
            <p className="text-[11px] text-muted-foreground truncate">{title}</p>
          </div>

          {/* Progress */}
          <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground shrink-0">
            <span>{elapsed}</span>
            <div className="w-20 h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${audioProgress}%`,
                  background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
                }}
              />
            </div>
            <span>{remaining}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 hidden sm:flex"
              onClick={() => setAudioProgress(Math.max(0, audioProgress - 5))}
            >
              <SkipBack className="size-4" />
            </Button>

            <Button
              size="icon"
              className="size-9 rounded-full"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                boxShadow: isPlaying ? `0 0 20px ${colors.primary}50` : 'none',
                border: 'none',
                color: 'white',
              }}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 ml-0.5" />}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="size-8 hidden sm:flex"
              onClick={() => setAudioProgress(Math.min(100, audioProgress + 5))}
            >
              <SkipForward className="size-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={cycleSpeed}
              title={`Speed: ${playbackSpeed}x`}
            >
              <span className="text-[10px] font-bold">{playbackSpeed}x</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setMixerOpen(!mixerOpen)}
              title="Spatial Mixer"
            >
              <Music2 className="size-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
            </Button>
          </div>
        </div>

        {/* Thin progress bar */}
        <div className="mx-auto max-w-3xl mt-2 h-0.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-200"
            style={{
              width: `${audioProgress}%`,
              background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
            }}
          />
        </div>
      </div>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, BookOpen, Headphones, Type, Minus, Plus, X } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { KineticText } from '../components/reader/KineticText'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Slider } from '../components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { AURA_THEMES } from '../types'
import type { TypographyMode } from '../types'

const TYPOGRAPHY_MODES: { value: TypographyMode; label: string }[] = [
  { value: 'sans', label: 'Standard' },
  { value: 'serif', label: 'Editorial' },
  { value: 'focus', label: 'Focus' },
  { value: 'dyslexia', label: 'Dyslexia' },
]

export function ReaderPage() {
  const {
    route,
    books,
    chapters,
    fetchChapters,
    navigate,
    updateProgress,
    typographyMode,
    setTypographyMode,
    fontSize,
    setFontSize,
    isPlaying,
    setIsPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    setCurrentTrack,
    auraTheme,
  } = useApp()

  const bookId = route.page === 'reader' ? route.bookId : ''
  const book = books.find((b) => b.id === bookId)
  const bookChapters = chapters[bookId] ?? []
  const [chapterNum, setChapterNum] = useState(
    route.page === 'reader' ? route.chapterNum : 1
  )
  const chapter = bookChapters.find((c) => c.chapter_number === chapterNum)
  const [readingPct, setReadingPct] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [showTypoPanel, setShowTypoPanel] = useState(false)
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)
  const colors = AURA_THEMES[auraTheme]

  useEffect(() => {
    if (bookId) fetchChapters(bookId)
  }, [bookId])

  useEffect(() => {
    if (chapter && book) setCurrentTrack(book, chapter)
  }, [chapter?.chapter_number, book?.id])

  useEffect(() => {
    function handleScroll() {
      setShowControls(false)
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current)
      scrollTimerRef.current = setTimeout(() => setShowControls(true), 2000)

      const el = containerRef.current
      if (el) {
        const scrolled = el.scrollTop
        const total = el.scrollHeight - el.clientHeight
        if (total > 0) {
          const pct = Math.min(100, (scrolled / total) * 100)
          setReadingPct(pct)
          if (book) updateProgress(book.id, pct, 0, chapterNum)
        }
      }
    }
    const el = containerRef.current
    el?.addEventListener('scroll', handleScroll)
    return () => el?.removeEventListener('scroll', handleScroll)
  }, [book, chapterNum, updateProgress])

  function goChapter(delta: number) {
    const next = chapterNum + delta
    const found = bookChapters.find((c) => c.chapter_number === next)
    if (found) {
      setChapterNum(next)
      setIsPlaying(false)
      containerRef.current?.scrollTo({ top: 0 })
      if (route.page === 'reader') navigate({ page: 'reader', bookId, chapterNum: next })
    }
  }

  const hasPrev = bookChapters.some((c) => c.chapter_number === chapterNum - 1)
  const hasNext = bookChapters.some((c) => c.chapter_number === chapterNum + 1)
  const wordCount = chapter?.word_count ?? 0
  const minutesLeft = Math.max(1, Math.round((wordCount * (1 - readingPct / 100)) / 200))
  const typographyClass = `reader-${typographyMode}`

  if (!book || !chapter) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        <div className="text-center">
          <BookOpen className="size-12 mx-auto mb-3 opacity-30" />
          <p>Loading chapter…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Reader toolbar — auto-hides */}
      <div
        className={`fixed top-14 left-0 right-0 z-40 glass-strong border-b border-white/5 transition-all duration-500 ${
          showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 h-12 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className="text-xs text-muted-foreground truncate">
              Ch. {chapter.chapter_number}: {chapter.title}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className="text-xs border-white/10 hidden sm:flex">
              {minutesLeft}m left
            </Badge>
            <Badge variant="outline" className="text-xs border-white/10 hidden sm:flex">
              {Math.round(readingPct)}%
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={() => setShowTypoPanel(!showTypoPanel)}
            >
              <Type className="size-3.5" />
            </Button>
            <Button
              size="sm"
              className="h-7 gap-1.5 text-xs font-medium"
              style={isPlaying ? {
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                color: 'white',
                border: 'none',
              } : {}}
              variant={isPlaying ? 'default' : 'outline'}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              <Headphones className="size-3.5" />
              {isPlaying ? 'Listening' : 'Start Audio'}
            </Button>
          </div>
        </div>

        {showTypoPanel && (
          <div className="border-t border-white/5 px-4 sm:px-6 py-3">
            <div className="mx-auto max-w-3xl flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Font</span>
                <Select
                  value={typographyMode}
                  onValueChange={(v) => setTypographyMode(v as TypographyMode)}
                >
                  <SelectTrigger className="h-7 text-xs w-28 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPOGRAPHY_MODES.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Size</span>
                <Button variant="ghost" size="icon" className="size-6" onClick={() => setFontSize(Math.max(14, fontSize - 1))}>
                  <Minus className="size-3" />
                </Button>
                <span className="text-xs w-8 text-center">{fontSize}</span>
                <Button variant="ghost" size="icon" className="size-6" onClick={() => setFontSize(Math.min(28, fontSize + 1))}>
                  <Plus className="size-3" />
                </Button>
              </div>
              {isPlaying && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Speed</span>
                  <div className="w-24">
                    <Slider
                      min={0.5} max={3} step={0.25}
                      value={[playbackSpeed]}
                      onValueChange={([v]: [number]) => setPlaybackSpeed(v)}
                      className="h-1"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">{playbackSpeed}x</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="size-6 ml-auto"
                onClick={() => setShowTypoPanel(false)}
              >
                <X className="size-3" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="fixed top-14 left-0 right-0 h-0.5 z-40" style={{ background: 'var(--border)' }}>
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${readingPct}%`,
            background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`,
          }}
        />
      </div>

      {/* Scrollable reading area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto pt-32 pb-40 px-4 sm:px-6"
      >
        <div className="mx-auto max-w-[65ch]">
          <div className="mb-10 text-center">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
              Chapter {chapter.chapter_number}
            </p>
            <h1
              className="text-2xl sm:text-3xl font-bold tracking-tight"
              style={{ textShadow: `0 0 40px ${colors.primary}30` }}
            >
              {chapter.title}
            </h1>
            <div
              className="mx-auto mt-4 h-px w-16 rounded-full"
              style={{ background: `linear-gradient(90deg, transparent, ${colors.primary}, transparent)` }}
            />
          </div>

          <KineticText
            content={chapter.content}
            isPlaying={isPlaying}
            playbackSpeed={playbackSpeed}
            typographyClass={typographyClass}
            fontSize={fontSize}
            onProgress={(pct: number) => {
              if (book) updateProgress(book.id, Math.max(readingPct, pct), 0, chapterNum)
            }}
          />
        </div>
      </div>

      {/* Bottom chapter navigation */}
      <div
        className={`fixed bottom-20 left-0 right-0 z-30 flex justify-center gap-3 transition-all duration-500 ${
          showControls ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <Button
          variant="outline"
          size="sm"
          className="gap-2 glass border-white/10 text-xs"
          disabled={!hasPrev}
          onClick={() => goChapter(-1)}
        >
          <ChevronLeft className="size-3.5" />
          Previous
        </Button>
        <span className="flex items-center text-xs text-muted-foreground px-2">
          {chapterNum} / {bookChapters.length}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 glass border-white/10 text-xs"
          disabled={!hasNext}
          onClick={() => goChapter(1)}
        >
          Next
          <ChevronRight className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}

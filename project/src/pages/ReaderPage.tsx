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

  // ✨ FIXED EXTRACTION: Ensuring safe properties mapping fallback from any context structure types
  const bookId = (route as any).bookId || '';
  const book = books.find((b) => b.id === bookId)
  const bookChapters = chapters[bookId] ?? []
  
  const [chapterNum, setChapterNum] = useState<number>(() => {
    return (route as any).chapterNum || 1
  })

  const chapter = bookChapters.find((c) => c.chapter_number === chapterNum)
  const [readingPct, setReadingPct] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [showTypoPanel, setShowTypoPanel] = useState(false)
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Safety configuration mapping to prevent rendering template crashes
  const currentTheme = auraTheme || 'solar_dawn'
  const colors = AURA_THEMES[currentTheme as keyof typeof AURA_THEMES] || { primary: '#0f172a', secondary: '#64748b' }

  useEffect(() => {
    if (bookId) {
      fetchChapters(bookId)
    }
  }, [bookId, fetchChapters])

  useEffect(() => {
    if (chapter && book) {
      setCurrentTrack(book, chapter)
    }
  }, [chapter, book, setCurrentTrack])

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
      navigate({ page: 'reader', bookId, chapterNum: next })
    }
  }

  const hasPrev = bookChapters.some((c) => c.chapter_number === chapterNum - 1)
  const hasNext = bookChapters.some((c) => c.chapter_number === chapterNum + 1)
  const wordCount = chapter?.word_count ?? 0
  const minutesLeft = Math.max(1, Math.round((wordCount * (1 - readingPct / 100)) / 200))
  const typographyClass = `reader-${typographyMode}`

  // Loading indicator matching ElevenReader aesthetic workspace layout structures
  if (!book || !chapter) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f8fafc] text-slate-500">
        <div className="text-center">
          <BookOpen className="size-10 text-slate-300 animate-pulse mx-auto mb-3" />
          <p className="text-xs font-medium tracking-wide">Syncing text matrix and streams…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#f8fafc] text-slate-900 font-sans">
      
      {/* 🧭 ELEVENREADER STYLE TEXT HEADERS SYSTEM CONTAINER */}
      <div
        className={`fixed top-14 left-0 right-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/60 transition-all duration-500 ${
          showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 h-12 flex items-center justify-between gap-4">
          <div className="flex items-center min-w-0">
            <span className="text-xs font-semibold text-slate-800 truncate">
              Chapter {chapter.chapter_number}: {chapter.title}
            </span>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant="outline" className="text-[11px] border-slate-200 text-slate-500 bg-slate-50 px-2 font-medium hidden sm:flex">
              {minutesLeft}m left
            </Badge>
            <Badge variant="outline" className="text-[11px] border-slate-200 text-slate-500 bg-slate-50 px-2 font-medium hidden sm:flex">
              {Math.round(readingPct)}% read
            </Badge>
            
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 rounded-lg"
              onClick={() => setShowTypoPanel(!showTypoPanel)}
            >
              <Type className="size-4" />
            </Button>
            
            <Button
              size="sm"
              className="h-8 gap-1.5 text-xs font-semibold px-3.5 shadow-sm rounded-lg transition-all"
              style={isPlaying ? {
                background: '#0f172a',
                color: 'white',
              } : {
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid #cbd5e1'
              }}
              onClick={() => setIsPlaying(!isPlaying)}
            >
              <Headphones className="size-3.5" />
              {isPlaying ? 'Listening' : 'Listen Audio'}
            </Button>
          </div>
        </div>

        {/* TYPOGRAPHY CONTROL HOVER BOX */}
        {showTypoPanel && (
          <div className="border-t border-slate-100 bg-slate-50 px-4 sm:px-6 py-2.5">
            <div className="mx-auto max-w-3xl flex flex-wrap items-center gap-5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Style</span>
                <Select
                  value={typographyMode}
                  onValueChange={(v) => setTypographyMode(v as TypographyMode)}
                >
                  <SelectTrigger className="h-7 text-xs w-28 bg-white border-slate-200 text-slate-800 rounded-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPOGRAPHY_MODES.map((m) => (
                      <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center gap-1">
                <span className="text-xs font-medium text-slate-500 mr-1">Scale</span>
                <Button variant="outline" size="icon" className="size-7 bg-white border-slate-200" onClick={() => setFontSize(Math.max(14, fontSize - 1))}>
                  <Minus className="size-3 text-slate-600" />
                </Button>
                <span className="text-xs font-bold px-1.5 text-slate-700 min-w-[24px] text-center">{fontSize}</span>
                <Button variant="outline" size="icon" className="size-7 bg-white border-slate-200" onClick={() => setFontSize(Math.min(28, fontSize + 1))}>
                  <Plus className="size-3 text-slate-600" />
                </Button>
              </div>
              
              {isPlaying && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-500">Speed</span>
                  <div className="w-20">
                    <Slider
                      min={0.5} max={3} step={0.25}
                      value={[playbackSpeed]}
                      onValueChange={([v]: [number]) => setPlaybackSpeed(v)}
                      className="h-1"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-600">{playbackSpeed}x</span>
                </div>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                className="size-7 ml-auto text-slate-400 hover:text-slate-700"
                onClick={() => setShowTypoPanel(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modern Minimalist Reader Slider Line */}
      <div className="fixed top-14 left-0 right-0 h-0.5 z-40 bg-slate-200/50">
        <div
          className="h-full bg-slate-900 transition-all duration-300"
          style={{ width: `${readingPct}%` }}
        />
      </div>

      {/* 📖 TEXT CONTENT WORKSPACE AREA */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto pt-32 pb-40 px-4 sm:px-6 custom-scrollbar"
      >
        <div className="mx-auto max-w-[65ch]">
          <div className="mb-10 text-center">
            <p className="text-[11px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-2">
              Chapter {chapter.chapter_number}
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {chapter.title}
            </h1>
            <div className="mx-auto mt-4 h-[2px] w-12 rounded bg-slate-200" />
          </div>

          {/* DYNAMIC TEXT RENDER CORE PIPELINE */}
          <div className="text-slate-800 leading-relaxed font-normal antialiased protected-content">
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
      </div>

      {/* 🧭 STABLE CHAPTER BAR OVERLAYS BUTTONS SYSTEM */}
      <div
        className={`fixed bottom-24 left-0 right-0 z-30 flex justify-center gap-3 transition-all duration-500 ${
          showControls ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        }`}
      >
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 h-8 bg-white border-slate-200/80 hover:bg-slate-50 text-xs shadow-sm font-semibold rounded-lg text-slate-700"
          disabled={!hasPrev}
          onClick={() => goChapter(-1)}
        >
          <ChevronLeft className="size-4" />
          Previous
        </Button>
        <span className="flex items-center text-xs font-bold text-slate-400 px-3 bg-white border border-slate-200/60 rounded-lg shadow-sm">
          {chapterNum} / {bookChapters.length}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 h-8 bg-white border-slate-200/80 hover:bg-slate-50 text-xs shadow-sm font-semibold rounded-lg text-slate-700"
          disabled={!hasNext}
          onClick={() => goChapter(1)}
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  )
}

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { supabase, getSessionId } from '../lib/supabase'
import { idbGet, idbSet, IDB_STORES } from '../lib/idb'
import { SEED_BOOKS, SEED_CHAPTERS } from '../lib/sampleData'
import { AMBIENT_TRACKS, AURA_THEMES } from '../types'
import type {
  Book,
  Chapter,
  ReadingProgress,
  AuraTheme,
  TypographyMode,
  AudioTrack,
} from '../types'

// ─── Route types ────────────────────────────────────────────────────────────
export type Route =
  | { page: 'home' }
  | { page: 'reader'; bookId: string; chapterNum: number }
  | { page: 'admin' }

// ─── Context shape ───────────────────────────────────────────────────────────
interface AppContextValue {
  // Library
  books: Book[]
  chapters: Record<string, Chapter[]>
  progress: Record<string, ReadingProgress>
  loading: boolean
  addBook: (book: Omit<Book, 'id' | 'created_at'>, chapters: Omit<Chapter, 'id' | 'book_id' | 'created_at'>[]) => Promise<void>
  updateBook: (bookId: string, book: Omit<Book, 'id' | 'created_at'>, chapters: Omit<Chapter, 'id' | 'book_id' | 'created_at'>[]) => Promise<void>
  deleteBook: (bookId: string) => Promise<void>
  updateProgress: (bookId: string, readingPct: number, listeningPct: number, chapterNum: number) => Promise<void>
  fetchChapters: (bookId: string) => Promise<Chapter[]>

  // Navigation
  route: Route
  navigate: (route: Route) => void

  // Aura
  auraTheme: AuraTheme
  setAuraTheme: (theme: AuraTheme) => void

  // Reader
  typographyMode: TypographyMode
  setTypographyMode: (mode: TypographyMode) => void
  fontSize: number
  setFontSize: (size: number) => void

  // Player
  isPlaying: boolean
  setIsPlaying: (v: boolean) => void
  playbackSpeed: number
  setPlaybackSpeed: (v: number) => void
  currentBook: Book | null
  currentChapter: Chapter | null
  setCurrentTrack: (book: Book, chapter: Chapter) => void
  audioProgress: number
  setAudioProgress: (v: number) => void

  // Mixer
  mixerTracks: AudioTrack[]
  setMixerTrackVolume: (id: string, vol: number) => void
  toggleMixerTrack: (id: string) => void
  mixerOpen: boolean
  setMixerOpen: (v: boolean) => void
}

const AppContext = createContext<AppContextValue | null>(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<Book[]>([])
  const [chapters, setChapters] = useState<Record<string, Chapter[]>>({})
  const [progress, setProgress] = useState<Record<string, ReadingProgress>>({})
  const [loading, setLoading] = useState(true)
  const [route, setRoute] = useState<Route>({ page: 'home' })
  const [auraTheme, setAuraThemeState] = useState<AuraTheme>('solar_dawn')
  const [typographyMode, setTypographyMode] = useState<TypographyMode>('sans')
  const [fontSize, setFontSize] = useState(18)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [currentBook, setCurrentBook] = useState<Book | null>(null)
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null)
  const [audioProgress, setAudioProgress] = useState(0)
  const [mixerTracks, setMixerTracks] = useState<AudioTrack[]>(
    AMBIENT_TRACKS.map((t) => ({ ...t, volume: 0, playing: false }))
  )
  const [mixerOpen, setMixerOpen] = useState(false)
  const seededRef = useRef(false)

  const setAuraTheme = useCallback((theme: AuraTheme) => {
    setAuraThemeState(theme)
    const colors = AURA_THEMES[theme]
    document.documentElement.style.setProperty('--aura-1', colors.primary)
    document.documentElement.style.setProperty('--aura-2', colors.secondary)
    document.documentElement.style.setProperty('--aura-3', colors.accent)
  }, [])

  useEffect(() => {
    async function init() {
      if (seededRef.current) return
      seededRef.current = true
      setLoading(true)
      try {
        const { data: existingBooks } = await supabase
          .from('books')
          .select('*')
          .eq('published', true)
          .order('created_at', { ascending: true })

        if (!existingBooks || existingBooks.length === 0) {
          for (const seedBook of SEED_BOOKS) {
            const { data: inserted } = await supabase
              .from('books')
              .insert(seedBook)
              .select()
              .maybeSingle()

            if (inserted) {
              const bookChapters = SEED_CHAPTERS[seedBook.title] ?? []
              for (const ch of bookChapters) {
                await supabase.from('chapters').insert({ ...ch, book_id: inserted.id })
              }
            }
          }

          const { data: seededBooks } = await supabase
            .from('books')
            .select('*')
            .eq('published', true)
            .order('created_at', { ascending: true })
          setBooks((seededBooks as Book[]) ?? [])
        } else {
          setBooks(existingBooks as Book[])
        }

        const sessionId = getSessionId()
        const { data: prog } = await supabase
          .from('reading_progress')
          .select('*')
          .eq('session_id', sessionId)

        if (prog) {
          const map: Record<string, ReadingProgress> = {}
          for (const p of prog as ReadingProgress[]) {
            map[p.book_id] = p
          }
          setProgress(map)
        }

        const savedMixer = await idbGet<AudioTrack[]>(IDB_STORES.MIXER, 'tracks')
        if (savedMixer) setMixerTracks(savedMixer)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const fetchChapters = useCallback(async (bookId: string): Promise<Chapter[]> => {
    if (chapters[bookId]) return chapters[bookId]
    const { data } = await supabase
      .from('chapters')
      .select('*')
      .eq('book_id', bookId)
      .order('chapter_number', { ascending: true })
    const result = (data as Chapter[]) ?? []
    if (result.length > 0) {
      setChapters((prev) => ({ ...prev, [bookId]: result }))
    }
    return result
  }, [chapters])

  // ─── ✨ FIXED ADDBOOK FUNCTION WITH AUTO-MAPPING ───────────────────
  const addBook = useCallback(
    async (
      bookData: Omit<Book, 'id' | 'created_at'>,
      bookChapters: Omit<Chapter, 'id' | 'book_id' | 'created_at'>[]
    ) => {
      // Database mapping safety fallback
      const payload = {
        ...bookData,
        description: (bookData as any).synopsis || (bookData as any).description || ""
      }

      const { data: newBook, error: bookError } = await supabase
        .from('books')
        .insert(payload)
        .select()
        .maybeSingle()

      if (bookError) {
        console.error("Fablex Insert Book Error:", bookError.message)
        alert("Database Entry Failed: " + bookError.message)
        return
      }
      if (!newBook) return

      for (const ch of bookChapters) {
        const { error: chError } = await supabase
          .from('chapters')
          .insert({ ...ch, book_id: newBook.id })
        if (chError) console.error("Chapter Insert Error:", chError.message)
      }

      setBooks((prev) => [...prev, newBook as Book])
    },
    []
  )

  // ─── ✨ FIXED UPDATEBOOK FUNCTION WITH AUTO-MAPPING ─────────────────
  const updateBook = useCallback(
    async (
      bookId: string,
      bookData: Omit<Book, 'id' | 'created_at'>,
      bookChapters: Omit<Chapter, 'id' | 'book_id' | 'created_at'>[]
    ) => {
      const payload = {
        ...bookData,
        description: (bookData as any).synopsis || (bookData as any).description || ""
      }

      const { data: updated, error: updateError } = await supabase
        .from('books')
        .update(payload)
        .eq('id', bookId)
        .select()
        .maybeSingle()

      if (updateError) {
        console.error("Fablex Update Book Error:", updateError.message)
        alert("Database Update Failed: " + updateError.message)
        return
      }
      if (!updated) return

      await supabase.from('chapters').delete().eq('book_id', bookId)
      for (const ch of bookChapters) {
        await supabase.from('chapters').insert({ ...ch, book_id: bookId })
      }

      setChapters((prev) => {
        const next = { ...prev }
        delete next[bookId]
        return next
      })
      setBooks((prev) => prev.map((b) => (b.id === bookId ? (updated as Book) : b)))
    },
    []
  )

  const deleteBook = useCallback(async (bookId: string) => {
    await supabase.from('books').delete().eq('id', bookId)
    setBooks((prev) => prev.filter((b) => b.id !== bookId))
    setChapters((prev) => {
      const next = { ...prev }
      delete next[bookId]
      return next
    })
  }, [])

  const updateProgress = useCallback(
    async (bookId: string, readingPct: number, listeningPct: number, chapterNum: number) => {
      const sessionId = getSessionId()
      const { data } = await supabase
        .from('reading_progress')
        .upsert(
          {
            session_id: sessionId,
            book_id: bookId,
            reading_pct: readingPct,
            listening_pct: listeningPct,
            last_chapter_number: chapterNum,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'session_id,book_id' }
        )
        .select()
        .maybeSingle()
      if (data) {
        setProgress((prev) => ({ ...prev, [bookId]: data as ReadingProgress }))
      }
    },
    []
  )

  const navigate = useCallback((newRoute: Route) => {
    setRoute(newRoute)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    if (newRoute.page === 'reader') {
      const book = books.find((b) => b.id === newRoute.bookId)
      if (book) setAuraTheme(book.aura_theme as AuraTheme)
    } else {
      setAuraTheme('solar_dawn')
    }
  }, [books, setAuraTheme])

  const setCurrentTrack = useCallback((book: Book, chapter: Chapter) => {
    setCurrentBook(book)
    setCurrentChapter(chapter)
    setAudioProgress(0)
  }, [])

  const setMixerTrackVolume = useCallback(async (id: string, vol: number) => {
    setMixerTracks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, volume: vol } : t))
      idbSet(IDB_STORES.MIXER, 'tracks', next)
      return next
    })
  }, [])

  const toggleMixerTrack = useCallback(async (id: string) => {
    setMixerTracks((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, playing: !t.playing } : t))
      idbSet(IDB_STORES.MIXER, 'tracks', next)
      return next
    })
  }, [])

  const value: AppContextValue = {
    books,
    chapters,
    progress,
    loading,
    addBook,
    updateBook,
    deleteBook,
    updateProgress,
    fetchChapters,
    route,
    navigate,
    auraTheme,
    setAuraTheme,
    typographyMode,
    setTypographyMode,
    fontSize,
    setFontSize,
    isPlaying,
    setIsPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    currentBook,
    currentChapter,
    setCurrentTrack,
    audioProgress,
    setAudioProgress,
    mixerTracks,
    setMixerTrackVolume,
    toggleMixerTrack,
    mixerOpen,
    setMixerOpen,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

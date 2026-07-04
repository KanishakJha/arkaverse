import { useEffect, useState, useRef } from 'react'
import { useApp } from '../contexts/AppContext'
import { Play, Pause, ChevronLeft, ChevronRight, User, UserCheck } from 'lucide-react'
// ✅ 1. NEW IMPORT ADDED (Sirf ek line add ki)
import { TTSReader } from '../components/TTSReader'

export function ReaderPage() {
  const { route, books, chapters, fetchChapters, isPlaying, setIsPlaying, navigate } = useApp()
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0)
  
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('male')
  const chunksRef = useRef<string[]>([])
  const bgMusicRef = useRef<HTMLAudioElement | null>(null)

  const book = books.find((b) => b.id === route.bookId)
  
  useEffect(() => {
    if (route.bookId && fetchChapters) {
      fetchChapters(route.bookId).catch(err => console.error(err))
    }
  }, [route.bookId, fetchChapters])

  const bookChapters = book ? chapters[book.id] || [] : []
  const activeChapter = bookChapters[currentChapterIndex]
  const textToRead = activeChapter?.content || ""

  // SMART TEXT CHUNKER FOR TTS ACCURACY
  useEffect(() => {
    if (textToRead) {
      const sentences = textToRead.match(/[^.!?]+[.!?]+(\s|$)|[^।!?]+[।!?]+(\s|$)/g) || [textToRead]
      const chunks: string[] = []
      let currentChunk = ""

      sentences.forEach((sentence) => {
        if ((currentChunk + sentence).length > 250) {
          chunks.push(currentChunk.trim())
          currentChunk = sentence
        } else {
          currentChunk += sentence
        }
      })
      if (currentChunk.trim()) chunks.push(currentChunk.trim())

      chunksRef.current = chunks
      setCurrentChunkIndex(0) 
      window.speechSynthesis.cancel()
    }
  }, [textToRead])

  // AMBIENT BACKDROP ENGINE
  useEffect(() => {
    if (!bgMusicRef.current) {
      bgMusicRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav')
      bgMusicRef.current.loop = true
      bgMusicRef.current.volume = 0.08
    }
    if (isPlaying) {
      bgMusicRef.current.play().catch((e) => console.log("BG Deferred:", e))
    } else {
      if (bgMusicRef.current) bgMusicRef.current.pause()
    }
    return () => {
      if (bgMusicRef.current) bgMusicRef.current.pause()
    }
  }, [isPlaying])

  // TTS PLAYBACK INTERACTIVE HANDLER (Aapka existing TTS bilkul same chalega)
  useEffect(() => {
    if (!isPlaying || chunksRef.current.length === 0) {
      window.speechSynthesis.cancel()
      return
    }

    const activeText = chunksRef.current[currentChunkIndex]
    if (!activeText) return

    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(activeText)
    const isHindi = /[\u0900-\u097F]/.test(activeText)
    utterance.lang = isHindi ? 'hi-IN' : 'en-IN'

    const selectVoice = () => {
      const voices = window.speechSynthesis.getVoices()
      const target = isHindi ? 'hi' : 'en'
      let v = voices.find(x => {
        const name = x.name.toLowerCase()
        const lang = x.lang.toLowerCase()
        if (voiceGender === 'male') {
          return lang.includes(target) && (name.includes('google') || name.includes('male') || name.includes('ravi'))
        } else {
          return lang.includes(target) && (name.includes('female') || name.includes('swara') || name.includes('zira'))
        }
      })
      if (!v) v = voices.find(x => x.lang.toLowerCase().includes(target))
      if (v) utterance.voice = v
    }

    selectVoice()

    if (voiceGender === 'male') {
      utterance.pitch = 0.80
      utterance.rate = 0.88
    } else {
      utterance.pitch = 1.02
      utterance.rate = 0.94
    }

    utterance.onend = () => {
      if (currentChunkIndex < chunksRef.current.length - 1) {
        setCurrentChunkIndex(prev => prev + 1)
      } else {
        setIsPlaying(false)
      }
    }
    utterance.onerror = () => setIsPlaying(false)

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        selectVoice()
        window.speechSynthesis.speak(utterance)
      }
    } else {
      window.speechSynthesis.speak(utterance)
    }

  }, [isPlaying, currentChunkIndex, voiceGender, setIsPlaying])

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel()
    }
  }, [])

  if (!book) return null

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col relative overflow-x-hidden">
      <div className="flex items-center gap-4 p-4 border-b border-zinc-800/50 justify-between">
        <button type="button" onClick={() => { window.speechSynthesis.cancel(); setIsPlaying(false); navigate({ page: 'home' }); }} className="p-2 hover:bg-zinc-800 rounded-full transition">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center flex-1 min-w-0">
          <h2 className="text-xs uppercase tracking-widest text-zinc-400 truncate">{book.title}</h2>
          <h1 className="text-sm font-semibold text-zinc-200 truncate">{activeChapter?.title || `Chapter ${currentChapterIndex + 1}`}</h1>
        </div>
        <div className="w-10" />
      </div>

      {/* ✅ 2. TTS READER ADDED HERE (Is block ko aapke header aur content ke beech mein add kiya) */}
      <TTSReader text={activeChapter?.content || ""} />

      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
        <div className="relative w-64 h-64 rounded-full overflow-hidden shadow-2xl border-4 border-zinc-800">
          <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
        </div>

        {/* GENDER TABS */}
        <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl w-64 justify-between">
          <button type="button" onClick={() => { window.speechSynthesis.cancel(); setVoiceGender('male'); setCurrentChunkIndex(0); }} className={'flex-1 py-1.5 text-xs font-semibold rounded-lg transition ' + (voiceGender === 'male' ? 'bg-white text-black shadow' : 'text-zinc-400')}>
            <UserCheck className="w-4 h-4 inline mr-1" /> Male Voice
          </button>
          <button type="button" onClick={() => { window.speechSynthesis.cancel(); setVoiceGender('female'); setCurrentChunkIndex(0); }} className={'flex-1 py-1.5 text-xs font-semibold rounded-lg transition ' + (voiceGender === 'female' ? 'bg-white text-black shadow' : 'text-zinc-400')}>
            <User className="w-4 h-4 inline mr-1" /> Female Voice
          </button>
        </div>

        <div className="w-full max-w-md bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 text-center max-h-32 overflow-y-auto">
          <p className="text-sm text-zinc-300 italic">
            "{chunksRef.current[currentChunkIndex] || "Click Play to read..."}"
          </p>
        </div>

        {/* FOOTER NAV CONTROLS */}
        <div className="flex items-center gap-6">
          <button type="button" disabled={currentChapterIndex === 0} onClick={() => { window.speechSynthesis.cancel(); setIsPlaying(false); setCurrentChunkIndex(0); setCurrentChapterIndex(prev => Math.max(0, prev - 1)); setTimeout(() => setIsPlaying(true), 150); }} className={'p-3 ' + (currentChapterIndex === 0 ? 'text-zinc-700' : 'text-zinc-400')}>
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button type="button" onClick={() => setIsPlaying(!isPlaying)} className="p-4 bg-white text-black rounded-full hover:scale-105 transition flex items-center justify-center">
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          <button type="button" disabled={currentChapterIndex >= bookChapters.length - 1} onClick={() => { window.speechSynthesis.cancel(); setIsPlaying(false); setCurrentChunkIndex(0); setCurrentChapterIndex(prev => Math.min(bookChapters.length - 1, prev + 1)); setTimeout(() => setIsPlaying(true), 150); }} className={'p-3 ' + (currentChapterIndex >= bookChapters.length - 1 ? 'text-zinc-700' : 'text-zinc-400')}>
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  )
          }

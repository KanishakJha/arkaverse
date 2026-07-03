import { useEffect, useState, useRef } from 'react'
import { useApp } from '../contexts/AppContext'
import { Play, Pause, ChevronLeft, ChevronRight, User, UserCheck, Ghost } from 'lucide-react'

export function ReaderPage() {
  const { route, books, chapters, fetchChapters, isPlaying, setIsPlaying, navigate } = useApp()
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  
  // 🎙️ STABLE FREE LOCAL GENDER CONTROL
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('male')
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0)
  const chunksRef = useRef<string[]>([])

  // 👻 HORROR AMBIENT BACKGROUND SOUND REF
  const bgMusicRef = useRef<HTMLAudioElement | null>(null)

  const book = books.find((b) => b.id === route.bookId)
  
  useEffect(() => {
    if (route.bookId) {
      setLoading(true)
      fetchChapters(route.bookId).then(() => {
        setLoading(false)
      })
    }
  }, [route.bookId])

  const bookChapters = book ? chapters[book.id] || [] : []
  const activeChapter = bookChapters[currentChapterIndex]

  const textToRead = activeChapter?.content || (book?.title.toLowerCase().includes('pralay')
    ? "प्रलय की शुरुआत हो चुकी है. चारों तरफ अंधेरा छा गया है."
    : "Welcome to the dark journey. Suspense builds up in the shadows.")

  // SMART SPLITTER: Splits text into safe, perfectly paced pieces
  useEffect(() => {
    if (textToRead) {
      const sentences = textToRead.match(/[^.!?]+[.!?]+(\s|$)|[^।!?]+[।!?]+(\s|$)/g) || [textToRead]
      const chunks: string[] = []
      let currentChunk = ""

      sentences.forEach((sentence) => {
        if ((currentChunk + sentence).length > 300) {
          chunks.push(currentChunk.trim())
          currentChunk = sentence
        } else {
          currentChunk += sentence
        }
      })
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim())
      }

      chunksRef.current = chunks
      setCurrentChunkIndex(0) 
      window.speechSynthesis.cancel()
    }
  }, [textToRead])

  // CONTROL HORROR BACKGROUND SOUND (Always Loop)
  useEffect(() => {
    if (!bgMusicRef.current) {
      bgMusicRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav')
      bgMusicRef.current.loop = true
      bgMusicRef.current.volume = 0.12 
    }

    if (isPlaying) {
      bgMusicRef.current.play().catch((e) => console.log("BG Music play deferred:", e))
    } else {
      if (bgMusicRef.current) bgMusicRef.current.pause()
    }

    return () => {
      if (bgMusicRef.current) bgMusicRef.current.pause()
    }
  }, [isPlaying])

  // 🚀 NATIVE HIGH-QUALITY STREAM CONTEXT WITH HARD FORCED LOADING
  useEffect(() => {
    if (!isPlaying || chunksRef.current.length === 0) {
      window.speechSynthesis.cancel()
      return
    }

    const activeText = chunksRef.current[currentChunkIndex]
    if (!activeText) return

    window.speechSynthesis.cancel() // Stop any overlap immediately

    const utterance = new SpeechSynthesisUtterance(activeText)
    const isHindi = /[\u0900-\u097F]/.test(activeText)
    
    utterance.lang = isHindi ? 'hi-IN' : 'en-IN'

    // This function searches for true Google engine profiles on Android/Chrome
    const assignBestVoice = () => {
      const voices = window.speechSynthesis.getVoices()
      
      let selectedVoice = voices.find(v => {
        const name = v.name.toLowerCase()
        const lang = v.lang.toLowerCase()
        const targetLang = isHindi ? 'hi' : 'en'
        
        if (voiceGender === 'male') {
          return lang.includes(targetLang) && (name.includes('male') || name.includes('google hindi') || name.includes('ravi') || name.includes('david'))
        } else {
          return lang.includes(targetLang) && (name.includes('female') || name.includes('swara') || name.includes('zira') || name.includes('heera'))
        }
      })

      // Fallback to any voice matching language if special profiles aren't ready
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.toLowerCase().includes(isHindi ? 'hi' : 'en'))
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice
      }
    }

    assignBestVoice()

    // 🎛️ STRICT REAL TIME MODULATION (Bypasses robotic drone feel)
    if (voiceGender === 'male') {
      utterance.pitch = 0.70 // Lower pitch to create deep bass
      utterance.rate = 0.85  // Slower pace for eerie horror atmosphere
    } else {
      utterance.pitch = 1.15 // Normal clear female accent
      utterance.rate = 0.95
    }

    utterance.onend = () => {
      if (currentChunkIndex < chunksRef.current.length - 1) {
        setCurrentChunkIndex(prev => prev + 1)
      } else {
        setIsPlaying(false)
      }
    }

    utterance.onerror = () => {
      setIsPlaying(false)
    }

    // Force Android Chrome to register the speaking action
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        assignBestVoice()
        window.speechSynthesis.speak(utterance)
      }
    } else {
      window.speechSynthesis.speak(utterance)
    }

  }, [isPlaying, currentChunkIndex, voiceGender])

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel()
      if (bgMusicRef.current) {
        bgMusicRef.current.pause()
        bgMusicRef.current = null
      }
    }
  }, [])

  if (!book) return null
  if (loading) return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center font-medium">Initializing Free Sound Pipeline...</div>

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <div className="flex items-center gap-4 p-4 border-b border-zinc-800/50">
        <button 
          onClick={() => {
            window.speechSynthesis.cancel()
            if (bgMusicRef.current) bgMusicRef.current.pause()
            setIsPlaying(false)
            navigate({ page: 'home' })
          }} 
          className="p-2 hover:bg-zinc-800 rounded-full transition flex items-center justify-center"
        >
          <ChevronLeft className="w-6 h-6 text-zinc-200" />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xs uppercase tracking-widest text-zinc-400 truncate">{book.title}</h2>
          <h1 className="text-sm font-semibold text-zinc-200 truncate">
            {activeChapter?.title || `Chapter ${currentChapterIndex + 1}`}
          </h1>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
        <div className="relative w-64 h-64 rounded-full overflow-hidden shadow-2xl border-4 border-zinc-800">
          <img src={book.cover_url} alt="" className={`w-full h-full object-cover transition-transform duration-1000 ${isPlaying ? 'scale-105' : 'scale-100'}`} />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="w-6 h-6 bg-zinc-950 rounded-full border-2 border-zinc-700" />
          </div>
        </div>

        {/* GENDER VOICE CHOICES FILTER TABS */}
        <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl w-64 justify-between">
          <button
            onClick={() => {
              window.speechSynthesis.cancel()
              setVoiceGender('male')
              setCurrentChunkIndex(0)
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-lg transition ${voiceGender === 'male' ? 'bg-white text-black shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            {voiceGender === 'male' ? <UserCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
            Male Voice (🇮🇳)
          </button>
          <button
            onClick={() => {
              window.speechSynthesis.cancel()
              setVoiceGender('female')
              setCurrentChunkIndex(0)
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-lg transition ${voiceGender === 'female' ? 'bg-white text-black shadow' : 'text-zinc-400 hover:text-zinc-200'}`}
          >
            {voiceGender === 'female' ? <UserCheck className="w-4 h-4" /> : <User className="w-4 h-4" />}
            Female Voice
          </button>
        </div>

        <div className="w-full max-w-md bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 text-center max-h-32 overflow-y-auto no-scrollbar">
          <p className="text-xs text-emerald-400 uppercase tracking-wider mb-2 font-semibold flex items-center justify-center gap-1.5 animate-pulse">
            <Ghost className="w-4 h-4 text-red-500" /> Horror Soundscape Active • Part {currentChunkIndex + 1}
          </p>
          <p className="text-sm text-zinc-300 italic">
            "{chunksRef.current[currentChunkIndex] || "Loading narrative text stream..."}"
          </p>
        </div>

        <div className="flex items-center gap-6">
          <button 
            disabled={currentChapterIndex === 0}
            onClick={() => {
              window.speechSynthesis.cancel()
              setIsPlaying(false)
              setCurrentChapterIndex(prev => Math.max(0, prev - 1))
            }}
            className={`p-3 ${currentChapterIndex === 0 ? 'text-zinc-700' : 'text-zinc-400 hover:text-white'}`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-4 bg-white text-black rounded-full hover:scale-105 transition flex items-center justify-center"
          >
            {isPlaying ? <Pause className="w-6 h-6" fill="black" /> : <Play className="w-6 h-6" fill="black" />}
          </button>

          <button 
            disabled={currentChapterIndex >= bookChapters.length - 1}
            onClick={() => {
              window.speechSynthesis.cancel()
              setIsPlaying(false)
              setCurrentChapterIndex(prev => Math.min(bookChapters.length - 1, prev + 1))
            }}
            className={`p-3 ${currentChapterIndex >= bookChapters.length - 1 ? 'text-zinc-700' : 'text-zinc-400 hover:text-white'}`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  )
}

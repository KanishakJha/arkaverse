import { useEffect, useState, useRef } from 'react'
import { useApp } from '../contexts/AppContext'
import { Play, Pause, ChevronLeft, ChevronRight, Volume2 } from 'lucide-react'

export function ReaderPage() {
  const { route, books, chapters, fetchChapters, isPlaying, setIsPlaying, navigate } = useApp()
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  
  // Audio streaming control elements
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chunksRef = useRef<string[]>([])

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
    : "Welcome to Blood and Glory. This is the journey of a fighter.")

  // 🧠 SMART SPLITTER: Breaks 5000+ words into safe 2000-character chunks
  useEffect(() => {
    if (textToRead) {
      const sentences = textToRead.match(/[^.!?]+[.!?]+(\s|$)|[^।!?]+[।!?]+(\s|$)/g) || [textToRead]
      const chunks: string[] = []
      let currentChunk = ""

      sentences.forEach((sentence) => {
        if ((currentChunk + sentence).length > 2000) {
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
      setCurrentChunkIndex(0) // Reset to first chunk on text change
    }
  }, [textToRead])

  // ElevenLabs Dynamic Stream Controller
  useEffect(() => {
    async function playCurrentChunk() {
      if (!isPlaying || chunksRef.current.length === 0) return

      const activeText = chunksRef.current[currentChunkIndex]
      if (!activeText) return

      try {
        // ⚠️ YAHA APNI API KEY PASTE KARNA BHAI:
        const API_KEY = "sk_1cec648b44208dded5f713cd2ebc8efc9fb14dd023792ac2" 
        const isHindi = /[\u0900-\u097F]/.test(activeText)
        const modelId = "eleven_multilingual_v2"
        const voiceId = isHindi ? "21m00Tcm4TlvDq8ikWAM" : "pNInz6obpgmo51dZ5mX8"

        if (audioRef.current) {
          audioRef.current.pause()
        }

        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': API_KEY,
          },
          body: JSON.stringify({
            text: activeText,
            model_id: modelId,
            voice_settings: { stability: 0.5, similarity_boost: 0.75 }
          })
        })

        if (!response.ok) throw new Error("ElevenLabs limit reached")

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        
        audioRef.current = new Audio(url)
        audioRef.current.play().catch(() => {})

        // When current chunk finishes, automatically generate and play the next chunk!
        audioRef.current.onended = () => {
          if (currentChunkIndex < chunksRef.current.length - 1) {
            setCurrentChunkIndex(prev => prev + 1)
          } else {
            setIsPlaying(false) // Whole chapter completed
          }
        }
      } catch (err) {
        console.error("ElevenLabs failed, using fallback:", err)
        window.speechSynthesis.cancel()
        const utterance = new SpeechSynthesisUtterance(activeText)
        utterance.lang = /[\u0900-\u097F]/.test(activeText) ? 'hi-IN' : 'en-US'
        utterance.onend = () => {
          if (currentChunkIndex < chunksRef.current.length - 1) {
            setCurrentChunkIndex(prev => prev + 1)
          } else {
            setIsPlaying(false)
          }
        }
        window.speechSynthesis.speak(utterance)
      }
    }

    if (isPlaying) {
      playCurrentChunk()
    } else {
      if (audioRef.current) audioRef.current.pause()
      window.speechSynthesis.cancel()
    }
  }, [isPlaying, currentChunkIndex])

  useEffect(() => {
    return () => {
      if (audioRef.current) audioRef.current.pause()
      window.speechSynthesis.cancel()
    }
  }, [])

  if (!book) return null
  if (loading) return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center font-medium">Loading Professional Audio Pipeline...</div>

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Top Header Navigation */}
      <div className="flex items-center gap-4 p-4 border-b border-zinc-800/50">
        <button 
          onClick={() => {
            if (audioRef.current) audioRef.current.pause()
            window.speechSynthesis.cancel()
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

      {/* Center Layout Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
        <div className="relative w-64 h-64 rounded-full overflow-hidden shadow-2xl border-4 border-zinc-800">
          <img src={book.cover_url} alt="" className={`w-full h-full object-cover transition-transform duration-1000 ${isPlaying ? 'scale-105' : 'scale-100'}`} />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="w-6 h-6 bg-zinc-950 rounded-full border-2 border-zinc-700" />
          </div>
        </div>

        {/* Live Subtitle Content (Super helpful for Deaf monitoring) */}
        <div className="w-full max-w-md bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 text-center max-h-32 overflow-y-auto no-scrollbar">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 font-semibold flex items-center justify-center gap-1.5">
            <Volume2 className="w-3 h-3 text-emerald-400" /> Playing Part {currentChunkIndex + 1} of {chunksRef.current.length}
          </p>
          <p className="text-sm text-zinc-300 italic">
            "{chunksRef.current[currentChunkIndex] || "Preparing chunk stream..."}"
          </p>
        </div>

        {/* Player Action Grid */}
        <div className="flex items-center gap-6">
          <button 
            disabled={currentChapterIndex === 0}
            onClick={() => {
              if (audioRef.current) audioRef.current.pause()
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
              if (audioRef.current) audioRef.current.pause()
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

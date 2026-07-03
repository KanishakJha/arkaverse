import { useEffect, useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { Play, Pause, ChevronLeft, ChevronRight, Volume2 } from 'lucide-react'

export function ReaderPage() {
  const { route, books, chapters, fetchChapters, isPlaying, setIsPlaying, navigate } = useApp()
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [loading, setLoading] = useState(true)

  const book = books.find((b) => b.id === route.bookId)
  
  // Fetch real chapters from Supabase data store on component mount
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

  // Fallback text structure in case backend content fields are still empty
  const fallbackContent = book?.title.toLowerCase().includes('pralay')
    ? "प्रलय की शुरुआत हो चुकी है. चारों तरफ अंधेरा छा गया है और एक रहस्यमयी शक्ति जाग उठी है."
    : "Welcome to Blood and Glory. This is the journey of a fighter who lost everything to win the ultimate battle."

  const textToRead = activeChapter?.content || fallbackContent

  // Web Speech Synthesis Pipeline Execution Row
  useEffect(() => {
    if (isPlaying && textToRead) {
      window.speechSynthesis.cancel()

      const utterance = new SpeechSynthesisUtterance(textToRead)
      
      // Smart language identifier regex
      if (/[\u0900-\u097F]/.test(textToRead)) {
        utterance.lang = 'hi-IN' // Pure Hindi Engine
      } else {
        utterance.lang = 'en-US' // Pure English Accent
      }

      utterance.onend = () => {
        setIsPlaying(false)
      }

      utterance.onerror = () => {
        setIsPlaying(false)
      }

      window.speechSynthesis.speak(utterance)
    } else {
      window.speechSynthesis.cancel()
    }

    return () => {
      window.speechSynthesis.cancel()
    }
  }, [isPlaying, textToRead, setIsPlaying])

  if (!book) return null
  if (loading) return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center font-medium">Loading Audio Asset...</div>

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Top Header Navigation Row */}
      <div className="flex items-center gap-4 p-4 border-b border-zinc-800/50">
        <button 
          onClick={() => {
            window.speechSynthesis.cancel()
            setIsPlaying(false)
            navigate({ page: 'home' })
          }} 
          className="p-2 hover:bg-zinc-800 rounded-full transition flex items-center justify-center"
          aria-label="Back to home"
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

      {/* Main Player UI Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
        <div className="relative w-64 h-64 rounded-full overflow-hidden shadow-2xl border-4 border-zinc-800">
          <img 
            src={book.cover_url || "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e"} 
            alt={book.title}
            className={`w-full h-full object-cover transition-transform duration-1000 ${isPlaying ? 'scale-105' : 'scale-100'}`}
          />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="w-6 h-6 bg-zinc-950 rounded-full border-2 border-zinc-700 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-zinc-400 rounded-full" />
            </div>
          </div>
        </div>

        {/* Text Dynamic Preview */}
        <div className="w-full max-w-md bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 text-center max-h-32 overflow-y-auto no-scrollbar">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2 font-semibold flex items-center justify-center gap-1.5 sticky top-0 bg-zinc-900/60 py-0.5">
            <Volume2 className="w-3 h-3 text-emerald-400" /> Reading Text Screen Preview
          </p>
          <p className="text-sm text-zinc-300 italic">
            "{textToRead}"
          </p>
        </div>

        {/* Audio Controls */}
        <div className="flex items-center gap-6">
          <button 
            disabled={currentChapterIndex === 0}
            onClick={() => {
              window.speechSynthesis.cancel()
              setIsPlaying(false)
              setCurrentChapterIndex(prev => Math.max(0, prev - 1))
            }}
            className={`p-3 transition ${currentChapterIndex === 0 ? 'text-zinc-700 cursor-not-allowed' : 'text-zinc-400 hover:text-white'}`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-4 bg-white text-black rounded-full hover:scale-105 transition shadow-lg flex items-center justify-center"
          >
            {isPlaying ? <Pause className="w-6 h-6" fill="black" /> : <Play className="w-6 h-6" fill="black" />}
          </button>

          <button 
            disabled={currentChapterIndex >= bookChapters.length - 1 || bookChapters.length <= 1}
            onClick={() => {
              window.speechSynthesis.cancel()
              setIsPlaying(false)
              setCurrentChapterIndex(prev => Math.min(bookChapters.length - 1, prev + 1))
            }}
            className={`p-3 transition ${currentChapterIndex >= bookChapters.length - 1 || bookChapters.length <= 1 ? 'text-zinc-700 cursor-not-allowed' : 'text-zinc-400 hover:text-white'}`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        
        <div className="text-center px-4">
          <p className="text-sm text-zinc-400 font-medium">Narrated by {book.author}</p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/20">
            <span className={`w-1.5 h-1.5 bg-emerald-400 rounded-full ${isPlaying ? 'animate-ping' : ''}`} />
            AI Dynamic Voice Pipeline Active
          </div>
        </div>
      </div>
    </div>
  )
}

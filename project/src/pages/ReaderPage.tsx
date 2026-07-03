import { useEffect, useRef } from 'react'
import { useApp } from '../contexts/AppContext'
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react'

export function ReaderPage() {
  const { route, books, isPlaying, setIsPlaying, navigate } = useApp()
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // 1. Target Active Book data row elements securely
  const book = books.find((b) => b.id === route.bookId)
  const simulatedTrackUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"

  // 2. Setup native browser audio engine mapping references
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(simulatedTrackUrl)
    }

    // Bind state management hooks directly to player engine
    if (isPlaying) {
      audioRef.current.play().catch(() => {
        console.log("Browser blocked autoplay requirement context trigger.")
      })
    } else {
      audioRef.current.pause()
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [isPlaying])

  if (!book) return null

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      {/* Top Header Navigation Row */}
      <div className="flex items-center gap-4 p-4 border-b border-zinc-800/50">
        <button 
          onClick={() => navigate({ page: 'home' })} 
          className="p-2 hover:bg-zinc-800 rounded-full transition flex items-center justify-center"
          aria-label="Back to home"
        >
          <ChevronLeft className="w-6 h-6 text-zinc-200" />
        </button>
        <div>
          <h2 className="text-xs uppercase tracking-widest text-zinc-400">{book.title}</h2>
          <h1 className="text-sm font-semibold text-zinc-200 truncate max-w-[250px]">
            Track 1: Episode Master Stream
          </h1>
        </div>
      </div>

      {/* Main Player UI Content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
        <div className="relative w-64 h-64 rounded-full overflow-hidden shadow-2xl border-4 border-zinc-800 animate-[spin_20s_linear_infinite] style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}">
          <img 
            src={book.cover_url || "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e"} 
            alt={book.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
            <div className="w-4 h-4 bg-zinc-950 rounded-full border border-zinc-700" />
          </div>
        </div>

        {/* Audio Controls */}
        <div className="flex items-center gap-6">
          <button className="p-3 text-zinc-400 hover:text-white transition">
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-4 bg-white text-black rounded-full hover:scale-105 transition shadow-lg"
          >
            {isPlaying ? <Pause className="w-6 h-6" fill="black" /> : <Play className="w-6 h-6" fill="black" />}
          </button>

          <button className="p-3 text-zinc-400 hover:text-white transition">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
        
        <div className="text-center px-4">
          <p className="text-sm text-zinc-400 font-medium">Narrated by {book.author}</p>
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-medium rounded-full border border-emerald-500/20">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Audio Pipeline Active & Secured
          </div>
        </div>
      </div>
    </div>
  )
}

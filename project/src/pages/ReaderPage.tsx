import { useEffect, useRef } from 'react'
import { useApp } from '../contexts/AppContext'
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react'

export function ReaderPage() {
  const { route, books, navigate, isPlaying, setIsPlaying, currentTrack, setCurrentTrack } = useApp()
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
        console.log("Browser blocked autoplay requirement context trigger.");
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
    <div className="pt-20 pb-24 px-4 max-w-md mx-auto text-center font-sans bg-white min-h-screen">
      <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{book.title}</span>
      <h2 className="text-sm font-bold text-slate-800 mt-1 truncate">Track 1: Episode Master Stream</h2>
      <p className="text-xs text-slate-400 mt-0.5">Narrated by {book.author}</p>

      {/* 📀 Beautiful Spinning Custom Album Art Desk */}
      <div className="my-12 flex justify-center">
        <div className={`relative size-56 rounded-full shadow-2xl border-4 border-slate-900/10 overflow-hidden flex items-center justify-center transition-transform duration-1000 ${isPlaying ? 'animate-spin' : ''}`}>
          <img src={book.cover_url} alt="" className="w-full h-full object-cover absolute inset-0" />
          <div className="size-8 rounded-full bg-white relative z-10 shadow-inner border border-slate-200" />
        </div>
      </div>

      {/* 🕹️ Navigation Play/Pause Interactive Trigger Matrix */}
      <div className="flex items-center justify-center gap-8 mt-6">
        <button className="p-2 text-slate-400 hover:text-slate-900"><ChevronLeft className="size-5" /></button>
        <button 
          onClick={() => setIsPlaying(!isPlaying)}
          className="size-14 rounded-full bg-slate-900 hover:bg-black text-white flex items-center justify-center shadow-xl transform active:scale-95 transition-all"
        >
          {isPlaying ? <Pause className="size-6 fill-current" /> : <Play className="size-6 fill-current ml-1" />}
        </button>
        <button className="p-2 text-slate-400 hover:text-slate-900"><ChevronRight className="size-5" /></button>
      </div>

      <div className="mt-8 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-200/50">
        <span>✨ Audio Pipeline Active & Secured</span>
      </div>
    </div>
  )
}

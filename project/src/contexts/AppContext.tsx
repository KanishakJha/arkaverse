import { useApp } from '../../contexts/AppContext'
import { Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react'

export function FloatingPlayer() {
  const { currentTrack, isPlaying, setIsPlaying } = useApp()

  if (!currentTrack) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-t border-slate-200/80 px-4 py-3 shadow-lg flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-initial">
        <div className="size-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
          {currentTrack.bookCover ? (
            <img src={currentTrack.bookCover} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-slate-50" />
          )}
        </div>
        <div className="min-w-0">
          <h4 className="text-xs font-bold text-slate-900 truncate">{currentTrack.chapterTitle || 'Active Episode'}</h4>
          <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">{currentTrack.bookTitle || 'Fablex Series'}</p>
        </div>
      </div>

      {/* ✨ UPDATED STREAM CONTROLS */}
      <div className="flex items-center gap-4">
        <button className="text-slate-400 hover:text-slate-900 transition-colors">
          <SkipBack className="size-4 fill-current" />
        </button>
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="size-8 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-black shadow transition-all"
        >
          {isPlaying ? <Pause className="size-4 fill-current" /> : <Play className="size-4 fill-current ml-0.5" />}
        </button>
        <button className="text-slate-400 hover:text-slate-900 transition-colors">
          <SkipForward className="size-4 fill-current" />
        </button>
      </div>

      <div className="hidden sm:flex items-center gap-2 w-28 justify-end">
        <Volume2 className="size-4 text-slate-400" />
        <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
          <div className="bg-slate-900 h-full w-full" />
        </div>
      </div>
    </div>
  )
}

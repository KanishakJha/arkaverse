import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Headphones, Play, Pause, Lock, Sparkles, ShieldCheck } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'

export function ReaderPage() {
  const {
    route,
    books,
    chapters,
    fetchChapters,
    navigate,
    isPlaying,
    setIsPlaying,
    setCurrentTrack,
  } = useApp()

  const bookId = (route as any).bookId || ''
  const book = books.find((b) => b.id === bookId)
  const bookChapters = chapters[bookId] ?? []
  
  const [chapterNum, setChapterNum] = useState<number>(() => {
    return (route as any).chapterNum || 1
  })

  const chapter = bookChapters.find((c) => c.chapter_number === chapterNum)

  // ✨ SUBSCRIPTION CHECK SIMULATOR: Aap is state ko user login profile token se bind kar sakte ho
  // Abhi ke liye hum ise false rakh rahe hain taaki locked content par premium lock-screen test ho sake!
  const [isUserVIP, setIsUserVIP] = useState(false)

  useEffect(() => {
    if (bookId) {
      fetchChapters(bookId)
    }
  }, [bookId, fetchChapters])

  // Track status verification and loader engine trigger
  const isTrackLocked = chapter ? ((chapter as any).is_audio_premium || (chapter as any).is_locked || false) : false
  const isAccessDenied = isTrackLocked && !isUserVIP

  useEffect(() => {
    if (chapter && book && !isAccessDenied) {
      setCurrentTrack(book, chapter)
    }
  }, [chapter, book, isAccessDenied, setCurrentTrack])

  function goChapter(delta: number) {
    const next = chapterNum + delta
    const found = bookChapters.find((c) => c.chapter_number === next)
    if (found) {
      setChapterNum(next)
      setIsPlaying(false)
      navigate({ page: 'reader', bookId, chapterNum: next })
    }
  }

  if (!book || !chapter) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f8fafc] text-slate-500">
        <div className="text-center">
          <Headphones className="size-10 text-slate-300 animate-bounce mx-auto mb-3" />
          <p className="text-xs font-medium tracking-wide">Connecting Fablex Audio Streams…</p>
        </div>
      </div>
    )
  }

  const hasPrev = bookChapters.some((c) => c.chapter_number === chapterNum - 1)
  const hasNext = bookChapters.some((c) => c.chapter_number === chapterNum + 1)

  return (
    <div className="h-screen w-screen flex flex-col justify-between bg-[#f8fafc] text-slate-900 font-sans overflow-hidden">
      
      {/* TOP NAVIGATION BAR */}
      <div className="bg-white border-b border-slate-200/60 px-4 py-3 sticky top-14 left-0 right-0 z-40">
        <div className="mx-auto max-w-xl flex items-center justify-between">
          <div className="min-w-0">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest truncate">{book.title}</h2>
            <p className="text-xs font-semibold text-slate-700 truncate mt-0.5">Track {chapter.chapter_number}: {chapter.title}</p>
          </div>
          <Badge variant="outline" className={`text-[10px] px-2 py-0.5 font-bold ${isTrackLocked ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
            {isTrackLocked ? 'VIP PREMIUM' : 'FREE EPISODE'}
          </Badge>
        </div>
      </div>

      {/* CORE AUDIOBOARD INTERFACE BODY */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="max-w-sm w-full bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xl shadow-slate-100/70 text-center relative overflow-hidden">
          
          {isAccessDenied ? (
            /* 🔒 PAYWALL LOCK SCREEN PANEL */
            <div className="py-8 px-4 flex flex-col items-center justify-center animate-page-flip-right">
              <div className="size-16 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center mb-5 text-amber-500 shadow-sm">
                <Lock className="size-7" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">This Episode is Locked</h3>
              <p className="text-xs text-slate-400 mt-2 max-w-[240px] mx-auto leading-relaxed">
                Unlock the complete series and ad-free high fidelity experience by upgrading to a Fablex VIP Membership.
              </p>
              
              <div className="mt-8 w-full space-y-2.5">
                <Button 
                  onClick={() => alert("Redirecting to Fablex Payment Gateway Integration Panel…")}
                  className="w-full bg-slate-900 hover:bg-black text-white text-xs font-bold h-10 rounded-xl shadow-md flex items-center justify-center gap-2"
                >
                  <Sparkles className="size-3.5 text-amber-400 fill-current" />
                  Upgrade to VIP Membership
                </Button>
                <button 
                  onClick={() => setIsUserVIP(true)} 
                  className="text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors block mx-auto pt-2"
                >
                  (Bypass/Simulate Success Account)
                </button>
              </div>
            </div>
          ) : (
            /* 🎵 ACTIVE PREMIUM AUDIO PLAYER LAYOUT */
            <div className="flex flex-col items-center animate-page-flip-right">
              {/* Spinning Album Disc Artwork Cover */}
              <div className="relative group mb-6">
                <div className={`size-48 rounded-full border-4 border-slate-100 shadow-xl overflow-hidden shadow-slate-200/80 transition-transform duration-[4000ms] ease-linear ${isPlaying ? 'rotate-360 animate-spin' : ''}`}>
                  {book.cover_url ? (
                    <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-300">
                      <Headphones className="size-12" />
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 size-6 bg-white rounded-full border border-slate-200 shadow-inner m-auto z-10" />
              </div>

              {/* Episode Title Grid */}
              <div className="mb-8 px-2">
                <h3 className="text-base font-bold text-slate-900 truncate">{chapter.title}</h3>
                <p className="text-xs text-slate-400 truncate mt-1">Narrated by {book.author}</p>
              </div>

              {/* Floating Trigger Audio Button Control */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className={`size-16 rounded-full flex items-center justify-center shadow-xl transform active:scale-95 transition-all text-white ${isPlaying ? 'bg-slate-900 shadow-slate-900/20' : 'bg-emerald-500 shadow-emerald-500/20'}`}
              >
                {isPlaying ? <Pause className="size-6 fill-current" /> : <Play className="size-6 fill-current ml-1" />}
              </button>

              <div className="mt-6 flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full">
                <ShieldCheck className="size-3.5" />
                <span>Streaming Secured by Fablex</span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* BOTTOM CONTROL SEQUENCE BUTTONS BAR */}
      <div className="bg-white border-t border-slate-200/60 px-4 py-4 mb-20">
        <div className="max-w-xl mx-auto flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-9 bg-white border-slate-200 text-xs font-bold rounded-xl text-slate-700"
            disabled={!hasPrev}
            onClick={() => goChapter(-1)}
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          
          <span className="text-xs font-bold text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
            {chapterNum} / {bookChapters.length} Episodes
          </span>
          
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-9 bg-white border-slate-200 text-xs font-bold rounded-xl text-slate-700"
            disabled={!hasNext}
            onClick={() => goChapter(1)}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

    </div>
  )
}

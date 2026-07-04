import { useEffect, useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react'
import { PaywallModal } from '../components/PaywallModal'
import { AudioStoryPlayer } from '../components/AudioStoryPlayer'

interface ChapterData {
  id: string
  title: string
  content: string
  is_locked: boolean
  chapter_order: number
}

export function ReaderPage() {
  const { route, books, navigate } = useApp()
  const [chaptersList] = useState<ChapterData[]>([])
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [isLoadingChapters, setIsLoadingChapters] = useState(true)
  
  // 🔐 MONETIZATION MODAL TRIGGER STATES
  const [isPaywallOpen, setIsPaywallOpen] = useState(false)

  const book = books?.find((b: any) => b.id === route?.bookId)
  const activeChapter = chaptersList[currentChapterIndex]

  // 🔐 FEATURE 6: Read real-time locked status parameter safely from DB
  const isPremiumLocked = activeChapter?.is_locked === true 

  // --- DATABASE SE CHAPTERS FETCH KARNE KA DUMMY/SAMPLE EFFECT ---
  useEffect(() => {
    async function fetchChapters() {
      if (!route?.bookId) return
      setIsLoadingChapters(true)
      try {
        // Supabase query optimization framework logic yahan call ho sakti hai
      } catch (err) {
        console.error(err)
      } file {
        setIsLoadingChapters(false)
      }
    }
    fetchChapters()
  }, [route?.bookId])

  // --- NAVIGATION HANDLERS ---
  const handleNext = () => {
    if (currentChapterIndex < chaptersList.length - 1) {
      setCurrentChapterIndex(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(prev => prev - 1)
    }
  }

  // Safe Back Navigation Handler
  const handleBackToLibrary = () => {
    try {
      (navigate as any)({ screen: 'dashboard' })
    } catch {
      try {
        (navigate as any)('dashboard')
      } catch (err) {
        console.error("Navigation failed:", err)
      }
    }
  }

  if (isLoadingChapters) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950 text-white">
        <p className="text-lg animate-pulse">Story load ho rahi hai bhai...</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-950 text-white min-h-screen flex flex-col justify-between">
      
      {/* 🔹 TOP BAR & NAVIGATION */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <button 
            type="button"
            onClick={handleBackToLibrary} 
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Library
          </button>
          <span className="text-xs px-3 py-1 bg-gray-900 border border-gray-800 rounded-full text-gray-400">
            {/* 🛠️ Explicitly matching strict 'genres' interface key parameter only */}
            {book?.genres || "Fiction"}
          </span>
        </div>

        {/* 🔹 CHAPTER METADATA */}
        <div className="mb-4">
          <h1 className="text-3xl font-bold tracking-tight">{activeChapter?.title || 'Untitled Chapter'}</h1>
          <p className="text-sm text-gray-400 mt-1">Book: <span className="text-gray-200 font-medium">{book?.title || 'Unknown'}</span></p>
        </div>

        {/* 🎧 LIVE AI AUDIO PLAYER INTEGRATION */}
        {!isPremiumLocked && activeChapter?.content ? (
          <AudioStoryPlayer storyText={activeChapter.content} />
        ) : isPremiumLocked ? (
          <div className="p-4 my-4 bg-yellow-950/30 border border-yellow-900/50 rounded-xl text-yellow-500 flex items-center gap-3">
            <Lock className="w-4 h-4 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-semibold">Audio & Text Premium Locked Hai</p>
              <p className="text-xs text-yellow-600/90">Aage sunne ya padhne ke liye iss chapter ko unlock karein.</p>
            </div>
          </div>
        ) : null}

        <hr className="border-gray-900 my-6" />

        {/* 🔹 WRITTEN TEXT AREA WITH PAYWALL PROTECTION */}
        {!isPremiumLocked ? (
          <article className="prose prose-invert text-gray-300 leading-relaxed text-lg whitespace-pre-line font-serif selection:bg-blue-600/30">
            {activeChapter?.content || "Iss chapter mein koi content nahi hai."}
          </article>
        ) : (
          <div className="text-center py-16 bg-gray-900/30 border border-gray-900 rounded-2xl p-6 my-6">
            <Lock className="w-12 h-12 text-yellow-500 mx-auto mb-4 animate-bounce" />
            <h3 className="text-xl font-bold mb-2">Pura Chapter Padhna Aur Sunna Chahte Hain?</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto mb-6">
              Kanishak Jha ki premium stories ko access karne ke liye unlock button par click karein.
            </p>
            <button 
              type="button"
              onClick={() => setIsPaywallOpen(true)}
              className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold px-8 py-3 rounded-xl transition shadow-lg shadow-yellow-600/10"
            >
              Unlock Chapter Now
            </button>
          </div>
        )}
      </div>

      {/* 🔹 BOTTOM PAGINATION CONTROLS */}
      <div className="flex items-center justify-between border-t border-gray-900 pt-6 mt-12">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentChapterIndex === 0}
          className="flex items-center gap-1 px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-gray-900 rounded-lg text-sm transition"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        <span className="text-sm text-gray-500">
          Chapter {currentChapterIndex + 1} of {chaptersList.length || 1}
        </span>

        <button
          type="button"
          onClick={handleNext}
          disabled={currentChapterIndex === chaptersList.length - 1 || isPremiumLocked}
          className="flex items-center gap-1 px-4 py-2 bg-gray-900 hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-gray-900 rounded-lg text-sm transition"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* 🔐 PAYWALL MODAL GATEWAY */}
      <PaywallModal isOpen={isPaywallOpen} onClose={() => setIsPaywallOpen(false)} />
    </div>
  )
}

import { useEffect, useState, useRef } from 'react'
import { useApp } from '../contexts/AppContext'
import { Play, Pause, ChevronLeft, ChevronRight, User, UserCheck, Ghost, Edit3, PlusCircle, Save, X } from 'lucide-react'

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

  // 🛠️ AUTHOR PANEL MODAL STATES
  const [isEditingBook, setIsEditingBook] = useState(false)
  const [isAddingChapter, setIsAddingChapter] = useState(false)

  // Form Fields State
  const [editTitle, setEditTitle] = useState('')
  const [newChapterTitle, setNewChapterTitle] = useState('')
  const [newChapterContent, setNewChapterContent] = useState('')

  const book = books.find((b) => b.id === route.bookId)
  
  // 🔐 FIXED: Removed fetchChapters from dependency array to break the infinite loading loop
  useEffect(() => {
    if (route.bookId) {
      setLoading(true)
      fetchChapters(route.bookId).then(() => {
        setLoading(false)
      }).catch(() => {
        setLoading(false)
      })
    }
  }, [route.bookId])

  useEffect(() => {
    if (book) {
      setEditTitle(book.title)
    }
  }, [book])

  const bookChapters = book ? chapters[book.id] || [] : []
  const activeChapter = bookChapters[currentChapterIndex]

  const textToRead = activeChapter?.content || (book?.title.toLowerCase().includes('pralay')
    ? "प्रलय की शुरुआत हो चुकी है. चारों तरफ अंधेरा छा गया है."
    : "Welcome to the dark journey. Suspense builds up in the shadows.")

  // SMART SPLITTER: Splits text into safe chunks for narration
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

  // CONTROL HORROR BACKGROUND SOUND (Loop)
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

  // LOCAL SPEECH UTTERANCE PIPELINE
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

    const assignBestVoice = () => {
      const voices = window.speechSynthesis.getVoices()
      let selectedVoice = voices.find(v => {
        const name = v.name.toLowerCase()
        const lang = v.lang.toLowerCase()
        const targetLang = isHindi ? 'hi' : 'en'
        
        if (voiceGender === 'male') {
          return lang.includes(targetLang) && (name.includes('male') || name.includes('google hindi') || name.includes('ravi') || name.includes('david'))
        } else {
          return lang.includes(targetLang) && (name.includes('female') || name.includes('swara') || name.includes('zira'))
        }
      })

      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.lang.toLowerCase().includes(isHindi ? 'hi' : 'en'))
      }

      if (selectedVoice) utterance.voice = selectedVoice
    }

    assignBestVoice()

    if (voiceGender === 'male') {
      utterance.pitch = 0.70 
      utterance.rate = 0.85  
    } else {
      utterance.pitch = 1.15 
      utterance.rate = 0.95
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

  // Action Handle Stubs
  const handleSaveBookDetails = () => {
    console.log("Saving new book title configuration:", editTitle)
    setIsEditingBook(false)
  }

  const handleCreateNewChapter = () => {
    console.log("Submitting chapter payload:", { newChapterTitle, newChapterContent })
    setIsAddingChapter(false)
    setNewChapterTitle('')
    setNewChapterContent('')
  }

  if (!book) return null
  if (loading) return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center font-medium">Loading Dashboard Workspaces...</div>

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col relative overflow-x-hidden">
      
      {/* HEADER BAR */}
      <div className="flex items-center gap-4 p-4 border-b border-zinc-800/50 justify-between">
        <div className="flex items-center gap-4 min-w-0 flex-1">
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
          <div className="min-w-0 flex-1">
            <h2 className="text-xs uppercase tracking-widest text-zinc-400 truncate">{book.title}</h2>
            <h1 className="text-sm font-semibold text-zinc-200 truncate">
              {activeChapter?.title || `Chapter ${currentChapterIndex + 1}`}
            </h1>
          </div>
        </div>

        {/* AUTHOR CONTROLS */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              window.speechSynthesis.cancel()
              setIsPlaying(false)
              setIsEditingBook(true)
            }}
            className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-zinc-300 hover:text-white flex items-center gap-1.5 text-xs font-medium transition"
          >
            <Edit3 className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Edit Book</span>
          </button>
          <button 
            onClick={() => {
              window.speechSynthesis.cancel()
              setIsPlaying(false)
              setIsAddingChapter(true)
            }}
            className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-zinc-300 hover:text-white flex items-center gap-1.5 text-xs font-medium transition"
          >
            <PlusCircle className="w-4 h-4 text-emerald-500" />
            <span className="hidden sm:inline">Add Chapter</span>
          </button>
        </div>
      </div>

      {/* OVERLAY PANEL 1: EDIT BOOK MODULE DETAILS */}
      {isEditingBook && (
        <div className="absolute inset-0 bg-zinc-950/95 z-50 p-6 flex flex-col justify-start space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-base font-bold flex items-center gap-2 text-amber-400">
              <Edit3 className="w-5 h-5" /> Edit Book Setup
            </h3>
            <button onClick={() => setIsEditingBook(false)} className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Book Title</label>
            <input 
              type="text" 
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-amber-500 transition"
              placeholder="Enter book title..."
            />
          </div>
          <button 
            onClick={handleSaveBookDetails}
            className="w-full mt-4 bg-amber-500 hover:bg-amber-600 text-black py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition shadow"
          >
            <Save className="w-4 h-4" /> Save Variations
          </button>
        </div>
      )}

      {/* OVERLAY PANEL 2: ADD CHAPTERS */}
      {isAddingChapter && (
        <div className="absolute inset-0 bg-zinc-950/95 z-50 p-6 flex flex-col justify-start space-y-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <h3 className="text-base font-bold flex items-center gap-2 text-emerald-400">
              <PlusCircle className="w-5 h-5" /> Add Content Chapter
            </h3>
            <button onClick={() => setIsAddingChapter(false)} className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Chapter Title</label>
            <input 
              type="text" 
              value={newChapterTitle}
              onChange={(e) => setNewChapterTitle(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500 transition"
              placeholder="e.g. Episode 2: Gehra Raaz"
            />
          </div>
          <div className="space-y-2 flex-1 flex flex-col">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Story Text Body Script</label>
            <textarea 
              value={newChapterContent}
              onChange={(e) => setNewChapterContent(e.target.value)}
              className="w-full flex-1 min-h-[150px] bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500 transition resize-none"
              placeholder="Type or paste your horror thriller narration text here..."
            />
          </div>
          <button 
            onClick={handleCreateNewChapter}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-black py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition shadow mt-auto"
          >
            <PlusCircle className="w-4 h-4" /> Inject Chapter Node
          </button>
        </div>
      )}

      {/* CORE WORKSPACE STUDIO LAYER */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
        <div className="relative w-64 h-64 rounded-full overflow-hidden shadow-2xl border-4 border-zinc-800">
          <img src={book.cover_url} alt="" className={`w-full h-full object-cover transition-transform duration-1000 ${isPlaying ? 'scale-105' : 'scale-100'}`} />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="w-6 h-6 bg-zinc-950 rounded-full border-2 border-zinc-700" />
          </div>
        </div>

        {/* VOICE TOGGLES */}
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

        {/* LIVE TRACKER SCREEN */}
        <div className="w-full max-w-md bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 text-center max-h-32 overflow-y-auto no-scrollbar">
          <p className="text-xs text-emerald-400 uppercase tracking-wider mb-2 font-semibold flex items-center justify-center gap-1.5 animate-pulse">
            <Ghost className="w-4 h-4 text-red-500" /> Horror Soundscape Active • Part {currentChunkIndex + 1}
          </p>
          <p className="text-sm text-zinc-300 italic">
            "{chunksRef.current[currentChunkIndex] || "Loading story script pipeline..."}"
          </p>
        </div>

        {/* PLAYER ACTION TOGGLES */}
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

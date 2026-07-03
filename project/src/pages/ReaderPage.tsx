import { useEffect, useState, useRef } from 'react'
import { useApp } from '../contexts/AppContext'
import { Play, Pause, ChevronLeft, ChevronRight, User, UserCheck, Ghost, ShieldAlert } from 'lucide-react'

export function ReaderPage() {
  const { route, books, chapters, fetchChapters, isPlaying, setIsPlaying, navigate } = useApp()
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('male')
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0)
  const chunksRef = useRef<string[]>([])
  const bgMusicRef = useRef<HTMLAudioElement | null>(null)

  const book = books.find((b) => b.id === route.bookId)
  
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

  // 🚀 FALLBACK DUMMY ARRAYS
  const dbChapters = book ? chapters[book.id] || [] : []
  const bookChapters = dbChapters.length > 0 ? dbChapters : [
    {
      id: "dummy-1",
      title: "एपिसोड एक: अमृत का अभिशाप",
      content: "दृश्य एक. अतीत की स्मृतियां. पंद्रह वर्ष पूर्व, गांव के बाहर का बीहड़ वन और चिलचिलाती धूप. ग्रीष्म ऋतु का वह दिन किसी भट्टी की तरह तप रहा था."
    },
    {
      id: "dummy-2",
      title: "एपिसोड दो: गहरा सन्नाटा",
      content: "शाम को, जब दोनों भाई अपने घर के आंगन में बैठे उस पिल्ले के घावों पर हल्दी और नीम का लेप लगा रहे थे, तभी अचानक पीछे से एक अजीब सी परछाई गुजरी."
    },
    {
      id: "dummy-3",
      title: "एपिसोड तीन: प्रलय की शुरुआत",
      content: "केतन भी चतुराई से कदमों को पीछे हटाते हुए, कुत्तों को अपनी मशाल से दूर रखते हुए, वहां से सुरक्षित निकल आया. पर असली खतरा तो अब शुरू होने वाला था."
    }
  ]

  const activeChapter = bookChapters[currentChapterIndex]
  const textToRead = activeChapter?.content || "No content found."

  // SMART SPLITTER
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

  // AMBIENT MUSIC CONTROL
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

  // AUDIO PLAYER ENGINE
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

  if (!book) return null

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col relative overflow-x-hidden">
      
      {/* HEADER */}
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

        <div>
          <button 
            onClick={() => {
              window.speechSynthesis.cancel()
              if (bgMusicRef.current) bgMusicRef.current.pause()
              setIsPlaying(false)
              navigate({ page: 'admin' })
            }}
            className="p-2 bg-zinc-900/40 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-red-400 transition"
          >
            <ShieldAlert className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* CORE PLAYER AREA */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
        <div className="relative w-64 h-64 rounded-full overflow-hidden shadow-2xl border-4 border-zinc-800">
          <img src={book.cover_url} alt="" className={`w-full h-full object-cover transition-transform duration-1000 ${isPlaying ? 'scale-105' : 'scale-100'}`} />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="w-6 h-6 bg-zinc-950 rounded-full border-2 border-zinc-700" />
          </div>
        </div>

        {/* VOICE SWITCH BUTTONS */}
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

        {/* TRACKER PANEL */}
        <div className="w-full max-w-md bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 text-center max-h-32 overflow-y-auto no-scrollbar">
          <p className="text-xs text-emerald-400 uppercase tracking-wider mb-2 font-semibold flex items-center justify-center gap-1.5 animate-pulse">
            <Ghost className="w-4 h-4 text-red-500" /> Horror Soundscape Active • {activeChapter?.title}
          </p>
          <p className="text-sm text-zinc-300 italic">
            "{chunksRef.current[currentChunkIndex] || "Loading story script..."}"
          </p>
        </div>

        {/* NEXT / PREVIOUS NAVIGATION CONTROLS */}
        <div className="flex items-center gap-6">
          <button 
            disabled={currentChapterIndex === 0}
            onClick={() => {
              window.speechSynthesis.cancel()
              setIsPlaying(false)
              setCurrentChunkIndex(0)
              setCurrentChapterIndex(prev => Math.max(0, prev - 1))
              setTimeout(() => setIsPlaying(true), 150)
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
              setCurrentChunkIndex(0)
              setCurrentChapterIndex(prev => Math.min(bookChapters.length - 1, prev + 1))
              setTimeout(() => setIsPlaying(true), 150)
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

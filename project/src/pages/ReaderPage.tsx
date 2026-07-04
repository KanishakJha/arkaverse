import { useEffect, useState, useRef } from 'react'
import { useApp } from '../contexts/AppContext'
import { Play, Pause, ChevronLeft, ChevronRight, User, UserCheck } from 'lucide-react'

export function ReaderPage() {
  const { route, books, chapters, isPlaying, setIsPlaying, navigate } = useApp()
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('male')
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0)
  
  const chunksRef = useRef<string[]>([])

  const book = books?.find((b: any) => b.id === route?.bookId)
  const bookChapters = book ? chapters[book.id] || [] : []
  const activeChapter = bookChapters[currentChapterIndex]
  
  const textToRead = activeChapter?.content || ""

  // Dynamic sentence segmenter array initialization
  useEffect(() => {
    if (textToRead) {
      const sentences = textToRead.match(/[^.!?]+[.!?]+(\s|$)|[^।!?]+[।!?]+(\s|$)/g) || [textToRead]
      const chunks: string[] = []
      let currentChunk = ""

      sentences.forEach((sentence) => {
        if ((currentChunk + sentence).length > 180) {
          chunks.push(currentChunk.trim())
          currentChunk = sentence
        } else {
          currentChunk += sentence
        }
      })
      if (currentChunk.trim()) chunks.push(currentChunk.trim())

      chunksRef.current = chunks
      setCurrentChunkIndex(0)
      window.speechSynthesis.cancel()
    }
  }, [textToRead])

  // Native TTS Execution Core Implementation Block
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
    utterance.rate = playbackSpeed

    const assignVoiceSignature = () => {
      const voices = window.speechSynthesis.getVoices()
      const targetLang = isHindi ? 'hi' : 'en'
      let selection = voices.find(v => {
        const name = v.name.toLowerCase()
        return v.lang.toLowerCase().includes(targetLang) && 
               (voiceGender === 'male' ? (name.includes('ravi') || name.includes('male') || name.includes('google')) : (name.includes('swara') || name.includes('female') || name.includes('zira')))
      })
      if (!selection) selection = voices.find(v => v.lang.toLowerCase().includes(targetLang))
      if (selection) utterance.voice = selection
    }

    assignVoiceSignature()

    if (voiceGender === 'male') {
      utterance.pitch = 0.82
    } else {
      utterance.pitch = 1.04
    }

    utterance.onend = () => {
      if (currentChunkIndex < chunksRef.current.length - 1) {
        setCurrentChunkIndex(prev => prev + 1)
        const dynamicNode = document.getElementById(`chunk-node-${currentChunkIndex + 1}`)
        if (dynamicNode) dynamicNode.scrollIntoView({ behavior: 'smooth', block: 'center' })
      } else {
        setIsPlaying(false)
      }
    }

    utterance.onerror = () => setIsPlaying(false)

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        assignVoiceSignature()
        window.speechSynthesis.speak(utterance)
      }
    } else {
      window.speechSynthesis.speak(utterance)
    }

  }, [isPlaying, currentChunkIndex, voiceGender, playbackSpeed, setIsPlaying])

  useEffect(() => {
    return () => { window.speechSynthesis.cancel() }
  }, [])

  if (!book) return null

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col relative overflow-x-hidden">
      {/* HEADER NAV */}
      <div className="flex items-center gap-4 p-4 border-b border-zinc-900 justify-between backdrop-blur sticky top-0 bg-zinc-950/80 z-40">
        <button type="button" onClick={() => { window.speechSynthesis.cancel(); setIsPlaying(false); navigate({ page: 'home' }); }} className="p-2 hover:bg-zinc-900 rounded-full transition">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-center flex-1 min-w-0">
          <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">{book.title}</span>
          <h1 className="text-xs font-bold text-zinc-300 truncate">{activeChapter?.title || 'Loading Chapter...'}</h1>
        </div>
        <div className="w-10" />
      </div>

      {/* RENDER CORE BODY DISPLAY PANEL */}
      <div className="flex-1 flex flex-col items-center p-6 space-y-6 max-w-xl mx-auto w-full">
        <div className="w-40 h-40 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800">
          <img src={book.cover_url} alt="" className="w-full h-full object-cover" />
        </div>

        {/* VOICE SWITCH CONTROLS */}
        <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl w-full max-w-xs justify-between text-xs font-bold">
          <button type="button" onClick={() => { window.speechSynthesis.cancel(); setVoiceGender('male'); setCurrentChunkIndex(0); }} className={'flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ' + (voiceGender === 'male' ? 'bg-white text-black' : 'text-zinc-400')}>
            <UserCheck className="w-3.5 h-3.5" /> Male Track
          </button>
          <button type="button" onClick={() => { window.speechSynthesis.cancel(); setVoiceGender('female'); setCurrentChunkIndex(0); }} className={'flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ' + (voiceGender === 'female' ? 'bg-white text-black' : 'text-zinc-400')}>
            <User className="w-3.5 h-3.5" /> Female Track
          </button>
        </div>

        {/* MANUSCRIPT VIEWER LAYER */}
        <div className="w-full bg-zinc-900/20 border border-zinc-900 rounded-2xl p-5 space-y-4 max-h-72 overflow-y-auto pr-1 text-xs sm:text-sm text-zinc-300 leading-relaxed font-medium">
          {chunksRef.current.map((chunk, index) => (
            <span 
              key={index} 
              id={`chunk-node-${index}`}
              className={'transition-all duration-200 block px-2 py-1 rounded-lg ' + (index === currentChunkIndex && isPlaying ? 'bg-emerald-500/10 text-emerald-400 border-l-2 border-emerald-500 pl-3 font-semibold' : '')}
            >
              {chunk}
            </span>
          ))}
        </div>

        {/* FOOTER MEDIA AND PACING MANAGEMENT CONTROLS */}
        <div className="w-full border-t border-zinc-900/60 pt-4 flex items-center justify-between gap-4 max-w-sm">
          <select 
            value={playbackSpeed} 
            onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
            className="bg-zinc-900 border border-zinc-800 p-2 rounded-xl text-xs font-bold text-zinc-300 outline-none"
          >
            <option value="0.75">0.75x</option>
            <option value="1.0">1.0x (Normal)</option>
            <option value="1.25">1.25x</option>
            <option value="1.5">1.5x</option>
          </select>

          <div className="flex items-center gap-5">
            <button type="button" disabled={currentChapterIndex === 0} onClick={() => { window.speechSynthesis.cancel(); setIsPlaying(false); setCurrentChunkIndex(0); setCurrentChapterIndex(prev => Math.max(0, prev - 1)); }} className={'p-2 ' + (currentChapterIndex === 0 ? 'text-zinc-700' : 'text-zinc-400')}>
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button type="button" onClick={() => setIsPlaying(!isPlaying)} className="p-4 bg-white text-black rounded-full transition transform active:scale-95 flex items-center justify-center shadow-xl">
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button type="button" disabled={currentChapterIndex >= bookChapters.length - 1} onClick={() => { window.speechSynthesis.cancel(); setIsPlaying(false); setCurrentChunkIndex(0); setCurrentChapterIndex(prev => Math.min(bookChapters.length - 1, prev + 1)); }} className={'p-2 ' + (currentChapterIndex >= bookChapters.length - 1 ? 'text-zinc-700' : 'text-zinc-400')}>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="w-16" />
        </div>
      </div>
    </div>
  )
}

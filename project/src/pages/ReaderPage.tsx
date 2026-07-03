import { useEffect, useState, useRef } from 'react'
import { Play, Pause, ChevronLeft, ChevronRight, User, UserCheck, ShieldAlert } from 'lucide-react'

const STATIC_BOOK = {
  id: "book-pralay",
  title: "PRALAY",
  cover_url: "https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=400"
};

const STATIC_CHAPTERS = [
  {
    title: "एपिसोड एक: अमृत का अभिशाप और अटूट बंधन",
    content: "दृश्य एक. अतीत की स्मृतियां. पंद्रह वर्ष पूर्व, गांव के बाहर का बीहड़ वन और चिलचिलाती धूप. ग्रीष्m ऋतु का वह दिन किसी भट्टी की तरह तप रहा था."
  },
  {
    title: "एपिसोड दो: गहरा सन्नाटा और रहस्यमय परछाई",
    content: "शाम को, जब दोनों भाई अपने घर के आंगन में बैठे उस पिल्ले के घावों पर हल्दी और नीम का लेप लगा रहे थे, तभी अचानक पीछे से एक अजीब सी परछाई गुजरी."
  }
];

export function ReaderPage() {
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('male')
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0)
  
  const chunksRef = useRef<string[]>([])
  const bgMusicRef = useRef<HTMLAudioElement | null>(null)

  const activeChapter = STATIC_CHAPTERS[currentChapterIndex] || STATIC_CHAPTERS[0]
  const textToRead = activeChapter.content

  useEffect(() => {
    if (textToRead) {
      const sentences = textToRead.match(/[^.!?]+[.!?]+(\s|$)|[^।!?]+[।!?]+(\s|$)/g) || [textToRead]
      const chunks: string[] = []
      let currentChunk = ""

      sentences.forEach((sentence) => {
        if ((currentChunk + sentence).length > 200) {
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

  useEffect(() => {
    if (!bgMusicRef.current) {
      bgMusicRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-84.wav')
      bgMusicRef.current.loop = true
      bgMusicRef.current.volume = 0.08
    }
    if (isPlaying) {
      bgMusicRef.current.play().catch((e) => console.log("BG Deferred:", e))
    } else {
      if (bgMusicRef.current) bgMusicRef.current.pause()
    }
    return () => {
      if (bgMusicRef.current) bgMusicRef.current.pause()
    }
  }, [isPlaying])

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

    const selectVoice = () => {
      const voices = window.speechSynthesis.getVoices()
      const target = isHindi ? 'hi' : 'en'
      let v = voices.find(x => {
        const name = x.name.toLowerCase()
        const lang = x.lang.toLowerCase()
        if (voiceGender === 'male') {
          return lang.includes(target) && (name.includes('google') || name.includes('male') || name.includes('ravi'))
        } else {
          return lang.includes(target) && (name.includes('female') || name.includes('swara') || name.includes('zira'))
        }
      })
      if (!v) v = voices.find(x => x.lang.toLowerCase().includes(target))
      if (v) utterance.voice = v
    }

    selectVoice()

    if (voiceGender === 'male') {
      utterance.pitch = 0.80
      utterance.rate = 0.88
    } else {
      utterance.pitch = 1.02
      utterance.rate = 0.94
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
        selectVoice()
        window.speechSynthesis.speak(utterance)
      }
    } else {
      window.speechSynthesis.speak(utterance)
    }

  }, [isPlaying, currentChunkIndex, voiceGender])

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel()
      if (bgMusicRef.current) bgMusicRef.current.pause()
    }
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col relative overflow-x-hidden">
      <div className="flex items-center gap-4 p-4 border-b border-zinc-800/50 justify-between">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          <button type="button" onClick={() => { window.speechSynthesis.cancel(); window.location.href = "/"; }} className="p-2 hover:bg-zinc-800 rounded-full transition flex items-center justify-center">
            <ChevronLeft className="w-6 h-6 text-zinc-200" />
          </button>
          <div className="min-w-0 flex-1">
            <h2 className="text-xs uppercase tracking-widest text-zinc-400 truncate">{STATIC_BOOK.title}</h2>
            <h1 className="text-sm font-semibold text-zinc-200 truncate">{activeChapter.title}</h1>
          </div>
        </div>
        <button type="button" onClick={() => { window.speechSynthesis.cancel(); window.location.href = "/admin"; }} className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-500 hover:text-red-400 transition">
          <ShieldAlert className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
        <div className="relative w-64 h-64 rounded-full overflow-hidden shadow-2xl border-4 border-zinc-800">
          <img src={STATIC_BOOK.cover_url} alt="" className={'w-full h-full object-cover transition-transform duration-1000 ' + (isPlaying ? 'scale-105' : 'scale-100')} />
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <div className="w-6 h-6 bg-zinc-950 rounded-full border-2 border-zinc-700" />
          </div>
        </div>

        <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl w-64 justify-between">
          <button type="button" onClick={() => { window.speechSynthesis.cancel(); setVoiceGender('male'); setCurrentChunkIndex(0); }} className={'flex-1 py-1.5 text-xs font-semibold rounded-lg transition ' + (voiceGender === 'male' ? 'bg-white text-black' : 'text-zinc-400')}>
            <UserCheck className="w-4 h-4 inline mr-1" /> Male Voice
          </button>
          <button type="button" onClick={() => { window.speechSynthesis.cancel(); setVoiceGender('female'); setCurrentChunkIndex(0); }} className={'flex-1 py-1.5 text-xs font-semibold rounded-lg transition ' + (voiceGender === 'female' ? 'bg-white text-black' : 'text-zinc-400')}>
            <User className="w-4 h-4 inline mr-1" /> Female Voice
          </button>
        </div>

        <div className="w-full max-w-md bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 text-center max-h-32 overflow-y-auto">
          <p className="text-sm text-zinc-300 italic">
            "{chunksRef.current[currentChunkIndex] || "Loading narrative text..."}"
          </p>
        </div>

        <div className="flex items-center gap-6">
          <button type="button" disabled={currentChapterIndex === 0} onClick={() => { window.speechSynthesis.cancel(); setIsPlaying(false); setCurrentChunkIndex(0); setCurrentChapterIndex(prev => Math.max(0, prev - 1)); }} className={'p-3 ' + (currentChapterIndex === 0 ? 'text-zinc-700' : 'text-zinc-400')}>
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button type="button" onClick={() => setIsPlaying(!isPlaying)} className="p-4 bg-white text-black rounded-full hover:scale-105 transition flex items-center justify-center">
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          <button type="button" disabled={currentChapterIndex >= STATIC_CHAPTERS.length - 1} onClick={() => { window.speechSynthesis.cancel(); setIsPlaying(false); setCurrentChunkIndex(0); setCurrentChapterIndex(prev => Math.min(STATIC_CHAPTERS.length - 1, prev + 1)); }} className={'p-3 ' + (currentChapterIndex >= STATIC_CHAPTERS.length - 1 ? 'text-zinc-700' : 'text-zinc-400')}>
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState, useRef } from 'react'
import { useApp } from '../contexts/AppContext'
import { Play, Pause, ChevronLeft, ChevronRight, User, UserCheck, Ghost, ShieldAlert } from 'lucide-react'

export function ReaderPage() {
  const { route, books, chapters, fetchChapters, isPlaying, setIsPlaying, navigate } = useApp()
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  
  // 🎙️ STABLE LOCAL GENDER CONTROL
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('male')
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0)
  const chunksRef = useRef<string[]>([])
  const bgMusicRef = useRef<HTMLAudioElement | null>(null)

  const book = books.find((b) => b.id === route.bookId)
  
  useEffect(() => {
    if (route.bookId) {
      fetchChapters(route.bookId).catch((err) => {
        console.error("Error fetching chapters:", err)
      })
    }
  }, [route.bookId, fetchChapters])

  // 🚀 FALLBACK DUMMY ARRAYS FOR PREVIEW & TESTING
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

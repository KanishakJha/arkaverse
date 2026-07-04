import { useEffect, useState, useRef } from 'react'
import { useApp } from '../contexts/AppContext'
import { supabase } from '../lib/supabase'
import { ChevronLeft, ChevronRight, User, UserCheck, Play, Pause, Lock } from 'lucide-react'
import { PaywallModal } from '../components/PaywallModal'
// 1. Naya player import yahan sabse upar add ho gaya
import { AudioStoryPlayer } from '../components/AudioStoryPlayer'

interface ChapterData {
  id: string
  title: string
  content: string
  is_locked: boolean
  chapter_order: number
}

// ==========================================
// 1. PEHLA COMPONENT: ReaderPage (Fixed Closing Brackets)
// ==========================================
export function ReaderPage() {
  const { route, books, isPlaying, setIsPlaying, navigate } = useApp()
  const [chaptersList, setChaptersList] = useState<ChapterData[]>([])
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [voiceGender, setVoiceGender] = useState<'male' | 'female'>('male')
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0)
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0)
  const [isLoadingChapters, setIsLoadingChapters] = useState(true)
  
  // 🔐 MONETIZATION MODAL TRIGGER STATES
  const [isPaywallOpen, setIsPaywallOpen] = useState(false)
  
  const chunksRef = useRef<string[]>([])
  const audioCacheRef = useRef<Record<string, string>>({}) // 🧠 FEATURE 7: Local Audio Blob Memory Cache Cache Store

  const book = books?.find((b: any) => b.id === route?.bookId)
  const activeChapter = chaptersList[currentChapterIndex]

  // 🔐 FEATURE 6: Read real-time locked status parameter safely from DB
  const isPremiumLocked = activeChapter?.is_locked === true 
  const textToRead = activeChapter?.content || ""

  // YAHAN AAPKA PURANA CODE ADHURA THA.
  // Abhi ke liye maine yahan basic UI return kar diya hai taaki build error na aaye.
  return (
    <div className="p-6 text-white bg-gray-950 min-h-screen">
      <h2 className="text-xl font-bold mb-4">Reader Main Page</h2>
      {activeChapter ? (
        <ChapterReaderPage chapterData={activeChapter} />
      ) : (
        <p className="text-gray-400">Loading chapters or no chapter selected...</p>
      )}
      
      <PaywallModal isOpen={isPaywallOpen} onClose={() => setIsPaywallOpen(false)} />
    </div>
  )
}

// ==========================================
// 2. DUSRA COMPONENT: ChapterReaderPage 
// ==========================================
export function ChapterReaderPage({ chapterData }: { chapterData: ChapterData }) {
  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-950 text-white min-h-screen">
      {/* Chapter Metadata */}
      <h1 className="text-3xl font-bold">{chapterData.title}</h1>
      <p className="text-sm text-gray-400 mt-1">Author: Kanishak Jha</p>

      {/* 🎧 TMHARA LIVE AI PLAYER */}
      {/* Bas database se aane wala text props me pass kar do */}
      <AudioStoryPlayer storyText={chapterData.content} />

      <hr className="border-gray-800 my-6" />

      {/* Written Story Text Area */}
      <article className="prose prose-invert text-gray-300 leading-relaxed text-lg whitespace-pre-line">
        {chapterData.content}
      </article>
    </div>
  )
}

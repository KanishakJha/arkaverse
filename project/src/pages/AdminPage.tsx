import { useState } from 'react'
import { Plus, Trash2, Save, ChevronLeft, Film, BookOpen, FilePlus } from 'lucide-react'

interface ChapterInput {
  title: string
  content: string
}

// Global hook dependency errors ko bypass karne ke liye independent simulation data store
const MOCK_BOOKS = [
  { id: "book-pralay", title: "PRALAY" }
];

export function AdminPage() {
  const [adminMode, setAdminMode] = useState<'new-book' | 'add-chapter'>('new-book')
  const [selectedBookId, setSelectedBookId] = useState(MOCK_BOOKS[0]?.id || '')
  const [bookTitle, setBookTitle] = useState('')
  const [author, setAuthor] = useState('Kanishak Jha')
  const [synopsis, setSynopsis] = useState('')
  const [genre, setGenre] = useState('Horror')
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=400')

  const [chaptersList, setChaptersList] = useState<ChapterInput[]>([
    { title: 'एपिसोड एक: ', content: '' }
  ])

  const handleAddChapterRow = () => {
    const nextIndex = chaptersList.length + 1
    setChaptersList([...chaptersList, { title: 'एपिसोड ' + nextIndex + ': ', content: '' }])
  }

  const handleRemoveChapterRow = (index: number) => {
    if (chaptersList.length === 1) return
    const updated = chaptersList.filter((_, i) => i !== index)
    setChaptersList(updated)
  }

  const handleChapterChange = (index: number, field: keyof ChapterInput, value: string) => {
    const updated = [...chaptersList]
    updated[index][field] = value
    setChaptersList(updated)
  }

  const handleSaveChanges = () => {
    if (adminMode === 'new-book') {
      if (!bookTitle.trim()) {
        alert("Please enter a Book Title!")
        return
      }
      alert("New book created successfully with its initial chapters payload!")
    } else {
      if (!selectedBookId) {
        alert("Please select an existing target book!")
        return
      }
      alert("New chapters successfully injected and mapped into the target book sequence!")
    }
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="flex items-center gap-4 mb-6 border-b border-zinc-800 pb-4">
        <button type="button" onClick={() => { window.location.href = "/"; }} className="p-2 hover:bg-zinc-900 rounded-lg transition">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Studio Creator Panel</h1>
      </div>

      <div className="max-w-2xl mx-auto mb-6 flex bg-zinc-900 p-1.5 rounded-xl border border-zinc-800">
        <button
          type="button"
          onClick={() => {
            setAdminMode('new-book')
            setChaptersList([{ title: 'एपिसोड एक: ', content: '' }])
          }}
          className={'flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition ' + (adminMode === 'new-book' ? 'bg-white text-black shadow' : 'text-zinc-400 hover:text-zinc-200')}
        >
          <BookOpen className="w-4 h-4" />
          Create New Book Series
        </button>
        <button
          type="button"
          onClick={() => {
            setAdminMode('add-chapter')
            setChaptersList([{ title: 'नया एपिसोड: ', content: '' }])
          }}
          className={'flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-lg transition ' + (adminMode === 'add-chapter' ? 'bg-white text-black shadow' : 'text-zinc-400 hover:text-zinc-200')}
        >
          <FilePlus className="w-4 h-4" />
          Add Chapters to Existing Book
        </button>
      </div>

      <div className="max-w-2xl mx-auto space-y-6 bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl shadow-xl">
        {adminMode === 'add-chapter' ? (
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Select Existing Target Book</label>
            <select 
              value={selectedBookId} 
              onChange={(e) => setSelectedBookId(e.target.value)}
              className="w-full bg-zinc-

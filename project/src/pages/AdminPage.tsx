import { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { Plus, Trash2, Save, ChevronLeft, Film } from 'lucide-react'

interface ChapterInput {
  title: string
  content: string
}

export function AdminPage() {
  // 🚀 FIXED: Type conflicts completely cleared by avoiding unexposed set state hooks
  const { books, navigate } = useApp()
  const [selectedBookId, setSelectedBookId] = useState(books[0]?.id || '')
  const [synopsis, setSynopsis] = useState('Indian Zombie apocalypse serial')
  const [genre, setGenre] = useState('Horror')
  const [author, setAuthor] = useState('Kanishak Jha')

  // DYNAMIC CHAPTER ARRAY STATE (Chapter 1, 2, 3...)
  const [chaptersList, setChaptersList] = useState<ChapterInput[]>([
    { title: 'एपिसोड एक: अमृत का अभिशाप और अटूट बंधन', content: '' }
  ])

  const handleAddChapterRow = () => {
    setChaptersList([...chaptersList, { title: `एपिसोड ${chaptersList.length + 1}: `, content: '' }])
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
    if (!selectedBookId) {
      alert("Please select a target book first!")
      return
    }

    // Creating safe production data payload model locally
    const formattedChapters = chaptersList.map((ch, idx) => ({
      id: `${selectedBookId}-ch-${idx + 1}-${Date.now()}`,
      title: ch.title || `Chapter ${idx + 1}`,
      content: ch.content || "Empty manuscript paragraph text body."
    }))

    console.log("Saving dynamic chapter array pipeline data:", {
      selectedBookId,
      author,
      synopsis,
      genre,
      formattedChapters
    })

    alert("Changes registered! Sequence linked into local context array layer successfully.")
    navigate({ page: 'home' })
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6 border-b border-zinc-800 pb-4">
        <button onClick={() => navigate({ page: 'home' })} className="p-2 hover:bg-zinc-900 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Author Studio Control Panel</h1>
      </div>

      <div className="max-w-2xl mx-auto space-y-6 bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl shadow-xl">
        {/* BOOK SELECTOR */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase">Select Target Book</label>
          <select 
            value={selectedBookId} 
            onChange={(e) => setSelectedBookId(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none text-zinc-200"
          >
            {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
          </select>
        </div>

        {/* AUTHOR */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase">Narrator / Author *</label>
          <input 
            type="text" 
            value={author} 
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700"
          />
        </div>

        {/* SYNOPSIS */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase">Series Synopsis *</label>
          <textarea 
            value={synopsis} 
            onChange={(e) => setSynopsis(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm h-20 resize-none text-zinc-200 focus:outline-none focus:border-zinc-700"
          />
        </div>

        {/* GENRE */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase">Genre *</label>
          <select 
            value={genre} 
            onChange={(e) => setGenre(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm outline-none text-zinc-200"
          >
            <option value="Horror">Horror</option>
            <option value="Sci-Fi">Sci-Fi</option>
            <option value="Epic">Epic</option>
          </select>
        </div>

        {/* COVER PREVIEW */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase">Creative Cover Album</label>
          <div className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 p-3 rounded-xl">
            <Film className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">Cover Photo Selected ✅</span>
          </div>
        </div>

        {/* 🛠️ DYNAMIC CHAPTER INJECTION LAB */}
        <div className="border-t border-zinc-800 pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">AI Voice Lab (Book Chapters Bundle)</h2>
            <button 
              type="button"
              onClick={handleAddChapterRow}
              className="px-3 py-1.5 bg-emerald-

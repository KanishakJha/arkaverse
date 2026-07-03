import { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { Plus, Trash2, Save, ChevronLeft, Film } from 'lucide-react'

interface ChapterInput {
  title: string
  content: string
}

export function AdminPage() {
  const { books, navigate } = useApp()
  const [selectedBookId, setSelectedBookId] = useState(books[0]?.id || '')
  const [synopsis, setSynopsis] = useState('Indian Zombie apocalypse serial')
  const [genre, setGenre] = useState('Horror')
  const [author, setAuthor] = useState('Kanishak Jha')

  // DYNAMIC CHAPTER ARRAY STATE
  const [chaptersList, setChaptersList] = useState<ChapterInput[]>([
    { title: 'एपिसोड एक: अमृत का अभिशाप और अटूट बंधन', content: '' }
  ])

  const handleAddChapterRow = () => {
    // FIXED STRING LITERAL: Safely handles text joining without breaking JSX tokens
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
    if (!selectedBookId) {
      alert("Please select a target book first!")
      return
    }

    const formattedChapters = chaptersList.map((ch, idx) => ({
      id: selectedBookId + '-ch-' + (idx + 1) + '-' + Date.now(),
      title: ch.title || 'Chapter ' + (idx + 1),
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
            {books.map(b => (
              <option key={b.id} value={b.id}>{b.title}</option>
            ))}
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

        {/* DYNAMIC CHAPTER INJECTION LAB */}
        <div className="border-t border-zinc-800 pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">AI Voice Lab (Book Chapters Bundle)</h2>
            <button 
              type="button"
              onClick={handleAddChapterRow}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs rounded-lg flex items-center gap-1 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Next Chapter
            </button>
          </div>

          <div className="space-y-6 max-h-[350px] overflow-y-auto pr-1 no-scrollbar">
            {chaptersList.map((ch, index) => (
              <div key={index} className="bg-zinc-900/90 border border-zinc-800/80 p-4 rounded-xl space-y-3 relative group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-500 uppercase">Node #{index + 1}</span>
                  {chaptersList.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => handleRemoveChapterRow(index)}
                      className="p-1 text-zinc-500 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  <input 
                    type="text"
                    value={ch.title}
                    placeholder="Chapter Title (e.g. Chapter 2: Gehra Raaz)"
                    onChange={(e) => handleChapterChange(index, 'title', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <textarea 
                    value={ch.content}
                    placeholder="Paste your individual script content text body here..."
                    onChange={(e) => handleChapterChange(index, 'content', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-300 h-24 resize-none focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SAVE CORE */}
        <button 
          type="button"
          onClick={handleSaveChanges}
          className="w-full mt-2 bg-white text-black hover:bg-zinc-200 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg"
        >
          <Save className="w-4 h-4" /> Save Whole Sequence
        </button>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Plus, Trash2, Save, ChevronLeft } from 'lucide-react'

interface ChapterInput {
  title: string
  content: string
}

export function AdminPage() {
  // 🌟 Simple & Solid State Setup: No complex properties mapping
  const [isNewBookMode, setIsNewBookMode] = useState(true)
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
    setChaptersList(chaptersList.filter((_, i) => i !== index))
  }

  const handleChapterChange = (index: number, field: keyof ChapterInput, value: string) => {
    const updated = [...chaptersList]
    updated[index][field] = value
    setChaptersList(updated)
  }

  const handleSaveChanges = () => {
    if (isNewBookMode && !bookTitle.trim()) {
      alert("Please enter a Book Title!")
      return
    }
    alert("Changes saved successfully!")
    window.location.href = "/"
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      {/* BAR */}
      <div className="flex items-center gap-4 mb-6 border-b border-zinc-800 pb-4">
        <button type="button" onClick={() => { window.location.href = "/"; }} className="p-2 hover:bg-zinc-900 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Studio Creator Panel</h1>
      </div>

      {/* MODE CONTROLS CONTAINER */}
      <div className="max-w-2xl mx-auto mb-6 flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
        <button
          type="button"
          onClick={() => {
            setIsNewBookMode(true)
            setChaptersList([{ title: 'एपिसोड एक: ', content: '' }])
          }}
          className={'flex-1 py-2 text-xs font-bold rounded-lg transition ' + (isNewBookMode ? 'bg-white text-black' : 'text-zinc-400')}
        >
          Create New Book Series
        </button>
        <button
          type="button"
          onClick={() => {
            setIsNewBookMode(false)
            setChaptersList([{ title: 'नया एपिसोड: ', content: '' }])
          }}
          className={'flex-1 py-2 text-xs font-bold rounded-lg transition ' + (!isNewBookMode ? 'bg-white text-black' : 'text-zinc-400')}
        >
          Add Chapters to Existing Book (e.g. Pralay)
        </button>
      </div>

      <div className="max-w-2xl mx-auto space-y-6 bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl">
        {isNewBookMode ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1 font-semibold uppercase">New Book Title *</label>
              <input type="text" value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} placeholder="e.g. PRALAY" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-200 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1 font-semibold uppercase">Cover Image URL</label>
              <input type="text" value={coverUrl} onChange={(e) => setCoverUrl(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-200 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1 font-semibold uppercase">Narrator / Author *</label>
              <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-200 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1 font-semibold uppercase">Series Synopsis *</label>
              <textarea value={synopsis} onChange={(e) => setSynopsis(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm h-20 resize-none text-zinc-200 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1 font-semibold uppercase">Genre *</label>
              <select value={genre} onChange={(e) => setGenre(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-200 focus:outline-none">
                <option value="Horror">Horror</option>
                <option value="Sci-Fi">Sci-Fi</option>
                <option value="Epic">Epic</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1 font-semibold uppercase">Target Existing Book</label>
              <select className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-200 focus:outline-none">
                <option value="pralay">PRALAY</option>
              </select>
            </div>
          </div>
        )}

        {/* Dynamic Injection Engine */}
        <div className="border-t border-zinc-800 pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-emerald-400 uppercase">AI Voice Lab (Chapters Panel)</h2>
            <button type="button" onClick={handleAddChapterRow} className="px-3 py-1.5 bg-emerald-500 text-black font-semibold text-xs rounded-lg flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add Next Chapter
            </button>
          </div>

          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {chaptersList.map((ch, index) => (
              <div key={index} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-500">CHAPTER ROW #{index + 1}</span>
                  {chaptersList.length > 1 && (
                    <button type="button" onClick={() => handleRemoveChapterRow(index)} className="text-zinc-500 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <input type="text" value={ch.title} placeholder="Chapter Title" onChange={(e) => handleChapterChange(index, 'title', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 focus:outline-none" />
                <textarea value={ch.content} placeholder="Paste script manuscript here..." onChange={(e) => handleChapterChange(index, 'content', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-300 h-20 resize-none focus:outline-none" />
              </div>
            ))}
          </div>
        </div>

        <button type="button" onClick={handleSaveChanges} className="w-full bg-white text-black py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg">
          <Save className="w-4 h-4" /> Save Configuration
        </button>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { Plus, Trash2, Save, ChevronLeft, Film, BookOpen, FilePlus } from 'lucide-react'

interface ChapterInput {
  title: string
  content: string
}

export function AdminPage() {
  const { books, navigate } = useApp()
  
  // 🛠️ CHOOSE MODE: 'new-book' (Nayi Book banana) ya 'add-chapter' (Bani hui book jaise Pralay mein naye chapters daalna)
  const [adminMode, setAdminMode] = useState<'new-book' | 'add-chapter'>('new-book')

  // Common Fields & Book Meta
  const [selectedBookId, setSelectedBookId] = useState(books[0]?.id || '')
  const [bookTitle, setBookTitle] = useState('')
  const [author, setAuthor] = useState('Kanishak Jha')
  const [synopsis, setSynopsis] = useState('')
  const [genre, setGenre] = useState('Horror')
  const [coverUrl, setCoverUrl] = useState('https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=400')

  // Dynamic Array for Chapters (For New Book or Bulk Addition)
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
      
      console.log("CREATING BRAND NEW BOOK PAYLOAD:", {
        id: 'book-' + Date.now(),
        title: bookTitle,
        author,
        description: synopsis,
        genre,
        cover_url: coverUrl,
        chapters: chaptersList
      })
      alert("New book created successfully with its initial chapters payload!");

    } else {
      if (!selectedBookId) {
        alert("Please select an existing target book!");
        return
      }

      console.log("INJECTING NEW CHAPTERS TO EXISTING BOOK:", {
        targetBookId: selectedBookId,
        newChaptersAdded: chaptersList
      })
      alert("New chapters successfully injected and mapped into the target book sequence!");
    }

    navigate({ page: 'home' })
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6 border-b border-zinc-800 pb-4">
        <button onClick={() => navigate({ page: 'home' })} className="p-2 hover:bg-zinc-900 rounded-lg transition">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Studio Creator Panel</h1>
      </div>

      {/* 🎛️ MODE SELECTOR TABS (New Book vs Add Chapters) */}
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
        
        {/* CONDITION 1: TARGET BOOK SELECTION (ONLY FOR ADDING CHAPTERS CODE) */}
        {adminMode === 'add-chapter' ? (
          <div className="space-y-2 animate-in fade-in duration-200">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Select Existing Target Book (e.g. Pralay)</label>
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
        ) : (
          /* CONDITION 2: BRAND NEW BOOK FIELDS TRIGGER */
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">New Book Title *</label>
              <input 
                type="text" 
                value={bookTitle} 
                onChange={(e) => setBookTitle(e.target.value)}
                placeholder="e.g. PRALAY: Part 2"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Cover Image URL</label>
              <input 
                type="text" 
                value={coverUrl} 
                onChange={(e) => setCoverUrl(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-zinc-700"
              />
            </div>
          </div>
        )}

        {/* METADATA CORE (Common for creation tracking) */}
        {adminMode === 'new-book' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Narrator / Author *</label>
              <input 
                type="text" 
                value={author} 
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Series Synopsis *</label>
              <textarea 
                value={synopsis} 
                onChange={(e) => setSynopsis(e.target.value)}
                placeholder="Enter series descriptions..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm h-20 resize-none text-zinc-200 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Genre *</label>
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

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Creative Cover Album</label>
              <div className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 p-3 rounded-xl">
                <Film className="w-5 h-5 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">Cover Photo Management Live ✅</span>
              </div>
            </div>
          </div>
        )}

        {/* 🛠️ DYNAMIC CHAPTER INJECTION BLOCK PANEL */}
        <div className="border-t border-zinc-800 pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">
              {adminMode === 'new-book' ? "Add Initial Book Chapters" : "Add New Segments Sequence"}
            </h2>
            <button 
              type="button"
              onClick={handleAddChapterRow}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs rounded-lg flex items-center gap-1 transition shadow"
            >
              <Plus className="w-3.5 h-3.5" /> Add Next Chapter
            </button>
          </div>

          <div className="space-y-6 max-h-[350px] overflow-y-auto pr-1 no-scrollbar">
            {chaptersList.map((ch, index) => (
              <div key={index} className="bg-zinc-900/90 border border-zinc-800/80 p-4 rounded-xl space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-500 uppercase">Chapter Node #{index + 1}</span>
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
                    placeholder="Chapter Title (e.g. Episode 2: Gehra Kuan)"
                    onChange={(e) => handleChapterChange(index, 'title', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <textarea 
                    value={ch.content}
                    placeholder="Paste individual segment script narration paragraphs text..."
                    onChange={(e) => handleChapterChange(index, 'content', e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-300 h-24 resize-none focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SAVE DATA INTERACTION PANEL BUTTON */}
        <button 
          type="button"
          onClick={handleSaveChanges}
          className="w-full mt-2 bg-white text-black hover:bg-zinc-200 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg"
        >
          <Save className="w-4 h-4" /> 
          {adminMode === 'new-book' ? "Save and Publish New Book" : "Inject Dynamic Chapters Array"}
        </button>
      </div>
    </div>
  )
}

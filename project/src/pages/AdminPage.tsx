import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, ChevronLeft, Copy, ToggleLeft, ToggleRight, Archive } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { ImageUploader } from '../components/ImageUploader'

interface ChapterInput {
  id?: string
  title: string
  content: string
  is_locked: boolean
}

interface BookData {
  id: string
  title: string
  author: string
  description: string
  genre: string
  cover_url: string
}

export function AdminPage() {
  const [isNewBookMode, setIsNewBookMode] = useState(true)
  const [existingBooks, setExistingBooks] = useState<BookData[]>([])
  const [selectedBookId, setSelectedBookId] = useState('')

  // Book Meta States
  const [bookTitle, setBookTitle] = useState('')
  const [author, setAuthor] = useState('Kanishak Jha')
  const [synopsis, setSynopsis] = useState('')
  const [genre, setGenre] = useState('Horror')
  const [coverUrl, setCoverUrl] = useState('')

  // Chapters Grid State
  const [chaptersList, setChaptersList] = useState<ChapterInput[]>([
    { title: 'एपिसोड एक: ', content: '', is_locked: false }
  ])

  // 🔄 Fetch all active books from Supabase for Management Mode
  useEffect(() => {
    async function loadBooks() {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('archived', false)
      if (!error && data) {
        setExistingBooks(data)
        if (data.length > 0) setSelectedBookId(data[0].id)
      }
    }
    loadBooks()
  }, [])

  // 🔄 Fetch existing chapters when a book is selected for editing
  useEffect(() => {
    if (isNewBookMode || !selectedBookId) return

    async function loadChapters() {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('book_id', selectedBookId)
        .order('chapter_order', { ascending: true })

      if (!error && data) {
        setChaptersList(data.map(ch => ({
          id: ch.id,
          title: ch.title,
          content: ch.content || '',
          is_locked: ch.is_locked || false
        })))
      }
    }
    loadChapters()
  }, [selectedBookId, isNewBookMode])

  const handleAddChapterRow = () => {
    const nextIndex = chaptersList.length + 1
    setChaptersList([...chaptersList, { title: 'एपिसोड ' + nextIndex + ': ', content: '', is_locked: false }])
  }

  const handleRemoveChapterRow = (index: number) => {
    if (chaptersList.length === 1) return
    setChaptersList(chaptersList.filter((_, i) => i !== index))
  }

  const handleChapterChange = (index: number, field: keyof ChapterInput, value: any) => {
    const updated = [...chaptersList]
    updated[index][field] = value
    setChaptersList(updated)
  }

  // 👥 FEATURE 4: Duplicate Individual Chapter Local Handler
  const handleDuplicateChapter = (index: number) => {
    const target = chaptersList[index]
    const updated = [...chaptersList]
    updated.splice(index + 1, 0, {
      title: `${target.title} (Copy)`,
      content: target.content,
      is_locked: target.is_locked
    })
    setChaptersList(updated)
  }

  // 💾 CORE TRANSACTION: Save / Update / Bulk Upsert Engine
  const handleSaveChanges = async () => {
    if (isNewBookMode && !bookTitle.trim()) {
      alert("Please enter a Book Title!")
      return
    }

    try {
      let targetBookId = selectedBookId

      if (isNewBookMode) {
        // 1. Insert New Book Entity
        const { data: newBook, error: bookError } = await supabase
          .from('books')
          .insert([{ title: bookTitle, author, description: synopsis, genre, cover_url: coverUrl }])
          .select()
          .single()

        if (bookError) throw bookError
        targetBookId = newBook.id
      } else {
        // 2. Clear out older chapters schema nodes for full atomic transaction overwrite
        await supabase.from('chapters').delete().eq('book_id', targetBookId)
      }

      // 3. Bulk insert the updated sequence array into Supabase
      if (targetBookId && chaptersList.length > 0) {
        const formattedChapters = chaptersList.map((ch, idx) => ({
          book_id: targetBookId,
          title: ch.title || 'Chapter ' + (idx + 1),
          content: ch.content || '',
          chapter_order: idx + 1,
          is_locked: ch.is_locked
        }))

        const { error: chapterError } = await supabase
          .from('chapters')
          .insert(formattedChapters)

        if (chapterError) throw chapterError
      }

      alert("🎉 Data successfully saved and synchronized with Supabase Database!")
      window.location.href = "/"
    } catch (error: any) {
      console.error(error)
      alert("Error saving transaction: " + error.message)
    }
  }

  // 🗑️ FEATURE 5: Archive / Delete entire book completely
  const handleArchiveBook = async () => {
    if (isNewBookMode || !selectedBookId) return
    if (!confirm("Are you sure you want to archive this series?")) return

    const { error } = await supabase
      .from('books')
      .update({ archived: true })
      .eq('id', selectedBookId)

    if (!error) {
      alert("Book series moved to archive shelf successfully!")
      window.location.href = "/"
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6 border-b border-zinc-800 pb-4">
        <button type="button" onClick={() => { window.location.href = "/"; }} className="p-2 hover:bg-zinc-900 rounded-full">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Studio Creator Panel</h1>
      </div>

      {/* MODE TABS */}
      <div className="max-w-2xl mx-auto mb-6 flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
        <button type="button" onClick={() => setIsNewBookMode(true)} className={'flex-1 py-2.5 text-xs font-bold rounded-lg transition ' + (isNewBookMode ? 'bg-white text-black shadow' : 'text-zinc-400')}>
          Create New Book Series
        </button>
        <button type="button" onClick={() => setIsNewBookMode(false)} className={'flex-1 py-2.5 text-xs font-bold rounded-lg transition ' + (!isNewBookMode ? 'bg-white text-black shadow' : 'text-zinc-400')}>
          Manage / Edit Existing Book
        </button>
      </div>

      <div className="max-w-2xl mx-auto space-y-6 bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl shadow-xl">
        {isNewBookMode ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1 font-semibold uppercase">New Book Title *</label>
              <input type="text" value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} placeholder="e.g. PRALAY" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none" />
            </div>
            
            <ImageUploader onUploadSuccess={(url) => setCoverUrl(url)} defaultUrl={coverUrl} />

            <div>
              <label className="text-xs text-zinc-400 block mb-1 font-semibold uppercase">Narrator / Author *</label>
              <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1 font-semibold uppercase">Series Synopsis *</label>
              <textarea value={synopsis} onChange={(e) => setSynopsis(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm h-20 resize-none text-zinc-200 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1 font-semibold uppercase">Genre *</label>
              <select value={genre} onChange={(e) => setGenre(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none">
                <option value="Horror">Horror</option>
                <option value="Sci-Fi">Sci-Fi</option>
                <option value="Epic">Epic</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label className="text-xs text-zinc-400 block mb-1 font-semibold uppercase">Select Book to Edit</label>
                <select value={selectedBookId} onChange={(e) => setSelectedBookId(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none">
                  {existingBooks.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                </select>
              </div>
              <button type="button" onClick={handleArchiveBook} className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl flex items-center gap-1.5 text-xs font-bold transition">
                <Archive className="w-4 h-4" /> Archive Series
              </button>
            </div>
          </div>
        )}

        {/* DYNAMIC CHAPTER MANAGEMENT INJECTION ENGINE */}
        <div className="border-t border-zinc-800 pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Book Episodes List Bundle</h2>
            <button type="button" onClick={handleAddChapterRow} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-xs rounded-lg flex items-center gap-1 transition">
              <Plus className="w-3.5 h-3.5" /> Add Next Chapter
            </button>
          </div>

          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
            {chaptersList.map((ch, index) => (
              <div key={index} className="bg-zinc-900/90 border border-zinc-800/80 p-4 rounded-xl space-y-3 relative group animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-wide">Chapter Index #{index + 1}</span>
                  <div className="flex items-center gap-2">
                    {/* 🔐 MONETIZATION: Paywall lock status selector toggler switches */}
                    <button 
                      type="button" 
                      onClick={() => handleChapterChange(index, 'is_locked', !ch.is_locked)}
                      className="flex items-center gap-1 text-[10px] font-bold text-zinc-400 uppercase tracking-wider bg-zinc-950 px-2 py-1 rounded border border-zinc-800"
                    >
                      {ch.is_locked ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-zinc-600" />}
                      Premium Lock
                    </button>
                    <button type="button" onClick={() => handleDuplicateChapter(index)} className="p-1 text-zinc-500 hover:text-white transition">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {chaptersList.length > 1 && (
                      <button type="button" onClick={() => handleRemoveChapterRow(index)} className="p-1 text-zinc-500 hover:text-red-400 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <input type="text" value={ch.title} placeholder="Chapter Title" onChange={(e) => handleChapterChange(index, 'title', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500" />
                <textarea value={ch.content} placeholder="Paste your script text body layout parameters..." onChange={(e) => handleChapterChange(index, 'content', e.target.value)} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs text-zinc-300 h-24 resize-none focus:outline-none focus:border-emerald-500" />
              </div>
            ))}
          </div>
        </div>

        <button type="button" onClick={handleSaveChanges} className="w-full mt-2 bg-white text-black hover:bg-zinc-200 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg">
          <Save className="w-4 h-4" /> Save Series Schema Configuration
        </button>
      </div>
    </div>
  )
}
  }

  const handleSaveChanges = async () => {
    if (isNewBookMode && !bookTitle.trim()) {
      alert("Please enter a Book Title!")
      return
    }
    if (isNewBookMode && !coverUrl) {
      alert("Please upload a cover photo from your phone first!")
      return
    }

    try {
      if (isNewBookMode) {
        const { data: newBook, error: bookError } = await supabase
          .from('books')
          .insert([
            {
              title: bookTitle,
              author: author,
              description: synopsis,
              genre: genre,
              cover_url: coverUrl,
            }
          ])
          .select()
          .single()

        if (bookError) throw bookError

        if (newBook && chaptersList.length > 0) {
          const formattedChapters = chaptersList.map((ch, idx) => ({
            book_id: newBook.id,
            title: ch.title || 'Chapter ' + (idx + 1),
            content: ch.content || '',
            chapter_order: idx + 1,
            is_free: idx === 0
          }))

          const { error: chapterError } = await supabase
            .from('chapters')
            .insert(formattedChapters)

          if (chapterError) throw chapterError
        }

        alert("🎉 Nayi book aur uske saare chapters Supabase Database mein permanently save ho gaye!")
      }
      window.location.href = "/"
    } catch (error: any) {
      console.error("Database Error:", error)
      alert("Error saving data: " + error.message)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="flex items-center gap-4 mb-6 border-b border-zinc-800 pb-4">
        <button type="button" onClick={() => { window.location.href = "/"; }} className="p-2 hover:bg-zinc-900 rounded-lg">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Studio Creator Panel</h1>
      </div>

      <div className="max-w-2xl mx-auto mb-6 flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
        <button type="button" onClick={() => setIsNewBookMode(true)} className={'flex-1 py-2 text-xs font-bold rounded-lg transition ' + (isNewBookMode ? 'bg-white text-black' : 'text-zinc-400')}>
          Create New Book Series
        </button>
        <button type="button" onClick={() => setIsNewBookMode(false)} className={'flex-1 py-2 text-xs font-bold rounded-lg transition ' + (!isNewBookMode ? 'bg-white text-black' : 'text-zinc-400')}>
          Add Chapters to Existing Book
        </button>
      </div>

      <div className="max-w-2xl mx-auto space-y-6 bg-zinc-900/40 border border-zinc-800 p-6 rounded-2xl">
        {isNewBookMode ? (
          <div className="space-y-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1 font-semibold uppercase">New Book Title *</label>
              <input type="text" value={bookTitle} onChange={(e) => setBookTitle(e.target.value)} placeholder="e.g. PRALAY" className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-zinc-200 focus:outline-none" />
            </div>
            
            {/* PHONE IMAGE UPLOADER MOUNT */}
            <ImageUploader onUploadSuccess={(url) => setCoverUrl(url)} defaultUrl={coverUrl} />

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

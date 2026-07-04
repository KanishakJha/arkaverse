import { useState, useEffect } from 'react'
import { Plus, Trash2, Save, ChevronLeft, Copy, ToggleLeft, ToggleRight, Archive, Upload } from 'lucide-react'
import { supabase } from '../lib/supabase'

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
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Book Meta States
  const [bookTitle, setBookTitle] = useState('')
  const [author, setAuthor] = useState('Kanishak Jha')
  const [synopsis, setSynopsis] = useState('')
  const [genre, setGenre] = useState('Romance') 
  const [coverUrl, setCoverUrl] = useState('')

  // Chapters Grid State
  const [chaptersList, setChaptersList] = useState<ChapterInput[]>([
    { title: 'एपिसोड एक: ', content: '', is_locked: false }
  ])

  const availableGenres = [
    'Romance',
    'Romantic',
    'Emotional',
    'Murder Mystery',
    'Crime',
    'Action',
    'Adventure',
    'Horror',
    'Epic',
    'Sci-Fi',
    'Thriller',
    'Drama'
  ]

  // Fetch Existing Books
  useEffect(() => {
    async function loadBooks() {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('archived', false)
      if (!error && data) setExistingBooks(data)
    }
    loadBooks()
  }, [isNewBookMode])

  // Fetch Individual Chapters when editing
  useEffect(() => {
    if (isNewBookMode || !selectedBookId) return
    async function loadBookData() {
      const targetBook = existingBooks.find(b => b.id === selectedBookId)
      if (targetBook) {
        setBookTitle(targetBook.title)
        setAuthor(targetBook.author || 'Kanishak Jha')
        setSynopsis(targetBook.description || '')
        setGenre(targetBook.genre || 'Romance')
        setCoverUrl(targetBook.cover_url || '')
      }

      const { data: chData, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('book_id', selectedBookId)
        .order('chapter_order', { ascending: true })

      if (!error && chData) {
        setChaptersList(chData.map(c => ({
          id: c.id,
          title: c.title,
          content: c.content || '',
          is_locked: c.is_locked || false
        })))
      }
    }
    loadBookData()
  }, [selectedBookId, isNewBookMode, existingBooks])

  // Native Image Upload Handler to completely replace external components
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('book-covers')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('book-covers')
        .getPublicUrl(filePath)

      setCoverUrl(publicUrl)
      alert('📸 Cover Image uploaded successfully!')
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`)
    } finally {
      setIsUploading(false)
    }
  }

  // Save Transaction Handler Function
  const handleSaveConfiguration = async () => {
    if (!bookTitle.trim()) {
      alert('Please fill out the series title parameter.')
      return
    }

    try {
      setIsLoading(true)
      let currentBookId = selectedBookId

      if (isNewBookMode) {
        const { data: newBook, error: bookError } = await supabase
          .from('books')
          .insert([{
            title: bookTitle,
            author: author,
            description: synopsis,
            genre: genre,
            cover_url: coverUrl
          }])
          .select()
          .single()

        if (bookError) throw bookError
        currentBookId = newBook.id
      } else {
        const { error: updateError } = await supabase
          .from('books')
          .update({
            title: bookTitle,
            author: author,
            description: synopsis,
            genre: genre,
            cover_url: coverUrl
          })
          .eq('id', currentBookId)

        if (updateError) throw updateError
      }

      if (currentBookId) {
        if (!isNewBookMode) {
          await supabase.from('chapters').delete().eq('book_id', currentBookId)
        }

        const formattedChapters = chaptersList.map((ch, idx) => ({
          book_id: currentBookId,
          title: ch.title || `Episode #${idx + 1}`,
          content: ch.content,
          is_locked: ch.is_locked,
          chapter_order: idx + 1
        }))

        const { error: chInsertError } = await supabase
          .from('chapters')
          .insert(formattedChapters)

        if (chInsertError) throw chInsertError
      }

      alert('🚀 Custom Series and Chapters Schema Matrix Synchronized Safely!')
      resetControlForm()

    } catch (err: any) {
      alert(`Error saving transaction: ${err.message || 'Database pipeline fail.'}`)
    } finally {
      setIsLoading(false)
    }
  }

  const resetControlForm = () => {
    setBookTitle('')
    setSynopsis('')
    setCoverUrl('')
    setGenre('Romance')
    setChaptersList([{ title: 'एपिसोड एक: ', content: '', is_locked: false }])
    setIsNewBookMode(true)
    setSelectedBookId('')
  }

  const handleArchiveBook = async () => {
    if (!selectedBookId) return
    if (confirm('Archive this bundle script manuscript?')) {
      await supabase.from('books').update({ archived: true }).eq('id', selectedBookId)
      alert('Manuscript Archived.')
      resetControlForm()
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 pb-24">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* HEADER AREA */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
          <div className="flex items-center gap-2">
            {!isNewBookMode && (
              <button type="button" onClick={resetControlForm} className="p-1 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400">
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <h1 className="text-sm font-black uppercase tracking-wider text-zinc-200">
              {isNewBookMode ? 'Studio Core Engine ⚙️' : 'Modify Manuscript Schema'}
            </h1>
          </div>

          {isNewBookMode && existingBooks.length > 0 && (
            <select
              value={selectedBookId}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedBookId(e.target.value)
                  setIsNewBookMode(false)
                }
              }}
              className="bg-zinc-900 border border-zinc-800 text-[11px] font-bold p-1.5 rounded-xl outline-none text-zinc-300 max-w-[160px]"
            >
              <option value="">Edit Live Book...</option>
              {existingBooks.map(b => (
                <option key={b.id} value={b.id}>{b.title}</option>
              ))}
            </select>
          )}
        </div>

        {/* METADATA FORM MATRIX */}
        <div className="space-y-4 bg-zinc-900/30 border border-zinc-900 p-5 rounded-2xl">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">New Book Title *</label>
            <input 
              type="text" 
              value={bookTitle}
              onChange={(e) => setBookTitle(e.target.value)}
              placeholder="e.g. PRALAY" 
              className="w-full bg-zinc-900 border border-zinc-900 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-800 transition font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Creator Signature</label>
            <input 
              type="text" 
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-900 rounded-xl px-3 py-2 text-xs text-zinc-400 focus:outline-none transition font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Series Synopsis *</label>
            <textarea 
              rows={3}
              value={synopsis}
              onChange={(e) => setSynopsis(e.target.value)}
              placeholder="Write the master plot synopsis..."
              className="w-full bg-zinc-900 border border-zinc-900 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-zinc-800 transition leading-relaxed font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Genre Parameters *</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-900 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-800 transition font-bold outline-none"
            >
              {availableGenres.map((g) => (
                <option key={g} value={g} className="bg-zinc-950 font-semibold">{g}</option>
              ))}
            </select>
          </div>

          {/* INLINED PURE HTML IMAGE UPLOADER COMPONENT LAYER TO PREVENT CRASHES */}
          <div className="space-y-2 pt-1">
            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-wider">Book Cover Asset *</label>
            <div className="border-2 border-dashed border-zinc-800 bg-zinc-950 rounded-2xl p-4 text-center relative hover:border-zinc-700 transition flex flex-col items-center justify-center min-h-[120px]">
              {coverUrl ? (
                <div className="relative w-full max-w-[100px] h-32 rounded-lg overflow-hidden border border-zinc-800">
                  <img src={coverUrl} alt="Preview" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => setCoverUrl('')}
                    className="absolute top-1 right-1 bg-black/80 p-1 text-[10px] rounded text-red-400 font-bold"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer space-y-2 flex flex-col items-center">
                  <Upload className={`w-6 h-6 ${isUploading ? 'animate-bounce text-emerald-400' : 'text-zinc-500'}`} />
                  <span className="text-[11px] font-bold text-zinc-400 block">
                    {isUploading ? 'Uploading assets...' : 'Tap to Upload Cover from Phone'}
                  </span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    disabled={isUploading} 
                    className="hidden" 
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* EPISODES REPEATER BOX */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">Book Episodes List Bundle</h2>
            <button
              type="button"
              onClick={() => setChaptersList([...chaptersList, { title: `एपिसोड ${chaptersList.length + 1}: `, content: '', is_locked: false }])}
              className="px-3 py-1.5 bg-emerald-500 text-black font-black text-[10px] rounded-xl hover:bg-emerald-400 transition flex items-center gap-1 shadow"
            >
              <Plus className="w-3 h-3" /> Add Next Chapter
            </button>
          </div>

          {chaptersList.map((chapter, index) => (
            <div key={index} className="bg-zinc-900/20 border border-zinc-900 rounded-2xl p-4 space-y-3 relative group">
              <div className="flex justify-between items-center gap-4">
                <input 
                  type="text"
                  value={chapter.title}
                  onChange={(e) => {
                    const next = [...chaptersList]
                    next[index].title = e.target.value
                    setChaptersList(next)
                  }}
                  className="bg-transparent text-xs font-black text-white outline-none border-b border-transparent focus:border-zinc-800 pb-0.5 flex-1 uppercase tracking-wide"
                />
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const next = [...chaptersList]
                      next[index].is_locked = !next[index].is_locked
                      setChaptersList(next)
                    }}
                    className="flex items-center gap-1 text-[10px] font-black tracking-wider uppercase text-zinc-500"
                  >
                    {chapter.is_locked ? (
                      <span className="text-emerald-400 flex items-center gap-1"><ToggleRight className="w-4 h-4" /> Premium Lock</span>
                    ) : (
                      <span className="text-zinc-600 flex items-center gap-1"><ToggleLeft className="w-4 h-4" /> Free Layer</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const next = [...chaptersList]
                      const target = { ...next[index], title: next[index].title + ' (Copy)' }
                      next.splice(index + 1, 0, target)
                      setChaptersList(next)
                    }}
                    className="p-1 text-zinc-500"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {chaptersList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setChaptersList(chaptersList.filter((_, i) => i !== index))}
                      className="p-1 text-zinc-600 hover:text-red-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <textarea
                rows={4}
                value={chapter.content}
                onChange={(e) => {
                  const next = [...chaptersList]
                  next[index].content = e.target.value
                  setChaptersList(next)
                }}
                placeholder="Paste script text..."
                className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-zinc-900 transition leading-relaxed font-medium"
              />
            </div>
          ))}
        </div>

        {/* SUBMIT ACTION BUTTONS */}
        <div className="grid grid-cols-1 gap-2 pt-4">
          <button
            type="button"
            disabled={isLoading || isUploading}
            onClick={handleSaveConfiguration}
            className="w-full py-3 bg-white text-black font-black text-xs rounded-xl shadow-xl hover:bg-zinc-200 transition flex items-center justify-center gap-2 tracking-wide disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> Save Series Schema Configuration
          </button>

          {!isNewBookMode && (
            <button
              type="button"
              onClick={handleArchiveBook}
              className="w-full py-2.5 bg-zinc-900/40 text-zinc-500 hover:text-red-400 border border-zinc-900 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <Archive className="w-3.5 h-3.5" /> Archive Current Book
            </button>
          )}
        </div>

      </div>
    </div>
  )
}

import { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { supabase } from '../lib/supabase'
import { Trash2, Plus, ArrowLeft, Headphones, Edit2, Upload } from 'lucide-react'

export function AdminPage() {
  const { books, fetchChapters, addBook, updateBook, deleteBook, navigate } = useApp()
  
  // Selection identity tracker for updates
  const [editingBookId, setEditingBookId] = useState<string | null>(null)

  // Form input field configurations
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [synopsis, setSynopsis] = useState('')
  const [genres, setGenres] = useState('Horror')
  const [coverUrl, setCoverUrl] = useState('')
  const [chapterTitle, setChapterTitle] = useState('Chapter 1')
  const [chapterContent, setChapterContent] = useState('')
  
  // Upload state tracker
  const [uploading, setUploading] = useState(false)

  // Trigger content loading when selecting an audio row for editing
  const handleSelectEdit = async (bookItem: any) => {
    setEditingBookId(bookItem.id)
    setTitle(bookItem.title)
    setAuthor(bookItem.author)
    setSynopsis(bookItem.synopsis || '')
    setGenres(bookItem.genres?.[0] || 'Horror')
    setCoverUrl(bookItem.cover_url || '')
    
    const loadedChapters = await fetchChapters(bookItem.id)
    if (loadedChapters && loadedChapters.length > 0) {
      setChapterTitle(loadedChapters[0].title)
      setChapterContent(loadedChapters[0].content)
    } else {
      setChapterTitle('Chapter 1')
      setChapterContent('')
    }
  }

  // Manual Photo Cover Upload Handler via Supabase Storage
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `covers/${fileName}`

      // Upload file to the 'fablex-assets' bucket
      const { error: uploadError } = await supabase.storage
        .from('fablex-assets')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL link for database schema row matching
      const { data } = supabase.storage
        .from('fablex-assets')
        .getPublicUrl(filePath)

      setCoverUrl(data.publicUrl)
      alert('Photo cover uploaded successfully!')
    } catch (error: any) {
      alert(error.message || 'Error uploading file')
    } finally {
      setUploading(false)
    }
  }

  async function handlePublish() {
    if (!title || !author) return alert('Title and Author are required fields!')
    
    const bookPayload = {
      title,
      author,
      synopsis,
      genres: [genres],
      cover_url: coverUrl || "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e",
      published: true,
      featured: false,
      reading_time_minutes: 15,
      total_chapters: 1
    }

    const chapterPayload = [
      {
        chapter_number: 1,
        title: chapterTitle,
        content: chapterContent,
        audio_url: ""
      }
    ]

    try {
      if (editingBookId) {
        await updateBook(editingBookId, bookPayload, chapterPayload)
        alert('Audio Series Updated Safely!')
      } else {
        await addBook(bookPayload, chapterPayload)
        alert('New Audio Series Published Successfully!')
      }
      
      setEditingBookId(null)
      setTitle('')
      setAuthor('')
      setSynopsis('')
      setCoverUrl('')
      setChapterContent('')
      setChapterTitle('Chapter 1')
    } catch (err) {
      console.error(err)
      alert('Error updating database content rows.')
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6 space-y-8">
      {/* Header Panel */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate({ page: 'home' })} className="p-2 hover:bg-zinc-900 rounded-full border border-zinc-800">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Headphones className="w-5 h-5 text-emerald-400" /> Fablex Backoffice Studio
          </h1>
          <p className="text-xs text-zinc-500">Manage audio items content distribution pipeline grid.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Area: Manage Books Feed Control */}
        <div className="lg:col-span-1 bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Active Catalog ({books.length})</h2>
          
          {books.length === 0 ? (
            <p className="text-xs text-zinc-500 italic">No audio properties saved in database yet.</p>
          ) : (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto no-scrollbar">
              {books.map((b) => (
                <div key={b.id} className={`flex items-center justify-between p-3 border rounded-xl transition ${editingBookId === b.id ? 'bg-zinc-800/80 border-emerald-500/50' : 'bg-zinc-900/80 border-zinc-800/60'}`}>
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img src={b.cover_url} alt="" className="w-10 h-10 object-cover rounded-md border border-zinc-800" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold truncate text-zinc-200">{b.title}</p>
                      <p className="text-xs text-zinc-500 truncate">By {b.author}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => handleSelectEdit(b)}
                      className="p-2 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 rounded-lg transition"
                      title="Edit Catalog Item"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={async (e) => {
                        e.stopPropagation()
                        if (confirm(`Are you sure you want to completely delete "${b.title}"?`)) {
                          await deleteBook(b.id)
                          if (editingBookId === b.id) setEditingBookId(null)
                          alert('Book dropped from remote master schema.')
                        }
                      }}
                      className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                      title="Delete Series"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Area: Form Upload Creation Matrix */}
        <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-900 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
              {editingBookId ? 'Modify Selected Audio Entry' : 'Upload New Audio Series Master'}
            </h2>
            {editingBookId && (
              <button 
                onClick={() => {
                  setEditingBookId(null)
                  setTitle('')
                  setAuthor('')
                  setSynopsis('')
                  setCoverUrl('')
                  setChapterContent('')
                  setChapterTitle('Chapter 1')
                }}
                className="text-xs text-zinc-400 hover:text-white underline"
              >
                Cancel Edit Mode
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">Series Title *</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-zinc-700" placeholder="Enter title" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">Narrator / Author *</label>
              <input type="text" value={author} onChange={e => setAuthor(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-zinc-700" placeholder="Narrator name" />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-400">Series Synopsis *</label>
            <textarea value={synopsis} onChange={e => setSynopsis(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm h-16 focus:outline-none focus:border-zinc-700 resize-none" placeholder="Write dynamic description" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-zinc-400">Genre *</label>
              <select value={genres} onChange={e => setGenres(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-zinc-700 text-zinc-300">
                <option value="Horror">Horror</option>
                <option value="Thriller">Thriller</option>
                <option value="Sci-Fi">Sci-Fi</option>
                <option value="Epic">Epic</option>
                <option value="Mystery">Mystery</option>
              </select>
            </div>

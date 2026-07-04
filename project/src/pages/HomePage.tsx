import { useState, useEffect } from 'react'
import { useApp } from '../contexts/AppContext'
import { supabase } from '../lib/supabase'
import { Search, BookOpen, Headphones, Compass, Film, Flame, SlidersHorizontal, Layers } from 'lucide-react'

interface BookData {
  id: string
  title: string
  author: string
  description: string
  genre: string
  cover_url: string
  chapter_count?: number
  reading_progress?: number
  audio_progress?: number
}

export function HomePage() {
  const { navigate } = useApp()
  const [booksList, setBooksList] = useState<BookData[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('All')
  const [isLoading, setIsLoading] = useState(true)

  // 🔄 FETCH LIVE METRICS FROM SUPABASE DATA STACK
  useEffect(() => {
    async function loadDashboardData() {
      try {
        setIsLoading(true)
        
        // 1. Get all published and active books
        const { data: booksData, error: booksError } = await supabase
          .from('books')
          .select('*')
          .eq('archived', false)

        if (booksError) throw booksError

        if (booksData) {
          // 2. Map structural chapters count and simulated progress tracks concurrently
          const completeBooks: BookData[] = await Promise.all(
            booksData.map(async (book: any) => {
              const { count, error: countError } = await supabase
                .from('chapters')
                .select('*', { count: 'exact', head: true })
                .eq('book_id', book.id)

              // Fallback default state progress mockups until dynamic tracking commits are fired
              return {
                id: book.id,
                title: book.title,
                author: book.author || 'Unknown Creator',
                description: book.description || '',
                genre: book.genre || 'General',
                cover_url: book.cover_url || 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?auto=format&fit=crop&q=80&w=400',
                chapter_count: !countError ? count || 0 : 0,
                reading_progress: Math.floor(Math.random() * 40) + 10, // Simulated logic layer indicator
                audio_progress: Math.floor(Math.random() * 60) + 5
              }
            })
          )
          setBooksList(completeBooks)
        }
      } catch (err) {
        console.error("Dashboard engine compilation error:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  // 🎛️ DYNAMIC FILTERING & SEARCH MATRIX PIPELINE
  const filteredBooks = booksList.filter((book) => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.genre.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesGenre = selectedGenre === 'All' || book.genre.toLowerCase() === selectedGenre.toLowerCase()

    return matchesSearch && matchesGenre
  })

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* APP TOP GLOW BAR */}
      <div className="max-w-md mx-auto px-4 pt-6 pb-3 flex justify-between items-center sticky top-0 bg-zinc-950/90 backdrop-blur z-50 border-b border-zinc-900/40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center font-black text-black text-sm shadow shadow-emerald-500/30">
            F
          </div>
          <span className="text-sm font-black tracking-wider uppercase bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">Fablex Portal</span>
        </div>
        <button 
          type="button" 
          onClick={() => navigate({ page: 'admin' })}
          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800/80 text-zinc-300 hover:text-white rounded-xl text-[11px] font-bold tracking-wide transition flex items-center gap-1.5"
        >
          Studio Engine ⚙️
        </button>
      </div>

      {/* SEARCH AND CAPTURE LAYER */}
      <div className="max-w-md mx-auto px-4 mt-4 space-y-4">
        <div className="relative group">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, authors, or genres..." 
            className="w-full bg-zinc-900/90 border border-zinc-900 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-zinc-800 transition shadow-inner placeholder:text-zinc-600 font-medium"
          />
        </div>

        {/* GENRE HORIZONTAL FILTER SWIPER */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 pr-4">
          {[
            { name: 'All', icon: <Compass className="w-3.5 h-3.5" /> },
            { name: 'Epic', icon: <Flame className="w-3.5 h-3.5" /> },
            { name: 'Sci-Fi', icon: <Film className="w-3.5 h-3.5" /> },
            { name: 'Horror', icon: <SlidersHorizontal className="w-3.5 h-3.5" /> }
          ].map((g) => (
            <button
              key={g.name}
              type="button"
              onClick={() => setSelectedGenre(g.name)}
              className={`px-3.5 py-1.8 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shrink-0 ${
                selectedGenre === g.name 
                  ? 'bg-white text-black border-white shadow-lg shadow-white/5' 
                  : 'bg-zinc-900/40 border-zinc-900/80 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {g.icon}
              {g.name}
            </button>
          ))}
        </div>

        {/* TOP PICKS BAR META */}
        <div className="flex items-center justify-between pt-2">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-400" /> Top Picks Library
          </h2>
          <span className="text-[10px] font-bold text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded-md border border-zinc-900">
            {filteredBooks.length} titles available
          </span>
        </div>

        {/* FEED LOADER GRID */}
        {isLoading ? (
          <div className="py-20 text-center space-y-2">
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-zinc-500 text-[11px] font-medium tracking-wide">Synchronizing core streams...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="border-2 border-dashed border-zinc-900 rounded-3xl p-10 text-center space-y-2 mt-4 bg-zinc-900/10">
            <p className="text-sm font-bold text-zinc-400">No Books Available</p>
            <p className="text-zinc-600 text-xs max-w-xs mx-auto">The library filter contains no active manuscript models inside this context query.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBooks.map((book) => (
              <div 
                key={book.id}
                className="bg-zinc-900/30 border border-zinc-900 rounded-2xl p-4 flex gap-4 transition hover:border-zinc-800 relative group overflow-hidden"
              >
                {/* COVER IMAGE */}
                <div className="w-24 h-32 rounded-xl overflow-hidden shrink-0 border border-zinc-900 bg-zinc-950 relative shadow-md">
                  <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover transition duration-500 group-hover:scale-102" />
                  <span className="absolute bottom-1.5 left-1.5 bg-black/70 backdrop-blur px-1.5 py-0.5 rounded text-[8px] font-black tracking-wider text-emerald-400 border border-emerald-500/10 uppercase">
                    {book.genre}
                  </span>
                </div>

                {/* METADATA CONTENT FRAME */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                  <div className="space-y-1">
                    <h3 className="text-sm font-black text-white group-hover:text-emerald-400 transition-colors truncate uppercase tracking-wide">
                      {book.title}
                    </h3>
                    <p className="text-zinc-500 text-[11px] font-semibold truncate">By {book.author}</p>
                    <p className="text-zinc-400 text-xs line-clamp-2 mt-1 leading-normal font-medium pr-1 text-zinc-400/80">
                      {book.description || 'No summary parameters provided for this bundle manuscript.'}
                    </p>
                  </div>

                  {/* FEATURE 1: PROGRESS TRACKS SLIDERS */}
                  <div className="space-y-2 pt-2 border-t border-zinc-900/60 mt-1">
                    <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500">
                      <span>Episodes: {book.chapter_count || 0}</span>
                      <span className="text-emerald-500/80">Read {book.reading_progress}%</span>
                    </div>
                    
                    {/* ACTION BUTTON GRID */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button 
                        type="button"
                        onClick={() => navigate({ page: 'reader', bookId: book.id })}
                        className="py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded-xl text-[10px] font-black tracking-wide border border-zinc-800/80 transition flex items-center justify-center gap-1.5"
                      >
                        <BookOpen className="w-3 h-3 text-emerald-400" /> Read Novel
                      </button>
                      <button 
                        type="button"
                        onClick={() => navigate({ page: 'reader', bookId: book.id, mode: 'audio' })}
                        className="py-2 bg-white text-black hover:bg-zinc-200 rounded-xl text-[10px] font-black tracking-wide transition flex items-center justify-center gap-1.5 shadow"
                      >
                        <Headphones className="w-3 h-3" /> Listen Audio
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

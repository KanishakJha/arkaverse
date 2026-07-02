import { useState, useEffect } from 'react'
import { useApp } from '../contexts/AppContext'
import { 
  Search, 
  BookOpen, 
  Compass, 
  Skull, 
  Shield, 
  Flame, 
  Sparkles, 
  HelpCircle, 
  AlertTriangle, 
  Layers, 
  Play, 
  Clock, 
  Headphones 
} from 'lucide-react'

const GENRE_ICONS: Record<string, any> = {
  All: Compass,
  Epic: Shield,
  'Sci-Fi': Sparkles,
  Horror: Skull,
  Mystery: HelpCircle,
  Mythology: Flame,
  Thriller: AlertTriangle,
  Cyberpunk: Layers,
}

export function HomePage() {
  const { books, navigate } = useApp()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('All')
  const [isFlipping, setIsFlipping] = useState(false)

  const genres = ['All', 'Epic', 'Sci-Fi', 'Horror', 'Mystery', 'Mythology', 'Thriller', 'Cyberpunk']

  const handleGenreSelect = (genre: string) => {
    if (genre === selectedGenre) return
    setIsFlipping(true)
    setSelectedGenre(genre)
  }

  useEffect(() => {
    if (isFlipping) {
      const timer = setTimeout(() => setIsFlipping(false), 350)
      return () => clearTimeout(timer)
    }
  }, [isFlipping])

  // Filter logic checking title, author and genres array matching exactly
  const filteredBooks = books.filter((book) => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Safety check fallback for genres string or array formats
    const bookGenres = Array.isArray(book.genres) 
      ? book.genres 
      : typeof (book as any).genre === 'string' 
        ? [(book as any).genre] 
        : []

    const matchesGenre = selectedGenre === 'All' || bookGenres.some(g => g.toLowerCase() === selectedGenre.toLowerCase())
    return matchesSearch && matchesGenre
  })

  return (
    <div className="fixed inset-0 pt-14 w-screen h-screen flex bg-[#f8fafc] text-slate-900 overflow-hidden font-sans">
      
      {/* 🧭 LEFT SIDEBAR: ELEVENREADER EXPLORE PANEL */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/80 p-5 justify-between shrink-0">
        <div className="space-y-6">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold block mb-3">Discover</span>
            <div className="space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm bg-slate-900 text-white font-medium shadow-sm transition-all">
                <Compass className="size-4" />
                <span>Explore Audiobooks</span>
              </button>
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold block mb-2">Genres & Tags</span>
            <div className="space-y-0.5 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
              {genres.map((genre) => {
                const Icon = GENRE_ICONS[genre] || Compass
                const isSelected = selectedGenre === genre
                return (
                  <button
                    key={genre}
                    onClick={() => handleGenreSelect(genre)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                      isSelected
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`size-4 ${isSelected ? 'text-slate-900' : 'text-slate-400'}`} />
                      <span className="tracking-wide">{genre}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-2">
          <Headphones className="size-3.5 text-slate-400" />
          <span>Fablex Premium Stream</span>
        </div>
      </aside>

      {/* 🚀 MAIN CORE MARKETPLACE VIEW */}
      <main className="flex-1 flex flex-col bg-[#f8fafc] overflow-y-auto custom-scrollbar p-6 md:p-8">
        
        {/* TOP SEARCH BAR PANEL */}
        <div className="max-w-5xl w-full mx-auto mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl mb-1">
            Find your next audiobook
          </h1>
          <p className="text-sm text-slate-500 mb-6">Explore professional multi-genre audio stories</p>
          
          <div className="relative max-w-xl group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
            <input
              type="text"
              placeholder="Search by title, authors, or genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400/20 transition-all"
            />
          </div>
        </div>

        {/* RECENT PICKS / PRODUCTS GRID */}
        <div className="max-w-5xl w-full mx-auto flex-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              {selectedGenre === 'All' ? 'Top Picks' : `${selectedGenre} Realities`}
            </h2>
            <span className="text-xs text-slate-400 font-medium">{filteredBooks.length} titles available</span>
          </div>

          {filteredBooks.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-200/60 rounded-2xl p-8 shadow-sm">
              <BookOpen className="size-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-700 mb-0.5">No Books Available</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                The library is empty. Go to the Admin Studio panel to upload your master pieces.
              </p>
            </div>
          ) : (
            <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 transition-all duration-300 ${isFlipping ? 'opacity-40 scale-[0.99]' : 'opacity-100 scale-100'}`}>
              {filteredBooks.map((book) => (
                <div 
                  key={book.id} 
                  onClick={(e) => {
                    e.preventDefault();
                    if (book.id) {
                      // Redirects instantly to reader workspace mapping first chapter layout
                      navigate({ page: 'reader', bookId: book.id, chapterNum: 1 });
                    } else {
                      alert("Error: Core target book ID row parameter missing!");
                    }
                  }}
                  className="group flex flex-col cursor-pointer"
                >
                  {/* PREMIUM 3D ISOMETRIC COVER WRAPPER */}
                  <div className="book-card-premium aspect-[3/4] rounded-xl bg-slate-100 shadow-md border border-slate-200/50 mb-3 overflow-hidden relative">
                    {book.cover_url ? (
                      <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-300 bg-slate-50">
                        <BookOpen className="size-8" />
                      </div>
                    )}
                    
                    {/* OVERLAY PLAY BUTTON HOVER */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="size-11 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <Play className="size-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* METADATA INFO */}
                  <div className="px-0.5">
                    <h4 className="text-sm font-semibold text-slate-900 truncate leading-snug group-hover:text-blue-600 transition-colors">
                      {book.title}
                    </h4>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{book.author}</p>
                    
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] font-medium text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {book.reading_time_minutes || 30}m
                      </span>
                      <span>•</span>
                      <span className="text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Free</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  )
}
  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          book.author.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGenre = selectedGenre === 'All' || book.genres.includes(selectedGenre)
    return matchesSearch && matchesGenre
  })

  return (
    <div className="fixed inset-0 pt-14 w-screen h-screen flex bg-[#f8fafc] text-slate-900 overflow-hidden font-sans">
      
      {/* 🧭 LEFT SIDEBAR: ELEVENREADER EXPLORE PANEL */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/80 p-5 justify-between shrink-0">
        <div className="space-y-6">
          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold block mb-3">Discover</span>
            <div className="space-y-1">
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm bg-slate-900 text-white font-medium shadow-sm transition-all">
                <Compass className="size-4" />
                <span>Explore Audiobooks</span>
              </button>
            </div>
          </div>

          <div>
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold block mb-2">Genres & Tags</span>
            <div className="space-y-0.5 max-h-[50vh] overflow-y-auto pr-1 custom-scrollbar">
              {genres.map((genre) => {
                const Icon = GENRE_ICONS[genre] || Compass
                const isSelected = selectedGenre === genre
                return (
                  <button
                    key={genre}
                    onClick={() => handleGenreSelect(genre)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                      isSelected
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`size-4 ${isSelected ? 'text-slate-900' : 'text-slate-400'}`} />
                      <span className="tracking-wide">{genre}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 text-[11px] text-slate-400 flex items-center gap-2">
          <Headphones className="size-3.5 text-slate-400" />
          <span>Fablex Premium Stream</span>
        </div>
      </aside>

      {/* 🚀 MAIN CORE MARKETPLACE VIEW */}
      <main className="flex-1 flex flex-col bg-[#f8fafc] overflow-y-auto custom-scrollbar p-6 md:p-8">
        
        {/* TOP SEARCH BAR PANEL */}
        <div className="max-w-5xl w-full mx-auto mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl mb-1">
            Find your next audiobook
          </h1>
          <p className="text-sm text-slate-500 mb-6">Explore professional multi-genre audio stories</p>
          
          <div className="relative max-w-xl group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
            <input
              type="text"
              placeholder="Search by title, authors, or genres..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400/20 transition-all"
            />
          </div>
        </div>

        {/* RECENT PICKS / PRODUCTS GRID */}
        <div className="max-w-5xl w-full mx-auto flex-1">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">
              {selectedGenre === 'All' ? 'Top Picks' : `${selectedGenre} Realities`}
            </h2>
            <span className="text-xs text-slate-400 font-medium">{filteredBooks.length} titles available</span>
          </div>

          {filteredBooks.length === 0 ? (
            <div className="text-center py-20 bg-white border border-slate-200/60 rounded-2xl p-8 shadow-sm">
              <BookOpen className="size-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-semibold text-slate-700 mb-0.5">No Books Available</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                The library is empty. Go to the Admin Studio panel to upload your master pieces.
              </p>
            </div>
          ) : (
            <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 transition-all duration-300 ${isFlipping ? 'opacity-40 scale-[0.99]' : 'opacity-100 scale-100'}`}>
              {filteredBooks.map((book) => (
                <div 
                  key={book.id} 
                  onClick={() => navigate({ page: 'reader', bookId: book.id, chapterNum: 1 })}
                  className="group flex flex-col cursor-pointer"
                >
                  {/* PREMIUM 3D ISOMETRIC COVER WRAPPER */}
                  <div className="book-card-premium aspect-[3/4] rounded-xl bg-slate-100 shadow-md border border-slate-200/50 mb-3 overflow-hidden relative">
                    {book.cover_url ? (
                      <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-300 bg-slate-50">
                        <BookOpen className="size-8" />
                      </div>
                    )}
                    
                    {/* OVERLAY PLAY BUTTON HOVER */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="size-11 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <Play className="size-5 fill-current ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* METADATA INFO */}
                  <div className="px-0.5">
                    <h4 className="text-sm font-semibold text-slate-900 truncate leading-snug group-hover:text-blue-600 transition-colors">
                      {book.title}
                    </h4>
                    <p className="text-xs text-slate-400 truncate mt-0.5">{book.author}</p>
                    
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] font-medium text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {book.reading_time_minutes || 30}m
                      </span>
                      <span>•</span>
                      <span className="text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Free</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  )
}
  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          book.author.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGenre = selectedGenre === 'All' || book.genres.includes(selectedGenre)
    return matchesSearch && matchesGenre
  })

  return (
    <div className="fixed inset-0 pt-14 w-screen h-screen flex items-center justify-center bg-white overflow-hidden">
      
      {/* 📖 THE OPEN GRIMOIRE CONTAINER */}
      <div className="w-full max-w-5xl mx-4 grid grid-cols-1 md:grid-cols-2 bg-[#f4ebd0] border-2 border-stone-300 rounded-2xl overflow-hidden min-h-[550px] max-h-[85vh] shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative">
        
        {/* CENTER SPINE EFFECT */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-stone-400/40 via-stone-500/20 to-stone-400/40 z-20"></div>
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[30px] -translate-x-1/2 bg-gradient-to-r from-stone-900/10 via-transparent to-stone-900/10 pointer-events-none z-10"></div>

        {/* 📜 LEFT PAGE: SUB-UNIVERSE NAVIGATOR */}
        <div className="p-6 bg-[#fdf8e9] flex flex-col justify-between border-b md:border-b-0 md:border-r border-stone-200 relative overflow-hidden">
          <div>
            <div className="mb-4">
              <span className="text-[10px] uppercase tracking-[0.3em] text-red-700 font-bold block mb-0.5">Index Portal</span>
              <h2 className="text-xl font-serif font-bold text-stone-900 tracking-wide">
                Sub-Universe Navigator
              </h2>
            </div>

            <div className="relative mb-4 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400 group-focus-within:text-red-600 transition-colors" />
              <input
                type="text"
                placeholder="Search ancient scrolls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-100/80 border border-stone-200 rounded-xl pl-10 pr-4 py-2 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-red-600 focus:bg-white transition-all font-serif"
              />
            </div>

            <div className="space-y-1 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
              {genres.map((genre) => {
                const Icon = GENRE_ICONS[genre] || Compass
                const isSelected = selectedGenre === genre
                return (
                  <button
                    key={genre}
                    onClick={() => handleGenreSelect(genre)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all duration-300 text-left group ${
                      isSelected
                        ? 'bg-red-50 border-red-200 text-red-700 font-semibold shadow-sm'
                        : 'bg-transparent border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`size-4 ${isSelected ? 'text-red-600' : 'text-stone-400'}`} />
                      <span className="text-sm font-serif tracking-wide">{genre}</span>
                    </div>
                    {isSelected && <span className="size-1.5 rounded-full bg-red-600" />}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200 text-[11px] text-stone-400 font-serif flex justify-between items-center">
            <span>Fablex Archive</span>
            <span>Page I</span>
          </div>
        </div>

        {/* 📜 RIGHT PAGE: REAL-TIME DISPLAY POOL */}
        <div className={`p-6 bg-[#fdf8e9] flex flex-col justify-between relative overflow-hidden ${isFlipping ? 'animate-page-flip-right' : ''}`}>
          <div className="flex-1 flex flex-col justify-center items-center w-full">
            {filteredBooks.length === 0 ? (
              <div className="text-center p-4 max-w-sm">
                <div className="size-12 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <BookOpen className="size-4 text-stone-400" />
                </div>
                <h3 className="text-sm font-serif font-semibold text-stone-700 mb-0.5">No Grimoires Found</h3>
                <p className="text-xs text-stone-400 font-serif leading-relaxed">
                  The archives are quiet. Try adjusting your search filters.
                </p>
              </div>
            ) : (
              <div className="w-full grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-1">
                {filteredBooks.map((book) => (
                  <div 
                    key={book.id} 
                    className="group bg-stone-50/50 border border-stone-200/60 hover:border-red-400 rounded-xl p-2.5 transition-all duration-300 cursor-pointer shadow-sm"
                  >
                    <div className="aspect-[3/4] rounded-lg bg-stone-200 mb-2 overflow-hidden border border-stone-200 relative">
                      {book.cover_url ? (
                        <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-stone-400">
                          <BookOpen className="size-6" />
                        </div>
                      )}
                    </div>
                    <h4 className="text-xs font-serif font-bold text-stone-800 truncate group-hover:text-red-700 transition-colors">{book.title}</h4>
                    <p className="text-[10px] text-stone-500 truncate">{book.author}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-stone-200 text-[11px] text-stone-400 font-serif flex justify-between items-center w-full">
            <span>Displaying {filteredBooks.length} Realities</span>
            <span>Page II</span>
          </div>
        </div>

      </div>
    </div>
  )
}

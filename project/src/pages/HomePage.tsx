import { useState, useEffect } from 'react'
import { useApp } from '../contexts/AppContext'
import { Search, BookOpen, Compass, Skull, Shield, Flame, Sparkles, HelpCircle, AlertTriangle, Layers } from 'lucide-react'

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
  const { books } = useApp()
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
      const timer = setTimeout(() => setIsFlipping(false), 600) // 0.6s animation duration match
      return () => clearTimeout(timer)
    }
  }, [isFlipping])

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
            <span>ArkaVerse Archive</span>
            <span>Page I</span>
          </div>
        </div>

        {/* 📜 RIGHT PAGE: REAL-TIME DISPLAY POOL WITH ANIMATION MATCH */}
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

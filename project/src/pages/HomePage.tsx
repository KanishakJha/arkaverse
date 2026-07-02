import { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { Search, BookOpen, Compass, Skull, Shield, Flame, Sparkles, Eye, Ghost, Dna } from 'lucide-react'

// Genres ko unique mystic icons ke saath link karna
const GENRE_ICONS: Record<string, any> = {
  All: Compass,
  Epic: Shield,
  'Sci-Fi': Sparkles,
  Horror: Skull,
  Mystery: Eye,
  Mythology: Flame,
  Thriller: Ghost,
  Cyberpunk: Dna,
}

export function HomePage() {
  const { books } = useApp()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('All')

  const genres = ['All', 'Epic', 'Sci-Fi', 'Horror', 'Mystery', 'Mythology', 'Thriller', 'Cyberpunk']

  // Search aur Genre filter logic
  const filteredBooks = books.filter((book) => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          book.author.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGenre = selectedGenre === 'All' || book.genres.includes(selectedGenre)
    return matchesSearch && matchesGenre
  })

  return (
    <div className="pt-24 pb-16 px-4 max-w-6xl mx-auto min-h-screen flex items-center justify-center bg-white animate-fade-in">
      
      {/* 📖 THE OPEN GRIMOIRE - AUTHENTIC OLD BOOK CONTAINER */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 bg-[#f4ebd0] border-2 border-stone-300 rounded-2xl overflow-hidden min-h-[600px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative">
        
        {/* 📚 CENTER SPINE (Kitaab ke beech ka mod - Realistic Book Crease) */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-stone-400/40 via-stone-500/20 to-stone-400/40 z-20"></div>
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[30px] -translate-x-1/2 bg-gradient-to-r from-stone-900/10 via-transparent to-stone-900/10 pointer-events-none z-10"></div>

        {/* 📜 LEFT PAGE: SUB-UNIVERSE NAVIGATOR */}
        <div className="p-6 sm:p-8 bg-[#fdf8e9] flex flex-col justify-between border-b md:border-b-0 md:border-r border-stone-200 relative">
          <div>
            {/* Page Header */}
            <div className="mb-6">
              <span className="text-[10px] uppercase tracking-[0.3em] text-red-700 font-bold block mb-1">Index Portal</span>
              <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-wide flex items-center gap-2">
                Sub-Universe Navigator
              </h2>
            </div>

            {/* Mystic Search Bar */}
            <div className="relative mb-6 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400 group-focus-within:text-red-600 transition-colors" />
              <input
                type="text"
                placeholder="Search ancient scrolls, titles, authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-100/80 border border-stone-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-red-600 focus:bg-white transition-all font-serif"
              />
            </div>

            {/* Vertical Table of Contents (Genres List) */}
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {genres.map((genre) => {
                const Icon = GENRE_ICONS[genre] || Compass
                const isSelected = selectedGenre === genre
                return (
                  <button
                    key={genre}
                    onClick={() => setSelectedGenre(genre)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300 text-left group relative overflow-hidden ${
                      isSelected
                        ? 'bg-red-50 border-red-200 text-red-700 font-semibold shadow-sm'
                        : 'bg-transparent border-transparent text-stone-600 hover:text-stone-900 hover:bg-stone-100/50'
                    }`}
                  >
                    <div className="flex items-center gap-3 relative z-10">
                      <Icon className={`size-4 transition-transform duration-500 group-hover:rotate-12 ${isSelected ? 'text-red-600' : 'text-stone-400 group-hover:text-stone-600'}`} />
                      <span className="text-sm font-serif tracking-wide">{genre}</span>
                    </div>
                    
                    {isSelected && (
                      <span className="size-1.5 rounded-full bg-red-600 shadow-[0_0_6px_#dc2626] relative z-10" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Left Page Footer */}
          <div className="pt-6 border-t border-stone-200 text-[11px] text-stone-400 font-serif flex justify-between items-center mt-6">
            <span>ArkaVerse Archive</span>
            <span>Page I</span>
          </div>
        </div>

        {/* 📜 RIGHT PAGE: REAL-TIME DISPLAY POOL */}
        <div className="p-6 sm:p-8 bg-[#fdf8e9] flex flex-col justify-between relative">
          
          {/* Dynamic Content Frame */}
          <div className="flex-1 flex flex-col justify-center items-center">
            {filteredBooks.length === 0 ? (
              /* Empty Parchment State */
              <div className="text-center p-6 max-w-sm animate-float-up">
                <div className="size-14 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <BookOpen className="size-5 text-stone-400" />
                </div>
                <h3 className="text-base font-serif font-semibold text-stone-700 mb-1">No Grimoires Found</h3>
                <p className="text-xs text-stone-400 font-serif leading-relaxed">
                  The archives are quiet. Try adjusting your search query or flipping to another universe index on the left page.
                </p>
              </div>
            ) : (
              /* Books Found State (Renders Grid Inside the Page) */
              <div className="w-full grid grid-cols-2 gap-4 max-h-[460px] overflow-y-auto pr-1">
                {filteredBooks.map((book) => (
                  <div 
                    key={book.id} 
                    className="group bg-stone-50/50 border border-stone-200/60 hover:border-red-400 rounded-xl p-3 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
                  >
                    <div className="aspect-[3/4] rounded-lg bg-stone-200 mb-2 overflow-hidden border border-stone-200 relative">
                      {book.cover_url ? (
                        <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-stone-400">
                          <BookOpen className="size-8" />
                        </div>
                      )}
                    </div>
                    <h4 className="text-xs font-serif font-bold text-stone-800 truncate group-hover:text-red-700 transition-colors">{book.title}</h4>
                    <p className="text-[10px] text-stone-500 truncate mt-0.5">{book.author}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Page Footer */}
          <div className="pt-6 border-t border-stone-200 text-[11px] text-stone-400 font-serif flex justify-between items-center w-full">
            <span>Displaying {filteredBooks.length} Realities</span>
            <span>Page II</span>
          </div>
        </div>

      </div>
    </div>
  )
}

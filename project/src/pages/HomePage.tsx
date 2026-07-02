import { useState } from 'react'
import { useApp } from '../contexts/AppContext'
import { Search, BookOpen, Compass, Skull, Shield, Flame, Sparkles } from 'lucide-react'

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

import { Eye, Ghost, Dna } from 'lucide-react'

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
    <div className="pt-24 pb-16 px-4 max-w-6xl mx-auto min-h-screen flex items-center justify-center animate-fade-in">
      
      {/* 📖 THE OPEN GRIMOIRE - MAIN BOOK CONTAINER */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 bg-[#09090b] border border-orange-900/20 rounded-2xl overflow-hidden min-h-[600px] shadow-[0_0_60px_rgba(0,0,0,0.8),_0_0_30px_rgba(249,115,22,0.05)] relative">
        
        {/* 📚 CENTER SPINE (Kitaab ke beech ka mod/crease) */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-zinc-900 via-orange-950/40 to-zinc-900 z-20 shadow-[0_0_10px_rgba(0,0,0,1)]"></div>
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[40px] -translate-x-1/2 bg-gradient-to-r from-black/40 via-transparent to-black/40 pointer-events-none z-10"></div>

        {/* 📜 LEFT PAGE: SUB-UNIVERSE NAVIGATOR (INDEX PAGE) */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-zinc-950 to-[#0c0c0e] flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/[0.02] relative">
          <div>
            {/* Page Header */}
            <div className="mb-6">
              <span className="text-[10px] uppercase tracking-[0.3em] text-orange-500/60 font-semibold block mb-1">Index Portal</span>
              <h2 className="text-2xl font-serif font-bold text-zinc-100 tracking-wide flex items-center gap-2">
                Sub-Universe Navigator
              </h2>
            </div>

            {/* Mystic Search Bar */}
            <div className="relative mb-6 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-600 group-focus-within:text-orange-500 transition-colors" />
              <input
                type="text"
                placeholder="Search ancient scrolls, titles, authors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-orange-500/50 focus:bg-zinc-900 transition-all font-serif"
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
                        ? 'bg-orange-500/[0.03] border-orange-500/30 text-orange-400 shadow-[inset_0_0_12px_rgba(249,115,22,0.02)]'
                        : 'bg-transparent border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.01]'
                    }`}
                  >
                    <div className="flex items-center gap-3 relative z-10">
                      <Icon className={`size-4 transition-transform duration-500 group-hover:rotate-12 ${isSelected ? 'text-orange-500' : 'text-zinc-600 group-hover:text-zinc-400'}`} />
                      <span className="text-sm font-serif tracking-wide">{genre}</span>
                    </div>
                    
                    {isSelected && (
                      <span className="size-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_#f97316] relative z-10" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Left Page Footer */}
          <div className="pt-6 border-t border-white/[0.02] text-[11px] text-zinc-600 font-serif flex justify-between items-center mt-6">
            <span>ArkaVerse Archive v2.0</span>
            <span>Page I</span>
          </div>
        </div>

        {/* 📜 RIGHT PAGE: REAL-TIME DISPLAY POOL */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-zinc-950 to-[#0a0a0c] flex flex-col justify-between relative">
          
          {/* Dynamic Content Frame */}
          <div className="flex-1 flex flex-col justify-center items-center">
            {filteredBooks.length === 0 ? (
              /* Empty Parchment State */
              <div className="text-center p-6 max-w-sm animate-float-up">
                <div className="size-14 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center mx-auto mb-4 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                  <BookOpen className="size-5 text-zinc-600 animate-pulse" />
                </div>
                <h3 className="text-base font-serif font-semibold text-zinc-400 mb-1">No Grimoires Found</h3>
                <p className="text-xs text-zinc-600 font-serif leading-relaxed">
                  The archives are quiet. Try adjusting your search query or flipping to another universe index on the left page.
                </p>
              </div>
            ) : (
              /* Books Found State (Renders Grid Inside the Page) */
              <div className="w-full grid grid-cols-2 gap-4 max-h-[460px] overflow-y-auto pr-1">
                {filteredBooks.map((book) => (
                  <div 
                    key={book.id} 
                    className="group bg-zinc-900/30 border border-zinc-800/50 hover:border-orange-500/20 rounded-xl p-3 transition-all duration-300 cursor-pointer shadow-md hover:shadow-[0_0_25px_rgba(249,115,22,0.03)]"
                  >
                    <div className="aspect-[3/4] rounded-lg bg-zinc-950 mb-2 overflow-hidden border border-zinc-800 relative shadow-inner">
                      {book.cover_url ? (
                        <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-zinc-700">
                          <BookOpen className="size-8" />
                        </div>
                      )}
                    </div>
                    <h4 className="text-xs font-serif font-bold text-zinc-300 truncate group-hover:text-orange-400 transition-colors">{book.title}</h4>
                    <p className="text-[10px] text-zinc-500 truncate mt-0.5">{book.author}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Page Footer */}
          <div className="pt-6 border-t border-white/[0.02] text-[11px] text-zinc-600 font-serif flex justify-between items-center w-full">
            <span>Displaying {filteredBooks.length} Realities</span>
            <span>Page II</span>
          </div>
        </div>

      </div>
    </div>
  )
}

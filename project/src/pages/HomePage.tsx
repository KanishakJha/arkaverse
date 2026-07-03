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

  // Filter books based on search input and selected genre filter row
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          book.author.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGenre = selectedGenre === 'All' || (book.genres && book.genres.includes(selectedGenre))
    return matchesSearch && matchesGenre
  })

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      {/* Title Header Section / Shortcut navigation trigger to bypass SPA 404s */}
      <header className="mb-6">
        <h1 
          onClick={() => navigate({ page: 'admin' })}
          className="text-2xl font-bold tracking-tight cursor-pointer hover:text-zinc-200 transition"
        >
          Find your next audiobook
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Explore professional multi-genre audio stories.</p>
      </header>

      {/* Search Input Layout Container */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by title, authors, or genres..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition"
        />
      </div>

      {/* Clean Horizontal Scrolling Genre Chips Row Grid */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-3 px-1 mb-6">
        {genres.map((genre) => {
          const IconComponent = GENRE_ICONS[genre] || Compass
          return (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition border ${
                selectedGenre === genre 
                  ? 'bg-white text-black border-white shadow-md shadow-white/5' 
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800/80 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              <IconComponent className="w-4 h-4" />
              {genre}
            </button>
          )
        })}
      </div>

      {/* Top Picks Books List Feed Dashboard */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold tracking-wider uppercase text-zinc-400">Top Picks</h2>
          <span className="text-xs text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded-md">
            {filteredBooks.length} titles available
          </span>
        </div>

        {filteredBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
            <BookOpen className="w-8 h-8 text-zinc-600 mb-2" />
            <p className="text-sm text-zinc-400 font-medium">No Books Available</p>
            <p className="text-xs text-zinc-500 mt-1 text-center px-6">
              The library is empty for this filter. Go to the Admin Studio to update files.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredBooks.map((book) => (
              <div 
                key={book.id}
                onClick={() => navigate({ page: 'reader', bookId: book.id })}
                className="group cursor-pointer bg-zinc-900/40 border border-zinc-900 rounded-xl p-3 hover:bg-zinc-900 hover:border-zinc-800 transition flex flex-col space-y-3"
              >
                <div className="aspect-[3/4] w-full bg-zinc-800 rounded-lg overflow-hidden relative shadow-md">
                  <img 
                    src={book.cover_url || "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e"} 
                    alt={book.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute bottom-2 right-2 p-2 bg-black/60 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition">
                    <Play className="w-4 h-4 fill-white text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-sm truncate group-hover:text-zinc-200 transition">{book.title}</h3>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">{book.author}</p>
                  <div className="flex items-center gap-3 mt-2 text-[11px] text-zinc-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {book.reading_time_minutes || 20}m
                    </span>
                    <span className="px-1.5 py-0.2 bg-zinc-800 text-zinc-400 rounded text-[10px]">Free</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

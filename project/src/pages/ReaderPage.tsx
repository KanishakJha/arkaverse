import { useApp } from '../contexts/AppContext'
import { ChevronLeft, BookOpen, Type } from 'lucide-react'

export function ReaderPage() {
  const { route, books, navigate, fontSize, setFontSize, typographyMode, setTypographyMode } = useApp()

  // 1. Fetch active book data matching parameters
  const book = books.find((b) => b.id === route.bookId)

  if (!book) {
    return (
      <div className="pt-20 text-center font-sans">
        <p className="text-sm text-slate-500">Book loading or not found...</p>
        <button onClick={() => navigate({ page: 'home' })} className="mt-4 text-xs text-blue-600 font-bold">Return Home</button>
      </div>
    )
  }

  // Fallback content agar backend mein specific chapter text na mile
  const storyContent = book.synopsis || "Story content is loading from the database desk framework...";

  return (
    <div className="pt-14 bg-[#fcfbf9] min-h-screen font-serif text-slate-900 select-text">
      
      {/* 🛠️ TOP READING CONTROL BAR */}
      <div className="sticky top-14 left-0 right-0 h-11 bg-white border-b border-slate-200/60 px-4 flex items-center justify-between z-30 shadow-sm">
        <button 
          onClick={() => navigate({ page: 'home' })} 
          className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 transition-colors font-sans font-medium"
        >
          <ChevronLeft className="size-4" />
          <span>Library</span>
        </button>

        {/* Font Control Matrix */}
        <div className="flex items-center gap-4 font-sans">
          <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-0.5 bg-slate-50">
            <button 
              onClick={() => setFontSize(Math.max(14, fontSize - 2))}
              className="px-2 py-0.5 text-xs font-bold text-slate-600 hover:bg-white rounded transition-all"
              title="Decrease Font"
            >
              A-
            </button>
            <span className="text-[10px] text-slate-400 px-1">{fontSize}px</span>
            <button 
              onClick={() => setFontSize(Math.min(26, fontSize + 2))}
              className="px-2 py-0.5 text-xs font-bold text-slate-600 hover:bg-white rounded transition-all"
              title="Increase Font"
            >
              A+
            </button>
          </div>

          <button 
            onClick={() => setTypographyMode(typographyMode === 'serif' ? 'sans' : 'serif')}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
            title="Toggle Font Family"
          >
            <Type className="size-4" />
          </button>
        </div>
      </div>

      {/* 📖 PREMIUM READING WORKSPACE */}
      <main className="max-w-2xl mx-auto px-5 py-10 sm:py-14">
        
        {/* Book Header Meta */}
        <header className="mb-10 pb-6 border-b border-slate-200/60 font-sans">
          <div className="flex items-center gap-2 text-amber-700 text-[10px] font-bold uppercase tracking-widest mb-2">
            <BookOpen className="size-3" />
            <span>Chapter 1</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl mb-1">
            {book.title}
          </h1>
          <p className="text-xs text-slate-400 font-medium">Written by {book.author}</p>
        </header>

        {/* Pure Story Text Wrapper with Dynamic Font State Injection */}
        <article 
          className="leading-relaxed tracking-wide text-slate-800 break-words whitespace-pre-wrap transition-all duration-200"
          style={{ 
            fontSize: `${fontSize || 18}px`, 
            fontFamily: typographyMode === 'sans' ? 'sans-serif' : 'Georgia, serif',
            lineHeight: '1.8'
          }}
        >
          {storyContent}
        </article>

        {/* End of Chapter Mark */}
        <div className="mt-16 flex flex-col items-center justify-center gap-3 pt-8 border-t border-slate-200/60 font-sans">
          <div className="size-1.5 rounded-full bg-slate-300" />
          <p className="text-[11px] text-slate-400 font-medium tracking-wider uppercase">End of Chapter</p>
        </div>

      </main>
    </div>
  )
}

export default ReaderPage;

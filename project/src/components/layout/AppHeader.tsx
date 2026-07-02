import { BookOpen, Settings, ChevronLeft } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { AURA_THEMES } from '../../types'

export function AppHeader() {
  const { route, navigate, auraTheme, currentBook } = useApp()
  const isReader = route.page === 'reader'
  const isAdmin = route.page === 'admin'

  return (
    <header
      /* NAVBAR BACKGROUND IS NOW WHITE WITH CLEAN STONE BORDER */
      className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-stone-200/80 shadow-sm transition-all duration-500"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: logo or back */}
        <div className="flex items-center gap-3 min-w-0">
          {(isReader || isAdmin) ? (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              onClick={() => navigate({ page: 'home' })}
            >
              <ChevronLeft className="size-4" />
              <span className="hidden sm:inline">Library</span>
            </Button>
          ) : (
            <button
              onClick={() => navigate({ page: 'home' })}
              className="flex items-center gap-2.5 group"
            >
              {/* NEW BRAND LOGO: DEEP RED GRADIENT BOOK ICON */}
              <div
                className="size-7 rounded-lg flex items-center justify-center bg-gradient-to-br from-red-700 to-red-900 shadow-sm transition-transform group-hover:scale-105"
              >
                <BookOpen className="size-3.5 text-white" />
              </div>
              <span className="font-serif font-bold tracking-tight text-base text-stone-900">
                Arka<span className="text-red-700">Verse</span>
              </span>
            </button>
          )}

          {isReader && currentBook && (
            <div className="hidden sm:flex items-center gap-2 min-w-0">
              <span className="text-stone-300">|</span>
              <span className="text-sm text-stone-600 truncate max-w-[200px]">
                {currentBook.title}
              </span>
              <Badge
                variant="outline"
                className="text-xs shrink-0 border-red-200 text-red-700 bg-red-50"
              >
                {AURA_THEMES[auraTheme].label}
              </Badge>
            </div>
          )}
        </div>

        {/* Right: nav */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-stone-600 hover:text-stone-900 hover:bg-stone-100"
            onClick={() => navigate(isAdmin ? { page: 'home' } : { page: 'admin' })}
            title="Admin Studio"
          >
            <Settings className="size-4" />
          </Button>
          {!isReader && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              onClick={() => navigate({ page: 'home' })}
              title="Library"
            >
              <BookOpen className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

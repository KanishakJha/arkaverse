import { BookOpen, Settings, Sparkles, ChevronLeft } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { AURA_THEMES } from '../../types'

export function AppHeader() {
  const { route, navigate, auraTheme, currentBook } = useApp()
  const colors = AURA_THEMES[auraTheme]
  const isReader = route.page === 'reader'
  const isAdmin = route.page === 'admin'

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 glass-strong transition-all duration-500"
      style={{ borderBottom: `1px solid ${colors.primary}20` }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: logo or back */}
        <div className="flex items-center gap-3 min-w-0">
          {(isReader || isAdmin) ? (
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-muted-foreground hover:text-foreground"
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
              <div
                className="size-7 rounded-lg flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
              >
                <Sparkles className="size-3.5 text-white" />
              </div>
              <span className="font-bold tracking-tight text-base">
                Arka<span style={{ color: colors.primary }}>Verse</span>
              </span>
            </button>
          )}

          {isReader && currentBook && (
            <div className="hidden sm:flex items-center gap-2 min-w-0">
              <span className="text-border">|</span>
              <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                {currentBook.title}
              </span>
              <Badge
                variant="outline"
                className="text-xs shrink-0"
                style={{ borderColor: `${colors.primary}40`, color: colors.primary }}
              >
                {AURA_THEMES[auraTheme].label}
              </Badge>
            </div>
          )}
        </div>

        {/* Right: nav */}
        <div className="flex items-center gap-2">
          {!isReader && !isAdmin && (
            <div className="hidden sm:flex items-center gap-1">
              <Badge
                variant="outline"
                className="text-xs cursor-default"
                style={{ borderColor: `${colors.primary}30`, color: `${colors.primary}cc` }}
              >
                <Sparkles className="size-2.5 mr-1" />
                v2.0 Sovereign
              </Badge>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => navigate(isAdmin ? { page: 'home' } : { page: 'admin' })}
            title="Admin Studio"
          >
            <Settings className="size-4" />
          </Button>
          {!isReader && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
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

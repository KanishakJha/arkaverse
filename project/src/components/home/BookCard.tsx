import { Clock, BookOpen, Headphones } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import type { Book, ReadingProgress } from '../../types'
import { AURA_THEMES } from '../../types'
import { Badge } from '../ui/badge'
import { cn } from '../../lib/utils'

interface ProgressRingProps {
  pct: number
  size?: number
  color: string
  label: string
  icon: React.ReactNode
}

function ProgressRing({ pct, size = 48, color, label, icon }: ProgressRingProps) {
  const r = (size - 6) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={r}
            stroke="currentColor" strokeWidth={3}
            fill="none" className="text-white/5"
          />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            stroke={color} strokeWidth={3}
            fill="none" strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground">
          {Math.round(pct)}%
        </div>
      </div>
      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
        {icon}
        {label}
      </div>
    </div>
  )
}

interface BookCardProps {
  book: Book
  progress?: ReadingProgress
  featured?: boolean
  index?: number
}

export function BookCard({ book, progress, featured = false, index = 0 }: BookCardProps) {
  const { navigate, fetchChapters } = useApp()
  const colors = AURA_THEMES[book.aura_theme as keyof typeof AURA_THEMES]
  const readPct = progress?.reading_pct ?? 0
  const listenPct = progress?.listening_pct ?? 0

  const gradientBg = `linear-gradient(135deg, ${colors.primary}22 0%, ${colors.secondary}18 50%, ${colors.accent}12 100%)`

  async function handleOpen() {
    await fetchChapters(book.id)
    const chNum = progress?.last_chapter_number ?? 1
    navigate({ page: 'reader', bookId: book.id, chapterNum: chNum })
  }

  return (
    <div
      className={cn(
        'book-card glass rounded-2xl overflow-hidden cursor-pointer group',
        'animate-float-up',
        featured && 'col-span-full sm:col-span-2'
      )}
      style={{
        animationDelay: `${index * 60}ms`,
        boxShadow: `0 0 0 1px ${colors.primary}18, 0 8px 40px ${colors.primary}10`,
      }}
      onClick={handleOpen}
    >
      {/* Cover area */}
      <div
        className="relative overflow-hidden"
        style={{ height: featured ? '280px' : '200px', background: gradientBg }}
      >
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-end p-5">
            <div
              className="size-16 rounded-2xl flex items-center justify-center text-3xl shadow-2xl"
              style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
            >
              {book.aura_theme === 'solar_dawn' ? '🌅' :
               book.aura_theme === 'abyssal_eclipse' ? '🌑' :
               book.aura_theme === 'cosmic_singularity' ? '🌌' : '🏺'}
            </div>
          </div>
        )}

        {/* Genre badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[75%]">
          {book.genres.slice(0, featured ? 3 : 2).map((g) => (
            <Badge
              key={g}
              variant="outline"
              className="text-[10px] py-0.5 glass"
              style={{ borderColor: `${colors.primary}40`, color: colors.primary }}
            >
              {g}
            </Badge>
          ))}
        </div>

        {/* Hover glow overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ background: `radial-gradient(ellipse at 50% 100%, ${colors.primary}18 0%, transparent 70%)` }}
        />
      </div>

      {/* Content area */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0">
            <h3 className="font-bold text-sm leading-tight truncate">{book.title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
          </div>
          {(readPct > 0 || listenPct > 0) && (
            <div className="flex gap-3 shrink-0">
              <ProgressRing
                pct={readPct} color={colors.primary} label="Read"
                icon={<BookOpen className="size-2.5" />}
              />
              <ProgressRing
                pct={listenPct} color={colors.secondary} label="Audio"
                icon={<Headphones className="size-2.5" />}
              />
            </div>
          )}
        </div>

        {featured && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
            {book.synopsis}
          </p>
        )}

        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {book.reading_time_minutes}m
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="size-3" />
            {book.total_chapters} chapters
          </span>
          <div
            className="ml-auto size-2 rounded-full"
            style={{ background: colors.primary, boxShadow: `0 0 6px ${colors.primary}` }}
          />
        </div>
      </div>
    </div>
  )
}

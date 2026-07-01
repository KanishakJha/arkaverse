import { Sparkles, ArrowRight, BookOpen, Clock } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { AURA_THEMES } from '../../types'

export function HeroHub() {
  const { books, navigate, fetchChapters, progress } = useApp()
  const featured = books.find((b) => b.featured) ?? books[0]

  if (!featured) return null

  const colors = AURA_THEMES[featured.aura_theme as keyof typeof AURA_THEMES]
  const prog = progress[featured.id]

  async function handleRead() {
    await fetchChapters(featured!.id)
    navigate({ page: 'reader', bookId: featured!.id, chapterNum: prog?.last_chapter_number ?? 1 })
  }

  return (
    <div
      className="relative overflow-hidden rounded-3xl glass-strong mb-10 animate-float-up"
      style={{
        boxShadow: `0 0 0 1px ${colors.primary}25, 0 30px 80px ${colors.primary}12`,
        minHeight: '320px',
      }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, ${colors.primary}20 0%, ${colors.secondary}14 40%, transparent 80%)`,
        }}
      />
      {/* Large faint title typography */}
      <div
        className="absolute right-4 top-0 bottom-0 flex items-center select-none pointer-events-none"
        style={{ opacity: 0.04 }}
      >
        <span
          className="text-[120px] sm:text-[180px] font-black leading-none tracking-tighter"
          style={{ color: colors.primary }}
        >
          {featured.title.split(':')[0].trim().slice(0, 6)}
        </span>
      </div>

      <div className="relative p-8 sm:p-12 flex flex-col justify-between h-full min-h-[320px]">
        {/* Top row */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="size-8 rounded-xl flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
              >
                <Sparkles className="size-4 text-white" />
              </div>
              <Badge
                variant="outline"
                className="text-xs"
                style={{ borderColor: `${colors.primary}50`, color: colors.primary }}
              >
                Featured Series
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight max-w-lg">
              {featured.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1 font-medium">{featured.author}</p>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-6 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="max-w-md">
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
              {featured.synopsis}
            </p>
            <div className="flex flex-wrap gap-2">
              {featured.genres.map((g) => (
                <Badge
                  key={g}
                  variant="outline"
                  className="text-xs"
                  style={{ borderColor: `${colors.primary}30`, color: `${colors.primary}cc` }}
                >
                  {g}
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-3 shrink-0">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                {featured.reading_time_minutes} min read
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="size-3.5" />
                {featured.total_chapters} chapters
              </span>
            </div>
            <Button
              className="gap-2 font-semibold px-6"
              style={{
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                boxShadow: `0 0 24px ${colors.primary}40`,
                color: 'white',
                border: 'none',
              }}
              onClick={handleRead}
            >
              {prog && prog.reading_pct > 0 ? 'Continue Reading' : 'Begin Journey'}
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

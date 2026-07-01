import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { BookCard } from './BookCard'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from '../ui/empty'

const MOOD_FILTERS = [
  { label: 'All', value: '' },
  { label: 'Epic', value: 'Epic' },
  { label: 'Sci-Fi', value: 'Sci-Fi' },
  { label: 'Horror', value: 'Horror' },
  { label: 'Mystery', value: 'Mystery' },
  { label: 'Mythology', value: 'Mythology' },
  { label: 'Thriller', value: 'Thriller' },
  { label: 'Cyberpunk', value: 'Cyberpunk' },
]

export function BookGrid() {
  const { books, progress } = useApp()
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('')

  const filtered = useMemo(() => {
    return books.filter((b) => {
      const matchSearch =
        !search ||
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase()) ||
        b.genres.some((g) => g.toLowerCase().includes(search.toLowerCase()))
      const matchGenre = !activeFilter || b.genres.includes(activeFilter)
      return matchSearch && matchGenre
    })
  }, [books, search, activeFilter])

  const inProgress = filtered.filter((b) => {
    const p = progress[b.id]
    return p && (p.reading_pct > 0 || p.listening_pct > 0) && p.reading_pct < 100
  })
  const unstarted = filtered.filter((b) => {
    const p = progress[b.id]
    return !p || (p.reading_pct === 0 && p.listening_pct === 0)
  })
  const completed = filtered.filter((b) => {
    const p = progress[b.id]
    return p && p.reading_pct >= 100
  })

  return (
    <div className="space-y-8">
      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search titles, authors, genres…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/[0.04] border-white/10 focus-visible:border-white/25"
          />
          {search && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearch('')}
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <SlidersHorizontal className="size-3.5 text-muted-foreground shrink-0" />
          {MOOD_FILTERS.map((f) => (
            <Badge
              key={f.value}
              variant={activeFilter === f.value ? 'default' : 'outline'}
              className="cursor-pointer select-none text-xs px-2.5 py-0.5 transition-all"
              style={
                activeFilter === f.value
                  ? { background: 'oklch(0.97 0 0)', color: 'oklch(0.05 0 0)' }
                  : {}
              }
              onClick={() => setActiveFilter(f.value)}
            >
              {f.label}
            </Badge>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <Empty className="border-white/5 min-h-[300px]">
          <EmptyHeader>
            <EmptyMedia variant="icon">📚</EmptyMedia>
            <EmptyTitle>No books found</EmptyTitle>
            <EmptyDescription>
              Try adjusting your search or filters, or{' '}
              <button className="underline" onClick={() => { setSearch(''); setActiveFilter('') }}>
                clear all
              </button>
              .
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {/* Active Journeys */}
      {inProgress.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-4 flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-amber-400 animate-pulse" />
            Active Journeys
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {inProgress.map((b, i) => (
              <BookCard key={b.id} book={b} progress={progress[b.id]} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* All books / Unstarted */}
      {unstarted.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-4 flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-blue-400" />
            {inProgress.length > 0 ? 'Discover' : 'Library'}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {unstarted.map((b, i) => (
              <BookCard key={b.id} book={b} progress={progress[b.id]} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-4 flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-green-400" />
            Completed
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {completed.map((b, i) => (
              <BookCard key={b.id} book={b} progress={progress[b.id]} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

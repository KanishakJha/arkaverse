import { BookOpen, Sparkles } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { HeroHub } from '../components/home/HeroHub'
import { BookGrid } from '../components/home/BookGrid'
import { Skeleton } from '../components/ui/skeleton'

export function HomePage() {
  const { books, loading } = useApp()

  if (loading) {
    return (
      <div className="pt-20 pb-32 min-h-screen px-4 sm:px-6 max-w-7xl mx-auto">
        <Skeleton className="h-[320px] w-full rounded-3xl mb-10" />
        <div className="flex gap-2 mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-20 rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-[280px] w-full rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="pt-20 pb-36 min-h-screen px-4 sm:px-6 max-w-7xl mx-auto">
      {/* Hero Solar Hub */}
      {books.length > 0 && <HeroHub />}

      {/* Sub-Universe header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-muted-foreground" />
          <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
            Sub-Universe Navigator
          </h2>
        </div>
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted-foreground">
          {books.length} {books.length === 1 ? 'universe' : 'universes'}
        </span>
      </div>

      {/* Book grid with search/filter */}
      <BookGrid />

      {books.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="size-16 rounded-2xl glass flex items-center justify-center mb-4">
            <BookOpen className="size-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Your library is empty</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Visit the Admin Studio to publish your first universe.
          </p>
        </div>
      )}
    </div>
  )
}

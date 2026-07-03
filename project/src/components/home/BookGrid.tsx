import type { Book } from '../../contexts/AppContext'

export function BookGrid({ books }: { books: Book[] }) {
  if (!books || books.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-4">
      {books.map((b: Book) => (
        <div key={b.id} className="p-2 border rounded bg-white text-slate-900">
          {b.title}
        </div>
      ))}
    </div>
  )
}

import { Book } from '../../contexts/AppContext';

export function BookGrid({ books }: { books: Book[] }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {books.map((b: Book) => (
        <div key={b.id}>{b.title}</div>
      ))}
    </div>
  );
}

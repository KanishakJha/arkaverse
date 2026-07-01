import type { Book, Chapter } from '../types'

export const SEED_BOOKS: Omit<Book, 'id' | 'created_at'>[] = []

export const SEED_CHAPTERS: Record<string, Omit<Chapter, 'id' | 'book_id' | 'created_at'>[]> = {}

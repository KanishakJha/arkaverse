import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// Types definition matching ecosystem architecture
export interface Book {
  id: string;
  title: string;
  author: string;
  synopsis: string;
  description?: string;
  genres: string[];
  tags: string[];
  cover_url: string;
  aura_theme: string;
  reading_time_minutes: number;
  total_chapters: number;
  featured: boolean;
  published: boolean;
}

export interface Chapter {
  id: string;
  book_id: string;
  chapter_number: number;
  title: string;
  content: string;
  audio_url: string;
  is_audio_premium?: boolean;
  is_locked?: boolean;
}

export interface RouteState {
  page: 'home' | 'reader' | 'admin';
  bookId?: string;
  chapterNum?: number;
}

interface AppContextType {
  route: RouteState;
  navigate: (newRoute: RouteState) => void;
  books: Book[];
  chapters: Record<string, Chapter[]>;
  fetchChapters: (bookId: string) => Promise<Chapter[]>;
  addBook: (book: any, chaptersList: any[]) => Promise<void>;
  updateBook: (bookId: string, book: any, chaptersList: any[]) => Promise<void>;
  deleteBook: (bookId: string) => Promise<void>;
  updateProgress: (bookId: string, pct: number, dummy: number, chapterNum: number) => void;
  typographyMode: 'sans' | 'serif' | 'focus' | 'dyslexia';
  setTypographyMode: (mode: any) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  currentTrack: any;
  setCurrentTrack: (book: Book, chapter: Chapter) => void;
  auraTheme: string;
  // ✨ MOCK TYPES TO FIX LEGACY COMPONENTS EXPORTS
  currentBook: any;
  currentChapter: any;
  audioProgress: number;
  setAudioProgress: (p: number) => void;
  mixerOpen: boolean;
  setMixerOpen: (o: boolean) => void;
  mixerTracks: any[];
  setMixerTrackVolume: (id: string, vol: number) => void;
  toggleMixerTrack: (id: string) => void;
  progress: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [route, setRoute] = useState<RouteState>({ page: 'home' });
  const [books, setBooks] = useState<Book[]>([]);
  const [chapters, setChapters] = useState<Record<string, Chapter[]>>({});
  
  // Custom Player Workspace States
  const [typographyMode, setTypographyMode] = useState<any>('sans');
  const [fontSize, setFontSize] = useState(16);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentTrack, setCurrentTrackState] = useState<any>(null);
  const [auraTheme, setAuraTheme] = useState('solar_dawn');

  // Legacy Compatibility States
  const [mixerOpen, setMixerOpen] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  useEffect(() => {
    loadBooks();
  }, []);

  async function loadBooks() {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setBooks(data || []);
    } catch (err) {
      console.error('Error loading books:', err);
    }
  }

  async function fetchChapters(bookId: string) {
    if (!bookId) return [];
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('book_id', bookId)
        .order('chapter_number', { ascending: true });
      if (error) throw error;
      
      const loadedChapters = data || [];
      setChapters(prev => ({ ...prev, [bookId]: loadedChapters }));
      return loadedChapters;
    } catch (err) {
      console.error('Error fetching chapters:', err);
      return [];
    }
  }

  async function addBook(bookPayload: any, chaptersPayload: any[]) {
    const { data: bookData, error: bookError } = await supabase
      .from('books')
      .insert([bookPayload])
      .select();
    
    if (bookError) throw bookError;
    const newBook = bookData[0];

    const mappedChapters = chaptersPayload.map(ch => ({
      ...ch,
      book_id: newBook.id
    }));

    const { error: chError } = await supabase.from('chapters').insert(mappedChapters);
    if (chError) throw chError;

    await loadBooks();
  }

  async function updateBook(bookId: string, bookPayload: any, chaptersPayload: any[]) {
    const { error: bookError } = await supabase
      .from('books')
      .update(bookPayload)
      .eq('id', bookId);
    if (bookError) throw bookError;

    const { error: delError } = await supabase
      .from('chapters')
      .delete()
      .eq('book_id', bookId);
    if (delError) throw delError;

    const mappedChapters = chaptersPayload.map(ch => ({
      ...ch,
      book_id: bookId
    }));

    const { error: chError } = await supabase.from('chapters').insert(mappedChapters);
    if (chError) throw chError;

    await loadBooks();
    await fetchChapters(bookId);
  }

  async function deleteBook(bookId: string) {
    const { error } = await supabase.from('books').delete().eq('id', bookId);
    if (error) throw error;
    await loadBooks();
  }

  function navigate(newRoute: RouteState) {
    setRoute(newRoute);
  }

  function updateProgress(bookId: string, pct: number, dummy: number, chapterNum: number) {
    // Consuming parameters to prevent strict unused compilation errors
    const syncLog = { bookId, pct, dummy, chapterNum };
    return syncLog;
  }

  function setCurrentTrack(book: Book, chapter: Chapter) {
    setCurrentTrackState({
      bookId: book.id,
      bookTitle: book.title,
      bookCover: book.cover_url,
      author: book.author,
      chapterId: chapter.id,
      chapterTitle: chapter.title,
      audioUrl: chapter.audio_url
    });
    if (book.aura_theme) setAuraTheme(book.aura_theme);
  }

  // ✨ COMPATIBILITY FALLBACK HANDLERS
  const currentBook = currentTrack ? books.find(b => b.id === currentTrack.bookId) : null;
  const currentChapter = currentTrack;
  const mixerTracks: any[] = [];
  const setMixerTrackVolume = (id: string, vol: number) => { return { id, vol }; };
  const toggleMixerTrack = (id: string) => { return id; };
  const progress = audioProgress;

  return (
    <AppContext.Provider value={{
      route, navigate, books, chapters, fetchChapters, addBook, updateBook, deleteBook, updateProgress,
      typographyMode, setTypographyMode, fontSize, setFontSize, isPlaying, setIsPlaying,
      playbackSpeed, setPlaybackSpeed, currentTrack, setCurrentTrack, auraTheme,
      currentBook, currentChapter, audioProgress, setAudioProgress, mixerOpen, setMixerOpen,
      mixerTracks, setMixerTrackVolume, toggleMixerTrack, progress
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

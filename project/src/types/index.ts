export type AuraTheme = 'solar_dawn' | 'abyssal_eclipse' | 'cosmic_singularity' | 'mythological_gold'

export type TypographyMode = 'sans' | 'serif' | 'focus' | 'dyslexia' | 'amoled'

export interface Book {
  id: string
  title: string
  author: string
  synopsis: string
  genres: string[]
  tags: string[]
  cover_url: string
  aura_theme: AuraTheme
  reading_time_minutes: number
  total_chapters: number
  featured: boolean
  published: boolean
  created_at: string
}

export interface Chapter {
  id: string
  book_id: string
  chapter_number: number
  title: string
  content: string
  audio_url: string
  word_count: number
  created_at: string
}

export interface ReadingProgress {
  id: string
  session_id: string
  book_id: string
  reading_pct: number
  listening_pct: number
  last_chapter_number: number
  updated_at: string
}

export interface AuraColors {
  primary: string
  secondary: string
  accent: string
  label: string
}

export const AURA_THEMES: Record<AuraTheme, AuraColors> = {
  solar_dawn: {
    primary: '#F59E0B',
    secondary: '#EC4899',
    accent: '#F97316',
    label: 'Solar Dawn',
  },
  abyssal_eclipse: {
    primary: '#991B1B',
    secondary: '#4C1D95',
    accent: '#BE123C',
    label: 'Abyssal Eclipse',
  },
  cosmic_singularity: {
    primary: '#06B6D4',
    secondary: '#3730A3',
    accent: '#0EA5E9',
    label: 'Cosmic Singularity',
  },
  mythological_gold: {
    primary: '#D97706',
    secondary: '#78350F',
    accent: '#D4AF37',
    label: 'Mythological Gold',
  },
}

export interface AudioTrack {
  id: string
  label: string
  emoji: string
  volume: number
  playing: boolean
}

export const AMBIENT_TRACKS: Omit<AudioTrack, 'volume' | 'playing'>[] = [
  { id: 'rain', label: 'Ambient Rain', emoji: '🌧' },
  { id: 'thunder', label: 'Distant Thunder', emoji: '⛈' },
  { id: 'forest', label: 'Mystical Forest', emoji: '🌲' },
  { id: 'drone', label: 'Cosmic Drone', emoji: '🌌' },
  { id: 'tension', label: 'Cinematic Tension', emoji: '🎻' },
]

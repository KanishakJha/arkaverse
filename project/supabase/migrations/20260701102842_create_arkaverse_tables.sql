
/*
# ArkaVerse — Core Schema

## Overview
Creates the full data model for ArkaVerse, a sovereign autonomous immersive storyverse engine.
Single-tenant app (no user auth); all data is intentionally public/shared via anon key.

## New Tables

### books
Stores book metadata for the library catalog.
- id (uuid, PK)
- title (text) — display title
- author (text) — author name
- synopsis (text) — full book description
- genres (text[]) — array of genre tags
- tags (text[]) — mood/theme tags
- cover_url (text) — cover art URL or gradient spec
- aura_theme (text) — solar aura palette name: solar_dawn | abyssal_eclipse | cosmic_singularity | mythological_gold
- reading_time_minutes (int) — estimated reading time
- total_chapters (int) — chapter count
- featured (boolean) — pinned to Solar Hub hero banner
- published (boolean) — visible in catalog
- created_at (timestamptz)

### chapters
Individual chapters belonging to a book.
- id (uuid, PK)
- book_id (uuid, FK → books.id CASCADE)
- chapter_number (int) — display order
- title (text)
- content (text) — full chapter prose
- audio_url (text) — optional narration file path or URL
- word_count (int) — for reading time estimation
- created_at (timestamptz)

### reading_progress
Tracks per-session reading and listening completion.
- id (uuid, PK)
- session_id (text) — anonymous browser session token
- book_id (uuid, FK → books.id CASCADE)
- reading_pct (numeric 0-100)
- listening_pct (numeric 0-100)
- last_chapter_number (int)
- updated_at (timestamptz)
- UNIQUE(session_id, book_id)

## Security
- RLS enabled on all tables
- All policies: TO anon, authenticated with USING(true) — intentionally public single-tenant data
*/

-- ── BOOKS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS books (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title                text        NOT NULL,
  author               text        NOT NULL DEFAULT '',
  synopsis             text        NOT NULL DEFAULT '',
  genres               text[]      NOT NULL DEFAULT '{}',
  tags                 text[]      NOT NULL DEFAULT '{}',
  cover_url            text        NOT NULL DEFAULT '',
  aura_theme           text        NOT NULL DEFAULT 'solar_dawn',
  reading_time_minutes integer     NOT NULL DEFAULT 0,
  total_chapters       integer     NOT NULL DEFAULT 0,
  featured             boolean     NOT NULL DEFAULT false,
  published            boolean     NOT NULL DEFAULT true,
  created_at           timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE books ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_books" ON books;
CREATE POLICY "anon_select_books" ON books FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_books" ON books;
CREATE POLICY "anon_insert_books" ON books FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_books" ON books;
CREATE POLICY "anon_update_books" ON books FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_books" ON books;
CREATE POLICY "anon_delete_books" ON books FOR DELETE
  TO anon, authenticated USING (true);

-- ── CHAPTERS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chapters (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id        uuid        NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  chapter_number integer     NOT NULL,
  title          text        NOT NULL DEFAULT '',
  content        text        NOT NULL DEFAULT '',
  audio_url      text        NOT NULL DEFAULT '',
  word_count     integer     NOT NULL DEFAULT 0,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chapters_book_id ON chapters(book_id);
CREATE INDEX IF NOT EXISTS idx_chapters_order ON chapters(book_id, chapter_number);

ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_chapters" ON chapters;
CREATE POLICY "anon_select_chapters" ON chapters FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_chapters" ON chapters;
CREATE POLICY "anon_insert_chapters" ON chapters FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_chapters" ON chapters;
CREATE POLICY "anon_update_chapters" ON chapters FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_chapters" ON chapters;
CREATE POLICY "anon_delete_chapters" ON chapters FOR DELETE
  TO anon, authenticated USING (true);

-- ── READING PROGRESS ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reading_progress (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id           text        NOT NULL,
  book_id              uuid        NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  reading_pct          numeric(5,2) NOT NULL DEFAULT 0,
  listening_pct        numeric(5,2) NOT NULL DEFAULT 0,
  last_chapter_number  integer     NOT NULL DEFAULT 1,
  updated_at           timestamptz NOT NULL DEFAULT now(),
  UNIQUE(session_id, book_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_session ON reading_progress(session_id);

ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_progress" ON reading_progress;
CREATE POLICY "anon_select_progress" ON reading_progress FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_progress" ON reading_progress;
CREATE POLICY "anon_insert_progress" ON reading_progress FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_progress" ON reading_progress;
CREATE POLICY "anon_update_progress" ON reading_progress FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_progress" ON reading_progress;
CREATE POLICY "anon_delete_progress" ON reading_progress FOR DELETE
  TO anon, authenticated USING (true);

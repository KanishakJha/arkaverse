import { useRef, useState } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus, Trash2, Upload, Sparkles, BookOpen, ChevronDown, ChevronUp,
  Check, AlertCircle, Loader2, Film, Music, ImagePlus, X,
  Pencil, Library, Clock, AlertTriangle,
} from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Field, FieldLabel, FieldDescription, FieldError } from '../components/ui/field'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '../components/ui/dialog'
import { AURA_THEMES } from '../types'
import type { AuraTheme, Book } from '../types'

const chapterSchema = z.object({
  title: z.string().min(1, 'Chapter title required'),
  content: z.string().min(50, 'Chapter content must be at least 50 characters'),
  audio_url: z.string().optional(),
  is_audio_premium: z.boolean().optional(),
})

const bookSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  author: z.string().min(2, 'Author name required'),
  synopsis: z.string().min(20, 'Synopsis must be at least 20 characters'),
  genres: z.string().min(1, 'Enter at least one genre'),
  cover_url: z.string().optional(),
  aura_theme: z.enum(['solar_dawn', 'abyssal_eclipse', 'cosmic_singularity', 'mythological_gold']),
  reading_time_minutes: z.coerce.number().min(1).max(9999),
  chapters: z.array(chapterSchema).min(1, 'Add at least one chapter'),
})

type BookFormData = z.infer<typeof bookSchema>

const DEFAULT_VALUES: BookFormData = {
  title: '',
  author: '',
  synopsis: '',
  genres: '',
  cover_url: '',
  aura_theme: 'solar_dawn',
  reading_time_minutes: 30,
  chapters: [{ title: 'Chapter 1', content: '', audio_url: '', is_audio_premium: false }],
}

export function AdminPage() {
  const { addBook, updateBook, deleteBook, books, fetchChapters } = useApp()

  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [expandedChapter, setExpandedChapter] = useState<number | null>(0)
  const [coverPreview, setCoverPreview] = useState<string>('')
  const [coverFileName, setCoverFileName] = useState<string>('')
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Book | null>(null)
  const [deleting, setDeleting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BookFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(bookSchema) as any,
    defaultValues: DEFAULT_VALUES,
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'chapters' })
  const watchedTheme = watch('aura_theme') as AuraTheme
  const colors = AURA_THEMES[watchedTheme]

  function showSuccess(msg: string) {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(null), 3000)
  }

  function clearForm() {
    reset(DEFAULT_VALUES)
    setCoverPreview('')
    setCoverFileName('')
    setExpandedChapter(0)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleCoverFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setCoverPreview(dataUrl)
      setCoverFileName(file.name)
      setValue('cover_url', dataUrl)
    }
    reader.readAsDataURL(file)
  }

  function clearCover() {
    setCoverPreview('')
    setCoverFileName('')
    setValue('cover_url', '')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleEdit(book: Book) {
    const bookChapters = await fetchChapters(book.id)
    setEditingBook(book)

    reset({
      title: book.title,
      author: book.author,
      synopsis: book.synopsis,
      genres: book.genres.join(', '),
      cover_url: book.cover_url ?? '',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      aura_theme: book.aura_theme as any,
      reading_time_minutes: book.reading_time_minutes,
      chapters: bookChapters.length > 0
        ? bookChapters.map((ch) => ({
            title: ch.title,
            content: ch.content,
            audio_url: ch.audio_url ?? '',
            is_audio_premium: (ch as any).is_audio_premium ?? false,
          }))
        : [{ title: 'Chapter 1', content: '', audio_url: '', is_audio_premium: false }],
    })

    if (book.cover_url?.startsWith('data:')) {
      setCoverPreview(book.cover_url)
      setCoverFileName('Existing cover')
    } else {
      setCoverPreview('')
      setCoverFileName('')
    }

    setExpandedChapter(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelEdit() {
    setEditingBook(null)
    clearForm()
  }

  async function handleDeleteConfirmed() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteBook(deleteTarget.id)
      setDeleteTarget(null)
      showSuccess(`"${deleteTarget.title}" deleted.`)
      if (editingBook?.id === deleteTarget.id) {
        setEditingBook(null)
        clearForm()
      }
    } finally {
      setDeleting(false)
    }
  }

  async function onSubmit(data: BookFormData) {
    setSubmitting(true)
    try {
      const genreList = data.genres.split(',').map((g) => g.trim()).filter(Boolean)
      const bookPayload = {
        title: data.title,
        author: data.author,
        synopsis: data.synopsis,
        genres: genreList,
        tags: genreList.map((g) => g.toLowerCase()),
        cover_url: data.cover_url ?? '',
        aura_theme: data.aura_theme,
        reading_time_minutes: data.reading_time_minutes,
        total_chapters: data.chapters.length,
        featured: false,
        published: true,
      }
      const chapterPayload = data.chapters.map((ch, idx) => ({
        chapter_number: idx + 1,
        title: ch.title,
        content: ch.content,
        audio_url: ch.audio_url ?? '',
        is_audio_premium: ch.is_audio_premium ?? false,
        word_count: ch.content.split(/\s+/).length,
      }))

      if (editingBook) {
        await updateBook(editingBook.id, bookPayload, chapterPayload)
        setEditingBook(null)
        showSuccess('Changes saved!')
      } else {
        await addBook(bookPayload, chapterPayload)
        showSuccess('Published! Add your next universe below.')
      }

      clearForm()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="pt-20 pb-16 px-4 sm:px-6 min-h-screen max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-float-up">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="size-9 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
          >
            <Sparkles className="size-4 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Author CMS Studio</h1>
            <p className="text-xs text-muted-foreground">Sovereign Publisher Control Center</p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <Badge variant="outline" className="text-xs border-white/10">
            <BookOpen className="size-3 mr-1" />
            {books.length} published
          </Badge>
          <Badge
            variant="outline"
            className="text-xs"
            style={{ borderColor: `${colors.primary}30`, color: colors.primary }}
          >
            {AURA_THEMES[watchedTheme].label} Aura
          </Badge>
        </div>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div
          className="mb-6 flex items-center gap-3 p-4 rounded-xl border animate-float-up"
          style={{ borderColor: `${colors.primary}40`, background: `${colors.primary}12` }}
        >
          <Check className="size-5 shrink-0" style={{ color: colors.primary }} />
          <p className="text-sm font-semibold">{successMsg}</p>
        </div>
      )}

      {/* Edit mode banner */}
      {editingBook && (
        <div className="mb-6 flex items-center justify-between gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/8 animate-float-up">
          <div className="flex items-center gap-2.5">
            <Pencil className="size-4 text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-300">Editing: {editingBook.title}</p>
              <p className="text-xs text-amber-400/70">Modify fields below then click Save Changes</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="text-xs border-amber-500/30 text-amber-300 hover:bg-amber-500/10 shrink-0"
            onClick={cancelEdit}
          >
            <X className="size-3 mr-1.5" />
            Cancel
          </Button>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Book metadata */}
        <Card className="border-white/8 bg-white/[0.03]">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Film className="size-4" />
              Book Metadata
            </CardTitle>
            <CardDescription className="text-xs">Core information about your universe</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field data-invalid={!!errors.title}>
              <FieldLabel htmlFor="title">Title *</FieldLabel>
              <Input
                id="title"
                placeholder="Enter book title…"
                aria-invalid={!!errors.title}
                className="bg-white/[0.04] border-white/10"
                {...register('title')}
              />
              {errors.title && <FieldError errors={[errors.title]} />}
            </Field>

            <Field data-invalid={!!errors.author}>
              <FieldLabel htmlFor="author">Author *</FieldLabel>
              <Input
                id="author"
                placeholder="Author name…"
                aria-invalid={!!errors.author}
                className="bg-white/[0.04] border-white/10"
                {...register('author')}
              />
              {errors.author && <FieldError errors={[errors.author]} />}
            </Field>

            <Field data-invalid={!!errors.synopsis} className="sm:col-span-2">
              <FieldLabel htmlFor="synopsis">Synopsis *</FieldLabel>
              <Textarea
                id="synopsis"
                placeholder="Write your book's synopsis…"
                aria-invalid={!!errors.synopsis}
                className="bg-white/[0.04] border-white/10 min-h-[80px]"
                {...register('synopsis')}
              />
              {errors.synopsis && <FieldError errors={[errors.synopsis]} />}
            </Field>

            <Field data-invalid={!!errors.genres}>
              <FieldLabel htmlFor="genres">Genres *</FieldLabel>
              <FieldDescription>Comma-separated (e.g. Epic, Mythology, Adventure)</FieldDescription>
              <Input
                id="genres"
                placeholder="Epic, Mythology, Adventure"
                aria-invalid={!!errors.genres}
                className="bg-white/[0.04] border-white/10"
                {...register('genres')}
              />
              {errors.genres && <FieldError errors={[errors.genres]} />}
            </Field>

            <Field>
              <FieldLabel htmlFor="reading_time">Est. Reading Time (min)</FieldLabel>
              <Input
                id="reading_time"
                type="number"
                min={1}
                className="bg-white/[0.04] border-white/10"
                {...register('reading_time_minutes')}
              />
            </Field>

            {/* Cover Image File Upload */}
            <Field className="sm:col-span-2">
              <FieldLabel>Cover Image</FieldLabel>
              <FieldDescription>Upload from your device gallery — JPG, PNG, WebP</FieldDescription>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handleCoverFile}
              />

              {coverPreview ? (
                <div
                  className="relative flex items-center gap-4 p-3 rounded-xl border border-white/10 bg-white/[0.03]"
                  style={{ borderColor: `${colors.primary}30` }}
                >
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="size-20 rounded-lg object-cover shrink-0"
                    style={{ boxShadow: `0 0 0 1px ${colors.primary}30` }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{coverFileName}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Ready to publish</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2 h-7 text-xs gap-1.5 border-white/10"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <ImagePlus className="size-3" />
                      Change image
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={clearCover}
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center gap-3 py-8 px-4 rounded-xl border border-dashed border-white/15 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/25 transition-all duration-200 cursor-pointer group"
                >
                  <div
                    className="size-12 rounded-2xl flex items-center justify-center transition-all duration-200 group-hover:scale-105"
                    style={{ background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}12)` }}
                  >
                    <ImagePlus className="size-5" style={{ color: colors.primary }} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Tap to upload cover image</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Choose from your camera roll or gallery · JPG, PNG, WebP
                    </p>
                  </div>
                </button>
              )}
            </Field>

            <Field>
              <FieldLabel>Solar Aura Theme</FieldLabel>
              <Controller
                name="aura_theme"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-white/[0.04] border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(AURA_THEMES).map(([key, val]) => (
                        <SelectItem key={key} value={key}>
                          {val.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </CardContent>
        </Card>

        {/* Chapter editor */}
        <Card className="border-white/8 bg-white/[0.03]">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Music className="size-4" />
                  Chapter Generator
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  {fields.length} chapter{fields.length !== 1 ? 's' : ''} — add as many as you need
                </CardDescription>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs border-white/10"
                onClick={() =>
                  append({ title: `Chapter ${fields.length + 1}`, content: '', audio_url: '', is_audio_premium: false })
                }
              >
                <Plus className="size-3.5" />
                Add Chapter
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {fields.map((field, idx) => (
              <div
                key={field.id}
                className="rounded-xl border border-white/8 overflow-hidden"
                style={{
                  boxShadow: expandedChapter === idx ? `0 0 0 1px ${colors.primary}20` : undefined,
                }}
              >
                <div
                  className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpandedChapter(expandedChapter === idx ? null : idx)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="size-6 rounded-md flex items-center justify-center text-[11px] font-bold"
                      style={{ background: `${colors.primary}22`, color: colors.primary }}
                    >
                      {idx + 1}
                    </div>
                    <span className="text-sm font-medium">
                      {watch(`chapters.${idx}.title`) || `Chapter ${idx + 1}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-6 text-destructive hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); remove(idx) }}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    )}
                    {expandedChapter === idx ? (
                      <ChevronUp className="size-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="size-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {expandedChapter === idx && (
                  <div className="px-4 pb-4 space-y-3 border-t border-white/5">
                    <Field data-invalid={!!errors.chapters?.[idx]?.title} className="mt-3">
                      <FieldLabel>Chapter Title *</FieldLabel>
                      <Input
                        placeholder="Chapter title…"
                        aria-invalid={!!errors.chapters?.[idx]?.title}
                        className="bg-white/[0.04] border-white/10"
                        {...register(`chapters.${idx}.title`)}
                      />
                      {errors.chapters?.[idx]?.title && (
                        <FieldError errors={[errors.chapters[idx]!.title]} />
                      )}
                    </Field>

                    <Field data-invalid={!!errors.chapters?.[idx]?.content}>
                      <FieldLabel>Chapter Content *</FieldLabel>
                      <Textarea
                        placeholder="Write or paste your chapter content here…"
                        aria-invalid={!!errors.chapters?.[idx]?.content}
                        className="bg-white/[0.04] border-white/10 min-h-[200px] font-mono text-sm"
                        {...register(`chapters.${idx}.content`)}
                      />
                      {errors.chapters?.[idx]?.content && (
                        <FieldError errors={[errors.chapters[idx]!.content]} />
                      )}
                    </Field>

                    <Field>
                      <FieldLabel>Audio File URL (optional)</FieldLabel>
                      <Input
                        placeholder="https://… .mp3"
                        className="bg-white/[0.04] border-white/10"
                        {...register(`chapters.${idx}.audio_url`)}
                      />
                    </Field>

                    {/* 🔒 PREMIUM AUDIO TOGGLE SWITCH */}
                    <div className="flex items-center justify-between mt-3 p-3 bg-orange-500/5 border border-white/5 rounded-xl transition-all duration-200">
                      <div className="flex flex-col pr-4">
                        <span className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                          👑 Require Premium to Listen
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          Users ko yeh background audio sunne ke liye VIP access chahiye hoga.
                        </span>
                      </div>
                      
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          {...register(`chapters.${idx}.is_audio_premium`)}
                        />
                        <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-500 peer-checked:after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-orange-600 peer-checked:to-amber-500"></div>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {errors.chapters?.root && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertCircle className="size-4" />
                {errors.chapters.root.message}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            {editingBook
              ? 'Changes will update the book in your library immediately.'
              : 'Publishing will immediately add this universe to the ArkaVerse catalog.'}
          </p>
          <Button
            type="submit"
            className="gap-2 font-semibold px-6 shrink-0"
            disabled={submitting}
            style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              boxShadow: `0 0 24px ${colors.primary}30`,
              color: 'white',
              border: 'none',
            }}
          >
            {submitting ? (
              <><Loader2 className="size-4 animate-spin" />{editingBook ? 'Saving…' : 'Publishing…'}</>
            ) : editingBook ? (
              <><Check className="size-4" />Save Changes</>
            ) : (
              <><Upload className="size-4" />Publish to ArkaVerse</>
            )}
          </Button>
        </div>
      </form>

      {/* ── Manage Uploaded Masterpieces ── */}
      <div className="mt-12">
        <div className="flex items-center gap-2 mb-4">
          <Library className="size-4 text-muted-foreground" />
          <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
            Manage Uploaded Masterpieces
          </h2>
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs text-muted-foreground">
            {books.length} {books.length === 1 ? 'book' : 'books'}
          </span>
        </div>

        <Card className="border-white/8 bg-white/[0.02]">
          <CardContent className="p-0">
            {books.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center px-6">
                <BookOpen className="size-8 text-muted-foreground mb-3" />
                <p className="text-sm font-medium">No books published yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Use the form above to publish your first universe.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-white/5">
                {books.map((book, i) => {
                  const bookColors = AURA_THEMES[book.aura_theme as keyof typeof AURA_THEMES]
                  const isEditing = editingBook?.id === book.id
                  return (
                    <li
                      key={book.id}
                      className={`flex items-center gap-4 px-4 py-3 transition-colors ${
                        isEditing ? 'bg-amber-500/6' : 'hover:bg-white/[0.02]'
                      } ${i === 0 ? 'rounded-t-xl' : ''} ${i === books.length - 1 ? 'rounded-b-xl' : ''}`}
                    >
                      {/* Cover thumbnail */}
                      <div
                        className="size-11 rounded-lg shrink-0 overflow-hidden flex items-center justify-center"
                        style={{ background: `linear-gradient(135deg, ${bookColors.primary}30, ${bookColors.secondary}18)` }}
                      >
                        {book.cover_url ? (
                          <img
                            src={book.cover_url}
                            alt={book.title}
                            className="size-full object-cover"
                          />
                        ) : (
                          <BookOpen className="size-4" style={{ color: bookColors.primary }} />
                        )}
                      </div>

                      {/* Book info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold truncate">{book.title}</p>
                          {isEditing && (
                            <Badge
                              variant="outline"
                              className="text-[10px] border-amber-500/40 text-amber-400 shrink-0"
                            >
                              Editing
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{book.author}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <BookOpen className="size-3" />
                            {book.total_chapters} ch
                          </span>
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Clock className="size-3" />
                            {book.reading_time_minutes}m
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8 gap-1.5 text-xs border-white/10 hover:border-white/20"
                          onClick={() => handleEdit(book)}
                        >
                          <Pencil className="size-3" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => setDeleteTarget(book)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Delete confirmation dialog ── */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <DialogContent className="max-w-sm border-white/10 bg-[#0d0d0d]/95 backdrop-blur-xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="size-10 rounded-xl bg-destructive/15 flex items-center justify-center shrink-0">
                <AlertTriangle className="size-5 text-destructive" />
              </div>
              <DialogTitle className="text-base">Delete this book?</DialogTitle>
            </div>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              <span className="font-semibold text-foreground">{deleteTarget?.title}</span> and all{' '}
              {deleteTarget?.total_chapters} chapter{deleteTarget?.total_chapters !== 1 ? 's' : ''}{' '}
              will be permanently removed from your library. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 mt-2">
            <Button
              variant="outline"
              className="flex-1 border-white/10"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1 gap-2"
              onClick={handleDeleteConfirmed}
              disabled={deleting}
            >
              {deleting ? (
                <><Loader2 className="size-3.5 animate-spin" />Deleting…</>
              ) : (
                <><Trash2 className="size-3.5" />Delete</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

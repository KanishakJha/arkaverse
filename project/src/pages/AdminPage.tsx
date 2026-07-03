import { useRef, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Plus, Sparkles, Check, Loader2, Film, Music, ImagePlus, ChevronDown, ChevronUp, Wand2
} from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card'
import { Field, FieldLabel } from '../components/ui/field'
import type { AuraTheme } from '../types'

const chapterSchema = z.object({
  title: z.string().min(1, 'Chapter title required'),
  audio_url: z.string().url('Valid audio MP3 link required'),
  is_audio_premium: z.boolean().optional(),
})

const bookSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  author: z.string().min(2, 'Author name required'),
  synopsis: z.string().min(20, 'Synopsis must be at least 20 characters'),
  genres: z.string().min(1, 'Enter at least one genre'),
  cover_url: z.string().optional(),
  reading_time_minutes: z.coerce.number().min(1).max(9999),
  chapters: z.array(chapterSchema).min(1, 'Add at least one chapter stream'),
})

type BookFormData = z.infer<typeof bookSchema>

const DEFAULT_VALUES: BookFormData = {
  title: '',
  author: '',
  synopsis: '',
  genres: '',
  cover_url: '',
  reading_time_minutes: 60,
  chapters: [{ title: 'Chapter 1', audio_url: '', is_audio_premium: false }],
}

export function AdminPage() {
  const { addBook, updateBook } = useApp()

  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [expandedChapter, setExpandedChapter] = useState<number | null>(0)
  const [coverPreview, setCoverPreview] = useState<string>('')
  const [editingBook, setEditingBook] = useState<any>(null)
  
  const [aiText, setAiText] = useState('')
  const [generatingAudio, setGeneratingAudio] = useState<number | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema) as any,
    defaultValues: DEFAULT_VALUES,
  })

  const { fields, append } = useFieldArray({ control, name: 'chapters' })

  function showSuccess(msg: string) {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(null), 3000)
  }

  function clearForm() {
    reset(DEFAULT_VALUES)
    setCoverPreview('')
    setExpandedChapter(0)
    setAiText('')
  }

  async function generateAIAudio(index: number) {
    if (!aiText.trim()) {
      alert("Pehle text area mein kahani ka text paste karo bhai!")
      return
    }

    setGeneratingAudio(index)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      const simulatedAudioUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
      
      setValue(`chapters.${index}.audio_url`, simulatedAudioUrl)
      alert(`✨ Episode ${index + 1} ka AI Audio successfully generate ho gaya!`)
    } catch (err) {
      alert("AI Generation failed.")
    } finally {
      setGeneratingAudio(null)
    }
  }

  function handleCoverFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setCoverPreview(dataUrl)
      setValue('cover_url', dataUrl)
    }
    reader.readAsDataURL(file)
  }

  async function onSubmit(data: BookFormData) {
    setSubmitting(true)
    try {
      const genreList = data.genres.split(',').map((g) => g.trim()).filter(Boolean)
      const currentTheme: AuraTheme = 'solar_dawn'
      
      const bookPayload = {
        title: data.title,
        author: data.author,
        synopsis: data.synopsis,
        description: data.synopsis,
        genres: genreList,
        tags: genreList.map((g) => g.toLowerCase()),
        cover_url: data.cover_url ?? '',
        aura_theme: currentTheme,
        reading_time_minutes: data.reading_time_minutes,
        total_chapters: data.chapters.length,
        featured: false,
        published: true,
      }

      const chapterPayload = data.chapters.map((ch, idx) => ({
        chapter_number: idx + 1,
        title: ch.title,
        content: `Audio Episode Stream ${idx + 1}`,
        audio_url: ch.audio_url,
        is_audio_premium: ch.is_audio_premium ?? false,
        is_locked: ch.is_audio_premium ?? false,
        word_count: 500,
      }))

      if (editingBook) {
        await updateBook(editingBook.id, bookPayload, chapterPayload)
        setEditingBook(null)
        showSuccess('Changes saved successfully!')
      } else {
        await addBook(bookPayload, chapterPayload)
        showSuccess('Audiobook Series Successfully Published!')
      }

      clearForm()
    } catch (err: any) {
      alert("Error: " + (err.message || err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="pt-20 pb-16 px-4 sm:px-6 min-h-screen max-w-4xl mx-auto text-slate-200">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="size-9 rounded-xl flex items-center justify-center bg-slate-800">
            <Sparkles className="size-4 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Fablex Creator Studio</h1>
            <p className="text-xs text-muted-foreground">Copyright-Free AI Audio Workspace</p>
          </div>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 flex items-center gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
          <Check className="size-5 shrink-0" />
          <p className="text-sm font-semibold">{successMsg}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Film className="size-4 text-slate-400" />
              Audiobook Series Metadata
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field>
              <FieldLabel className="text-slate-300">Series Title *</FieldLabel>
              <Input placeholder="Enter series title…" className="bg-slate-950 border-slate-800 text-white" {...register('title')} />
            </Field>

            <Field>
              <FieldLabel className="text-slate-300">Narrator / Author *</FieldLabel>
              <Input placeholder="Narrator name…" className="bg-slate-950 border-slate-800 text-white" {...register('author')} />
            </Field>

            <Field className="sm:col-span-2">
              <FieldLabel className="text-slate-300">Series Synopsis *</FieldLabel>
              <Input placeholder="Write a short dramatic hook for listeners..." className="bg-slate-950 border-slate-800 text-white" {...register('synopsis')} />
            </Field>

            <Field>
              <FieldLabel className="text-slate-300">Genres *</FieldLabel>
              <Input placeholder="Horror, Thriller, Mythological" className="bg-slate-950 border-slate-800 text-white" {...register('genres')} />
            </Field>

            <Field>
              <FieldLabel className="text-slate-300">Total Playtime (minutes)</FieldLabel>
              <Input type="number" className="bg-slate-950 border-slate-800 text-white" {...register('reading_time_minutes')} />
            </Field>

            <Field className="sm:col-span-2">
              <FieldLabel className="text-slate-300">Creative Cover Album</FieldLabel>
              <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={handleCoverFile} />
              {coverPreview ? (
                <div className="relative flex items-center gap-4 p-3 rounded-xl border border-slate-800 bg-slate-950">
                  <img src={coverPreview} alt="Cover preview" className="size-20 rounded-lg object-cover" />
                  <Button type="button" variant="outline" size="sm" className="h-7 text-xs border-slate-800 text-slate-300" onClick={() => fileInputRef.current?.click()}>Change poster</Button>
                </div>
              ) : (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex flex-col items-center gap-3 py-6 px-4 rounded-xl border border-dashed border-slate-800 bg-slate-950 hover:bg-slate-900/40">
                  <ImagePlus className="size-5 text-emerald-400" />
                  <p className="text-xs text-slate-400">Tap to upload professional book poster</p>
                </button>
              )}
            </Field>
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Wand2 className="size-4 text-emerald-400" />
              1. AI Voice Lab (Paste Story Here First)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
              placeholder="Apni kahani ya chapter ka poora text yahan paste karo bhai... Phir neeche wale episode par jaakar 'Generate Voice' daba dena."
              className="w-full min-h-[140px] bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-slate-700 font-sans resize-y"
            />
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/60 backdrop-blur-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <Music className="size-4 text-slate-400" />
                2. Audio Tracks Sequence Manager
              </CardTitle>
              <Button type="button" size="sm" variant="outline" className="text-xs border-slate-700 text-slate-200" onClick={() => append({ title: `Episode ${fields.length + 1}`, audio_url: '', is_audio_premium: fields.length >= 2 })}>
                <Plus className="size-3.5 mr-1" /> Add Track
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {fields.map((field, idx) => (
              <div key={field.id} className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-900/40" onClick={() => setExpandedChapter(expandedChapter === idx ? null : idx)}>
                  <div className="flex items-center gap-3">
                    <div className="size-6 rounded-md bg-slate-800 flex items-center justify-center text-[11px] font-bold text-emerald-400">{idx + 1}</div>
                    <span className="text-sm font-medium text-slate-300">{watch(`chapters.${idx}.title`) || `Episode ${idx + 1}`}</span>
                  </div>
                  {expandedChapter === idx ? <ChevronUp className="size-4 text-slate-500" /> : <ChevronDown className="size-4 text-slate-500" />}
                </div>

                {expandedChapter === idx && (
                  <div className="px-4 pb-4 pt-2 space-y-3 bg-slate-900/20 border-t border-slate-900/60">
                    <Field>
                      <FieldLabel className="text-slate-400 text-xs">Track Title *</FieldLabel>
                      <Input placeholder="Episode title…" className="h-8 bg-slate-950 border-slate-800 text-white text-xs" {...register(`chapters.${idx}.title`)} />
                    </Field>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 items-end">
                      <div className="sm:col-span-3">
                        <Field>
                          <FieldLabel className="text-slate-400 text-xs">Audio File URL (Direct MP3 Link)</FieldLabel>
                          <Input placeholder="AI will generate this link automatically..." className="h-8 bg-slate-950 border-slate-800 text-white text-xs font-mono" {...register(`chapters.${idx}.audio_url`)} />
                        </Field>
                      </div>
                      <Button
                        type="button"
                        onClick={() => generateAIAudio(idx)}
                        disabled={generatingAudio === idx}
                        className="w-full h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md flex items-center justify-center gap-1"
                      >
                        {generatingAudio === idx ? (
                          <Loader2 className="size-3.5 animate-spin" />
                        ) : (
                          <>
                            <Wand2 className="size-3.5" />
                            Generate Voice
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-2.5 bg-slate-900/40 rounded-lg border border-slate-800">
                      <span className="text-xs font-semibold text-slate-300">Subscription Paywall</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" {...register(`chapters.${idx}.is_audio_premium`)} />
                        <div className="w-9 h-5 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500 after:bg-white"></div>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-slate-500">Full Commercial Rights Activated.</p>
          <Button type="submit" className="bg-slate-100 hover:bg-white text-slate-950 font-bold px-6 h-10 shadow-lg rounded-xl" disabled={submitting}>
            {submitting ? <Loader2 className="size-4 animate-spin" /> : 'Publish Audio Series'}
          </Button>
        </div>
      </form>
    </div>
  )
}

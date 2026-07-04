import React, { useState, useRef } from 'react'
import { UploadCloud, RefreshCw, Loader2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void
  defaultUrl?: string
}

export function ImageUploader({ onUploadSuccess, defaultUrl }: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string>(defaultUrl || '')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = (event) => {
        const img = new Image()
        img.src = event.target?.result as string
        img.onload = () => {
          const canvas = document.createElement('canvas')
          let width = img.width
          let height = img.height

          const MAX_WIDTH = 600
          const MAX_HEIGHT = 800

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width
              width = MAX_WIDTH
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height
              height = MAX_HEIGHT
            }
          }

          canvas.width = width
          canvas.height = height
          const ctx = canvas.getContext('2d')
          ctx?.drawImage(img, 0, 0, width, height)

          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob)
              else reject(new Error('Canvas compression failed.'))
            },
            'image/jpeg',
            0.82
          )
        }
      }
      reader.onerror = (error) => reject(error)
    })
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)
      setUploadProgress(15)

      const compressedBlob = await compressImage(file)
      setUploadProgress(45)

      const fileName = `${Math.random()}_${Date.now()}.jpg`
      const filePath = `covers/${fileName}`

      setUploadProgress(70)
      const { error: uploadError } = await supabase.storage
        .from('book-covers')
        .upload(filePath, compressedBlob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from('book-covers').getPublicUrl(filePath)
      
      setPreviewUrl(data.publicUrl)
      onUploadSuccess(data.publicUrl)
      setUploadProgress(100)
    } catch (error: any) {
      console.error(error)
      alert("Upload failed: " + error.message)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="space-y-2 w-full">
      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
        Book Cover Asset *
      </label>
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      <div 
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className="relative w-full h-52 rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 flex flex-col items-center justify-center overflow-hidden cursor-pointer"
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <div className="bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-bold text-white">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" /> Change Cover Photo
              </div>
            </div>
          </>
        ) : (
          <div className="text-center p-4 space-y-2">
            <div className="w-10 h-10 bg-zinc-900 text-zinc-400 rounded-full flex items-center justify-center mx-auto border border-zinc-800">
              <UploadCloud className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-zinc-200">Upload from Phone / Library</p>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
            <p className="text-xs font-bold text-zinc-200">Uploading... {uploadProgress}%</p>
          </div>
        )}
      </div>
    </div>
  )
}

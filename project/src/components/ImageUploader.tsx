import React, { useState, useRef } from 'react'
import { UploadCloud, Image as ImageIcon, Loader2, RefreshCw } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface ImageUploaderProps {
  onUploadSuccess: (url: string) => void
  defaultUrl?: string
}

export function ImageUploader({ onUploadSuccess, defaultUrl }: ImageUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string>(defaultUrl || '')
  const [isUploading, setIsPlaying] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 🔄 Mobile-Optimized Compression Engine (Bypasses heavy canvas lags)
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

          // Max resolution matrix window scale for professional book covers
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

          // Compress to JPEG with 82% quality layout threshold
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob)
              else reject(new Error('Canvas compression matrix tracking broke.'))
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
      setIsPlaying(true)
      setUploadProgress(15)

      // 1. Instantly compress file array on your mobile processor
      const compressedBlob = await compressImage(file)
      setUploadProgress(45)

      // 2. Generate clean filename signature string
      const fileExt = 'jpg'
      const fileName = `${Math.random()}_${Date.now()}.${fileExt}`
      const filePath = `covers/${fileName}`

      // 3. Upload raw payload array to Supabase Storage Node
      setUploadProgress(70)
      const { error: uploadError } = await supabase.storage
        .from('book-covers')
        .upload(filePath, compressedBlob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      // 4. Extract public accessible CDN URL link track
      const { data } = supabase.storage.from('book-covers').getPublicUrl(filePath)
      
      setPreviewUrl(data.publicUrl)
      onUploadSuccess(data.publicUrl)
      setUploadProgress(100)
      
      alert("🎉 Photo successfully compressed & stored in Supabase!")
    } catch (error: any) {
      console.error("Upload error sequence:", error)
      alert("Upload failed: " + error.message)
    } finally {
      setIsPlaying(false)
      setUploadProgress(0)
    }
  }

  const triggerSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-2 w-full">
      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
        Book Cover Asset *
      </label>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />

      <div 
        onClick={!isUploading ? triggerSelect : undefined}
        className={`relative w-full h-52 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all duration-300 cursor-pointer ${
          previewUrl ? 'border-zinc-800 bg-zinc-900/20' : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
        }`}
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="Cover Preview" className="w-full h-full object-cover animate-in fade-in duration-300" />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
              <div className="bg-zinc-900/90 border border-zinc-800 px-3 py-2 rounded-xl flex items-center gap-2 text-xs font-bold text-white shadow-xl">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                Change Cover Photo
              </div>
            </div>
          </>
        ) : (
          <div className="text-center p-4 space-y-2">
            <div className="w-10 h-10 bg-zinc-900 text-zinc-400 rounded-full flex items-center justify-center mx-auto border border-zinc-800">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-zinc-200">Upload from Phone / Library</p>
              <p className="text-[10px] text-zinc-500 font-medium">Auto-compressed high-performance layer</p>
            </div>
          </div>
        )}

        {/* LOADING INDICATOR STREAMBAR */}
        {isUploading && (
          <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center space-y-3 animate-in fade-in">
            <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
            <div className="text-center space-y-1">
              <p className="text-xs font-bold tracking-wide text-zinc-200">Processing Matrix... {uploadProgress}%</p>
              <div className="w-32 h-1 bg-zinc-800 rounded-full overflow-hidden mx-auto">
                <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

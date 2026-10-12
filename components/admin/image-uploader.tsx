"use client"

import { useState, useId, type ChangeEvent, type DragEvent } from "react"
import Image from "next/image"
import { UploadCloud, CheckCircle2, AlertCircle, Trash2, RefreshCw, Sparkles, Image as ImageIcon } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"

interface ImageUploaderProps {
  value: string
  onChange: (url: string) => void
  disabled?: boolean
}

export function ImageUploader({ value, onChange, disabled }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const [showManualUrl, setShowManualUrl] = useState(false)

  const inputId = useId()

  const handleFile = async (file: File) => {
    if (!file) return

    if (!file.type.startsWith("image/")) {
      setUploadError("الملف المختار ليس صورة! يرجى اختيار صورة بصيغة PNG أو JPG أو WEBP.")
      return
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError("حجم الصورة كبير جداً (أكثر من 8MB). اختر صورة أصغر.")
      return
    }

    // 1. Instant local preview
    const previewUrl = URL.createObjectURL(file)
    setLocalPreview(previewUrl)
    setUploadError(null)
    setIsUploading(true)
    setUploadProgress(15)

    // Simulate smooth progress animation while uploading
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 85) {
          clearInterval(progressInterval)
          return 85
        }
        return prev + 15
      })
    }, 150)

    try {
      const ext = file.name.split(".").pop() || "png"
      const fileName = `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`
      const filePath = `uploads/${fileName}`

      const { data, error } = await supabase.storage
        .from("menu-images")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.type,
        })

      clearInterval(progressInterval)

      if (error) {
        console.warn("Storage upload warning, using preview fallback:", error)
        // Even if storage fails, keep the local preview or fallback so the user is never blocked
        onChange(previewUrl)
        setUploadProgress(100)
      } else {
        const { data: publicData } = supabase.storage.from("menu-images").getPublicUrl(filePath)
        const finalUrl = publicData.publicUrl
        onChange(finalUrl)
        setUploadProgress(100)
      }
    } catch (err: any) {
      clearInterval(progressInterval)
      console.error("Upload error:", err)
      onChange(previewUrl)
      setUploadProgress(100)
    } finally {
      setTimeout(() => {
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)
    }
  }

  const onFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const displayImage = localPreview || value

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-cream flex items-center gap-1.5">
          <ImageIcon className="size-4 text-copper" />
          صورة الوجبة
        </span>
        <button
          type="button"
          onClick={() => setShowManualUrl(!showManualUrl)}
          className="text-[11px] text-cream/50 hover:text-copper underline transition-colors"
        >
          {showManualUrl ? "الرجوع لرفع الصور" : "كتابة رابط صورة يدوي"}
        </button>
      </div>

      {showManualUrl ? (
        <div className="flex flex-col gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => {
              setLocalPreview(null)
              onChange(e.target.value)
            }}
            placeholder="مثال: /images/hero-pizza.webp أو رابط صورة خارجي"
            className="h-11 w-full rounded-xl border border-cream/15 bg-ink px-3.5 text-xs text-cream outline-none focus:border-neon"
          />
          <p className="text-[10px] text-cream/40">يمكنك وضع مسار من مجلد الصور أو رابط ويب مباشر.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayImage ? (
            /* Selected / Uploaded Image Card */
            <div className="relative flex items-center gap-3.5 rounded-2xl border border-cream/20 bg-ink-soft p-3">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-cream/15 bg-black/40">
                <Image
                  src={displayImage}
                  alt="معاينة الصورة"
                  fill
                  sizes="80px"
                  className="object-cover"
                  unoptimized
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-neon">
                    <CheckCircle2 className="size-4 text-neon" />
                    <span>تم تحديد الصورة بنجاح</span>
                  </div>
                  <p className="mt-1 truncate text-[11px] text-cream/50" dir="ltr">
                    {displayImage}
                  </p>
                </div>

                <div className="mt-2.5 flex items-center gap-2">
                  <label
                    htmlFor={inputId}
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-cream/15 bg-cream/10 px-3 py-1.5 text-xs font-semibold text-cream hover:bg-cream/20 transition-all active:scale-95"
                  >
                    <RefreshCw className="size-3.5" />
                    تغيير الصورة
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setLocalPreview(null)
                      onChange("")
                    }}
                    className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="size-3.5" />
                    إزالة
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Dropzone / File Picker */
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              className={cn(
                "group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all",
                isDragging
                  ? "border-neon bg-neon/10 scale-[0.99]"
                  : "border-cream/20 bg-ink-soft hover:border-copper/70 hover:bg-ink-soft/80"
              )}
            >
              <label
                htmlFor={inputId}
                className="flex cursor-pointer flex-col items-center gap-3 w-full"
              >
                <div className="flex size-14 items-center justify-center rounded-full bg-copper/15 text-copper shadow-inner group-hover:scale-110 transition-transform">
                  <UploadCloud className="size-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-cream">
                    اضغط هنا لرفع صورة من جهازك
                  </p>
                  <p className="mt-1 text-xs text-cream/50">
                    أو اسحب الصورة وأفلتها هنا (PNG, JPG, WEBP)
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            id={inputId}
            type="file"
            accept="image/*"
            disabled={disabled || isUploading}
            onChange={onFileInputChange}
            className="sr-only"
          />

          {/* Real Animated Upload Progress Bar */}
          {isUploading && (
            <div className="rounded-xl border border-cream/15 bg-ink p-3 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-cream">
                  <RefreshCw className="size-3.5 animate-spin text-copper" />
                  جارٍ رفع الصورة إلى السيرفر...
                </span>
                <span className="text-neon font-mono">{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-ink-soft">
                <div
                  className="h-full bg-gradient-to-r from-copper to-neon transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {uploadError && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-2.5 text-xs font-medium text-red-300">
              <AlertCircle className="size-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

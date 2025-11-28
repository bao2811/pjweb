"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Upload, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageUploadProps {
  onImageUpload: (url: string) => void
  initialImage?: string
  label?: string
  error?: string
}

export function ImageUpload({ onImageUpload, initialImage, label = "Tải lên hình ảnh", error }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(initialImage || null)
  const [uploadError, setUploadError] = useState<string>("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadError("")

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Tệp phải là hình ảnh")
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Hình ảnh không được vượt quá 5MB")
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    setSelectedFile(file)
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", selectedFile)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Upload thất bại")
      }

      const data = await response.json()
      onImageUpload(data.url)
      setSelectedFile(null)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload thất bại")
      setPreview(initialImage || null)
    } finally {
      setUploading(false)
    }
  }

  const handleRemoveImage = () => {
    setPreview(null)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onImageUpload("")
  }

  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-2">{label}</label>

      {preview ? (
        <div className="relative">
          <img
            src={preview || "/placeholder.svg"}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border border-border"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            disabled={uploading}
            className="absolute top-2 right-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-lg p-2 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
          {uploading && (
            <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-medium">Đang tải lên...</span>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
        >
          <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm font-medium text-foreground">Nhấp để chọn hình ảnh</p>
          <p className="text-xs text-muted-foreground mt-1">Hỗ trợ JPG, PNG, GIF (Tối đa 5MB)</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
        className="hidden"
      />

      {selectedFile && !uploading && (
        <div className="flex gap-2 mt-3">
          <Button type="button" onClick={handleUpload} disabled={uploading} className="flex-1">
            Tải lên
          </Button>
          <Button
            type="button"
            onClick={() => {
              setSelectedFile(null)
              setPreview(null)
              if (fileInputRef.current) {
                fileInputRef.current.value = ""
              }
            }}
            variant="outline"
          >
            Hủy
          </Button>
        </div>
      )}

      {(uploadError || error) && (
        <div className="flex items-center gap-2 mt-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4" />
          <span>{uploadError || error}</span>
        </div>
      )}
    </div>
  )
}

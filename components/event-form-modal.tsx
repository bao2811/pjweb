"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ImageUpload } from "@/components/image-upload"
import { X } from "lucide-react"
import * as yup from "yup"

interface Event {
  id: string
  name: string
  date: Date
  location: string
  description?: string
  image: string
  volunteersCount: number
  status: "upcoming" | "completed"
  category: string
}

interface EventFormModalProps {
  event?: Event | null
  onSubmit: (data: any) => void
  onClose: () => void
}

const validationSchema = yup.object({
  name: yup.string().required("Tên sự kiện là bắt buộc"),
  date: yup.string().required("Ngày tổ chức là bắt buộc"),
  location: yup.string().required("Địa điểm là bắt buộc"),
  description: yup.string().optional(),
  image: yup.string().optional(), // made image optional instead of required
  category: yup.string().required("Loại sự kiện là bắt buộc"),
})

const CATEGORY_OPTIONS = [
  { value: "environment", label: "🌱 Bảo vệ môi trường" },
  { value: "education", label: "📚 Giáo dục" },
  { value: "community", label: "🤝 Cộng đồng" },
  { value: "elderly", label: "👴 Chăm sóc người già" },
  { value: "health", label: "🏥 Y tế & sức khỏe" },
  { value: "other", label: "⭐ Khác" },
]

const DEFAULT_CATEGORY_IMAGES: Record<string, string> = {
  environment: "/environmental-cleanup-volunteers-planting-trees.jpg",
  education: "/students-learning-classroom-teaching-volunteers.jpg",
  community: "/community-service-volunteers-helping-together.jpg",
  elderly: "/elderly-care-volunteers-helping-seniors.jpg",
  health: "/health-wellness-medical-volunteers-clinic.jpg",
  other: "/other-volunteers-community.jpg",
}

export function EventFormModal({ event, onSubmit, onClose }: EventFormModalProps) {
  const [formData, setFormData] = useState({
    name: event?.name || "",
    date: event?.date ? event.date.toISOString().split("T")[0] : "",
    location: event?.location || "",
    description: event?.description || "",
    image: event?.image || "",
    category: event?.category || "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)

  const today = new Date().toISOString().split("T")[0]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleImageUpload = (url: string) => {
    setFormData((prev) => ({ ...prev, image: url }))
    if (errors.image) {
      setErrors((prev) => ({ ...prev, image: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)

    try {
      await validationSchema.validate(formData, { abortEarly: false })

      // Check date is not in the past
      if (!event && new Date(formData.date) < new Date(today)) {
        setErrors((prev) => ({
          ...prev,
          date: "Ngày tổ chức không được nhỏ hơn hôm nay",
        }))
        return
      }

      const finalFormData = {
        ...formData,
        image: formData.image || DEFAULT_CATEGORY_IMAGES[formData.category] || "/placeholder.svg",
      }

      onSubmit(finalFormData)
    } catch (err: any) {
      const newErrors: Record<string, string> = {}
      err.inner?.forEach((error: any) => {
        newErrors[error.path] = error.message
      })
      setErrors(newErrors)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card border border-border rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">{event ? "Chỉnh sửa sự kiện" : "Tạo sự kiện mới"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <ImageUpload
            onImageUpload={handleImageUpload}
            initialImage={formData.image}
            label="Hình ảnh sự kiện (tuỳ chọn)" // updated label to show optional
            error={errors.image}
          />

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Tên sự kiện *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập tên sự kiện"
              className={`w-full px-4 py-2 rounded-lg border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                errors.name ? "border-destructive" : "border-border"
              }`}
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Ngày tổ chức *</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={today}
              className={`w-full px-4 py-2 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                errors.date ? "border-destructive" : "border-border"
              }`}
            />
            {errors.date && <p className="text-sm text-destructive mt-1">{errors.date}</p>}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Địa điểm *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Nhập địa điểm sự kiện"
              className={`w-full px-4 py-2 rounded-lg border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                errors.location ? "border-destructive" : "border-border"
              }`}
            />
            {errors.location && <p className="text-sm text-destructive mt-1">{errors.location}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Loại sự kiện *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-lg border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                errors.category ? "border-destructive" : "border-border"
              }`}
            >
              <option value="">-- Chọn loại sự kiện --</option>
              {CATEGORY_OPTIONS.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-sm text-destructive mt-1">{errors.category}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Mô tả (tuỳ chọn)</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Nhập mô tả sự kiện"
              rows={4}
              className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 text-foreground border-border hover:bg-muted bg-transparent"
            >
              Hủy
            </Button>
            <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground">
              {event ? "Cập nhật" : "Tạo"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

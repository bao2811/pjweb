"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Eye, Edit2, Trash2, Calendar, MapPin, Users } from "lucide-react"
import { EventFormModal } from "@/components/event-form-modal"
import { EventDetailPage } from "@/components/event-detail-page"
import { format } from "date-fns"

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

const EVENT_CATEGORIES = [
  { id: "all", name: "Tất cả sự kiện", icon: "📋" },
  { id: "environment", name: "Bảo vệ môi trường", icon: "🌱" },
  { id: "education", name: "Giáo dục", icon: "📚" },
  { id: "community", name: "Cộng đồng", icon: "🤝" },
  { id: "elderly", name: "Chăm sóc người già", icon: "👴" },
  { id: "health", name: "Y tế & sức khỏe", icon: "🏥" },
  { id: "other", name: "Khác", icon: "⭐" }, // added new "other" category
]

export function EventManagementPage() {
  const [events, setEvents] = useState<Event[]>([
    {
      id: "1",
      name: "Vệ sinh môi trường biển",
      date: new Date(2025, 0, 15),
      location: "Bãi biển Mỹ Khê",
      description: "Chiến dịch vệ sinh môi trường biển",
      image: "/beach-cleanup.jpg",
      volunteersCount: 24,
      status: "upcoming",
      category: "environment",
    },
    {
      id: "2",
      name: "Dạy học tình nguyện",
      date: new Date(2024, 11, 20),
      location: "Trường tiểu học Lê Lợi",
      description: "Hỗ trợ giáo dục cho trẻ em",
      image: "/teaching-volunteers.jpg",
      volunteersCount: 15,
      status: "completed",
      category: "education",
    },
    {
      id: "3",
      name: "Trồng cây xanh",
      date: new Date(2025, 1, 1),
      location: "Công viên Tao Đàn",
      description: "Chiến dịch bảo vệ môi trường",
      image: "/tree-planting.jpg",
      volunteersCount: 32,
      status: "upcoming",
      category: "environment",
    },
    {
      id: "4",
      name: "Thăm viếng người già",
      date: new Date(2024, 10, 15),
      location: "Viện dưỡng lão Quốc tế",
      description: "Chăm sóc cộng đồng",
      image: "/elderly-care.jpg",
      volunteersCount: 8,
      status: "completed",
      category: "elderly",
    },
  ])

  const [showFormModal, setShowFormModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showDetailPage, setShowDetailPage] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredEvents = events.filter((event) => selectedCategory === "all" || event.category === selectedCategory)

  const handleCreateEvent = (formData: any) => {
    const newEvent: Event = {
      id: Date.now().toString(),
      name: formData.name,
      date: new Date(formData.date),
      location: formData.location,
      description: formData.description,
      image: formData.image,
      volunteersCount: 0,
      status: "upcoming",
      category: formData.category,
    }
    setEvents([...events, newEvent])
    setShowFormModal(false)
  }

  const handleEditEvent = (formData: any) => {
    if (!editingEvent) return
    const updatedEvents = events.map((e) =>
      e.id === editingEvent.id
        ? {
            ...e,
            name: formData.name,
            date: new Date(formData.date),
            location: formData.location,
            description: formData.description,
            image: formData.image,
            category: formData.category,
          }
        : e,
    )
    setEvents(updatedEvents)
    setShowFormModal(false)
    setEditingEvent(null)
  }

  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id))
  }

  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event)
    setShowDetailPage(true)
  }

  const handleEditClick = (event: Event) => {
    setEditingEvent(event)
    setShowFormModal(true)
  }

  if (showDetailPage && selectedEvent) {
    return (
      <EventDetailPage
        event={selectedEvent}
        onBack={() => {
          setShowDetailPage(false)
          setSelectedEvent(null)
        }}
      />
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <div className="flex h-screen">
        <aside className="w-64 bg-card border-r border-border p-6 overflow-y-auto">
          <h2 className="text-lg font-bold text-foreground mb-6">Phân loại sự kiện</h2>
          <nav className="space-y-2">
            {EVENT_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-3 ${
                  selectedCategory === cat.id ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                }`}
              >
                <span className="text-xl">{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-foreground">Quản lý sự kiện</h1>
                  <p className="text-muted-foreground">{filteredEvents.length} sự kiện</p>
                </div>
              </div>
              <Button
                onClick={() => {
                  setEditingEvent(null)
                  setShowFormModal(true)
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                size="lg"
              >
                <Plus className="w-5 h-5" />
                Tạo sự kiện
              </Button>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <Card
                    key={event.id}
                    className="overflow-hidden hover:shadow-lg transition-all duration-300 border border-border/50 bg-card hover:border-primary/30"
                  >
                    {/* Image */}
                    <div className="relative w-full h-48 bg-muted overflow-hidden">
                      <img
                        src={event.image || "/placeholder.svg"}
                        alt={event.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div
                        className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold text-primary-foreground ${event.status === "upcoming" ? "bg-primary" : "bg-muted"}`}
                      >
                        {event.status === "upcoming" ? "Sắp diễn ra" : "Đã kết thúc"}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-foreground mb-3 line-clamp-2">{event.name}</h3>

                      {/* Date and Location */}
                      <div className="space-y-2 mb-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span>{format(event.date, "dd/MM/yyyy")}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                      </div>

                      {/* Volunteers Count */}
                      <div className="flex items-center gap-2 mb-4 p-2 bg-accent/10 rounded-lg">
                        <Users className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">
                          {event.volunteersCount} tình nguyện viên
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewEvent(event)}
                          className="flex-1 text-primary border-primary/50 hover:bg-primary/10"
                        >
                          <Eye className="w-4 h-4" />
                          Xem
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(event)}
                          className="flex-1 text-primary border-primary/50 hover:bg-primary/10"
                        >
                          <Edit2 className="w-4 h-4" />
                          Sửa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteEvent(event.id)}
                          className="flex-1 text-destructive border-destructive/50 hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                          Xóa
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground text-lg">Không có sự kiện nào trong loại này</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showFormModal && (
        <EventFormModal
          event={editingEvent}
          onSubmit={editingEvent ? handleEditEvent : handleCreateEvent}
          onClose={() => {
            setShowFormModal(false)
            setEditingEvent(null)
          }}
        />
      )}
    </main>
  )
}

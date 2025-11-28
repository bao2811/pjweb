"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Check, X } from "lucide-react"

interface Event {
  id: string
  name: string
  date: Date
  location: string
  description?: string
  image: string
  volunteersCount: number
  status: "upcoming" | "completed"
}

interface Volunteer {
  id: string
  name: string
  email: string
  completed: boolean
}

interface CompletionTabProps {
  event: Event
}

export function CompletionTab({ event }: CompletionTabProps) {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([
    { id: "1", name: "Nguyễn Văn A", email: "nguyenvana@email.com", completed: true },
    { id: "2", name: "Trần Thị B", email: "tranthib@email.com", completed: true },
    { id: "3", name: "Lê Văn C", email: "levanc@email.com", completed: false },
    { id: "4", name: "Đỗ Văn E", email: "dovane@email.com", completed: true },
  ])

  const handleToggleCompletion = (id: string) => {
    setVolunteers(volunteers.map((v) => (v.id === id ? { ...v, completed: !v.completed } : v)))
  }

  const completedCount = volunteers.filter((v) => v.completed).length
  const pendingCount = volunteers.filter((v) => !v.completed).length

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4 border border-border/50 bg-muted/30">
          <p className="text-2xl font-bold text-primary">{volunteers.length}</p>
          <p className="text-sm text-muted-foreground">Tổng số</p>
        </Card>
        <Card className="p-4 border border-border/50 bg-muted/30">
          <p className="text-2xl font-bold text-primary">{completedCount}</p>
          <p className="text-sm text-muted-foreground">Đã hoàn thành</p>
        </Card>
        <Card className="p-4 border border-border/50 bg-muted/30">
          <p className="text-2xl font-bold text-secondary">{pendingCount}</p>
          <p className="text-sm text-muted-foreground">Chưa hoàn thành</p>
        </Card>
      </div>

      <div className="space-y-3">
        {volunteers.map((volunteer) => (
          <Card
            key={volunteer.id}
            className="p-4 border border-border/50 bg-card/50 hover:border-primary/30 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1">
                <p className="font-semibold text-foreground">{volunteer.name}</p>
                <p className="text-sm text-muted-foreground">{volunteer.email}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleCompletion(volunteer.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    volunteer.completed
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {volunteer.completed ? (
                    <>
                      <Check className="w-4 h-4" />
                      Đã hoàn thành
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4" />
                      Chưa hoàn thành
                    </>
                  )}
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check, X, Clock } from "lucide-react"

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
  status: "pending" | "approved" | "rejected"
}

interface RegistrationTabProps {
  event: Event
}

export function RegistrationTab({ event }: RegistrationTabProps) {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([
    { id: "1", name: "Nguyễn Văn A", email: "nguyenvana@email.com", status: "pending" },
    { id: "2", name: "Trần Thị B", email: "tranthib@email.com", status: "approved" },
    { id: "3", name: "Lê Văn C", email: "levanc@email.com", status: "pending" },
    { id: "4", name: "Phạm Thị D", email: "phamthid@email.com", status: "rejected" },
    { id: "5", name: "Đỗ Văn E", email: "dovane@email.com", status: "approved" },
  ])

  const handleApprove = (id: string) => {
    setVolunteers(volunteers.map((v) => (v.id === id ? { ...v, status: "approved" } : v)))
  }

  const handleReject = (id: string) => {
    setVolunteers(volunteers.map((v) => (v.id === id ? { ...v, status: "rejected" } : v)))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-primary-foreground bg-primary">
            <Check className="w-3 h-3" /> Đã duyệt
          </span>
        )
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-destructive-foreground bg-destructive">
            <X className="w-3 h-3" /> Từ chối
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold text-secondary-foreground bg-secondary">
            <Clock className="w-3 h-3" /> Chờ duyệt
          </span>
        )
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card className="p-4 border border-border/50 bg-muted/30">
          <p className="text-2xl font-bold text-primary">{volunteers.length}</p>
          <p className="text-sm text-muted-foreground">Tổng đơn</p>
        </Card>
        <Card className="p-4 border border-border/50 bg-muted/30">
          <p className="text-2xl font-bold text-primary">{volunteers.filter((v) => v.status === "approved").length}</p>
          <p className="text-sm text-muted-foreground">Đã duyệt</p>
        </Card>
        <Card className="p-4 border border-border/50 bg-muted/30">
          <p className="text-2xl font-bold text-secondary">{volunteers.filter((v) => v.status === "pending").length}</p>
          <p className="text-sm text-muted-foreground">Chờ duyệt</p>
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
                {getStatusBadge(volunteer.status)}

                {volunteer.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(volunteer.id)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleReject(volunteer.id)}
                      className="text-destructive border-destructive/50 hover:bg-destructive/10"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

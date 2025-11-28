"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

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

interface ReportTabProps {
  event: Event
}

export function ReportTab({ event }: ReportTabProps) {
  const [filter, setFilter] = useState<"all" | "completed" | "incomplete">("all")

  const allVolunteers: Volunteer[] = [
    { id: "1", name: "Nguyễn Văn A", email: "nguyenvana@email.com", completed: true },
    { id: "2", name: "Trần Thị B", email: "tranthib@email.com", completed: true },
    { id: "3", name: "Lê Văn C", email: "levanc@email.com", completed: false },
    { id: "4", name: "Phạm Thị D", email: "phamthid@email.com", completed: true },
    { id: "5", name: "Đỗ Văn E", email: "dovane@email.com", completed: false },
  ]

  const filteredVolunteers = allVolunteers.filter((v) => {
    if (filter === "completed") return v.completed
    if (filter === "incomplete") return !v.completed
    return true
  })

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="p-4 border border-border/50 bg-muted/30">
          <p className="text-2xl font-bold text-primary">{allVolunteers.length}</p>
          <p className="text-sm text-muted-foreground">Tổng số</p>
        </Card>
        <Card className="p-4 border border-border/50 bg-muted/30">
          <p className="text-2xl font-bold text-primary">{allVolunteers.filter((v) => v.completed).length}</p>
          <p className="text-sm text-muted-foreground">Hoàn thành</p>
        </Card>
        <Card className="p-4 border border-border/50 bg-muted/30">
          <p className="text-2xl font-bold text-secondary">{allVolunteers.filter((v) => !v.completed).length}</p>
          <p className="text-sm text-muted-foreground">Chưa HT</p>
        </Card>
        <Card className="p-4 border border-border/50 bg-muted/30">
          <p className="text-2xl font-bold text-accent">
            {Math.round((allVolunteers.filter((v) => v.completed).length / allVolunteers.length) * 100)}%
          </p>
          <p className="text-sm text-muted-foreground">Tỷ lệ</p>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["all", "completed", "incomplete"] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            onClick={() => setFilter(f)}
            className={filter === f ? "bg-primary text-primary-foreground" : "border-border/50 text-muted-foreground"}
          >
            {f === "all" && "Tất cả"}
            {f === "completed" && "Đã hoàn thành"}
            {f === "incomplete" && "Chưa hoàn thành"}
          </Button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="px-4 py-3 font-semibold text-foreground">Tên</th>
              <th className="px-4 py-3 font-semibold text-foreground">Email</th>
              <th className="px-4 py-3 font-semibold text-foreground text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {filteredVolunteers.map((volunteer) => (
              <tr key={volunteer.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-foreground">{volunteer.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{volunteer.email}</td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                      volunteer.completed
                        ? "text-primary-foreground bg-primary"
                        : "text-secondary-foreground bg-secondary"
                    }`}
                  >
                    {volunteer.completed ? "✓ Hoàn thành" : "✗ Chưa HT"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

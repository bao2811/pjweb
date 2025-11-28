"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Calendar, MapPin, Users, FileText } from "lucide-react"
import { format } from "date-fns"
import { RegistrationTab } from "@/components/tabs/registration-tab"
import { CompletionTab } from "@/components/tabs/completion-tab"
import { ReportTab } from "@/components/tabs/report-tab"

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

interface EventDetailPageProps {
  event: Event
  onBack: () => void
}

export function EventDetailPage({ event, onBack }: EventDetailPageProps) {
  const [activeTab, setActiveTab] = useState("registration")

  const tabs = [
    { id: "registration", label: "Xác nhận đăng ký", icon: Users },
    { id: "completion", label: "Đánh dấu hoàn thành", icon: FileText },
    { id: "report", label: "Xem báo cáo", icon: FileText },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <Button
          variant="outline"
          onClick={onBack}
          className="mb-6 text-primary border-primary/50 hover:bg-primary/10 bg-transparent"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại
        </Button>

        {/* Event Header */}
        <div className="mb-8">
          <div className="relative w-full h-64 bg-muted rounded-xl overflow-hidden mb-6 border border-border/50">
            <img src={event.image || "/placeholder.svg"} alt={event.name} className="w-full h-full object-cover" />
          </div>

          <h1 className="text-4xl font-bold text-foreground mb-4">{event.name}</h1>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-4 border border-border/50 bg-card/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Ngày tổ chức</p>
                  <p className="font-semibold text-foreground">{format(event.date, "dd/MM/yyyy")}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border border-border/50 bg-card/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Địa điểm</p>
                  <p className="font-semibold text-foreground line-clamp-2">{event.location}</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 border border-border/50 bg-card/50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tình nguyện viên</p>
                  <p className="font-semibold text-foreground">{event.volunteersCount} người</p>
                </div>
              </div>
            </Card>
          </div>

          {event.description && (
            <Card className="mt-4 p-4 border border-border/50 bg-card/50">
              <p className="text-sm text-muted-foreground mb-2">Mô tả</p>
              <p className="text-foreground">{event.description}</p>
            </Card>
          )}
        </div>

        {/* Tabs */}
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
          {/* Tab Navigation */}
          <div className="flex flex-wrap border-b border-border bg-muted/30">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-3 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
                </button>
              )
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === "registration" && <RegistrationTab event={event} />}
            {activeTab === "completion" && <CompletionTab event={event} />}
            {activeTab === "report" && <ReportTab event={event} />}
          </div>
        </div>
      </div>
    </main>
  )
}

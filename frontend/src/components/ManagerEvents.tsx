"use client";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { authFetch } from "@/utils/auth";
import { useAuth } from "@/hooks/useAuth";
import CreateEventModal from "@/components/CreateEventModal";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSpinner,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaHourglassHalf,
} from "react-icons/fa";

// Manager view aligns with user events card/filters but scoped to own events
interface ManagerEvent {
  id: number;
  eventId?: string; // string id for routes if needed
  title: string;
  content?: string;
  image: string;
  start_time?: string;
  end_time?: string;
  address: string;
  max_participants?: number;
  category?: string;
  // Lifecycle status for display on card (like user events.tsx)
  lifecycleStatus: "upcoming" | "ongoing" | "completed" | "cancelled";
  // Approval flow status (pending/approved/rejected)
  approvalStatus: "pending" | "approved" | "rejected";
  current_participants?: number;
  participants_count?: number;
  approved_participants?: number;
  created_at?: string;
  approved_at?: string | null;
}

export default function ManagerEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<ManagerEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Filters similar to user events component
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "upcoming" | "ongoing" | "completed" | "cancelled"
  >("all");
  const [approvalFilter, setApprovalFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");
  const [dateFilter, setDateFilter] = useState<
    "all" | "today" | "tomorrow" | "this_week" | "this_month"
  >("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      setIsLoading(true);
      // API lấy events của manager hiện tại
      const response = await authFetch("/manager/my-events");
      const data = await response.json();
      
      if (data && Array.isArray(data.events)) {
        // Transform to align with user card expectations
        const transformed: ManagerEvent[] = data.events.map((e: any) => {
          const start = e.start_time ? new Date(e.start_time) : null;
          const end = e.end_time ? new Date(e.end_time) : null;
          const now = new Date();
          let lifecycle: "upcoming" | "ongoing" | "completed" | "cancelled" = "upcoming";
          if (e.cancelled === true || e.status === "cancelled") {
            lifecycle = "cancelled";
          } else if (start && end) {
            if (now < start) lifecycle = "upcoming";
            else if (now >= start && now <= end) lifecycle = "ongoing";
            else lifecycle = "completed";
          } else if (end && now > end) {
            lifecycle = "completed";
          }

          const approval: "pending" | "approved" | "rejected" =
            e.approval_status ||
            (e.status === "pending" || e.status === "approved" || e.status === "rejected"
              ? e.status
              : "approved");

          return {
            id: Number(e.id),
            eventId: String(e.id),
            title: e.title,
            content: e.content,
            image:
              e.image ||
              "https://images.unsplash.com/photo-1559027615-cd4628902d4a",
            start_time: e.start_time,
            end_time: e.end_time,
            address: e.address,
            max_participants: e.max_participants ?? e.maxParticipants,
            category: e.category,
            lifecycleStatus: lifecycle,
            approvalStatus: approval,
            current_participants:
              e.current_participants ?? e.currentParticipants ?? e.participants_count ?? 0,
            participants_count: e.participants_count ?? e.current_participants ?? 0,
            approved_participants: e.approved_participants ?? e.participating_count ?? 0,
            created_at: e.created_at,
            approved_at: e.approved_at ?? null,
          } as ManagerEvent;
        });
        setEvents(transformed);
      }
    } catch (error) {
      console.error("Error fetching manager events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * FIX #3: Sử dụng route DELETE của manager thay vì route chung
   */
  const handleDeleteEvent = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa sự kiện này?")) return;

    try {
      // FIX #3: Gọi API /manager/events/{id} với kiểm tra quyền sở hữu
      const response = await authFetch(`/manager/events/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (data.success) {
        alert("Đã xóa sự kiện thành công!");
        fetchMyEvents();
      } else {
        alert(data.message || "Có lỗi xảy ra khi xóa sự kiện");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Có lỗi xảy ra khi xóa sự kiện");
    }
  };

  const getLifecycleBadge = (status: ManagerEvent["lifecycleStatus"]) => {
    const map: Record<ManagerEvent["lifecycleStatus"], { label: string; classes: string; Icon?: any }> = {
      upcoming: { label: "Sắp diễn ra", classes: "bg-blue-100 text-blue-700", Icon: FaClock },
      ongoing: { label: "Đang diễn ra", classes: "bg-green-100 text-green-700", Icon: FaCheckCircle },
      completed: { label: "Đã kết thúc", classes: "bg-gray-100 text-gray-700", Icon: FaCheckCircle },
      cancelled: { label: "Đã hủy", classes: "bg-red-100 text-red-700", Icon: FaTimesCircle },
    };
    const conf = map[status];
    const Icon = conf.Icon;
    return (
      <span className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold ${conf.classes}`}>
        {Icon ? <Icon /> : null}
        <span>{conf.label}</span>
      </span>
    );
  };

  const getApprovalBadge = (status: ManagerEvent["approvalStatus"]) => {
    const map: Record<ManagerEvent["approvalStatus"], { label: string; classes: string; Icon?: any }> = {
      pending: { label: "Chờ duyệt", classes: "bg-yellow-100 text-yellow-700", Icon: FaHourglassHalf },
      approved: { label: "Đã duyệt", classes: "bg-emerald-100 text-emerald-700", Icon: FaCheckCircle },
      rejected: { label: "Bị từ chối", classes: "bg-red-100 text-red-700", Icon: FaTimesCircle },
    };
    const conf = map[status];
    const Icon = conf.Icon;
    return (
      <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${conf.classes}`}>
        {Icon ? <Icon /> : null}
        <span>{conf.label}</span>
      </span>
    );
  };

  const formatDate = (iso?: string | null) => {
    if (!iso) return "-";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleString("vi-VN", {
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Compute filtered list similar to user events page
  const filteredEvents = useMemo(() => {
    let list = [...events];

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(term) ||
          (e.content || "").toLowerCase().includes(term) ||
          e.address.toLowerCase().includes(term)
      );
    }

    // Category
    if (selectedCategory !== "all") {
      list = list.filter((e) => (e.category || "").toLowerCase() === selectedCategory.toLowerCase());
    }

    // Lifecycle status
    if (selectedStatus !== "all") {
      list = list.filter((e) => e.lifecycleStatus === selectedStatus);
    }

    // Approval status filter
    if (approvalFilter !== "all") {
      list = list.filter((e) => e.approvalStatus === approvalFilter);
    }

    // Date filter (based on start_time)
    if (dateFilter !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);

      const startOfWeek = new Date(today);
      const day = startOfWeek.getDay();
      const diff = (day === 0 ? -6 : 1) - day; // start Monday
      startOfWeek.setDate(startOfWeek.getDate() + diff);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      endOfMonth.setHours(23, 59, 59, 999);

      list = list.filter((e) => {
        const d = e.start_time ? new Date(e.start_time) : null;
        if (!d) return false;
        switch (dateFilter) {
          case "today":
            return d >= today && d <= endOfToday;
          case "tomorrow": {
            const tmrStart = new Date(today);
            tmrStart.setDate(today.getDate() + 1);
            const tmrEnd = new Date(tmrStart);
            tmrEnd.setHours(23, 59, 59, 999);
            return d >= tmrStart && d <= tmrEnd;
          }
          case "this_week":
            return d >= startOfWeek && d <= endOfWeek;
          case "this_month":
            return d >= startOfMonth && d <= endOfMonth;
          default:
            return true;
        }
      });
    }

    // Sort by date ascending (like user default)
    list.sort((a, b) => {
      const da = a.start_time ? new Date(a.start_time).getTime() : 0;
      const db = b.start_time ? new Date(b.start_time).getTime() : 0;
      return da - db;
    });

    return list;
  }, [events, searchTerm, selectedCategory, selectedStatus, approvalFilter, dateFilter]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-6xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Đang tải sự kiện của bạn...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 pt-4">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              📋 Quản lý sự kiện
            </h1>
            <p className="text-gray-500 text-sm mt-1">Quản lý các sự kiện bạn đã tạo</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <FaPlus />
            <span>Tạo sự kiện mới</span>
          </button>
        </div>
      </div>

      {/* Filters matching user events style */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 max-w-md">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Tìm kiếm sự kiện..."
              className="w-full px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-blue-400 focus:outline-none transition-colors"
            />
          </div>
          <div className="flex items-center gap-3 ml-4">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white hover:border-blue-300 focus:border-blue-400 focus:outline-none transition-colors cursor-pointer"
            >
              <option value="all">📂 Tất cả thể loại</option>
              <option value="Môi trường">🌱 Môi trường</option>
              <option value="Giáo dục">📚 Giáo dục</option>
              <option value="Xã hội">🤝 Xã hội</option>
              <option value="Y tế">⚕️ Y tế</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white hover:border-purple-300 focus:border-purple-400 focus:outline-none transition-colors cursor-pointer"
            >
              <option value="all">📊 Tất cả trạng thái</option>
              <option value="upcoming">🔵 Sắp diễn ra</option>
              <option value="ongoing">🟢 Đang diễn ra</option>
              <option value="completed">⚪ Đã kết thúc</option>
              <option value="cancelled">🔴 Đã hủy</option>
            </select>
            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value as any)}
              className="px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white hover:border-green-300 focus:border-green-400 focus:outline-none transition-colors cursor-pointer"
            >
              <option value="all">✓ Tất cả duyệt</option>
              <option value="pending">⏳ Chờ duyệt</option>
              <option value="approved">✅ Đã duyệt</option>
              <option value="rejected">❌ Bị từ chối</option>
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="px-4 py-2.5 rounded-xl border-2 border-gray-200 bg-white hover:border-orange-300 focus:border-orange-400 focus:outline-none transition-colors cursor-pointer"
            >
              <option value="all">📅 Tất cả thời gian</option>
              <option value="today">📍 Hôm nay</option>
              <option value="tomorrow">➡️ Ngày mai</option>
              <option value="this_week">📆 Tuần này</option>
              <option value="this_month">🗓️ Tháng này</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 pb-6">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              Chưa có sự kiện nào
            </h2>
            <p className="text-gray-500 mb-6">
              Hãy tạo sự kiện đầu tiên của bạn!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <FaPlus />
              <span>Tạo sự kiện mới</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-100 flex flex-col"
              >
                {/* Event Image */}
                <div className="relative h-48 group">
                  <Image
                    src={event.image || "https://images.unsplash.com/photo-1559027615-cd4628902d4a"}
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    {getLifecycleBadge(event.lifecycleStatus)}
                  </div>
                  {/* Category Badge */}
                  <div className="absolute bottom-3 left-3">
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-full text-xs font-semibold shadow">
                      {event.category || "Khác"}
                    </span>
                  </div>
                </div>

                {/* Event Info */}
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer min-h-[3.5rem]">
                    {event.title}
                  </h3>

                  <div className="space-y-2 mb-3 flex-1">
                    <div className="flex items-center text-xs text-gray-600">
                      <FaCalendarAlt className="mr-2 text-blue-500 flex-shrink-0 text-sm" />
                      <span>
                        {event.start_time
                          ? new Date(event.start_time).toLocaleString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })
                          : "-"}
                      </span>
                    </div>
                    <div className="flex items-start text-xs text-gray-600">
                      <FaMapMarkerAlt className="mr-2 text-red-500 flex-shrink-0 mt-0.5 text-sm" />
                      <span className="line-clamp-1">{event.address}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <FaUsers className="mr-2 text-green-500 flex-shrink-0 text-sm" />
                      <span className="font-semibold">
                        {(event.approved_participants ?? 0)}/{event.max_participants ?? 0}
                      </span>
                      <span className="ml-1">người tham gia</span>
                    </div>
                    <div className="flex flex-col gap-1 text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-xs" title="Ngày tạo">⚙️ {formatDate(event.created_at)}</span>
                        {getApprovalBadge(event.approvalStatus)}
                      </div>
                      {/* Hiển thị thời gian duyệt nếu có */}
                      {event.approved_at && (
                        <span className="text-xs text-green-600" title="Ngày duyệt">
                          ✅ Duyệt: {formatDate(event.approved_at)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons - Manager specific */}
                  <div className="flex space-x-1 p-3 border-t border-gray-100 bg-gray-50">
                    <Link
                      href={`/manager/events/${event.id}`}
                      className="flex-1 flex items-center justify-center py-1.5 px-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-xs font-semibold"
                      title="Xem chi tiết"
                    >
                      <FaEye className="text-sm" />
                    </Link>
                    {event.lifecycleStatus === "upcoming" && (
                      <Link
                        href={`/manager/events/${event.id}/edit`}
                        className="flex-1 flex items-center justify-center py-1.5 px-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-xs font-semibold"
                        title="Sửa"
                      >
                        <FaEdit className="text-sm" />
                      </Link>
                    )}
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="flex-1 flex items-center justify-center py-1.5 px-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-xs font-semibold"
                      title="Xóa"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          fetchMyEvents(); // Refresh events list
          setShowCreateModal(false);
        }}
      />
    </div>
  );
}

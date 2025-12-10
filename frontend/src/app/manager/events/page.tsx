"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaPlus,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaEye,
  FaEdit,
  FaTrash,
  FaFilter,
  FaSearch,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
  FaTimes,
  FaCheck,
} from "react-icons/fa";
import api from "@/utils/api";

interface Event {
  id: number;
  title: string;
  description: string;
  image: string;
  start_date: string;
  end_date: string;
  location: string;
  max_participants: number;
  current_participants: number;
  category: string;
  status: "pending" | "approved" | "rejected" | "completed";
  created_at: string;
}

export default function ManagerEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const categories = [
    { value: "all", label: "Tất cả danh mục", icon: "🌟" },
    { value: "environment", label: "Môi trường", icon: "🌱" },
    { value: "education", label: "Giáo dục", icon: "📚" },
    { value: "healthcare", label: "Y tế", icon: "🏥" },
    { value: "community", label: "Cộng đồng", icon: "🤝" },
    { value: "disaster", label: "Thiên tai", icon: "🆘" },
    { value: "culture", label: "Văn hóa", icon: "🎭" },
    { value: "sports", label: "Thể thao", icon: "⚽" },
    { value: "other", label: "Khác", icon: "✨" },
  ];

  useEffect(() => {
    fetchManagerEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, categoryFilter, statusFilter]);

  const fetchManagerEvents = async () => {
    try {
      setLoading(true);
      // Giả sử API trả về events của manager đang login
      const response = await api.get("/events/getAllEvents");
      if (response.data && response.data.events) {
        setEvents(response.data.events);
      }
    } catch (error) {
      console.error("Error fetching manager events:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter((event) => event.category === categoryFilter);
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((event) => event.status === statusFilter);
    }

    setFilteredEvents(filtered);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: FaHourglassHalf,
        label: "Chờ duyệt",
      },
      approved: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: FaCheckCircle,
        label: "Đã duyệt",
      },
      rejected: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: FaTimesCircle,
        label: "Bị từ chối",
      },
      completed: {
        bg: "bg-gray-100",
        text: "text-gray-700",
        icon: FaCheckCircle,
        label: "Đã hoàn thành",
      },
    };

    const badge = badges[status as keyof typeof badges] || badges.pending;
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}
      >
        <Icon className="text-xs" />
        {badge.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Quản lý sự kiện</h1>
              <p className="text-purple-100 mt-2">Tạo và quản lý các sự kiện tình nguyện</p>
            </div>
            <button
              onClick={() => router.push("/manager/events/create")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              <FaPlus />
              <span>Tạo sự kiện mới</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filter Bar - Styled like Events Component */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm sự kiện..."
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 text-base placeholder:text-gray-400 shadow-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {/* Filters - Custom Dropdowns */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Category Filter */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowCategoryDropdown(!showCategoryDropdown);
                    setShowStatusDropdown(false);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-blue-200 rounded-full text-sm font-semibold text-gray-800 hover:border-blue-400 hover:bg-blue-50 transition-all shadow-md hover:shadow-lg min-w-[160px]"
                >
                  {categories.find(c => c.value === categoryFilter)?.icon} {categories.find(c => c.value === categoryFilter)?.label}
                  <svg className={`w-4 h-4 transition-transform ml-auto ${showCategoryDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Category Dropdown */}
                {showCategoryDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowCategoryDropdown(false)}></div>
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-20 max-h-80 overflow-y-auto">
                      {categories.map((cat) => (
                        <button
                          key={cat.value}
                          onClick={() => {
                            setCategoryFilter(cat.value);
                            setShowCategoryDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors flex items-center gap-3 ${
                            categoryFilter === cat.value ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'
                          }`}
                        >
                          <span className="text-lg">{cat.icon}</span>
                          <span>{cat.label}</span>
                          {categoryFilter === cat.value && <FaCheck className="ml-auto text-blue-600" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Status Filter */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowStatusDropdown(!showStatusDropdown);
                    setShowCategoryDropdown(false);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-purple-200 rounded-full text-sm font-semibold text-gray-800 hover:border-purple-400 hover:bg-purple-50 transition-all shadow-md hover:shadow-lg min-w-[160px]"
                >
                  {statusFilter === "all" ? "📋 Tất cả trạng thái" :
                   statusFilter === "pending" ? "⏳ Chờ duyệt" :
                   statusFilter === "approved" ? "✅ Đã duyệt" :
                   statusFilter === "rejected" ? "❌ Bị từ chối" : "🏆 Hoàn thành"}
                  <svg className={`w-4 h-4 transition-transform ml-auto ${showStatusDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Status Dropdown */}
                {showStatusDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowStatusDropdown(false)}></div>
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 py-2 z-20">
                      {[
                        { value: "all", label: "Tất cả trạng thái", icon: "📋" },
                        { value: "pending", label: "Chờ duyệt", icon: "⏳" },
                        { value: "approved", label: "Đã duyệt", icon: "✅" },
                        { value: "rejected", label: "Bị từ chối", icon: "❌" },
                        { value: "completed", label: "Hoàn thành", icon: "🏆" },
                      ].map((status) => (
                        <button
                          key={status.value}
                          onClick={() => {
                            setStatusFilter(status.value);
                            setShowStatusDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 hover:bg-purple-50 transition-colors flex items-center gap-3 ${
                            statusFilter === status.value ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-gray-700'
                          }`}
                        >
                          <span className="text-lg">{status.icon}</span>
                          <span>{status.label}</span>
                          {statusFilter === status.value && <FaCheck className="ml-auto text-purple-600" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Clear Filters */}
              {(categoryFilter !== "all" || statusFilter !== "all" || searchTerm) && (
                <button
                  onClick={() => {
                    setCategoryFilter("all");
                    setStatusFilter("all");
                    setSearchTerm("");
                  }}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-50 to-red-100 text-red-600 hover:from-red-100 hover:to-red-200 rounded-full text-sm font-semibold transition-all flex items-center gap-2 shadow-md hover:shadow-lg border-2 border-red-200"
                >
                  <FaTimes />
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards - Simple & Clean */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Tổng sự kiện</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{filteredEvents.length}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <FaCalendarAlt className="text-blue-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Chờ duyệt</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {filteredEvents.filter((e) => e.status === "pending").length}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center">
                <FaHourglassHalf className="text-yellow-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Đang hoạt động</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {filteredEvents.filter((e) => e.status === "approved").length}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                <FaCheckCircle className="text-green-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Tình nguyện viên</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">
                  {filteredEvents.reduce((sum, e) => sum + (e.current_participants || 0), 0)}
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                <FaUsers className="text-purple-600 text-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-pulse">
                <div className="w-full aspect-[16/9] bg-gray-200"></div>
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaCalendarAlt className="text-purple-600 text-4xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {searchTerm || categoryFilter !== "all" || statusFilter !== "all"
                ? "Không tìm thấy sự kiện"
                : "Chưa có sự kiện nào"}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {searchTerm || categoryFilter !== "all" || statusFilter !== "all"
                ? "Thử thay đổi bộ lọc để xem kết quả khác"
                : "Bắt đầu tạo sự kiện tình nguyện đầu tiên của bạn ngay hôm nay!"}
            </p>
            {!searchTerm && categoryFilter === "all" && statusFilter === "all" && (
              <button
                onClick={() => router.push("/manager/events/create")}
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all transform hover:-translate-y-0.5"
              >
                <FaPlus />
                <span>Tạo sự kiện mới</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                {/* Image */}
                <div className="relative w-full aspect-[16/9] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  <Image
                    src={event.image || "/placeholder-event.jpg"}
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(event.status)}
                  </div>
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700">
                      {categories.find(c => c.value === event.category)?.icon} {categories.find(c => c.value === event.category)?.label || event.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-purple-600 transition-colors min-h-[3.5rem]">
                    {event.title}
                  </h3>

                  <div className="space-y-2.5 mb-4">
                    <div className="flex items-center gap-2.5 text-gray-600">
                      <FaCalendarAlt className="text-purple-500 flex-shrink-0" />
                      <span className="text-sm">{new Date(event.start_date).toLocaleDateString("vi-VN")}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-gray-600">
                      <FaMapMarkerAlt className="text-purple-500 flex-shrink-0" />
                      <span className="text-sm line-clamp-1">{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-gray-600">
                      <FaUsers className="text-purple-500 flex-shrink-0" />
                      <span className="text-sm font-medium">
                        {event.current_participants || 0}/{event.max_participants} người
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <Link
                      href={`/manager/events/${event.id}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                    >
                      <FaEye />
                      <span>Chi tiết</span>
                    </Link>
                    <button
                      onClick={() => router.push(`/manager/events/${event.id}/edit`)}
                      className="p-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Chỉnh sửa"
                    >
                      <FaEdit className="text-lg" />
                    </button>
                    <button
                      className="p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Xóa"
                    >
                      <FaTrash className="text-lg" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { authFetch } from "@/utils/auth";
import Image from "next/image";
import {
  FaCalendarAlt,
  FaSearch,
  FaFilter,
  FaDownload,
  FaUsers,
  FaEye,
  FaTrash,
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimes,
  FaLeaf,
  FaHeart,
  FaGraduationCap,
  FaHandsHelping,
  FaCalendarCheck,
  FaCheck,
  FaBan,
  FaInfoCircle,
  FaUserCircle,
  FaThumbsUp,
} from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Types based on backend Event model
interface Event {
  id: number;
  title: string;
  content: string;
  image: string;
  address: string;
  start_time: string;
  end_time: string;
  author_id: number;
  status: "pending" | "accepted" | "rejected" | "completed" | "expired";
  computed_status?:
    | "upcoming"
    | "ongoing"
    | "completed"
    | "pending"
    | "rejected"
    | "expired"; // Computed status from backend
  max_participants: number;
  current_participants: number;
  category: "environment" | "education" | "health" | "community" | "other";
  likes: number;
  created_at: string;
  updated_at: string;
  author?: {
    id: number;
    username: string;
    email: string;
    image: string;
  };
  members?: Array<{
    id: number;
    username: string;
    email: string;
    phone: string;
    image: string;
    pivot: {
      created_at: string;
    };
  }>;
}

interface Toast {
  id: number;
  type: "success" | "error" | "info";
  message: string;
}

export default function AdminEventsPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: authLoading, hasRole } = useAuth();

  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "approve" | "reject" | "delete";
    eventId: number;
  } | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Check auth and role
  useEffect(() => {
    if (!authLoading) {
      if (!hasRole("admin")) {
        router.push("/unauthorized");
      }
    }
  }, [authLoading, hasRole, router]);

  // Fetch events from API
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch("/admin/getAllEvents");

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const data = await response.json();
      // Ensure events is always an array
      const eventsData = data.events || data;
      setEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch (error) {
      console.error("Error fetching events:", error);
      showToast("error", "Không thể tải danh sách sự kiện");
      setEvents([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Toast system
  const showToast = useCallback(
    (type: "success" | "error" | "info", message: string) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 3000);
    },
    []
  );

  // Helper function - Get the display status
  // Priority: expired > pending > rejected > computed_status (upcoming/ongoing/completed)
  const getDisplayStatus = useCallback((event: Event) => {
    // If event is expired, pending, or rejected, show that status (admin-controlled)
    if (
      event.status === "expired" ||
      event.status === "pending" ||
      event.status === "rejected"
    ) {
      return event.status;
    }
    // Otherwise, use computed_status for time-based status (upcoming/ongoing/completed)
    return event.computed_status || event.status;
  }, []);

  // Filter events
  const filteredEvents = useMemo(() => {
    // Ensure events is an array before filtering
    if (!Array.isArray(events)) {
      return [];
    }

    return events.filter((event) => {
      const matchSearch =
        event.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        event.content.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        event.address.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        event.author?.username
          ?.toLowerCase()
          .includes(debouncedSearch.toLowerCase());

      const matchCategory =
        filterCategory === "all" || event.category === filterCategory;

      // Use computed status for filtering
      const displayStatus = getDisplayStatus(event);
      const matchStatus =
        filterStatus === "all" || displayStatus === filterStatus;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [events, debouncedSearch, filterCategory, filterStatus, getDisplayStatus]);

  // Stats
  const stats = useMemo(() => {
    // Ensure events is an array before calculating stats
    if (!Array.isArray(events)) {
      return {
        total: 0,
        pending: 0,
        expired: 0,
        upcoming: 0,
        ongoing: 0,
        completed: 0,
        totalParticipants: 0,
      };
    }

    return {
      total: events.length,
      pending: events.filter((e) => e.status === "pending").length,
      upcoming: events.filter((e) => getDisplayStatus(e) === "upcoming").length,
      ongoing: events.filter((e) => getDisplayStatus(e) === "ongoing").length,
      completed: events.filter((e) => getDisplayStatus(e) === "completed")
        .length,
      rejected: events.filter((e) => e.status === "rejected").length,
      expired: events.filter((e) => e.status === "expired").length,
      totalParticipants: events.reduce(
        (sum, e) => sum + e.current_participants,
        0
      ),
    };
  }, [events, getDisplayStatus]);

  // Chart data - Calculate from actual events data
  const chartData = useMemo(() => {
    // Get last 12 months
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: `T${date.getMonth() + 1}`,
        year: date.getFullYear(),
        month: date.getMonth(),
      });
    }

    // Count events created per month
    const eventsCreatedByMonth = months.map((m) => {
      return events.filter((event) => {
        const createdDate = new Date(event.created_at);
        return (
          createdDate.getFullYear() === m.year &&
          createdDate.getMonth() === m.month
        );
      }).length;
    });

    // Count approved events per month (status !== pending && status !== rejected && status !== expired)
    const eventsApprovedByMonth = months.map((m) => {
      return events.filter((event) => {
        const createdDate = new Date(event.created_at);
        return (
          createdDate.getFullYear() === m.year &&
          createdDate.getMonth() === m.month &&
          event.status !== "pending" &&
          event.status !== "rejected" &&
          event.status !== "expired"
        );
      }).length;
    });

    // Count total participants per month (based on event start_time)
    const participantsByMonth = months.map((m) => {
      return events
        .filter((event) => {
          const startDate = new Date(event.start_time);
          return (
            startDate.getFullYear() === m.year &&
            startDate.getMonth() === m.month
          );
        })
        .reduce((sum, event) => sum + event.current_participants, 0);
    });

    return {
      labels: months.map((m) => m.label),
      eventsCreated: eventsCreatedByMonth,
      eventsApproved: eventsApprovedByMonth,
      participants: participantsByMonth,
    };
  }, [events]);

  // Helper functions
  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      environment: "Môi trường",
      education: "Giáo dục",
      health: "Sức khỏe",
      community: "Cộng đồng",
      other: "Khác",
    };
    return labels[category] || category;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      environment: {
        icon: FaLeaf,
        color: "text-green-600",
        bg: "bg-green-100",
      },
      education: {
        icon: FaGraduationCap,
        color: "text-blue-600",
        bg: "bg-blue-100",
      },
      health: { icon: FaHeart, color: "text-red-600", bg: "bg-red-100" },
      community: {
        icon: FaHandsHelping,
        color: "text-purple-600",
        bg: "bg-purple-100",
      },
      other: {
        icon: FaInfoCircle,
        color: "text-gray-600",
        bg: "bg-gray-100",
      },
    };
    return icons[category] || icons.other;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Chờ duyệt",
      approved: "Đã duyệt",
      rejected: "Đã từ chối",
      completed: "Hoàn thành",
      upcoming: "Sắp diễn ra",
      ongoing: "Đang diễn ra",
      expired: "Quá hạn xử lý",
    };
    return labels[status] || status;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, any> = {
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: FaHourglassHalf,
      },
      approved: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: FaCheckCircle,
      },
      rejected: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: FaBan,
      },
      completed: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: FaCalendarCheck,
      },
      upcoming: {
        bg: "bg-cyan-100",
        text: "text-cyan-700",
        icon: FaClock,
      },
      ongoing: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: FaCheckCircle,
      },
      expired: {
        bg: "bg-orange-100",
        text: "text-orange-700",
        icon: FaTimes,
      },
    };
    return badges[status] || badges.pending;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Actions
  const handleApproveEvent = async (eventId: number) => {
    setIsLoading(true);
    try {
      const response = await authFetch(`/admin/acceptEvent/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to approve event");

      setEvents(
        events.map((e) =>
          e.id === eventId ? { ...e, status: "accepted" as const } : e
        )
      );
      showToast("success", "Sự kiện đã được chấp nhận!");
      setShowConfirmModal(false);
      setConfirmAction(null);
    } catch (error) {
      console.error("Error accepting event:", error);
      showToast("error", "Không thể chấp nhận sự kiện");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectEvent = async (eventId: number) => {
    setIsLoading(true);
    try {
      const response = await authFetch(`/admin/rejectEvent/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to reject event");

      setEvents(
        events.map((e) =>
          e.id === eventId ? { ...e, status: "rejected" as const } : e
        )
      );
      showToast("success", "Sự kiện đã bị từ chối!");
      setShowConfirmModal(false);
      setConfirmAction(null);
    } catch (error) {
      console.error("Error rejecting event:", error);
      showToast("error", "Không thể từ chối sự kiện");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId: number) => {
    setIsLoading(true);
    try {
      const response = await authFetch(`/admin/deleteEvent/${eventId}`);

      if (!response.ok) throw new Error("Failed to delete event");

      setEvents(events.filter((e) => e.id !== eventId));
      showToast("success", "Sự kiện đã được xóa!");
      setShowConfirmModal(false);
      setConfirmAction(null);
      setShowDetailModal(false);
    } catch (error) {
      console.error("Error deleting event:", error);
      showToast("error", "Không thể xóa sự kiện");
    } finally {
      setIsLoading(false);
    }
  };

  const executeAction = async () => {
    if (!confirmAction) return;

    if (confirmAction.type === "approve") {
      await handleApproveEvent(confirmAction.eventId);
    } else if (confirmAction.type === "reject") {
      await handleRejectEvent(confirmAction.eventId);
    } else if (confirmAction.type === "delete") {
      await handleDeleteEvent(confirmAction.eventId);
    }
  };

  // Export to CSV
  const handleExportEvents = () => {
    const csvHeaders = [
      "ID",
      "Tên sự kiện",
      "Người tổ chức",
      "Chủ đề",
      "Địa điểm",
      "Ngày bắt đầu",
      "Ngày kết thúc",
      "Trạng thái",
      "Tham gia",
      "Tối đa",
      "Lượt thích",
    ];
    const csvRows = filteredEvents.map((event) => [
      event.id,
      event.title,
      event.author?.username || "N/A",
      getCategoryLabel(event.category),
      event.address,
      formatDate(event.start_time) + " " + formatTime(event.start_time),
      formatDate(event.end_time) + " " + formatTime(event.end_time),
      getStatusLabel(getDisplayStatus(event)),
      event.current_participants,
      event.max_participants,
      event.likes,
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `events_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    showToast("success", `Đã xuất ${filteredEvents.length} sự kiện!`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent flex items-center">
                <FaCalendarAlt className="mr-2 text-blue-600" />
                Quản lý sự kiện
              </h1>
              <p className="text-blue-700 mt-1 text-sm sm:text-base">
                Phê duyệt và quản lý các sự kiện trong hệ thống
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportEvents}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-xl transition duration-200 shadow-md hover:shadow-lg text-sm font-medium"
              >
                <FaDownload />
                <span className="hidden sm:inline">Xuất CSV</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 sm:gap-5 mb-8">
          <div className="bg-white rounded-xl p-5 border-l-4 border-blue-500 shadow-md hover:shadow-lg transition duration-200">
            <p className="text-sm sm:text-base text-gray-600 mb-1">Tổng số</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-900">
              {stats.total}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border-l-4 border-yellow-500 shadow-md hover:shadow-lg transition duration-200">
            <p className="text-sm sm:text-base text-gray-600 mb-1">Chờ duyệt</p>
            <p className="text-2xl sm:text-3xl font-bold text-yellow-700">
              {stats.pending}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border-l-4 border-orange-500 shadow-md hover:shadow-lg transition duration-200">
            <p className="text-sm sm:text-base text-gray-600 mb-1">Quá hạn</p>
            <p className="text-2xl sm:text-3xl font-bold text-orange-700">
              {stats.expired}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border-l-4 border-cyan-500 shadow-md hover:shadow-lg transition duration-200">
            <p className="text-sm sm:text-base text-gray-600 mb-1">
              Sắp diễn ra
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-cyan-700">
              {stats.upcoming}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border-l-4 border-green-500 shadow-md hover:shadow-lg transition duration-200">
            <p className="text-sm sm:text-base text-gray-600 mb-1">
              Đang diễn ra
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-green-700">
              {stats.ongoing}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border-l-4 border-blue-500 shadow-md hover:shadow-lg transition duration-200">
            <p className="text-sm sm:text-base text-gray-600 mb-1">
              Hoàn thành
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-700">
              {stats.completed}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border-l-4 border-purple-500 shadow-md hover:shadow-lg transition duration-200">
            <p className="text-sm sm:text-base text-gray-600 mb-1">Tham gia</p>
            <p className="text-2xl sm:text-3xl font-bold text-purple-700">
              {stats.totalParticipants}
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Event Creation Trend */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-blue-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <FaCalendarAlt className="mr-2 text-blue-600" />
              Xu hướng tạo sự kiện
            </h3>
            <Line
              data={{
                labels: chartData.labels,
                datasets: [
                  {
                    label: "Sự kiện mới",
                    data: chartData.eventsCreated,
                    borderColor: "rgb(59, 130, 246)",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    tension: 0.4,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top" as const,
                  },
                  title: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>

          {/* Event Status Distribution */}
          <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <FaCheckCircle className="mr-2 text-green-600" />
              Phân bố trạng thái
            </h3>
            <Doughnut
              data={{
                labels: [
                  "Chờ duyệt",
                  "Quá hạn",
                  "Sắp tới",
                  "Đang diễn",
                  "Hoàn thành",
                ],
                datasets: [
                  {
                    data: [
                      stats.pending,
                      stats.expired,
                      stats.upcoming,
                      stats.ongoing,
                      stats.completed,
                    ],
                    backgroundColor: [
                      "rgba(251, 191, 36, 0.8)", // yellow - pending
                      "rgba(249, 115, 22, 0.8)", // orange - expired
                      "rgba(6, 182, 212, 0.8)", // cyan - upcoming
                      "rgba(34, 197, 94, 0.8)", // green - ongoing
                      "rgba(59, 130, 246, 0.8)", // blue - completed
                    ],
                    borderColor: [
                      "rgb(251, 191, 36)",
                      "rgb(249, 115, 22)",
                      "rgb(6, 182, 212)",
                      "rgb(34, 197, 94)",
                      "rgb(59, 130, 246)",
                    ],
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "bottom" as const,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Event Statistics Chart */}
        <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <FaUsers className="mr-2 text-purple-600" />
            Thống kê sự kiện và tham gia theo tháng
          </h3>
          <Bar
            data={{
              labels: chartData.labels,
              datasets: [
                {
                  label: "Sự kiện được tạo",
                  data: chartData.eventsCreated,
                  backgroundColor: "rgba(59, 130, 246, 0.8)",
                  borderColor: "rgb(59, 130, 246)",
                  borderWidth: 1,
                },
                {
                  label: "Sự kiện được duyệt",
                  data: chartData.eventsApproved,
                  backgroundColor: "rgba(34, 197, 94, 0.8)",
                  borderColor: "rgb(34, 197, 94)",
                  borderWidth: 1,
                },
                {
                  label: "Lượt tham gia",
                  data: chartData.participants,
                  backgroundColor: "rgba(147, 51, 234, 0.8)",
                  borderColor: "rgb(147, 51, 234)",
                  borderWidth: 1,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top" as const,
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            }}
          />
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6 mb-6 space-y-5">
          {/* Search Bar */}
          <div className="relative">
            <label className="block text-base font-semibold text-gray-700 mb-3">
              🔍 Tìm kiếm sự kiện
            </label>
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Tìm theo tên, nội dung, địa điểm, người tổ chức..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 text-base text-gray-900 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-200 focus:border-blue-400 transition duration-200 placeholder:text-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-3 flex items-center">
                <FaFilter className="mr-2 text-blue-500" />
                Chủ đề
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-3 text-base text-gray-900 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-200 focus:border-blue-400 transition duration-200 bg-white cursor-pointer"
              >
                <option value="all">Tất cả chủ đề</option>
                <option value="environment">🌿 Môi trường</option>
                <option value="education">🎓 Giáo dục</option>
                <option value="health">❤️ Sức khỏe</option>
                <option value="community">🤝 Cộng đồng</option>
                <option value="other">📌 Khác</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-3 flex items-center">
                <FaFilter className="mr-2 text-green-500" />
                Trạng thái
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 text-base text-gray-900 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-green-200 focus:border-green-400 transition duration-200 bg-white cursor-pointer"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">⏳ Chờ duyệt</option>
                <option value="upcoming">📅 Sắp diễn ra</option>
                <option value="ongoing">🔴 Đang diễn ra</option>
                <option value="completed">🎉 Hoàn thành</option>
                <option value="rejected">❌ Đã từ chối</option>
                <option value="expired">⚠️ Quá hạn xử lý</option>
              </select>
            </div>
          </div>

          {/* Filter Info & Reset */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200">
            <div className="text-base text-gray-700">
              Hiển thị{" "}
              <span className="font-bold text-blue-600">
                {filteredEvents.length}
              </span>{" "}
              / <span className="font-bold">{events.length}</span> sự kiện
            </div>
            {(searchTerm ||
              filterCategory !== "all" ||
              filterStatus !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterCategory("all");
                  setFilterStatus("all");
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition duration-200 text-base"
              >
                <span>🔄</span>
                <span>Đặt lại bộ lọc</span>
              </button>
            )}
          </div>
        </div>

        {/* Events Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải sự kiện...</p>
            </div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-blue-100 p-12 text-center">
            <FaCalendarAlt className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Không tìm thấy sự kiện nào</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const categoryConfig = getCategoryIcon(event.category);
              const CategoryIcon = categoryConfig.icon;
              const displayStatus = getDisplayStatus(event);
              const statusBadge = getStatusBadge(displayStatus);
              const StatusIcon = statusBadge.icon;

              return (
                <div
                  key={event.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden border border-gray-100"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-blue-100 to-green-100">
                    {event.image ? (
                      <Image
                        src={event.image}
                        alt={event.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <FaCalendarAlt className="text-6xl text-gray-300" />
                      </div>
                    )}
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg ${statusBadge.bg} ${statusBadge.text}`}
                      >
                        <StatusIcon className="mr-1.5" />
                        {getStatusLabel(displayStatus)}
                      </span>
                    </div>
                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg ${categoryConfig.bg} ${categoryConfig.color}`}
                      >
                        <CategoryIcon className="mr-1.5" />
                        {getCategoryLabel(event.category)}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-3">
                    {/* Expired Warning Banner */}
                    {displayStatus === "expired" && (
                      <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded-r-lg mb-3">
                        <div className="flex items-center space-x-2">
                          <FaTimes className="text-orange-600 text-lg" />
                          <div>
                            <p className="text-sm font-semibold text-orange-800">
                              Sự kiện quá hạn xử lý
                            </p>
                            <p className="text-xs text-orange-700 mt-0.5">
                              Sự kiện đã kết thúc mà chưa được duyệt
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 min-h-[3.5rem]">
                      {event.title}
                    </h3>

                    {/* Author */}
                    {event.author && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <FaUserCircle className="text-blue-500" />
                        <span className="font-medium">
                          {event.author.username}
                        </span>
                      </div>
                    )}

                    {/* Location */}
                    <div className="flex items-start space-x-2 text-sm text-gray-600">
                      <FaMapMarkerAlt className="text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-1">{event.address}</span>
                    </div>

                    {/* Date & Time */}
                    <div className="space-y-2 text-sm">
                      {/* Start Time */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <FaCalendarAlt className="text-blue-500" />
                          <span className="font-medium">Bắt đầu:</span>
                        </div>
                        <div className="text-gray-900 font-semibold">
                          {formatDate(event.start_time)} •{" "}
                          {formatTime(event.start_time)}
                        </div>
                      </div>
                      {/* End Time */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <FaClock className="text-green-500" />
                          <span className="font-medium">Kết thúc:</span>
                        </div>
                        <div className="text-gray-900 font-semibold">
                          {formatDate(event.end_time)} •{" "}
                          {formatTime(event.end_time)}
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                      <div className="flex items-center space-x-2 text-sm">
                        <FaUsers className="text-purple-500" />
                        <span className="text-gray-700 font-semibold">
                          {event.current_participants}/{event.max_participants}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <FaThumbsUp className="text-pink-500" />
                        <span className="text-gray-700 font-semibold">
                          {event.likes}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowDetailModal(true);
                        }}
                        className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition duration-200 font-medium"
                      >
                        <FaEye />
                        <span>Chi tiết</span>
                      </button>

                      {event.status === "pending" && (
                        <>
                          <button
                            onClick={() => {
                              setConfirmAction({
                                type: "approve",
                                eventId: event.id,
                              });
                              setShowConfirmModal(true);
                            }}
                            className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition duration-200"
                            title="Phê duyệt"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => {
                              setConfirmAction({
                                type: "reject",
                                eventId: event.id,
                              });
                              setShowConfirmModal(true);
                            }}
                            className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition duration-200"
                            title="Từ chối"
                          >
                            <FaBan />
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => {
                          setConfirmAction({
                            type: "delete",
                            eventId: event.id,
                          });
                          setShowConfirmModal(true);
                        }}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition duration-200"
                        title="Xóa"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center space-x-3 px-6 py-4 rounded-xl shadow-2xl border-2 transform transition-all duration-300 ${
              toast.type === "success"
                ? "bg-green-500 border-green-600 text-white"
                : toast.type === "error"
                ? "bg-red-500 border-red-600 text-white"
                : "bg-blue-500 border-blue-600 text-white"
            } animate-slide-in-right`}
          >
            <div className="flex-shrink-0">
              {toast.type === "success" ? (
                <FaCheckCircle className="text-2xl" />
              ) : toast.type === "error" ? (
                <FaBan className="text-2xl" />
              ) : (
                <FaInfoCircle className="text-2xl" />
              )}
            </div>
            <p className="font-semibold text-base">{toast.message}</p>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Chi tiết sự kiện</h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition duration-200"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Image */}
              <div className="relative h-64 rounded-xl overflow-hidden bg-gradient-to-br from-blue-100 to-green-100">
                {selectedEvent.image ? (
                  <Image
                    src={selectedEvent.image}
                    alt={selectedEvent.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FaCalendarAlt className="text-8xl text-gray-300" />
                  </div>
                )}
              </div>

              {/* Title & Status */}
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-2xl font-bold text-gray-900 flex-1">
                  {selectedEvent.title}
                </h3>
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                    getStatusBadge(getDisplayStatus(selectedEvent)).bg
                  } ${getStatusBadge(getDisplayStatus(selectedEvent)).text}`}
                >
                  {getStatusLabel(getDisplayStatus(selectedEvent))}
                </span>
              </div>

              {/* Expired Warning */}
              {getDisplayStatus(selectedEvent) === "expired" && (
                <div className="bg-orange-50 border-2 border-orange-500 rounded-xl p-4">
                  <div className="flex items-start space-x-3">
                    <FaTimes className="text-orange-600 text-2xl flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="text-lg font-bold text-orange-800 mb-1">
                        ⚠️ Sự kiện quá hạn xử lý
                      </h4>
                      <p className="text-sm text-orange-700">
                        Sự kiện này đã kết thúc vào{" "}
                        <strong>{formatDate(selectedEvent.end_time)}</strong> mà
                        vẫn chưa được admin duyệt. Cần xem xét và xử lý (duyệt
                        hoặc từ chối) để hoàn tất quy trình.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Author */}
              {selectedEvent.author && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                    <FaUserCircle className="mr-2 text-blue-600" />
                    Người tổ chức sự kiện
                  </h4>
                  <div className="flex items-center space-x-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      {selectedEvent.author.image ? (
                        <Image
                          src={selectedEvent.author.image}
                          alt={selectedEvent.author.username}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center">
                          <FaUserCircle className="text-3xl text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-lg text-gray-900">
                        {selectedEvent.author.username}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        📧 {selectedEvent.author.email}
                      </p>
                      <p className="text-xs text-blue-600 mt-1 font-medium">
                        ID: #{selectedEvent.author.id}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-sm text-blue-600 mb-1 flex items-center">
                    <FaCalendarAlt className="mr-2" />
                    Thời gian bắt đầu
                  </p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(selectedEvent.start_time)}
                  </p>
                  <p className="text-gray-600">
                    {formatTime(selectedEvent.start_time)}
                  </p>
                </div>

                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-sm text-green-600 mb-1 flex items-center">
                    <FaCalendarCheck className="mr-2" />
                    Thời gian kết thúc
                  </p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(selectedEvent.end_time)}
                  </p>
                  <p className="text-gray-600">
                    {formatTime(selectedEvent.end_time)}
                  </p>
                </div>

                <div className="bg-red-50 rounded-xl p-4">
                  <p className="text-sm text-red-600 mb-1 flex items-center">
                    <FaMapMarkerAlt className="mr-2" />
                    Địa điểm
                  </p>
                  <p className="font-semibold text-gray-900">
                    {selectedEvent.address}
                  </p>
                </div>

                <div className="bg-purple-50 rounded-xl p-4">
                  <p className="text-sm text-purple-600 mb-1 flex items-center">
                    {React.createElement(
                      getCategoryIcon(selectedEvent.category).icon,
                      { className: "mr-2" }
                    )}
                    Chủ đề
                  </p>
                  <p className="font-semibold text-gray-900">
                    {getCategoryLabel(selectedEvent.category)}
                  </p>
                </div>

                <div className="bg-indigo-50 rounded-xl p-4">
                  <p className="text-sm text-indigo-600 mb-1 flex items-center">
                    <FaUsers className="mr-2" />
                    Số lượng tham gia
                  </p>
                  <p className="font-semibold text-gray-900">
                    {selectedEvent.current_participants} /{" "}
                    {selectedEvent.max_participants} người
                  </p>
                </div>

                <div className="bg-pink-50 rounded-xl p-4">
                  <p className="text-sm text-pink-600 mb-1 flex items-center">
                    <FaThumbsUp className="mr-2" />
                    Lượt thích
                  </p>
                  <p className="font-semibold text-gray-900">
                    {selectedEvent.likes} lượt
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <FaInfoCircle className="mr-2 text-blue-500" />
                  Mô tả chi tiết
                </p>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {selectedEvent.content}
                </p>
              </div>

              {/* Members Preview & Button */}
              {selectedEvent.members && selectedEvent.members.length > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
                  <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                    <FaUsers className="mr-2 text-purple-600" />
                    Thành viên tham gia ({selectedEvent.members.length})
                  </h4>

                  {/* Show first 5 members */}
                  <div className="flex items-center space-x-3 mb-4 overflow-x-auto pb-2">
                    {selectedEvent.members.slice(0, 5).map((member) => (
                      <div
                        key={member.id}
                        className="flex-shrink-0 text-center"
                        title={member.username}
                      >
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border-3 border-white shadow-md">
                          {member.image ? (
                            <Image
                              src={member.image}
                              alt={member.username}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                              <FaUserCircle className="text-2xl text-white" />
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-700 mt-1 truncate max-w-[60px]">
                          {member.username}
                        </p>
                      </div>
                    ))}
                    {selectedEvent.members.length > 5 && (
                      <div className="flex-shrink-0 text-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-md">
                          <span className="text-sm font-bold text-white">
                            +{selectedEvent.members.length - 5}
                          </span>
                        </div>
                        <p className="text-xs text-gray-700 mt-1">Khác</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      setShowMembersModal(true);
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition duration-200 shadow-md hover:shadow-lg font-medium"
                  >
                    <FaUsers />
                    <span>
                      Xem tất cả thành viên ({selectedEvent.members.length})
                    </span>
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 flex flex-wrap justify-between items-center gap-3">
              <button
                onClick={() => {
                  router.push(`/event/${selectedEvent.id}`);
                }}
                className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg font-medium transition duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
              >
                <FaEye />
                <span>Đi đến trang sự kiện</span>
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition duration-200"
                >
                  Đóng
                </button>
                {selectedEvent.status === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        setConfirmAction({
                          type: "approve",
                          eventId: selectedEvent.id,
                        });
                        setShowConfirmModal(true);
                        setShowDetailModal(false);
                      }}
                      className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition duration-200 flex items-center space-x-2"
                    >
                      <FaCheck />
                      <span>Phê duyệt</span>
                    </button>
                    <button
                      onClick={() => {
                        setConfirmAction({
                          type: "reject",
                          eventId: selectedEvent.id,
                        });
                        setShowConfirmModal(true);
                        setShowDetailModal(false);
                      }}
                      className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition duration-200 flex items-center space-x-2"
                    >
                      <FaBan />
                      <span>Từ chối</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    setConfirmAction({
                      type: "delete",
                      eventId: selectedEvent.id,
                    });
                    setShowConfirmModal(true);
                  }}
                  className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition duration-200 flex items-center space-x-2"
                >
                  <FaTrash />
                  <span>Xóa</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {showMembersModal && selectedEvent && selectedEvent.members && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  Danh sách thành viên ({selectedEvent.members.length})
                </h2>
                <button
                  onClick={() => setShowMembersModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition duration-200"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-3">
                {selectedEvent.members.map((member, index) => (
                  <div
                    key={member.id}
                    className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:shadow-md transition duration-200"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {index + 1}
                    </div>
                    <div className="relative w-14 h-14 rounded-full overflow-hidden">
                      {member.image ? (
                        <Image
                          src={member.image}
                          alt={member.username}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-blue-200 flex items-center justify-center">
                          <FaUserCircle className="text-2xl text-blue-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">
                        {member.username}
                      </p>
                      <p className="text-sm text-gray-600">{member.email}</p>
                      {member.phone && (
                        <p className="text-sm text-gray-600">{member.phone}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Tham gia</p>
                      <p className="text-sm font-medium text-gray-700">
                        {formatDate(member.pivot.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 flex justify-end">
              <button
                onClick={() => setShowMembersModal(false)}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition duration-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && confirmAction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            {/* Modal Header */}
            <div
              className={`p-6 rounded-t-2xl ${
                confirmAction.type === "delete"
                  ? "bg-gradient-to-r from-red-500 to-orange-500"
                  : confirmAction.type === "approve"
                  ? "bg-gradient-to-r from-green-500 to-teal-500"
                  : "bg-gradient-to-r from-red-500 to-pink-500"
              } text-white`}
            >
              <h2 className="text-2xl font-bold">Xác nhận thao tác</h2>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    confirmAction.type === "delete"
                      ? "bg-red-100"
                      : confirmAction.type === "approve"
                      ? "bg-green-100"
                      : "bg-red-100"
                  }`}
                >
                  {confirmAction.type === "delete" ? (
                    <FaTrash className="text-2xl text-red-600" />
                  ) : confirmAction.type === "approve" ? (
                    <FaCheck className="text-2xl text-green-600" />
                  ) : (
                    <FaBan className="text-2xl text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    {confirmAction.type === "approve"
                      ? "Phê duyệt sự kiện?"
                      : confirmAction.type === "reject"
                      ? "Từ chối sự kiện?"
                      : "Xóa sự kiện?"}
                  </p>
                  <p className="text-base text-gray-600">
                    {confirmAction.type === "approve"
                      ? "Sự kiện sẽ được công khai và cho phép người dùng tham gia."
                      : confirmAction.type === "reject"
                      ? "Sự kiện sẽ bị từ chối và không được hiển thị."
                      : "Thao tác này không thể hoàn tác. Tất cả dữ liệu liên quan sẽ bị xóa."}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmAction(null);
                }}
                disabled={isLoading}
                className="px-6 py-3 text-base bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition duration-200 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={executeAction}
                disabled={isLoading}
                className={`px-6 py-3 text-base rounded-lg font-medium transition duration-200 flex items-center space-x-2 disabled:opacity-50 ${
                  confirmAction.type === "delete"
                    ? "bg-red-500 hover:bg-red-600"
                    : confirmAction.type === "approve"
                    ? "bg-green-500 hover:bg-green-600"
                    : "bg-red-500 hover:bg-red-600"
                } text-white`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <FaCheck />
                    <span>Xác nhận</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

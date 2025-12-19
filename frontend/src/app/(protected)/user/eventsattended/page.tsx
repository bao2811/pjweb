"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaClock,
  FaEye,
  FaTimes,
  FaCheck,
  FaHourglassHalf,
  FaCheckCircle,
  FaExclamationCircle,
  FaFilter,
  FaSearch,
  FaUserFriends,
  FaHeart,
  FaTrophy,
  FaComments,
  FaStar,
  FaTimesCircle,
} from "react-icons/fa";
import { authFetch } from "@/utils/auth";

// Mock current user
const mockCurrentUser = {
  name: "Nguyễn Văn An",
  email: "user@example.com",
  avatar: "https://i.pravatar.cc/150?img=12",
  role: "user" as const,
  points: 1250,
};

// Types
interface Participant {
  id: number;
  name: string;
  avatar: string;
  joinedAt: string;
}

interface UserEvent {
  id: number;
  title: string;
  description: string;
  image: string;
  date: string;
  time: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  category: string;
  organizer: {
    id: number;
    name: string;
    avatar: string;
    role: string;
  };
  participants: Participant[];
  userStatus:
    | "pending"
    | "approved"
    | "participating"
    | "rejected"
    | "completed"
    | "cancelled"
    | "accepted";
  completionStatus?: "pending" | "completed" | "failed";
  completionNote?: string;
  eventStatus: "upcoming" | "ongoing" | "completed" | "cancelled" | "accepted";
  appliedAt: string;
  approvedAt?: string;
  completedAt?: string;
}

export default function EventsAttendedPage() {
  const router = useRouter();
  const [events, setEvents] = useState<UserEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<UserEvent | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    "all" | "pending" | "approved" | "rejected" | "completed"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showParticipants, setShowParticipants] = useState(false);
  const [cancellingEventId, setCancellingEventId] = useState<number | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's registered events
  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        setIsLoading(true);
        const response = await authFetch("/user/my-registrations");

        if (response.ok) {
          const data = await response.json();
          console.log("🔍 Backend response:", data); // DEBUG

          if (data && data.success && Array.isArray(data.registrations)) {
            // Transform backend data to frontend format
            const transformedEvents: UserEvent[] = data.registrations
              .filter((registration: any) => registration.event) // Filter out registrations without event
              .map((registration: any) => {
                const event = registration.event;
                console.log("📦 Processing registration:", {
                  status: registration.status,
                  event_title: event.title,
                  event_status: event.status,
                }); // DEBUG

                return {
                  id: event.id,
                  title: event.title || "Không có tiêu đề",
                  description: event.content || "",
                  image:
                    event.image ||
                    "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop",
                  date: event.start_time ? event.start_time.split(" ")[0] : "",
                  time:
                    event.start_time && event.end_time
                      ? `${event.start_time
                          .split(" ")[1]
                          ?.substring(0, 5)} - ${event.end_time
                          .split(" ")[1]
                          ?.substring(0, 5)}`
                      : "Cả ngày",
                  location: event.address || "Chưa xác định",
                  maxParticipants: event.max_participants || 100,
                  currentParticipants: event.current_participants || 0,
                  category: event.category || "Tình nguyện",
                  organizer: {
                    id: event.author?.id || event.author_id || 1,
                    name: event.author?.username || "Organizer",
                    avatar:
                      event.author?.image ||
                      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
                    role: "manager",
                  },
                  participants: [],
                  userStatus: registration.status, // pending, approved, rejected
                  completionStatus: registration.completion_status, // pending, completed, failed
                  completionNote: registration.completion_note,
                  eventStatus:
                    event.status ||
                    getEventStatus(event.start_time, event.end_time),
                  appliedAt:
                    registration.created_at || new Date().toISOString(),
                  approvedAt:
                    registration.joined_at && registration.status === "approved"
                      ? registration.joined_at
                      : undefined,
                  completedAt: registration.completed_at,
                };
              });

            console.log("✅ Transformed events:", transformedEvents); // DEBUG
            setEvents(transformedEvents);
          }
        }
      } catch (error) {
        console.error("Error fetching user events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserEvents();
  }, []);

  // Helper function to determine event status
  const getEventStatus = (
    startTime: string,
    endTime: string
  ): "upcoming" | "ongoing" | "completed" | "cancelled" => {
    if (!startTime) return "upcoming";

    const now = new Date();
    const start = new Date(startTime);
    const end = endTime
      ? new Date(endTime)
      : new Date(start.getTime() + 4 * 60 * 60 * 1000); // Default 4h duration

    if (now < start) return "upcoming";
    if (now >= start && now <= end) return "ongoing";
    return "completed";
  };

  // Handle cancel registration
  const handleCancelRegistration = async (eventId: number) => {
    if (!confirm("Bạn có chắc muốn hủy đăng ký sự kiện này?")) return;

    try {
      setCancellingEventId(eventId);
      const response = await authFetch(`/user/leaveEvent/${eventId}`, {
        method: "POST",
      });

      if (response.ok) {
        // Remove event from list
        setEvents(events.filter((e) => e.id !== eventId));
        alert("Đã hủy đăng ký thành công!");
        setShowDetailModal(false);
      } else {
        const error = await response.json();
        alert(error.message || "Hủy đăng ký thất bại!");
      }
    } catch (error: any) {
      console.error("Cancel registration error:", error);
      alert("Hủy đăng ký thất bại!");
    } finally {
      setCancellingEventId(null);
    }
  };

  // Handle access channel
  const handleAccessChannel = (eventId: number) => {
    router.push(`/events/${eventId}/channel`);
  };

  // Handle rate event
  const handleRateEvent = (eventId: number) => {
    // TODO: Implement rating modal
    alert("Chức năng đánh giá sẽ được cập nhật!");
  };

  // Filter events based on tab and search
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedTab === "all") return matchesSearch;
    if (selectedTab === "approved") {
      // "Đang tham gia" includes both "approved" and "participating" status
      return (
        matchesSearch &&
        (event.userStatus === "approved" ||
          event.userStatus === "participating")
      );
    }
    if (selectedTab === "completed") {
      // "Hoàn thành" only shows events with completion_status='completed'
      return matchesSearch && event.completionStatus === "completed";
    }
    return matchesSearch && event.userStatus === selectedTab;
  });

  // Get status info - Logic hiển thị trạng thái trên card
  // Priority: completionStatus > userStatus + eventStatus
  const getStatusInfo = (event: UserEvent) => {
    const { userStatus, eventStatus, completionStatus } = event;

    // Nếu có completionStatus = "completed" → Đã hoàn thành (manager đã đánh giá)
    if (completionStatus === "completed") {
      return {
        icon: FaTrophy,
        color: "text-purple-600",
        bgColor: "bg-purple-100",
        label: "Đã hoàn thành",
      };
    }

    // Nếu có completionStatus = "failed" → Không hoàn thành
    if (completionStatus === "failed") {
      return {
        icon: FaTimesCircle,
        color: "text-red-600",
        bgColor: "bg-red-100",
        label: "Không hoàn thành",
      };
    }

    // Nếu userStatus = "approved" và event đã kết thúc → Đã tham gia (chờ đánh giá)
    if (userStatus === "approved" && eventStatus === "completed") {
      return {
        icon: FaCheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-100",
        label: "Đã tham gia",
      };
    }

    // Nếu userStatus = "approved" và event đang diễn ra → Đang diễn ra
    if (userStatus === "approved" && eventStatus === "ongoing") {
      return {
        icon: FaCheckCircle,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        label: "Đang diễn ra",
      };
    }

    // Các status khác
    const statusConfig = {
      pending: {
        icon: FaHourglassHalf,
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        label: "Chờ duyệt",
      },
      approved: {
        icon: FaCheckCircle,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        label: "Đang tham gia",
      },
      rejected: {
        icon: FaTimesCircle,
        color: "text-red-600",
        bgColor: "bg-red-100",
        label: "Bị từ chối",
      },
      cancelled: {
        icon: FaExclamationCircle,
        color: "text-orange-600",
        bgColor: "bg-orange-100",
        label: "Đã hủy",
      },
    };
    return (
      statusConfig[userStatus as keyof typeof statusConfig] || {
        icon: FaCalendarAlt,
        color: "text-gray-600",
        bgColor: "bg-gray-100",
        label: userStatus || "Không xác định",
      }
    );
  };

  // Show event details
  const showEventDetails = (event: UserEvent) => {
    router.push(`/events/${event.id}`);
  };

  // Get tab counts
  const getTabCounts = () => {
    return {
      all: events.length,
      pending: events.filter((e) => e.userStatus === "pending").length,
      approved: events.filter(
        (e) => e.userStatus === "approved" || e.userStatus === "participating"
      ).length,
      rejected: events.filter((e) => e.userStatus === "rejected").length,
      completed: events.filter((e) => e.completionStatus === "completed")
        .length,
    };
  };

  const tabCounts = getTabCounts();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Page Header with Stats Dashboard */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Title and Stats */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Sự kiện của tôi
            </h1>
            <p className="text-gray-600 text-lg">
              Quản lý và theo dõi các sự kiện bạn đã đăng ký
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border-2 border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700 font-medium">
                    Chờ duyệt
                  </p>
                  <p className="text-2xl font-bold text-yellow-800">
                    {tabCounts.pending}
                  </p>
                </div>
                <FaHourglassHalf className="text-3xl text-yellow-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium">
                    Đang tham gia
                  </p>
                  <p className="text-2xl font-bold text-green-800">
                    {tabCounts.approved}
                  </p>
                </div>
                <FaCheckCircle className="text-3xl text-green-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">
                    Hoàn thành
                  </p>
                  <p className="text-2xl font-bold text-blue-800">
                    {tabCounts.completed}
                  </p>
                </div>
                <FaTrophy className="text-3xl text-blue-600" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700 font-medium">
                    Tổng cộng
                  </p>
                  <p className="text-2xl font-bold text-purple-800">
                    {tabCounts.all}
                  </p>
                </div>
                <FaHeart className="text-3xl text-purple-600" />
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm sự kiện..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full transition-all"
              />
            </div>

            {/* Tabs */}
            <nav className="flex space-x-2 bg-gray-100 rounded-xl p-1">
              {[
                {
                  key: "all",
                  label: "Tất cả",
                  count: tabCounts.all,
                  icon: FaCalendarAlt,
                },
                {
                  key: "pending",
                  label: "Chờ duyệt",
                  count: tabCounts.pending,
                  icon: FaHourglassHalf,
                },
                {
                  key: "approved",
                  label: "Đang tham gia",
                  count: tabCounts.approved,
                  icon: FaCheckCircle,
                },
                {
                  key: "rejected",
                  label: "Bị từ chối",
                  count: tabCounts.rejected,
                  icon: FaTimesCircle,
                },
                {
                  key: "completed",
                  label: "Hoàn thành",
                  count: tabCounts.completed,
                  icon: FaTrophy,
                },
              ].map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedTab(tab.key as any)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      selectedTab === tab.key
                        ? "bg-white text-blue-600 shadow-md"
                        : "text-gray-600 hover:text-gray-800"
                    }`}
                  >
                    <TabIcon
                      className={
                        selectedTab === tab.key
                          ? "text-blue-600"
                          : "text-gray-400"
                      }
                    />
                    <span>{tab.label}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        selectedTab === tab.key
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải sự kiện...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm ? "Không tìm thấy sự kiện" : "Chưa có sự kiện nào"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? "Hãy thử từ khóa khác."
                : "Hãy đăng ký tham gia các sự kiện tình nguyện."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => {
              const statusInfo = getStatusInfo(event);
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={event.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition duration-200"
                >
                  {/* Event Image */}
                  <div className="relative h-48">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                    <div className="absolute top-4 left-4">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
                      >
                        <StatusIcon className="mr-1" />
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-white bg-opacity-90 px-2 py-1 rounded-full text-xs font-medium text-gray-700">
                        {event.category}
                      </span>
                    </div>
                  </div>

                  {/* Event Content */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    {/* Event Info */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <FaCalendarAlt className="mr-2 text-blue-500" />
                        <span>
                          {new Date(event.date).toLocaleDateString("vi-VN")} •{" "}
                          {event.time}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <FaMapMarkerAlt className="mr-2 text-red-500" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <FaUsers className="mr-2 text-green-500" />
                        <span>
                          {event.currentParticipants}/{event.maxParticipants}{" "}
                          người tham gia
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(
                              (event.currentParticipants /
                                event.maxParticipants) *
                                100,
                              100
                            )}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Timeline */}
                    <div className="text-xs text-gray-500 mb-4 space-y-1">
                      <div>
                        Đăng ký:{" "}
                        {new Date(event.appliedAt).toLocaleDateString("vi-VN")}
                      </div>
                      {event.approvedAt && (
                        <div>
                          Được duyệt:{" "}
                          {new Date(event.approvedAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </div>
                      )}
                      {event.completedAt && (
                        <div>
                          Hoàn thành:{" "}
                          {new Date(event.completedAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons - Different for each status */}
                    <div className="space-y-2 pt-4 border-t border-gray-100">
                      {event.userStatus === "pending" && (
                        <>
                          <button
                            onClick={() => showEventDetails(event)}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition duration-200 font-medium"
                          >
                            <FaEye />
                            <span>Xem chi tiết</span>
                          </button>
                          <button
                            onClick={() => handleCancelRegistration(event.id)}
                            disabled={cancellingEventId === event.id}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-sm bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {cancellingEventId === event.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                <span>Đang hủy...</span>
                              </>
                            ) : (
                              <>
                                <FaTimesCircle />
                                <span>Hủy đăng ký</span>
                              </>
                            )}
                          </button>
                        </>
                      )}

                      {event.userStatus === "accepted" && (
                        <>
                          <button
                            onClick={() => showEventDetails(event)}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-sm bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg rounded-lg transition duration-200 font-medium"
                          >
                            <FaEye />
                            <span>Xem chi tiết sự kiện</span>
                          </button>
                          <button
                            onClick={() => handleAccessChannel(event.id)}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition duration-200 font-medium"
                          >
                            <FaComments />
                            <span>Truy cập kênh</span>
                          </button>
                        </>
                      )}

                      {(event.userStatus === "approved" ||
                        event.userStatus === "participating") && (
                        <>
                          <button
                            onClick={() => handleAccessChannel(event.id)}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-sm bg-gradient-to-r from-green-500 to-blue-500 text-white hover:shadow-lg rounded-lg transition duration-200 font-medium"
                          >
                            <FaComments />
                            <span>Truy cập kênh</span>
                          </button>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => showEventDetails(event)}
                              className="flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition duration-200 font-medium"
                            >
                              <FaEye />
                              <span>Chi tiết</span>
                            </button>
                            {/* Chỉ hiện nút hủy nếu sự kiện chưa kết thúc */}
                            {event.eventStatus !== "completed" &&
                            event.eventStatus !== "ongoing" ? (
                              <button
                                onClick={() =>
                                  handleCancelRegistration(event.id)
                                }
                                disabled={cancellingEventId === event.id}
                                className="flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition duration-200 font-medium disabled:opacity-50"
                              >
                                {cancellingEventId === event.id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                                ) : (
                                  <>
                                    <FaTimes />
                                    <span>Hủy</span>
                                  </>
                                )}
                              </button>
                            ) : (
                              <span className="flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-gray-200 text-gray-400 rounded-lg font-medium cursor-not-allowed">
                                <FaCheckCircle />
                                <span>
                                  {event.eventStatus === "completed"
                                    ? "Đã kết thúc"
                                    : "Đang diễn ra"}
                                </span>
                              </span>
                            )}
                          </div>
                        </>
                      )}

                      {event.completionStatus === "completed" && (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => showEventDetails(event)}
                            className="flex items-center justify-center space-x-1 px-4 py-2.5 text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition duration-200 font-medium"
                          >
                            <FaEye />
                            <span>Xem lại</span>
                          </button>
                          <button
                            onClick={() => handleRateEvent(event.id)}
                            className="flex items-center justify-center space-x-1 px-4 py-2.5 text-sm bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-lg transition duration-200 font-medium"
                          >
                            <FaStar />
                            <span>Đánh giá</span>
                          </button>
                        </div>
                      )}

                      {event.userStatus === "rejected" && (
                        <button
                          onClick={() => showEventDetails(event)}
                          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition duration-200 font-medium"
                        >
                          <FaEye />
                          <span>Xem chi tiết</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      {showDetailModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <Image
                src={selectedEvent.image}
                alt={selectedEvent.title}
                width={800}
                height={300}
                className="w-full h-64 object-cover"
                unoptimized
              />
              <button
                onClick={() => setShowDetailModal(false)}
                className="absolute top-4 right-4 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full p-2 transition duration-200"
              >
                <FaTimes className="text-gray-600" />
              </button>
              <div className="absolute top-4 left-4">
                {(() => {
                  // getStatusInfo expects the full event object, not just userStatus
                  const statusInfo = getStatusInfo(selectedEvent);
                  const StatusIcon = statusInfo.icon;
                  return (
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-90 ${statusInfo.color}`}
                    >
                      <StatusIcon className="mr-1" />
                      {statusInfo.label}
                    </span>
                  );
                })()}
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedEvent.title}
                  </h2>
                  <span className="inline-block bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                    {selectedEvent.category}
                  </span>
                </div>
              </div>

              <p className="text-gray-700 mb-6">{selectedEvent.description}</p>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Event Details */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Thông tin sự kiện
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <FaCalendarAlt className="mr-3 text-blue-500" />
                      <span className="text-gray-700">
                        {new Date(selectedEvent.date).toLocaleDateString(
                          "vi-VN"
                        )}{" "}
                        • {selectedEvent.time}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="mr-3 text-red-500" />
                      <span className="text-gray-700">
                        {selectedEvent.location}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FaUsers className="mr-3 text-green-500" />
                      <span className="text-gray-700">
                        {selectedEvent.currentParticipants}/
                        {selectedEvent.maxParticipants} người tham gia
                      </span>
                    </div>
                  </div>

                  {/* Organizer */}
                  <div className="mt-6">
                    <h4 className="text-md font-semibold text-gray-900 mb-2">
                      Người tổ chức
                    </h4>
                    <div className="flex items-center">
                      <Image
                        src={selectedEvent.organizer.avatar}
                        alt={selectedEvent.organizer.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                        unoptimized
                      />
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">
                          {selectedEvent.organizer.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {selectedEvent.organizer.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Participants */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Thành viên tham gia ({selectedEvent.participants.length})
                    </h3>
                    <button
                      onClick={() => setShowParticipants(!showParticipants)}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      {showParticipants ? "Ẩn" : "Xem tất cả"}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {(showParticipants
                      ? selectedEvent.participants
                      : selectedEvent.participants.slice(0, 3)
                    ).map((participant) => (
                      <div key={participant.id} className="flex items-center">
                        <Image
                          src={participant.avatar}
                          alt={participant.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                          unoptimized
                        />
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            {participant.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            Tham gia từ{" "}
                            {new Date(participant.joinedAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                        </div>
                      </div>
                    ))}

                    {!showParticipants &&
                      selectedEvent.participants.length > 3 && (
                        <div className="text-center">
                          <button
                            onClick={() => setShowParticipants(true)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            +{selectedEvent.participants.length - 3} thành viên
                            khác
                          </button>
                        </div>
                      )}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Lịch sử tham gia
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-700">
                      Đã đăng ký vào{" "}
                      {new Date(selectedEvent.appliedAt).toLocaleString(
                        "vi-VN"
                      )}
                    </span>
                  </div>
                  {selectedEvent.approvedAt && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">
                        Được duyệt vào{" "}
                        {new Date(selectedEvent.approvedAt).toLocaleString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                  )}
                  {selectedEvent.completedAt && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                      <span className="text-sm text-gray-700">
                        Hoàn thành vào{" "}
                        {new Date(selectedEvent.completedAt).toLocaleString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                {selectedEvent.userStatus === "pending" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                    >
                      Đóng
                    </button>
                    <button
                      onClick={() => handleCancelRegistration(selectedEvent.id)}
                      disabled={cancellingEventId === selectedEvent.id}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                    >
                      {cancellingEventId === selectedEvent.id ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Đang hủy...</span>
                        </>
                      ) : (
                        <>
                          <FaTimesCircle />
                          <span>Hủy đăng ký</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {selectedEvent.userStatus === "approved" && (
                  <div className="space-y-3">
                    <button
                      onClick={() => handleAccessChannel(selectedEvent.id)}
                      className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition font-medium flex items-center justify-center space-x-2"
                    >
                      <FaComments className="text-lg" />
                      <span>Truy cập kênh sự kiện</span>
                    </button>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowDetailModal(false)}
                        className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                      >
                        Đóng
                      </button>
                      <button
                        onClick={() =>
                          handleCancelRegistration(selectedEvent.id)
                        }
                        disabled={cancellingEventId === selectedEvent.id}
                        className="flex-1 px-6 py-3 bg-red-50 text-red-600 border-2 border-red-200 rounded-xl hover:bg-red-100 transition font-medium disabled:opacity-50 flex items-center justify-center space-x-2"
                      >
                        {cancellingEventId === selectedEvent.id ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
                            <span>Đang hủy...</span>
                          </>
                        ) : (
                          <>
                            <FaTimes />
                            <span>Hủy đăng ký</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {selectedEvent.completionStatus === "completed" && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowDetailModal(false)}
                      className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                    >
                      Đóng
                    </button>
                    <button
                      onClick={() => handleRateEvent(selectedEvent.id)}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl hover:shadow-lg transition font-medium flex items-center justify-center space-x-2"
                    >
                      <FaStar />
                      <span>Đánh giá sự kiện</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

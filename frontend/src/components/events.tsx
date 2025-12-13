"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaClock,
  FaHeart,
  FaRegHeart,
  FaEye,
  FaEdit,
  FaTrash,
  FaUserPlus,
  FaFilter,
  FaSearch,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
  FaEyeSlash,
  FaPlus,
  FaImage,
  FaPaperPlane,
  FaHourglassHalf,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";
import { authFetch } from "@/utils/auth";
import { useRouter } from "next/navigation";

// Types
interface Event {
  id: number;
  eventId: string;
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
    role: "user" | "manager" | "admin";
  };
  participants: Array<{
    id: number;
    name: string;
    avatar: string;
  }>;
  isLiked: boolean;
  likes: number;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  isHidden: boolean;
  approvalStatus: "pending" | "approved" | "rejected";
  createdAt: string;
}

interface NewEvent {
  title: string;
  description: string;
  image: string;
  date: string;
  time: string;
  location: string;
  maxParticipants: number;
  category: string;
}

interface User {
  id: number;
  name: string;
  role: "user" | "manager" | "admin";
  avatar: string;
}

export default function Events() {
  // Current user từ API
  const [currentUser, setCurrentUser] = useState<User>({
    id: 0,
    name: "",
    role: "user",
    avatar:
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
  });
  const [events, setEvents] = useState<Event[]>([]);
  const [joiningEvents, setJoiningEvents] = useState<Set<number>>(new Set());
  const [likingEvents, setLikingEvents] = useState<Set<number>>(new Set());
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [registeredEvents, setRegisteredEvents] = useState<number[]>([]);
  const [myRegistrations, setMyRegistrations] = useState<{
    [eventId: number]: {
      id: number;
      status: "pending" | "approved" | "rejected";
    };
  }>({});
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showHidden, setShowHidden] = useState(false);
  const [showPendingApproval, setShowPendingApproval] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "participants" | "newest">(
    "date"
  );
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [dateFilter, setDateFilter] = useState<
    "all" | "today" | "tomorrow" | "this_week" | "this_month" | "specific"
  >("all");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const [newEvent, setNewEvent] = useState<NewEvent>({
    title: "",
    description: "",
    image: "",
    date: "",
    time: "",
    location: "",
    maxParticipants: 10,
    category: "Môi trường",
  });

  const router = useRouter();
  const categories = ["all", "Môi trường", "Giáo dục", "Xã hội", "Y tế"];
  const statuses = ["all", "upcoming", "ongoing", "completed", "cancelled"];

  // Fetch events from backend
  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const response = await authFetch("/api/events/getAllEvents");
      const data = await response.json();

      console.log("🔍 BACKEND RESPONSE:", data); // DEBUG

      if (response.ok && data) {
        // Backend trả về mảng events trực tiếp hoặc trong data.events
        const eventsData = Array.isArray(data) ? data : data.events || [];

        const transformedEvents: Event[] = eventsData.map((event: any) => {
          console.log("📦 Event từ backend:", {
            id: event.id,
            title: event.title,
            content: event.content,
            address: event.address,
            isLiked: event.is_liked,
            likes: event.likes,
          }); // DEBUG

          return {
            id: event.id,
            eventId: event.id.toString(),
            title: event.title || "Sự kiện không có tiêu đề",
            description: event.content || "",
            image:
              event.image ||
              "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop",
            date: event.start_time || "",
            time:
              event.start_time && event.end_time
                ? `${
                    event.start_time.split(" ")[1]?.substring(0, 5) || "09:00"
                  } - ${
                    event.end_time.split(" ")[1]?.substring(0, 5) || "17:00"
                  }`
                : "Cả ngày",
            location: event.address || "Chưa xác định",
            maxParticipants: event.max_participants || 100,
            currentParticipants: event.current_participants || 0,
            category: event.category || "Môi trường",
            organizer: {
              id: event.author_id || event.author?.id || 1,
              name:
                event.author?.username || event.author?.email || "Organizer",
              avatar:
                event.author?.image ||
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
              role: "manager",
            },
            participants: [],
            isLiked: Boolean(event.is_liked),
            likes: event.likes || 0,
            // Computed status based on time OR backend status if it's special
            status: (() => {
              // Nếu backend gửi cancelled, giữ nguyên
              if (event.status === "cancelled") return "cancelled";
              
              // Tính toán dựa trên thời gian
              const now = new Date();
              const start = new Date(event.start_time);
              const end = new Date(event.end_time);
              
              if (now < start) return "upcoming";
              if (now > end) return "completed";
              return "ongoing";
            })(),
            isHidden: false,
            // Approval status: pending/approved/rejected HOẶC tự động approved nếu không phải pending/rejected
            approvalStatus: (() => {
              const backendStatus = event.status?.toLowerCase();
              if (backendStatus === "pending") return "pending";
              if (backendStatus === "rejected") return "rejected";
              // Tất cả các status khác (approved, ongoing, upcoming, completed, cancelled) đều được coi là approved
              return "approved";
            })(),
            createdAt: event.created_at || "",
          };
        });

        console.log("✅ Transformed events:", transformedEvents); // DEBUG
        setEvents(transformedEvents);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch current user info
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await authFetch("/api/me");
        const data = await response.json();
        if (data) {
          setCurrentUser({
            id: data.id,
            name: data.name || data.email,
            role: data.role || "user",
            avatar:
              data.avatar ||
              data.image ||
              "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
          });
        }
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };
    fetchUserInfo();
  }, []);

  // Fetch my registrations
  const fetchMyRegistrations = async () => {
    try {
      const response = await authFetch("/user/my-registrations");
      const data = await response.json();
      console.log("🔍 My Registrations Response:", data); // DEBUG
      
      if (data && data.success && Array.isArray(data.registrations)) {
        const registrationsMap: {
          [key: number]: {
            id: number;
            status: "pending" | "approved" | "rejected";
          };
        } = {};
        data.registrations.forEach((reg: any) => {
          console.log("📝 Processing registration:", reg); // DEBUG
          registrationsMap[reg.event_id] = {
            id: reg.id,
            status: reg.status,
          };
        });
        console.log("✅ Final registrations map:", registrationsMap); // DEBUG
        setMyRegistrations(registrationsMap);
      }
    } catch (error) {
      console.error("Error fetching my registrations:", error);
    }
  };

  // Fetch events from backend
  useEffect(() => {
    fetchEvents();
    fetchMyRegistrations();
  }, []);

  // Filter events
  useEffect(() => {
    let filtered = events;

    // Filter by approval status first
    if (showPendingApproval) {
      // Admin mode: show pending events only
      filtered = filtered.filter((event) => event.approvalStatus === "pending");
    } else {
      // Normal mode: ONLY show approved events (hide pending completely)
      filtered = filtered.filter(
        (event) => event.approvalStatus === "approved"
      );
    }

    // Filter by hidden status
    if (!showHidden) {
      filtered = filtered.filter((event) => !event.isHidden);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (event) => event.category === selectedCategory
      );
    }

    if (selectedStatus !== "all") {
      filtered = filtered.filter((event) => event.status === selectedStatus);
    }

    // Date filter
    if (selectedDate) {
      // Specific date selected
      const targetDate = new Date(selectedDate);
      const targetDateOnly = new Date(
        targetDate.getFullYear(),
        targetDate.getMonth(),
        targetDate.getDate()
      );

      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.date);
        const eventDateOnly = new Date(
          eventDate.getFullYear(),
          eventDate.getMonth(),
          eventDate.getDate()
        );
        return eventDateOnly.getTime() === targetDateOnly.getTime();
      });
    } else if (dateFilter !== "all") {
      // Preset date filters
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.date);
        const eventDateOnly = new Date(
          eventDate.getFullYear(),
          eventDate.getMonth(),
          eventDate.getDate()
        );

        if (dateFilter === "today") {
          const todayOnly = new Date(today);
          return eventDateOnly.getTime() === todayOnly.getTime();
        } else if (dateFilter === "tomorrow") {
          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          return eventDateOnly.getTime() === tomorrow.getTime();
        } else if (dateFilter === "this_week") {
          const nextWeek = new Date(today);
          nextWeek.setDate(today.getDate() + 7);
          return eventDateOnly >= today && eventDateOnly < nextWeek;
        } else if (dateFilter === "this_month") {
          const nextMonth = new Date(today);
          nextMonth.setDate(today.getDate() + 30);
          return eventDateOnly >= today && eventDateOnly < nextMonth;
        }
        return true;
      });
    }

    // Sort events
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === "date") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === "participants") {
        return b.currentParticipants - a.currentParticipants;
      } else {
        // newest
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
    });

    setFilteredEvents(filtered);
  }, [
    events,
    searchTerm,
    selectedCategory,
    selectedStatus,
    showHidden,
    showPendingApproval,
    sortBy,
    dateFilter,
  ]);

  // Check permissions
  const canDeleteEvent = (event: Event) => {
    if (currentUser.role === "admin") return true;
    if (currentUser.role === "manager" && event.organizer.id === currentUser.id)
      return true;
    return false;
  };

  const canEditEvent = (event: Event) => {
    if (currentUser.role === "admin") return true;
    if (currentUser.role === "manager" && event.organizer.id === currentUser.id)
      return true;
    return false;
  };

  const canHideEvent = (event: Event) => {
    if (currentUser.role === "admin") return true;
    if (currentUser.role === "manager" && event.organizer.id === currentUser.id)
      return true;
    return false;
  };

  const canCreateEvent = () => {
    return currentUser.role === "manager" || currentUser.role === "admin";
  };

  const canApproveEvent = () => {
    return currentUser.role === "admin";
  };

  // Handle like event
  const handleLike = async (eventId: number) => {
    // Tìm event hiện tại
    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    // 1️⃣ TÍNH TOÁN like mới (optimistic)
    const newLikesCount = event.isLiked
      ? (event.likes || 1) - 1
      : (event.likes || 0) + 1;
    const newIsLiked = !event.isLiked;

    // 2️⃣ CẬP NHẬT UI NGAY LẬP TỨC (optimistic update)
    setEvents(
      events.map((e) =>
        e.id === eventId
          ? {
              ...e,
              isLiked: newIsLiked,
              likes: newLikesCount,
            }
          : e
      )
    );

    // 3️⃣ GỬI REQUEST ĐẾN API (KHÔNG reload toàn bộ)
    try {
      let response;
      if (event.isLiked) {
        response = await authFetch(`/api/likes/event/unlike/${eventId}`, {
          method: "POST",
        });
      } else {
        response = await authFetch(`/api/likes/event/like/${eventId}`, {
          method: "POST",
        });
      }

      const data = await response.json();
      console.log("✅ Like API response:", data);
      // Không cần reload - optimistic update đã đúng
    } catch (error: any) {
      console.error("❌ Error liking event:", error);
      console.error("Error details:", error.response?.data);

      // 4️⃣ ROLLBACK nếu có lỗi
      setEvents(
        events.map((e) =>
          e.id === eventId
            ? {
                ...e,
                isLiked: event.isLiked, // ← Revert lại
                likes: event.likes, // ← Revert số like
              }
            : e
        )
      );
      alert(error.response?.data?.message || "Lỗi khi yêu thích sự kiện");
    }
  };

  // Handle join event
  const handleJoinEvent = async (eventId: number) => {
    if (joiningEvents.has(eventId)) return; // Prevent double submission

    setJoiningEvents((prev) => new Set(prev).add(eventId));

    // Lưu state cũ để rollback nếu cần
    const prevRegistrations = { ...myRegistrations };

    try {
      const event = events.find((e) => e.id === eventId);

      // 1️⃣ CẬP NHẬT UI NGAY - optimistic update
      setMyRegistrations({
        ...myRegistrations,
        [eventId]: {
          id: eventId,
          status: "pending",
        },
      });

      // 2️⃣ GỬI REQUEST ĐẾN API
      const response = await authFetch(`/user/joinEvent/${eventId}`, {
        method: "POST",
      });
      const data = await response.json();

      // 3️⃣ ĐỒNG BỘ với server response
      if (data && data.success && data.registration) {
        const registration = data.registration;
        setMyRegistrations((prev) => ({
          ...prev,
          [eventId]: {
            id: registration.id,
            status: registration.status,
          },
        }));
        alert(
          `Đã gửi yêu cầu tham gia sự kiện: ${
            event?.title || ""
          }. Vui lòng chờ manager duyệt!`
        );
        setShowDetailModal(false);
      } else if (data && data.error) {
        setMyRegistrations(prevRegistrations); 
        alert(data.error);
      }
    } catch (error: any) {
      console.error("Error joining event:", error);
      setMyRegistrations(prevRegistrations);
      alert(error.message || "Lỗi khi đăng ký sự kiện");
    } finally {
      setJoiningEvents((prev) => {
        const newSet = new Set(prev);
        newSet.delete(eventId);
        return newSet;
      });
    }
  };

  // Handle delete event
  const handleDeleteEvent = (event: Event) => {
    setEventToDelete(event);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (eventToDelete) {
      setEvents(events.filter((event) => event.id !== eventToDelete.id));
      setShowDeleteModal(false);
      setEventToDelete(null);
    }
  };
  // Show event details
  const showEventDetails = (event: Event) => {
    // setSelectedEvent(event);
    // setShowDetailModal(true);
    window.location.href = `/events/${event.eventId}`;
  };

  // Handle hide/show event
  const handleToggleHidden = (eventId: number) => {
    setEvents(
      events.map((event) =>
        event.id === eventId ? { ...event, isHidden: !event.isHidden } : event
      )
    );
  };

  // Handle approve/reject event
  const handleApproveEvent = async (
    eventId: number,
    status: "approved" | "rejected"
  ) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Vui lòng đăng nhập");
        return;
      }

      const endpoint =
        status === "approved"
          ? `/api/admin/approveEvent/${eventId}`
          : `/api/admin/rejectEvent/${eventId}`;

      const response = await authFetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        // Reload lại toàn bộ danh sách events sau khi approve/reject
        await fetchEvents();
        alert(
          status === "approved"
            ? "Đã duyệt sự kiện thành công"
            : "Đã từ chối sự kiện"
        );
      } else {
        alert("Có lỗi xảy ra, vui lòng thử lại");
      }
    } catch (error) {
      console.error("Error approving/rejecting event:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại");
    }
  };

  // Handle create new event
  const handleCreateEvent = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Vui lòng đăng nhập để tạo sự kiện");
        return;
      }

      // Chuyển đổi date + time thành datetime cho backend
      const startDateTime =
        newEvent.date && newEvent.time
          ? `${newEvent.date} ${newEvent.time.split(" - ")[0]}:00`
          : undefined;
      const endDateTime =
        newEvent.date && newEvent.time
          ? `${newEvent.date} ${newEvent.time.split(" - ")[1] || "23:59"}:00`
          : undefined;

      const response = await authFetch("/api/manager/createEvent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newEvent.title,
          content: newEvent.description,
          address: newEvent.location,
          start_time: startDateTime,
          end_time: endDateTime,
          image: newEvent.image,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Tạo sự kiện thất bại");
      }

      // Thêm event mới vào danh sách
      const createdEvent: Event = {
        id: data.event.id,
        eventId: data.event.id.toString(),
        title: data.event.title,
        description: data.event.content || "",
        image: data.event.image || "",
        date: data.event.start_time?.split(" ")[0] || "",
        time: newEvent.time,
        location: data.event.address,
        maxParticipants: newEvent.maxParticipants,
        currentParticipants: 0,
        category: newEvent.category,
        organizer: {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
          role: currentUser.role,
        },
        participants: [],
        isLiked: false,
        likes: 0,
        status: data.event.status || "upcoming",
        isHidden: false,
        approvalStatus: data.event.status === "pending" ? "pending" : "approved",
        createdAt: new Date().toISOString().split("T")[0],
      };

      setEvents([...events, createdEvent]);
      setShowCreateModal(false);
      setNewEvent({
        title: "",
        description: "",
        image: "",
        date: "",
        time: "",
        location: "",
        maxParticipants: 10,
        category: "Môi trường",
      });

      alert("Tạo sự kiện thành công!");
    } catch (error: any) {
      alert(error.message || "Đã xảy ra lỗi khi tạo sự kiện");
      console.error("Create event error:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      upcoming: "text-blue-700",
      ongoing: "text-green-700",
      completed: "text-gray-700",
      cancelled: "text-red-700",
    };
    const labels = {
      upcoming: "Sắp diễn ra",
      ongoing: "Đang diễn ra",
      completed: "Đã kết thúc",
      cancelled: "Đã hủy",
    };
    return (
      <span
        className={`text-xs font-semibold ${
          badges[status as keyof typeof badges]
        }`}
      >
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const getApprovalBadge = (approvalStatus: string) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
    };
    const labels = {
      pending: "Chờ duyệt",
      approved: "Đã duyệt",
      rejected: "Bị từ chối",
    };
    const icons = {
      pending: FaHourglassHalf,
      approved: FaCheckCircle,
      rejected: FaTimesCircle,
    };
    const Icon = icons[approvalStatus as keyof typeof icons];

    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          badges[approvalStatus as keyof typeof badges]
        }`}
      >
        <Icon className="mr-1" />
        {labels[approvalStatus as keyof typeof labels]}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Page Header */}
      <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Sự kiện tình nguyện
              </h1>
              <p className="text-gray-600 mt-1">
                Khám phá và tham gia các hoạt động ý nghĩa 🌱
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Create Event Button */}
              {canCreateEvent() && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-medium rounded-lg transition duration-200 shadow-md"
                >
                  <FaPlus />
                  <span>Tạo sự kiện</span>
                </button>
              )}

              {/* Admin Controls */}
              {canApproveEvent() && (
                <button
                  onClick={() => setShowPendingApproval(!showPendingApproval)}
                  className={`flex items-center space-x-2 px-4 py-2 font-medium rounded-lg transition duration-200 ${
                    showPendingApproval
                      ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <FaHourglassHalf />
                  <span>
                    Chờ duyệt (
                    {
                      events.filter((e) => e.approvalStatus === "pending")
                        .length
                    }
                    )
                  </span>
                </button>
              )}

              {/* Show Hidden Toggle */}
              {(currentUser.role === "admin" ||
                currentUser.role === "manager") && (
                <button
                  onClick={() => setShowHidden(!showHidden)}
                  className={`flex items-center space-x-2 px-4 py-2 font-medium rounded-lg transition duration-200 ${
                    showHidden
                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {showHidden ? <FaEye /> : <FaEyeSlash />}
                  <span>{showHidden ? "Hiện tất cả" : "Hiện bị ẩn"}</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm sự kiện..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 shadow-sm"
              />
            </div>

            {/* Filters - Custom Dropdowns */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Category Filter */}
              <div className="relative">
                <button
                  id="category-button"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setDropdownPosition({
                      top: rect.bottom + 8,
                      left: rect.left,
                    });
                    setShowCategoryDropdown(!showCategoryDropdown);
                    setShowStatusDropdown(false);
                    setShowDateDropdown(false);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-blue-200 rounded-full text-sm font-semibold text-gray-800 hover:border-blue-400 hover:bg-blue-50 transition-all shadow-md hover:shadow-lg"
                >
                  {selectedCategory === "all"
                    ? "🌍 Tất cả danh mục"
                    : selectedCategory === "Môi trường"
                    ? "🌱 Môi trường"
                    : selectedCategory === "Giáo dục"
                    ? "📚 Giáo dục"
                    : selectedCategory === "Xã hội"
                    ? "🤝 Xã hội"
                    : "❤️ Y tế"}
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      showCategoryDropdown ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <button
                  id="status-button"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setDropdownPosition({
                      top: rect.bottom + 8,
                      left: rect.left,
                    });
                    setShowStatusDropdown(!showStatusDropdown);
                    setShowCategoryDropdown(false);
                    setShowDateDropdown(false);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-purple-200 rounded-full text-sm font-semibold text-gray-800 hover:border-purple-400 hover:bg-purple-50 transition-all shadow-md hover:shadow-lg"
                >
                  {selectedStatus === "all"
                    ? "📋 Tất cả trạng thái"
                    : selectedStatus === "upcoming"
                    ? "🔜 Sắp diễn ra"
                    : selectedStatus === "ongoing"
                    ? "▶️ Đang diễn ra"
                    : selectedStatus === "completed"
                    ? "✅ Đã kết thúc"
                    : "❌ Đã hủy"}
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      showStatusDropdown ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>

              {/* Date Filter */}
              <div className="relative">
                <button
                  id="date-button"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setDropdownPosition({
                      top: rect.bottom + 8,
                      left: rect.left,
                    });
                    setShowDateDropdown(!showDateDropdown);
                    setShowCategoryDropdown(false);
                    setShowStatusDropdown(false);
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-orange-200 rounded-full text-sm font-semibold text-gray-800 hover:border-orange-400 hover:bg-orange-50 transition-all shadow-md hover:shadow-lg"
                >
                  {selectedDate
                    ? `📅 ${new Date(selectedDate).toLocaleDateString("vi-VN")}`
                    : dateFilter === "today"
                    ? "📅 Hôm nay"
                    : dateFilter === "tomorrow"
                    ? "📅 Ngày mai"
                    : dateFilter === "this_week"
                    ? "📅 Tuần này"
                    : dateFilter === "this_month"
                    ? "📅 Tháng này"
                    : "📅 Tất cả thời gian"}
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      showDateDropdown ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>

              {/* Clear Filters */}
              {(selectedCategory !== "all" ||
                selectedStatus !== "all" ||
                dateFilter !== "all" ||
                selectedDate) && (
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSelectedStatus("all");
                    setSelectedDate("");
                    setDateFilter("all");
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
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Đang tải sự kiện...</p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <FaCalendarAlt className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Không tìm thấy sự kiện
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Hãy thử thay đổi bộ lọc hoặc tìm kiếm khác.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
              >
                {/* Event Image */}
                <div className="relative h-40 flex-shrink-0 group">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md">
                      {getStatusBadge(event.status)}
                    </div>
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700 shadow-md">
                      {event.category}
                    </span>
                  </div>
                </div>

                {/* Event Content */}
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-gray-900 line-clamp-2 mb-1">
                        {event.title}
                      </h3>
                      {/* Approval Status Badge */}
                      {(showPendingApproval ||
                        event.approvalStatus !== "approved") && (
                        <div className="mt-1">
                          {getApprovalBadge(event.approvalStatus)}
                        </div>
                      )}
                      {/* Hidden Status */}
                      {event.isHidden && (
                        <div className="mt-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            <FaEyeSlash className="mr-1" />
                            Đã ẩn
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      {/* Admin Approval Buttons */}
                      {canApproveEvent() &&
                        event.approvalStatus === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleApproveEvent(event.id, "approved")
                              }
                              className="text-gray-400 hover:text-green-600 p-1"
                              title="Duyệt sự kiện"
                            >
                              <FaCheck />
                            </button>
                            <button
                              onClick={() =>
                                handleApproveEvent(event.id, "rejected")
                              }
                              className="text-gray-400 hover:text-red-600 p-1"
                              title="Từ chối sự kiện"
                            >
                              <FaTimes />
                            </button>
                          </>
                        )}

                      {/* Hide/Show Button */}
                      {canHideEvent(event) &&
                        event.approvalStatus === "approved" && (
                          <button
                            onClick={() => handleToggleHidden(event.id)}
                            className={`p-1 ${
                              event.isHidden
                                ? "text-gray-400 hover:text-blue-600"
                                : "text-gray-400 hover:text-gray-600"
                            }`}
                            title={
                              event.isHidden ? "Hiện sự kiện" : "Ẩn sự kiện"
                            }
                          >
                            {event.isHidden ? <FaEye /> : <FaEyeSlash />}
                          </button>
                        )}

                      {/* Edit Button */}
                      {canEditEvent(event) &&
                        event.approvalStatus === "approved" && (
                          <button
                            className="text-gray-400 hover:text-blue-600 p-1"
                            title="Chỉnh sửa sự kiện"
                          >
                            <FaEdit />
                          </button>
                        )}

                      {/* Delete Button */}
                      {canDeleteEvent(event) && (
                        <button
                          onClick={() => handleDeleteEvent(event)}
                          className="text-gray-400 hover:text-red-600 p-1"
                          title="Xóa sự kiện"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                    {event.description}
                  </p>

                  {/* Event Info - flexible spacer */}
                  <div className="space-y-1.5 mb-3">
                    <div className="flex items-center text-xs text-gray-600">
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

                  {/* Bottom Section - Fixed */}
                  <div className="mt-auto">
                    {/* Progress Bar */}
                    <div className="mb-3">
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

                    {/* Organizer */}
                    <div className="flex items-center mb-3 pb-3 border-b border-gray-100">
                      <Image
                        src={event.organizer.avatar}
                        alt={event.organizer.name}
                        width={32}
                        height={32}
                        className="rounded-full"
                        unoptimized
                      />
                      <div className="ml-2">
                        <p className="text-sm font-medium text-gray-900">
                          {event.organizer.name}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {event.organizer.role}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleLike(event.id)}
                          disabled={likingEvents.has(event.id)}
                          className={`flex items-center space-x-1 text-sm transition-colors ${
                            likingEvents.has(event.id)
                              ? "text-gray-400 cursor-not-allowed"
                              : event.isLiked
                              ? "text-red-500 hover:text-red-600"
                              : "text-gray-500 hover:text-red-500"
                          }`}
                        >
                          {likingEvents.has(event.id) ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                              <span>{event.likes}</span>
                            </>
                          ) : (
                            <>
                              {event.isLiked ? <FaHeart /> : <FaRegHeart />}
                              <span>{event.likes}</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => showEventDetails(event)}
                          className="flex items-center space-x-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition duration-200"
                        >
                          <FaEye />
                          <span>Chi tiết</span>
                        </button>
                        {event.status === "upcoming" &&
                          (myRegistrations[event.id]?.status === "pending" ? (
                            <button
                              disabled
                              className="flex items-center space-x-1 px-3 py-2 text-sm text-yellow-700 bg-yellow-50 rounded-lg cursor-not-allowed"
                            >
                              <FaHourglassHalf />
                              <span>Chờ duyệt</span>
                            </button>
                          ) : myRegistrations[event.id]?.status ===
                            "approved" ? (
                            <button
                              onClick={() => window.location.href = `/events/${event.id}/channel`}
                              className="flex items-center space-x-1 px-3 py-2 text-sm text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-lg transition duration-200"
                            >
                              <FaCheckCircle />
                              <span>Đang tham gia</span>
                            </button>
                          ) : myRegistrations[event.id]?.status ===
                            "rejected" ? (
                            <button
                              onClick={() => handleJoinEvent(event.id)}
                              className="flex items-center space-x-1 px-3 py-2 text-sm text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition"
                            >
                              <FaTimesCircle />
                              <span>Bị từ chối - Đăng ký lại</span>
                            </button>
                          ) : event.currentParticipants <
                            event.maxParticipants ? (
                            <button
                              onClick={() => handleJoinEvent(event.id)}
                              disabled={joiningEvents.has(event.id)}
                              className={`flex items-center space-x-1 px-3 py-2 text-sm rounded-lg transition duration-200 ${
                                joiningEvents.has(event.id)
                                  ? "text-white bg-blue-400 cursor-not-allowed"
                                  : "text-white bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
                              }`}
                            >
                              {joiningEvents.has(event.id) ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                  <span>Đang gửi...</span>
                                </>
                              ) : (
                                <>
                                  <FaUserPlus />
                                  <span>Tham gia</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <button
                              disabled
                              className="flex items-center space-x-1 px-3 py-2 text-sm text-gray-500 bg-gray-100 rounded-lg cursor-not-allowed"
                            >
                              <FaUsers />
                              <span>Đã đầy</span>
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      {showDetailModal && selectedEvent && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedEvent.title}
                  </h2>
                  {/* Compute status dựa trên thời gian */}
                  {(() => {
                    const now = new Date();
                    const start = new Date(selectedEvent.date);
                    const end = new Date(selectedEvent.date);
                    
                    // Parse time để set hours và minutes
                    const timeRange = selectedEvent.time.split(" - ");
                    if (timeRange.length === 2) {
                      const [startHour, startMin] = timeRange[0].split(":").map(Number);
                      const [endHour, endMin] = timeRange[1].split(":").map(Number);
                      start.setHours(startHour, startMin, 0, 0);
                      end.setHours(endHour, endMin, 0, 0);
                    }
                    
                    let computedStatus = selectedEvent.status;
                    if (selectedEvent.status !== "cancelled") {
                      if (now < start) computedStatus = "upcoming";
                      else if (now > end) computedStatus = "completed";
                      else computedStatus = "ongoing";
                    }
                    
                    return getStatusBadge(computedStatus);
                  })()}
                </div>
              </div>

              <p className="text-gray-700 mb-6">{selectedEvent.description}</p>

              <div className="space-y-4 mb-6">
                <div className="flex items-center">
                  <FaCalendarAlt className="mr-3 text-blue-500" />
                  <span className="text-gray-700">
                    {new Date(selectedEvent.date).toLocaleDateString("vi-VN")} •{" "}
                    {selectedEvent.time}
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

              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
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
                    <p className="text-sm text-gray-500 capitalize">
                      Người tổ chức • {selectedEvent.organizer.role}
                    </p>
                  </div>
                </div>

                {(() => {
                  const now = new Date();
                  const start = new Date(selectedEvent.date);
                  const timeRange = selectedEvent.time.split(" - ");
                  if (timeRange.length === 2) {
                    const [startHour, startMin] = timeRange[0].split(":").map(Number);
                    start.setHours(startHour, startMin, 0, 0);
                  }
                  
                  // Chỉ hiển thị nút tham gia nếu sự kiện chưa bắt đầu và còn chỗ
                  if (
                    selectedEvent.currentParticipants < selectedEvent.maxParticipants &&
                    now < start &&
                    selectedEvent.status !== "cancelled"
                  ) {
                    return (
                      <button
                        onClick={() => handleJoinEvent(selectedEvent.id)}
                        disabled={joiningEvents.has(selectedEvent.id)}
                        className={`flex items-center space-x-2 px-6 py-3 font-medium rounded-lg transition duration-200 ${
                          joiningEvents.has(selectedEvent.id)
                            ? "bg-blue-400 text-white cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white"
                        }`}
                      >
                        {joiningEvents.has(selectedEvent.id) ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                            <span>Đang gửi yêu cầu...</span>
                          </>
                        ) : (
                          <>
                            <FaUserPlus />
                            <span>Tham gia sự kiện</span>
                          </>
                        )}
                      </button>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Tạo sự kiện mới
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <FaTimes />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCreateEvent();
                }}
                className="space-y-6 text-gray-700"
              >
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tiêu đề sự kiện
                  </label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhập tiêu đề sự kiện..."
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mô tả sự kiện
                  </label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, description: e.target.value })
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Mô tả chi tiết về sự kiện..."
                    required
                  />
                </div>

                <div>
                  <label className="block">
                    <span className="sr-only">Choose profile photo</span>
                    <input
                      type="file"
                      className="block w-full text-sm text-gray-500
                                file:me-4 file:py-2 file:px-4
                                file:rounded-lg file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-600 file:text-white
                                hover:file:bg-blue-700
                                file:disabled:opacity-50 file:disabled:pointer-events-none
                                dark:text-neutral-500
                                dark:file:bg-blue-500
                                dark:hover:file:bg-blue-400
                              "
                    />
                  </label>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL hình ảnh
                  </label>
                  <input
                    type="url"
                    value={newEvent.image}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, image: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ngày tổ chức
                    </label>
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, date: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Thời gian
                    </label>
                    <input
                      type="text"
                      value={newEvent.time}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, time: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="08:00 - 17:00"
                      required
                    />
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa điểm
                  </label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, location: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Địa chỉ tổ chức sự kiện..."
                    required
                  />
                </div>

                {/* Category and Max Participants */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Danh mục
                    </label>
                    <select
                      value={newEvent.category}
                      onChange={(e) =>
                        setNewEvent({ ...newEvent, category: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {categories
                        .filter((cat) => cat !== "all")
                        .map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số lượng tối đa
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newEvent.maxParticipants}
                      onChange={(e) =>
                        setNewEvent({
                          ...newEvent,
                          maxParticipants: parseInt(e.target.value) || 10,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Info Message */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <FaExclamationTriangle className="text-blue-500 mt-0.5 mr-2" />
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">Lưu ý:</p>
                      <p>
                        {currentUser.role === "admin"
                          ? "Sự kiện sẽ được duyệt tự động."
                          : "Sự kiện sẽ được gửi đến admin để duyệt trước khi hiển thị công khai."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition duration-200"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-medium rounded-lg transition duration-200"
                  >
                    <FaPaperPlane />
                    <span>Tạo sự kiện</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && eventToDelete && (
        <div className="fixed inset-0 bg-white flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <FaExclamationTriangle className="text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Xác nhận xóa sự kiện
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa sự kiện "{eventToDelete.title}"? Hành
              động này không thể hoàn tác.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition duration-200"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition duration-200"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Portal Dropdowns */}
      {showCategoryDropdown &&
        createPortal(
          <>
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999999,
                backgroundColor: "transparent",
              }}
              onClick={() => setShowCategoryDropdown(false)}
            />
            <div
              style={{
                position: "absolute",
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                zIndex: 1000000,
              }}
              id="category-dropdown-portal"
            >
              <div className="w-64 bg-white rounded-2xl shadow-2xl border-2 border-blue-100 overflow-hidden">
                {["all", "Môi trường", "Giáo dục", "Xã hội", "Y tế"].map(
                  (category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setShowCategoryDropdown(false);
                      }}
                      className={`w-full text-left px-5 py-3.5 text-sm font-semibold transition-all ${
                        selectedCategory === category
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                          : "text-gray-700 hover:bg-blue-50"
                      }`}
                    >
                      {category === "all"
                        ? "🌍 Tất cả danh mục"
                        : category === "Môi trường"
                        ? "🌱 Môi trường"
                        : category === "Giáo dục"
                        ? "📚 Giáo dục"
                        : category === "Xã hội"
                        ? "🤝 Xã hội"
                        : "❤️ Y tế"}
                    </button>
                  )
                )}
              </div>
            </div>
          </>,
          document.body
        )}

      {showStatusDropdown &&
        createPortal(
          <>
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999999,
                backgroundColor: "transparent",
              }}
              onClick={() => setShowStatusDropdown(false)}
            />
            <div
              style={{
                position: "absolute",
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                zIndex: 1000000,
              }}
              id="status-dropdown-portal"
            >
              <div className="w-64 bg-white rounded-2xl shadow-2xl border-2 border-purple-100 overflow-hidden">
                {["all", "upcoming", "ongoing", "completed", "cancelled"].map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setSelectedStatus(status);
                        setShowStatusDropdown(false);
                      }}
                      className={`w-full text-left px-5 py-3.5 text-sm font-semibold transition-all ${
                        selectedStatus === status
                          ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                          : "text-gray-700 hover:bg-purple-50"
                      }`}
                    >
                      {status === "all"
                        ? "📋 Tất cả trạng thái"
                        : status === "upcoming"
                        ? "🔜 Sắp diễn ra"
                        : status === "ongoing"
                        ? "▶️ Đang diễn ra"
                        : status === "completed"
                        ? "✅ Đã kết thúc"
                        : "❌ Đã hủy"}
                    </button>
                  )
                )}
              </div>
            </div>
          </>,
          document.body
        )}

      {showDateDropdown &&
        createPortal(
          <>
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999999,
                backgroundColor: "transparent",
              }}
              onClick={() => setShowDateDropdown(false)}
            />
            <div
              style={{
                position: "absolute",
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                zIndex: 1000000,
              }}
              id="date-dropdown-portal"
            >
              <div className="w-80 bg-white rounded-2xl shadow-2xl border-2 border-orange-100 overflow-hidden">
                <button
                  onClick={() => {
                    setSelectedDate("");
                    setDateFilter("all");
                    setShowDateDropdown(false);
                  }}
                  className={`w-full text-left px-5 py-3.5 text-sm font-semibold transition-all ${
                    dateFilter === "all" && !selectedDate
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                      : "text-gray-700 hover:bg-orange-50"
                  }`}
                >
                  📅 Tất cả thời gian
                </button>
                <button
                  onClick={() => {
                    setSelectedDate("");
                    setDateFilter("today");
                    setShowDateDropdown(false);
                  }}
                  className={`w-full text-left px-5 py-3.5 text-sm font-semibold transition-all ${
                    dateFilter === "today"
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                      : "text-gray-700 hover:bg-orange-50"
                  }`}
                >
                  <div>📆 Hôm nay</div>
                  <div className="text-xs opacity-75 mt-1">
                    Sự kiện diễn ra hôm nay
                  </div>
                </button>
                <button
                  onClick={() => {
                    setSelectedDate("");
                    setDateFilter("tomorrow");
                    setShowDateDropdown(false);
                  }}
                  className={`w-full text-left px-5 py-3.5 text-sm font-semibold transition-all ${
                    dateFilter === "tomorrow"
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                      : "text-gray-700 hover:bg-orange-50"
                  }`}
                >
                  <div>📆 Ngày mai</div>
                  <div className="text-xs opacity-75 mt-1">
                    Sự kiện diễn ra ngày mai
                  </div>
                </button>
                <button
                  onClick={() => {
                    setSelectedDate("");
                    setDateFilter("this_week");
                    setShowDateDropdown(false);
                  }}
                  className={`w-full text-left px-5 py-3.5 text-sm font-semibold transition-all ${
                    dateFilter === "this_week"
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                      : "text-gray-700 hover:bg-orange-50"
                  }`}
                >
                  <div>📅 Tuần này</div>
                  <div className="text-xs opacity-75 mt-1">
                    7 ngày tới từ hôm nay
                  </div>
                </button>
                <button
                  onClick={() => {
                    setSelectedDate("");
                    setDateFilter("this_month");
                    setShowDateDropdown(false);
                  }}
                  className={`w-full text-left px-5 py-3.5 text-sm font-semibold transition-all ${
                    dateFilter === "this_month"
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white"
                      : "text-gray-700 hover:bg-orange-50"
                  }`}
                >
                  <div>📅 Tháng này</div>
                  <div className="text-xs opacity-75 mt-1">
                    30 ngày tới từ hôm nay
                  </div>
                </button>

                <div className="border-t border-gray-200 p-4">
                  <div className="text-sm font-semibold text-gray-800 mb-2">
                    📅 Chọn ngày cụ thể
                  </div>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => {
                      setSelectedDate(e.target.value);
                      setDateFilter(e.target.value ? "specific" : "all");
                      setShowDateDropdown(false);
                    }}
                    className="w-full px-4 py-2.5 border-2 border-orange-200 rounded-lg text-sm font-medium text-black focus:border-orange-500 focus:outline-none transition-colors"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
}

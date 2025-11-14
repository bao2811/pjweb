"use client";
import { useState, useEffect } from "react";
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
import api from "@/utils/api";
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

// Mock current user (thay đổi role để test các quyền khác nhau)
const currentUser: User = {
  id: 1,
  name: "Nguyễn Văn A",
  role: "admin", // Có thể thay đổi thành 'user', 'manager' hoặc 'admin' để test
  avatar:
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
};



export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<Event | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showHidden, setShowHidden] = useState(false);
  const [showPendingApproval, setShowPendingApproval] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
  // Use env-injected base URL if present, otherwise default to same-origin "/api"
        const response = await api.get('events/getAllEvents');
        const data = await response.data;

        if (response.status === 200 && data.events) {
          // Transform backend data to frontend format
          const transformedEvents: Event[] = data.events.map((event: any) => ({
            id: event.id,
            eventId: event.id.toString(),
            title: event.title,
            description: event.description || '',
            image: event.image || 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop',
            date: event.start_date || '',
            time: event.start_date && event.end_date 
              ? `${event.start_date.split(' ')[1]?.substring(0,5) || '09:00'} - ${event.end_date.split(' ')[1]?.substring(0,5) || '17:00'}`
              : 'Cả ngày',
            location: event.location || 'Chưa xác định',
            maxParticipants: event.max_participants || 100,
            currentParticipants: 0,
            category: event.category || 'Môi trường',
            organizer: {
              id: event.creator_id || 1,
              name: 'Organizer',
              avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
              role: 'manager',
            },
            participants: [],
            isLiked: false,
            likes: 0,
            status: event.status || 'upcoming',
            isHidden: false,
            approvalStatus: 'approved',
            createdAt: event.created_at || '',
          }));
          setEvents(transformedEvents);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        // Fallback to mock data if API fails
    
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Filter events
  useEffect(() => {
    let filtered = events;

    // Filter by approval status first
    if (showPendingApproval) {
      filtered = filtered.filter((event) => event.approvalStatus === "pending");
    } else {
      filtered = filtered.filter(
        (event) => event.approvalStatus === "approved"
      );
    }

    // Filter by hidden status
    if (!showHidden) {
      filtered = filtered.filter((event) => !event.isHidden);
    }

    // For admin, show all events regardless of hidden status when managing
    if (currentUser.role === "admin" && showHidden) {
      filtered = events.filter((event) => event.approvalStatus === "approved");
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

    setFilteredEvents(filtered);
  }, [
    events,
    searchTerm,
    selectedCategory,
    selectedStatus,
    showHidden,
    showPendingApproval,
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
  const handleLike = (eventId: number) => {
    setEvents(
      events.map((event) =>
        event.id === eventId
          ? {
              ...event,
              isLiked: !event.isLiked,
              likes: event.isLiked ? event.likes - 1 : event.likes + 1,
            }
          : event
      )
    );
  };

  // Handle join event
  const handleJoinEvent = (eventId: number) => {
    setEvents(
      events.map((event) =>
        event.id === eventId &&
        event.currentParticipants < event.maxParticipants
          ? { ...event, currentParticipants: event.currentParticipants + 1 }
          : event
      )
    );
    setShowDetailModal(false);
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
    window.location.href = `/user/events/${event.eventId}`;
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
  const handleApproveEvent = (
    eventId: number,
    status: "approved" | "rejected"
  ) => {
    setEvents(
      events.map((event) =>
        event.id === eventId ? { ...event, approvalStatus: status } : event
      )
    );
  };

  // Handle create new event
  const handleCreateEvent = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Vui lòng đăng nhập để tạo sự kiện');
        return;
      }

      // Chuyển đổi date + time thành datetime cho backend
      const startDateTime = newEvent.date && newEvent.time 
        ? `${newEvent.date} ${newEvent.time.split(' - ')[0]}:00`
        : undefined;
      const endDateTime = newEvent.date && newEvent.time
        ? `${newEvent.date} ${newEvent.time.split(' - ')[1] || '23:59'}:00`
        : undefined;

  // Use env-injected base URL if present, otherwise default to same-origin "/api"
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";
      const response = await fetch(`${API_URL}/manager/createEvent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
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
        throw new Error(data.message || 'Tạo sự kiện thất bại');
      }

      // Thêm event mới vào danh sách
      const createdEvent: Event = {
        id: data.event.id,
        eventId: data.event.id.toString(),
        title: data.event.title,
        description: data.event.content || '',
        image: data.event.image || '',
        date: data.event.start_time?.split(' ')[0] || '',
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
        approvalStatus: "approved",
        createdAt: new Date().toISOString().split('T')[0],
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
      
      alert('Tạo sự kiện thành công!');
    } catch (error: any) {
      alert(error.message || 'Đã xảy ra lỗi khi tạo sự kiện');
      console.error('Create event error:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      upcoming: "bg-blue-100 text-blue-800",
      ongoing: "bg-green-100 text-green-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };
    const labels = {
      upcoming: "Sắp diễn ra",
      ongoing: "Đang diễn ra",
      completed: "Đã kết thúc",
      cancelled: "Đã hủy",
    };
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
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
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Sự kiện tình nguyện
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Khám phá và tham gia các hoạt động ý nghĩa 🌱
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Create Event Button */}
              {canCreateEvent() && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-medium rounded-lg transition duration-200"
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

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            {/* Search */}
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm sự kiện..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === "all" ? "Tất cả danh mục" : category}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === "all"
                    ? "Tất cả trạng thái"
                    : status === "upcoming"
                    ? "Sắp diễn ra"
                    : status === "ongoing"
                    ? "Đang diễn ra"
                    : status === "completed"
                    ? "Đã kết thúc"
                    : "Đã hủy"}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              >
                {/* Event Image */}
                <div className="relative h-56 group">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute top-4 left-4">
                    {getStatusBadge(event.status)}
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-semibold text-gray-700 shadow-md">
                      {event.category}
                    </span>
                  </div>
                </div>

                {/* Event Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
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

                  {/* Organizer */}
                  <div className="flex items-center mb-4 pb-4 border-b border-gray-100">
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
                        className={`flex items-center space-x-1 text-sm ${
                          event.isLiked
                            ? "text-red-500"
                            : "text-gray-500 hover:text-red-500"
                        }`}
                      >
                        {event.isLiked ? <FaHeart /> : <FaRegHeart />}
                        <span>{event.likes}</span>
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
                      {event.currentParticipants < event.maxParticipants &&
                        event.status === "upcoming" && (
                          <button
                            onClick={() => handleJoinEvent(event.id)}
                            className="flex items-center space-x-1 px-3 py-2 text-sm text-white bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 rounded-lg transition duration-200"
                          >
                            <FaUserPlus />
                            <span>Tham gia</span>
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Event Detail Modal
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
                  {getStatusBadge(selectedEvent.status)}
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

                {selectedEvent.currentParticipants <
                  selectedEvent.maxParticipants &&
                  selectedEvent.status === "upcoming" && (
                    <button
                      onClick={() => handleJoinEvent(selectedEvent.id)}
                      className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-medium rounded-lg transition duration-200"
                    >
                      <FaUserPlus />
                      <span>Tham gia sự kiện</span>
                    </button>
                  )}
              </div>
            </div>
          </div>
        </div>
      )} */}

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
    </div>
  );
}

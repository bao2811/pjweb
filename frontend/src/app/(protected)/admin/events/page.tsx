"use client";
import { useState } from "react";
import Image from "next/image";
import {
  FaCalendarAlt,
  FaSearch,
  FaFilter,
  FaDownload,
  FaFileExport,
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
  FaChartLine,
  FaUserFriends,
  FaCalendarCheck,
} from "react-icons/fa";

// Types
interface EventMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  joinedDate: string;
  role: string;
}

interface Event {
  id: number;
  title: string;
  organizer: string;
  organizerId: number;
  category: "environment" | "education" | "health" | "community";
  image: string;
  location: string;
  date: string;
  time: string;
  status: "upcoming" | "ongoing" | "completed" | "pending";
  participants: number;
  maxParticipants: number;
  description: string;
  createdAt: string;
  members: EventMember[];
}

// Mock Data
const mockEvents: Event[] = [
  {
    id: 1,
    title: "Dọn rác bãi biển Vũng Tàu",
    organizer: "Nguyễn Văn An",
    organizerId: 2,
    category: "environment",
    image:
      "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=400&h=300&fit=crop",
    location: "Bãi biển Vũng Tàu",
    date: "2025-10-25",
    time: "07:00",
    status: "upcoming",
    participants: 156,
    maxParticipants: 200,
    description:
      "Chiến dịch dọn rác bảo vệ môi trường biển, góp phần xây dựng bãi biển xanh - sạch - đẹp.",
    createdAt: "2025-10-10",
    members: [
      {
        id: 1,
        name: "Trần Thị Bình",
        email: "tranbinhtv@gmail.com",
        phone: "0902345678",
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616b2e4a0ee?w=100&h=100&fit=crop&crop=face",
        joinedDate: "2025-10-11",
        role: "Tình nguyện viên",
      },
      {
        id: 2,
        name: "Lê Minh Châu",
        email: "leminhchau@gmail.com",
        phone: "0903456789",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
        joinedDate: "2025-10-12",
        role: "Nhóm trưởng",
      },
    ],
  },
  {
    id: 2,
    title: "Trồng cây xanh - Công viên Tao Đàn",
    organizer: "Trần Thị Bình",
    organizerId: 3,
    category: "environment",
    image:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=300&fit=crop",
    location: "Công viên Tao Đàn, Quận 1",
    date: "2025-10-22",
    time: "06:30",
    status: "ongoing",
    participants: 203,
    maxParticipants: 250,
    description:
      "Chương trình trồng 500 cây xanh tại công viên, góp phần cải thiện không khí đô thị.",
    createdAt: "2025-10-05",
    members: [
      {
        id: 3,
        name: "Phạm Văn Dũng",
        email: "phamvandung@gmail.com",
        phone: "0904567890",
        avatar:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
        joinedDate: "2025-10-06",
        role: "Tình nguyện viên",
      },
    ],
  },
  {
    id: 3,
    title: "Dạy học miễn phí cho trẻ em",
    organizer: "Lê Minh Châu",
    organizerId: 4,
    category: "education",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop",
    location: "Trung tâm Văn hóa Quận 3",
    date: "2025-10-28",
    time: "14:00",
    status: "upcoming",
    participants: 89,
    maxParticipants: 100,
    description:
      "Dạy học miễn phí cho trẻ em có hoàn cảnh khó khăn, các môn Toán, Văn, Anh.",
    createdAt: "2025-10-08",
    members: [],
  },
  {
    id: 4,
    title: "Hiến máu nhân đạo",
    organizer: "Phạm Văn Dũng",
    organizerId: 5,
    category: "health",
    image:
      "https://images.unsplash.com/photo-1615461065929-4f8ffed6ca40?w=400&h=300&fit=crop",
    location: "Bệnh viện Chợ Rẫy",
    date: "2025-11-05",
    time: "08:00",
    status: "pending",
    participants: 67,
    maxParticipants: 150,
    description:
      "Chương trình hiến máu tình nguyện, cứu người hiến máu cứu người.",
    createdAt: "2025-10-15",
    members: [],
  },
  {
    id: 5,
    title: "Tặng quà cho người vô gia cư",
    organizer: "Hoàng Thị Em",
    organizerId: 6,
    category: "community",
    image:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=300&fit=crop",
    location: "Khu vực Bến Thành",
    date: "2025-09-15",
    time: "18:00",
    status: "completed",
    participants: 45,
    maxParticipants: 50,
    description:
      "Phát quà và đồ ăn cho người vô gia cư trong khu vực trung tâm thành phố.",
    createdAt: "2025-09-01",
    members: [],
  },
];

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);

  // Filter events
  const filteredEvents = events.filter((event) => {
    const matchSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.organizer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory =
      filterCategory === "all" || event.category === filterCategory;
    const matchStatus = filterStatus === "all" || event.status === filterStatus;
    return matchSearch && matchCategory && matchStatus;
  });

  // Export events to CSV
  const handleExportEvents = () => {
    const csvHeaders = [
      "ID",
      "Tên sự kiện",
      "Người tổ chức",
      "Chủ đề",
      "Địa điểm",
      "Ngày",
      "Giờ",
      "Trạng thái",
      "Tham gia",
      "Tối đa",
    ];
    const csvRows = filteredEvents.map((event) => [
      event.id,
      event.title,
      event.organizer,
      getCategoryLabel(event.category),
      event.location,
      new Date(event.date).toLocaleDateString("vi-VN"),
      event.time,
      getStatusLabel(event.status),
      event.participants,
      event.maxParticipants,
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
  };

  // Export members to CSV
  const handleExportMembers = (event: Event) => {
    const csvHeaders = [
      "ID",
      "Tên",
      "Email",
      "Số điện thoại",
      "Vai trò",
      "Ngày tham gia",
    ];
    const csvRows = event.members.map((member) => [
      member.id,
      member.name,
      member.email,
      member.phone,
      member.role,
      new Date(member.joinedDate).toLocaleDateString("vi-VN"),
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `members_event_${event.id}_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    link.click();
  };

  // Delete event
  const handleDeleteEvent = (eventId: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) {
      setEvents(events.filter((e) => e.id !== eventId));
      setShowDetailModal(false);
    }
  };

  // Accept event
  const handleAcceptEvent = async (eventId: number) => {
    if (!confirm("Bạn có chắc chắn muốn duyệt sự kiện này?")) return;

    try {
      const res = await fetch(
        `http://localhost:8000/api/admin/acceptEvent/${eventId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        // Update status to "upcoming" after approval
        setEvents(
          events.map((e) =>
            e.id === eventId ? { ...e, status: "upcoming" as const } : e
          )
        );
        setShowDetailModal(false);
        alert("Duyệt sự kiện thành công!");
      } else {
        const data = await res.json();
        alert(`Lỗi: ${data.message || "Không thể duyệt sự kiện"}`);
      }
    } catch (error) {
      console.error("Error accepting event:", error);
      alert("Có lỗi xảy ra khi duyệt sự kiện");
    }
  };

  // Reject event
  const handleRejectEvent = async (eventId: number) => {
    if (!confirm("Bạn có chắc chắn muốn từ chối sự kiện này?")) return;

    try {
      const res = await fetch(
        `http://localhost:8000/api/admin/rejectEvent/${eventId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (res.ok) {
        // Remove rejected event from list or update status
        setEvents(events.filter((e) => e.id !== eventId));
        setShowDetailModal(false);
        alert("Từ chối sự kiện thành công!");
      } else {
        const data = await res.json();
        alert(`Lỗi: ${data.message || "Không thể từ chối sự kiện"}`);
      }
    } catch (error) {
      console.error("Error rejecting event:", error);
      alert("Có lỗi xảy ra khi từ chối sự kiện");
    }
  };

  // Category helpers
  const getCategoryLabel = (category: string) => {
    const labels = {
      environment: "Môi trường",
      education: "Giáo dục",
      health: "Sức khỏe",
      community: "Cộng đồng",
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
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
    };
    return icons[category as keyof typeof icons] || icons.community;
  };

  // Status helpers
  const getStatusLabel = (status: string) => {
    const labels = {
      upcoming: "Sắp diễn ra",
      ongoing: "Đang diễn ra",
      completed: "Đã hoàn thành",
      pending: "Chờ duyệt",
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      upcoming: { bg: "bg-blue-100", text: "text-blue-700", icon: FaClock },
      ongoing: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: FaCheckCircle,
      },
      completed: {
        bg: "bg-gray-100",
        text: "text-gray-700",
        icon: FaCalendarCheck,
      },
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: FaHourglassHalf,
      },
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  // Stats
  const stats = {
    total: events.length,
    upcoming: events.filter((e) => e.status === "upcoming").length,
    ongoing: events.filter((e) => e.status === "ongoing").length,
    completed: events.filter((e) => e.status === "completed").length,
    pending: events.filter((e) => e.status === "pending").length,
    totalParticipants: events.reduce((sum, e) => sum + e.participants, 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-green-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent flex items-center">
                <FaCalendarAlt className="mr-3 text-green-600" />
                Quản lý sự kiện tình nguyện
              </h1>
              <p className="text-green-700 mt-2">
                Theo dõi và quản lý các hoạt động tình nguyện
              </p>
            </div>
            <button
              onClick={handleExportEvents}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-lg font-medium transition duration-200 flex items-center space-x-2 shadow-md hover:shadow-lg"
            >
              <FaDownload />
              <span>Xuất tất cả sự kiện</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border-l-4 border-green-500 shadow-sm hover:shadow-md transition duration-200">
            <p className="text-sm text-gray-600 flex items-center">
              <FaCalendarAlt className="mr-2 text-green-500" />
              Tổng số
            </p>
            <p className="text-2xl font-bold text-green-700">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border-l-4 border-blue-500 shadow-sm hover:shadow-md transition duration-200">
            <p className="text-sm text-gray-600 flex items-center">
              <FaClock className="mr-2 text-blue-500" />
              Sắp diễn ra
            </p>
            <p className="text-2xl font-bold text-blue-700">{stats.upcoming}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border-l-4 border-green-600 shadow-sm hover:shadow-md transition duration-200">
            <p className="text-sm text-gray-600 flex items-center">
              <FaCheckCircle className="mr-2 text-green-600" />
              Đang diễn ra
            </p>
            <p className="text-2xl font-bold text-green-800">{stats.ongoing}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border-l-4 border-gray-500 shadow-sm hover:shadow-md transition duration-200">
            <p className="text-sm text-gray-600 flex items-center">
              <FaCalendarCheck className="mr-2 text-gray-500" />
              Đã hoàn thành
            </p>
            <p className="text-2xl font-bold text-gray-700">
              {stats.completed}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border-l-4 border-yellow-500 shadow-sm hover:shadow-md transition duration-200">
            <p className="text-sm text-gray-600 flex items-center">
              <FaHourglassHalf className="mr-2 text-yellow-500" />
              Chờ duyệt
            </p>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border-l-4 border-purple-500 shadow-sm hover:shadow-md transition duration-200">
            <p className="text-sm text-gray-600 flex items-center">
              <FaUsers className="mr-2 text-purple-500" />
              Tham gia
            </p>
            <p className="text-2xl font-bold text-purple-700">
              {stats.totalParticipants}
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-green-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-400" />
              <input
                type="text"
                placeholder="Tìm kiếm sự kiện hoặc người tổ chức..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Filter by Category */}
            <div className="relative">
              <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all">Tất cả chủ đề</option>
                <option value="environment">🌿 Môi trường</option>
                <option value="education">🎓 Giáo dục</option>
                <option value="health">❤️ Sức khỏe</option>
                <option value="community">🤝 Cộng đồng</option>
              </select>
            </div>

            {/* Filter by Status */}
            <div className="relative">
              <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="upcoming">Sắp diễn ra</option>
                <option value="ongoing">Đang diễn ra</option>
                <option value="completed">Đã hoàn thành</option>
                <option value="pending">Chờ duyệt</option>
              </select>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const categoryConfig = getCategoryIcon(event.category);
            const CategoryIcon = categoryConfig.icon;
            const statusBadge = getStatusBadge(event.status);
            const StatusIcon = statusBadge.icon;

            return (
              <div
                key={event.id}
                className="bg-white rounded-xl shadow-sm border border-green-100 hover:shadow-lg transition duration-300 overflow-hidden group"
              >
                {/* Event Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-110 transition duration-300"
                    unoptimized
                  />
                  {/* Category Badge */}
                  <div
                    className={`absolute top-3 left-3 ${categoryConfig.bg} ${categoryConfig.color} px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 shadow-md`}
                  >
                    <CategoryIcon />
                    <span>{getCategoryLabel(event.category)}</span>
                  </div>
                  {/* Status Badge */}
                  <div
                    className={`absolute top-3 right-3 ${statusBadge.bg} ${statusBadge.text} px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 shadow-md`}
                  >
                    <StatusIcon />
                    <span>{getStatusLabel(event.status)}</span>
                  </div>
                </div>

                {/* Event Info */}
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 min-h-[56px]">
                    {event.title}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600 flex items-center">
                      <FaUserFriends className="mr-2 text-green-500" />
                      <span className="font-medium">{event.organizer}</span>
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-blue-500" />
                      {event.location}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <FaCalendarAlt className="mr-2 text-green-500" />
                      {new Date(event.date).toLocaleDateString("vi-VN")} •{" "}
                      {event.time}
                    </p>
                  </div>

                  {/* Participants Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 flex items-center">
                        <FaUsers className="mr-1 text-purple-500" />
                        Tham gia
                      </span>
                      <span className="font-semibold text-green-700">
                        {event.participants}/{event.maxParticipants}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            (event.participants / event.maxParticipants) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    {event.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleAcceptEvent(event.id)}
                          className="flex-1 px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition duration-200 flex items-center justify-center space-x-1 text-sm"
                          title="Duyệt sự kiện"
                        >
                          <FaCheckCircle />
                          <span>Duyệt</span>
                        </button>
                        <button
                          onClick={() => handleRejectEvent(event.id)}
                          className="flex-1 px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg font-medium transition duration-200 flex items-center justify-center space-x-1 text-sm"
                          title="Từ chối sự kiện"
                        >
                          <FaTimes />
                          <span>Từ chối</span>
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowDetailModal(true);
                      }}
                      className={`${
                        event.status === "pending"
                          ? "px-3 py-2"
                          : "flex-1 px-4 py-2"
                      } bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-lg font-medium transition duration-200 flex items-center justify-center space-x-2`}
                    >
                      <FaEye />
                      <span>Chi tiết</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowMembersModal(true);
                      }}
                      className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition duration-200"
                      title="Xem thành viên"
                    >
                      <FaUsers />
                    </button>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition duration-200"
                      title="Xóa sự kiện"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <FaCalendarAlt className="mx-auto text-6xl text-gray-300 mb-4" />
            <p className="text-gray-500">Không tìm thấy sự kiện nào</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header with Image */}
            <div className="relative h-64">
              <Image
                src={selectedEvent.image}
                alt={selectedEvent.title}
                fill
                className="object-cover"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <button
                onClick={() => setShowDetailModal(false)}
                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition duration-200 text-white"
              >
                <FaTimes size={20} />
              </button>
              <div className="absolute bottom-4 left-6">
                <h2 className="text-3xl font-bold text-white mb-2">
                  {selectedEvent.title}
                </h2>
                <div className="flex items-center space-x-2">
                  {(() => {
                    const catConfig = getCategoryIcon(selectedEvent.category);
                    const CatIcon = catConfig.icon;
                    return (
                      <span
                        className={`${catConfig.bg} ${catConfig.color} px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1`}
                      >
                        <CatIcon />
                        <span>{getCategoryLabel(selectedEvent.category)}</span>
                      </span>
                    );
                  })()}
                  {(() => {
                    const statBadge = getStatusBadge(selectedEvent.status);
                    const StatIcon = statBadge.icon;
                    return (
                      <span
                        className={`${statBadge.bg} ${statBadge.text} px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1`}
                      >
                        <StatIcon />
                        <span>{getStatusLabel(selectedEvent.status)}</span>
                      </span>
                    );
                  })()}
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Event Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 mb-1 flex items-center">
                    <FaUserFriends className="mr-2" />
                    Người tổ chức
                  </p>
                  <p className="font-semibold text-gray-900">
                    {selectedEvent.organizer}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600 mb-1 flex items-center">
                    <FaMapMarkerAlt className="mr-2" />
                    Địa điểm
                  </p>
                  <p className="font-semibold text-gray-900">
                    {selectedEvent.location}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 mb-1 flex items-center">
                    <FaCalendarAlt className="mr-2" />
                    Ngày tổ chức
                  </p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedEvent.date).toLocaleDateString("vi-VN")}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600 mb-1 flex items-center">
                    <FaClock className="mr-2" />
                    Thời gian
                  </p>
                  <p className="font-semibold text-gray-900">
                    {selectedEvent.time}
                  </p>
                </div>
              </div>

              {/* Participants */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-6">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                  <FaUsers className="mr-2 text-green-600" />
                  Thống kê tham gia
                </h4>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-600">Đã tham gia</span>
                  <span className="text-2xl font-bold text-green-700">
                    {selectedEvent.participants}/{selectedEvent.maxParticipants}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        (selectedEvent.participants /
                          selectedEvent.maxParticipants) *
                          100,
                        100
                      )}%`,
                    }}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Còn{" "}
                  {selectedEvent.maxParticipants - selectedEvent.participants}{" "}
                  chỗ trống
                </p>
              </div>

              {/* Description */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-bold text-gray-900 mb-2">Mô tả sự kiện</h4>
                <p className="text-gray-700">{selectedEvent.description}</p>
              </div>

              {/* Created Date */}
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 mb-1">Ngày tạo</p>
                <p className="font-semibold text-gray-900">
                  {new Date(selectedEvent.createdAt).toLocaleDateString(
                    "vi-VN"
                  )}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition duration-200"
              >
                Đóng
              </button>
              {selectedEvent.status === "pending" && (
                <>
                  <button
                    onClick={() => handleRejectEvent(selectedEvent.id)}
                    className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition duration-200 flex items-center space-x-2"
                  >
                    <FaTimes />
                    <span>Từ chối</span>
                  </button>
                  <button
                    onClick={() => handleAcceptEvent(selectedEvent.id)}
                    className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition duration-200 flex items-center space-x-2"
                  >
                    <FaCheckCircle />
                    <span>Duyệt sự kiện</span>
                  </button>
                </>
              )}
              {selectedEvent.status !== "pending" && (
                <>
                  <button
                    onClick={() => {
                      setShowMembersModal(true);
                      setShowDetailModal(false);
                    }}
                    className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition duration-200 flex items-center space-x-2"
                  >
                    <FaUsers />
                    <span>Xem thành viên</span>
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition duration-200 flex items-center space-x-2"
                  >
                    <FaTrash />
                    <span>Xóa sự kiện</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Members Modal */}
      {showMembersModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Danh sách thành viên</h2>
                  <p className="text-green-100 mt-1">{selectedEvent.title}</p>
                </div>
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
              <div className="flex items-center justify-between mb-6">
                <p className="text-gray-600">
                  Tổng số thành viên:{" "}
                  <span className="font-bold text-green-700">
                    {selectedEvent.members.length}
                  </span>
                </p>
                <button
                  onClick={() => handleExportMembers(selectedEvent)}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-lg font-medium transition duration-200 flex items-center space-x-2"
                >
                  <FaFileExport />
                  <span>Xuất danh sách</span>
                </button>
              </div>

              {selectedEvent.members.length > 0 ? (
                <div className="space-y-4">
                  {selectedEvent.members.map((member) => (
                    <div
                      key={member.id}
                      className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-100 hover:shadow-md transition duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        <Image
                          src={member.avatar}
                          alt={member.name}
                          width={60}
                          height={60}
                          className="rounded-full ring-2 ring-green-200"
                          unoptimized
                        />
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900">
                            {member.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {member.email}
                          </p>
                          <p className="text-sm text-gray-600">
                            {member.phone}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-2">
                            {member.role}
                          </span>
                          <p className="text-xs text-gray-500">
                            Tham gia:{" "}
                            {new Date(member.joinedDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FaUsers className="mx-auto text-6xl text-gray-300 mb-4" />
                  <p className="text-gray-500">
                    Chưa có thành viên nào tham gia
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowMembersModal(false)}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition duration-200"
              >
                Đóng
              </button>
              {selectedEvent.members.length > 0 && (
                <button
                  onClick={() => handleExportMembers(selectedEvent)}
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-lg font-medium transition duration-200 flex items-center space-x-2"
                >
                  <FaFileExport />
                  <span>Xuất CSV</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

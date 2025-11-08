"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
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
} from "react-icons/fa";

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
  userStatus: "pending" | "approved" | "completed" | "cancelled";
  eventStatus: "upcoming" | "ongoing" | "completed" | "cancelled";
  appliedAt: string;
  approvedAt?: string;
  completedAt?: string;
}

// Mock current user
const currentUser = {
  id: 1,
  name: "Nguyễn Văn A",
  avatar:
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
};

// Mock events data
const mockUserEvents: UserEvent[] = [
  {
    id: 1,
    title: "Trồng cây xanh - Vì môi trường sạch",
    description:
      "Cùng nhau trồng cây tại công viên để tạo ra không gian xanh, sạch cho cộng đồng. Hoạt động bao gồm trồng cây, tưới nước và chăm sóc cây con.",
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop",
    date: "2025-10-15",
    time: "07:00 - 11:00",
    location: "Công viên Tao Đàn, Quận 1, TP.HCM",
    maxParticipants: 100,
    currentParticipants: 45,
    category: "Môi trường",
    organizer: {
      id: 2,
      name: "Trần Thị B",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b2e4a0ee?w=150&h=150&fit=crop&crop=face",
      role: "Manager",
    },
    participants: [
      {
        id: 1,
        name: "Nguyễn Văn A",
        avatar:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
        joinedAt: "2025-10-02",
      },
      {
        id: 3,
        name: "Lê Thị C",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        joinedAt: "2025-10-03",
      },
      {
        id: 4,
        name: "Phạm Văn D",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        joinedAt: "2025-10-04",
      },
    ],
    userStatus: "pending",
    eventStatus: "upcoming",
    appliedAt: "2025-10-08T09:00:00Z",
  },
  {
    id: 2,
    title: "Dạy học miễn phí cho trẻ em vùng cao",
    description:
      "Chương trình giáo dục tình nguyện dành cho trẻ em ở vùng núi cao. Chúng ta sẽ dạy các môn cơ bản và tặng sách vở, dụng cụ học tập.",
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop",
    date: "2025-10-20",
    time: "Cả ngày (3 ngày 2 đêm)",
    location: "Sapa, Lào Cai",
    maxParticipants: 20,
    currentParticipants: 12,
    category: "Giáo dục",
    organizer: {
      id: 3,
      name: "Lê Văn C",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      role: "Manager",
    },
    participants: [
      {
        id: 1,
        name: "Nguyễn Văn A",
        avatar:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
        joinedAt: "2025-09-25",
      },
      {
        id: 5,
        name: "Hoàng Thị E",
        avatar:
          "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face",
        joinedAt: "2025-09-26",
      },
      {
        id: 6,
        name: "Ngô Văn F",
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        joinedAt: "2025-09-27",
      },
    ],
    userStatus: "approved",
    eventStatus: "upcoming",
    appliedAt: "2025-09-25T10:30:00Z",
    approvedAt: "2025-09-26T14:15:00Z",
  },
  {
    id: 3,
    title: "Nấu cơm từ thiện cuối tuần",
    description:
      "Chuẩn bị và phục vụ bữa ăn miễn phí cho người vô gia cư và người nghèo trong khu vực. Mang đến sự ấm áp và tình người.",
    image:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop",
    date: "2025-09-28",
    time: "16:00 - 20:00",
    location: "Chùa Vĩnh Nghiêm, Quận 3, TP.HCM",
    maxParticipants: 80,
    currentParticipants: 67,
    category: "Xã hội",
    organizer: {
      id: 4,
      name: "Phạm Thị D",
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      role: "Manager",
    },
    participants: [
      {
        id: 1,
        name: "Nguyễn Văn A",
        avatar:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
        joinedAt: "2025-09-20",
      },
      {
        id: 7,
        name: "Trần Văn G",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        joinedAt: "2025-09-21",
      },
      {
        id: 8,
        name: "Vũ Thị H",
        avatar:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
        joinedAt: "2025-09-22",
      },
    ],
    userStatus: "completed",
    eventStatus: "completed",
    appliedAt: "2025-09-20T08:00:00Z",
    approvedAt: "2025-09-21T09:00:00Z",
    completedAt: "2025-09-28T20:00:00Z",
  },
  {
    id: 4,
    title: "Hiến máu tình nguyện",
    description:
      "Chương trình hiến máu nhân đạo để cứu giúp những bệnh nhân đang cần máu điều trị. Mỗi đơn vị máu có thể cứu được 3 sinh mạng.",
    image:
      "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop",
    date: "2025-08-15",
    time: "08:00 - 17:00",
    location: "Viện Huyết học Truyền máu TP.HCM",
    maxParticipants: 200,
    currentParticipants: 189,
    category: "Y tế",
    organizer: {
      id: 5,
      name: "Nguyễn Thị I",
      avatar:
        "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face",
      role: "Manager",
    },
    participants: [
      {
        id: 1,
        name: "Nguyễn Văn A",
        avatar:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
        joinedAt: "2025-08-10",
      },
      {
        id: 9,
        name: "Đỗ Văn J",
        avatar:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
        joinedAt: "2025-08-11",
      },
      {
        id: 10,
        name: "Bùi Thị K",
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616b2e4a0ee?w=150&h=150&fit=crop&crop=face",
        joinedAt: "2025-08-12",
      },
    ],
    userStatus: "completed",
    eventStatus: "completed",
    appliedAt: "2025-08-10T07:30:00Z",
    approvedAt: "2025-08-10T10:00:00Z",
    completedAt: "2025-08-15T17:00:00Z",
  },
];

export default function EventsAttendedPage() {
  const [events, setEvents] = useState<UserEvent[]>(mockUserEvents);
  const [selectedEvent, setSelectedEvent] = useState<UserEvent | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    "all" | "pending" | "approved" | "completed"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showParticipants, setShowParticipants] = useState(false);

  // Filter events based on tab and search
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location.toLowerCase().includes(searchTerm.toLowerCase());

    if (selectedTab === "all") return matchesSearch;
    return matchesSearch && event.userStatus === selectedTab;
  });

  // Get status info
  const getStatusInfo = (status: string) => {
    const statusConfig = {
      pending: {
        icon: FaHourglassHalf,
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        label: "Chờ duyệt",
      },
      approved: {
        icon: FaCheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-100",
        label: "Đang tham gia",
      },
      completed: {
        icon: FaCheck,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        label: "Đã hoàn thành",
      },
      cancelled: {
        icon: FaExclamationCircle,
        color: "text-red-600",
        bgColor: "bg-red-100",
        label: "Đã hủy",
      },
    };
    return statusConfig[status as keyof typeof statusConfig];
  };

  // Show event details
  const showEventDetails = (event: UserEvent) => {
    setSelectedEvent(event);
    setShowDetailModal(true);
    setShowParticipants(false);
  };

  // Get tab counts
  const getTabCounts = () => {
    return {
      all: events.length,
      pending: events.filter((e) => e.userStatus === "pending").length,
      approved: events.filter((e) => e.userStatus === "approved").length,
      completed: events.filter((e) => e.userStatus === "completed").length,
    };
  };

  const tabCounts = getTabCounts();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Sự kiện của tôi
              </h1>
              <p className="text-gray-600 mt-1">
                Quản lý các sự kiện bạn đã đăng ký tham gia
              </p>
            </div>

            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm sự kiện..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6">
            <nav className="flex space-x-8">
              {[
                { key: "all", label: "Tất cả", count: tabCounts.all },
                {
                  key: "pending",
                  label: "Chờ duyệt",
                  count: tabCounts.pending,
                },
                {
                  key: "approved",
                  label: "Đang tham gia",
                  count: tabCounts.approved,
                },
                {
                  key: "completed",
                  label: "Đã hoàn thành",
                  count: tabCounts.completed,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition duration-200 ${
                    selectedTab === tab.key
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      selectedTab === tab.key
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredEvents.length === 0 ? (
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
              const statusInfo = getStatusInfo(event.userStatus);
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

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <div className="flex items-center">
                        <Image
                          src={event.organizer.avatar}
                          alt={event.organizer.name}
                          width={24}
                          height={24}
                          className="rounded-full"
                          unoptimized
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          {event.organizer.name}
                        </span>
                      </div>

                      <button
                        onClick={() => showEventDetails(event)}
                        className="flex items-center space-x-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition duration-200"
                      >
                        <FaEye />
                        <span>Chi tiết</span>
                      </button>
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
                  const statusInfo = getStatusInfo(selectedEvent.userStatus);
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

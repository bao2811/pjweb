"use client";
import { use, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaClock,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimes,
  FaUserCheck,
  FaUserTimes,
  FaComments,
  FaLeaf,
  FaTrophy,
  FaHandsHelping,
} from "react-icons/fa";
import { authFetch } from "@/utils/auth";

interface EventDetail {
  id: number;
  title: string;
  description: string;
  image: string;
  start_date: string;
  end_date: string;
  location: string;
  max_participants: number;
  points: number;
  category: string;
  status: string;
  creator_id: number;
  currentParticipants?: number;
  manager?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  requirements?: string;
  created_at?: string;
  updated_at?: string;
}

interface Participant {
  id: number;
  user_id: number;
  event_id: number;
  status: "pending" | "approved" | "rejected";
  user: {
    id: number;
    username: string;
    email: string;
    image?: string;
  };
  created_at: string;
}

export default function ManagerEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchEventDetail();
    fetchParticipants();
  }, [id]);

  const fetchEventDetail = async () => {
    try {
      setIsLoading(true);
      const response = await authFetch(`/api/events/getEventDetails/${id}`);
      const data = await response.json();
      if (data && data.event) {
        setEvent(data.event);
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchParticipants = async () => {
    try {
      const response = await authFetch(`/manager/getListUserByEvent/${id}`);
      const data = await response.json();
      if (data && Array.isArray(data)) {
        setParticipants(data);
      }
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  };

  const handleApproveUser = async (userId: number) => {
    try {
      setIsProcessing(true);
      const response = await authFetch(`/manager/acceptUserJoinEvent/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        alert("Đã duyệt user tham gia sự kiện!");
        fetchParticipants();
      }
    } catch (error) {
      console.error("Error approving user:", error);
      alert("Có lỗi xảy ra khi duyệt user");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectUser = async (userId: number) => {
    if (!confirm("Bạn có chắc muốn từ chối user này?")) {
      return;
    }

    try {
      setIsProcessing(true);
      const response = await authFetch(`/manager/rejectUserJoinEvent/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        alert("Đã từ chối user tham gia sự kiện!");
        fetchParticipants();
      }
    } catch (error) {
      console.error("Error rejecting user:", error);
      alert("Có lỗi xảy ra khi từ chối user");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditEvent = () => {
    router.push(`/manager/events/${id}/edit`);
  };

  const handleDeleteEvent = async () => {
    if (!confirm("Bạn có chắc muốn xóa sự kiện này?")) {
      return;
    }

    try {
      const response = await authFetch(`/api/events/deleteEventById/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Đã xóa sự kiện thành công!");
        router.push("/manager/events");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Có lỗi xảy ra khi xóa sự kiện");
    }
  };

  const handleJoinChat = () => {
    router.push(`/manager/events/${id}/channel`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
          <p className="mt-4 text-gray-600 text-lg">Đang tải thông tin sự kiện...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <FaLeaf className="mx-auto text-6xl text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Không tìm thấy sự kiện</h2>
          <button
            onClick={() => router.push("/manager/events")}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const progress =
    event.max_participants > 0
      ? Math.min(((event.currentParticipants || 0) / event.max_participants) * 100, 100)
      : 0;

  const pendingCount = participants.filter((p) => p.status === "pending").length;
  const approvedCount = participants.filter((p) => p.status === "approved").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Hero Section */}
      <div className="relative h-[400px] w-full">
        <Image
          src={
            event.image ||
            "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&h=400&fit=crop"
          }
          alt={event.title}
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

        {/* Overlay Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center space-x-2 mb-3">
              <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-semibold flex items-center">
                <FaLeaf className="mr-1" />
                {event.category || "Tình nguyện"}
              </span>
              <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full text-sm font-semibold">
                {event.status === "upcoming"
                  ? "Sắp diễn ra"
                  : event.status === "ongoing"
                  ? "Đang diễn ra"
                  : event.status === "completed"
                  ? "Đã kết thúc"
                  : event.status === "pending"
                  ? "Chờ duyệt"
                  : "Đã hủy"}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Manager Action Buttons */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-purple-200">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleEditEvent}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-semibold"
            >
              <FaEdit />
              <span>Chỉnh sửa</span>
            </button>
            <button
              onClick={handleDeleteEvent}
              className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-semibold"
            >
              <FaTrash />
              <span>Xóa sự kiện</span>
            </button>
            <button
              onClick={handleJoinChat}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-semibold"
            >
              <FaComments />
              <span>Vào kênh chat</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <FaLeaf className="text-purple-600 mr-3" />
                Giới thiệu sự kiện
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/* Participants Management */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <FaUsers className="text-purple-600 mr-3" />
                  Quản lý người tham gia
                </h2>
                <div className="flex space-x-4">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
                    Chờ duyệt: {pendingCount}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    Đã duyệt: {approvedCount}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {participants.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Chưa có người đăng ký</p>
                ) : (
                  participants.map((participant) => (
                    <div
                      key={participant.id}
                      className={`p-4 rounded-xl border-2 ${
                        participant.status === "pending"
                          ? "bg-yellow-50 border-yellow-200"
                          : participant.status === "approved"
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {participant.user.image ? (
                            <Image
                              src={participant.user.image}
                              alt={participant.user.username}
                              width={50}
                              height={50}
                              className="rounded-full"
                              unoptimized
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                              {participant.user.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-800">
                              {participant.user.username}
                            </p>
                            <p className="text-sm text-gray-600">{participant.user.email}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Đăng ký: {new Date(participant.created_at).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {participant.status === "pending" ? (
                            <>
                              <button
                                onClick={() => handleApproveUser(participant.id)}
                                disabled={isProcessing}
                                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                              >
                                <FaUserCheck />
                                <span>Duyệt</span>
                              </button>
                              <button
                                onClick={() => handleRejectUser(participant.id)}
                                disabled={isProcessing}
                                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                              >
                                <FaUserTimes />
                                <span>Từ chối</span>
                              </button>
                            </>
                          ) : participant.status === "approved" ? (
                            <span className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg">
                              <FaCheckCircle />
                              <span>Đã duyệt</span>
                            </span>
                          ) : (
                            <span className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg">
                              <FaTimes />
                              <span>Đã từ chối</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Event Timeline */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-purple-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FaClock className="text-orange-600 mr-3" />
                Thời gian chi tiết
              </h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <FaCalendarAlt className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Bắt đầu</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(event.start_date).toLocaleString("vi-VN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <FaCalendarAlt className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Kết thúc</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(event.end_date).toLocaleString("vi-VN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Info Cards */}
          <div className="space-y-6">
            {/* Event Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-purple-100 sticky top-4">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Thông tin sự kiện</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <FaCalendarAlt className="text-purple-600 mt-1 text-lg" />
                  <div>
                    <p className="text-sm text-gray-500">Thời gian</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(event.start_date).toLocaleDateString("vi-VN")}
                    </p>
                    <p className="text-sm text-gray-600">
                      đến {new Date(event.end_date).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FaMapMarkerAlt className="text-red-600 mt-1 text-lg" />
                  <div>
                    <p className="text-sm text-gray-500">Địa điểm</p>
                    <p className="font-semibold text-gray-800">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FaUsers className="text-blue-600 mt-1 text-lg" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-2">Số lượng tham gia</p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-800">
                        {event.currentParticipants || 0}/{event.max_participants}
                      </span>
                      <span className="text-sm text-gray-600">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FaTrophy className="text-yellow-500 mt-1 text-lg" />
                  <div>
                    <p className="text-sm text-gray-500">Điểm thưởng</p>
                    <p className="font-semibold text-gray-800">{event.points} điểm</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

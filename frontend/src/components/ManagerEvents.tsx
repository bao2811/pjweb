"use client";
import { useState, useEffect } from "react";
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
} from "react-icons/fa";

interface Event {
  id: number;
  title: string;
  content: string;
  image: string;
  start_time: string;
  end_time: string;
  address: string;
  max_participants: number;
  category: string;
  status: string;
  current_participants?: number;
  created_at: string;
}

export default function ManagerEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "accepted" | "rejected">("all");
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
        setEvents(data.events);
      }
    } catch (error) {
      console.error("Error fetching manager events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa sự kiện này?")) return;

    try {
      const response = await authFetch(`/api/events/deleteEventById/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Đã xóa sự kiện thành công!");
        fetchMyEvents();
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Có lỗi xảy ra khi xóa sự kiện");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
      case "completed":
        return (
          <span className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
            <FaCheckCircle />
            <span>Đã hoàn thành</span>
          </span>
        );
      case "pending":
        return (
          <span className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-semibold">
            <FaClock />
            <span>Chờ duyệt</span>
          </span>
        );
      case "rejected":
        return (
          <span className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
            <FaTimesCircle />
            <span>Bị từ chối</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
            {status}
          </span>
        );
    }
  };

  const filteredEvents = events.filter((event) => {
    if (filter === "all") return true;
    if (filter === "accepted") return event.status === "accepted" || event.status === "completed";
    return event.status === filter;
  });

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header Section with backdrop blur */}
      <div className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-2">
                Sự kiện của tôi
              </h1>
              <p className="text-gray-600">
                Quản lý các sự kiện bạn đã tạo và điều phối
              </p>
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
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filter Tabs */}
        <div className="mb-8">

          <div className="flex flex-wrap gap-2 bg-white rounded-xl p-2 shadow-md">
            <button
              onClick={() => setFilter("all")}
              className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg font-semibold transition-all ${
                filter === "all"
                  ? "bg-gradient-to-r from-blue-500 to-green-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Tất cả
              <span className="ml-1 text-sm">({events.length})</span>
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg font-semibold transition-all ${
                filter === "pending"
                  ? "bg-yellow-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Chờ duyệt
              <span className="ml-1 text-sm">({events.filter((e) => e.status === "pending").length})</span>
            </button>
            <button
              onClick={() => setFilter("accepted")}
              className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg font-semibold transition-all ${
                filter === "accepted"
                  ? "bg-green-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Đã hoàn thành
              <span className="ml-1 text-sm">({events.filter((e) => e.status === "accepted" || e.status === "completed").length})</span>
            </button>
            <button
              onClick={() => setFilter("rejected")}
              className={`flex-1 min-w-[120px] py-3 px-4 rounded-lg font-semibold transition-all ${
                filter === "rejected"
                  ? "bg-red-500 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Bị từ chối
              <span className="ml-1 text-sm">({events.filter((e) => e.status === "rejected").length})</span>
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="text-7xl mb-6">📅</div>
            <h2 className="text-3xl font-bold text-gray-700 mb-3">
              Chưa có sự kiện nào
            </h2>
            <p className="text-gray-500 mb-8 text-lg">
              Hãy tạo sự kiện đầu tiên của bạn!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              <FaPlus />
              <span>Tạo sự kiện mới</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-100"
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
                    {getStatusBadge(event.status)}
                  </div>
                  {/* Category Badge */}
                  <div className="absolute bottom-3 left-3">
                    <span className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-full text-xs font-semibold shadow-lg">
                      {event.category}
                    </span>
                  </div>
                </div>

                {/* Event Info */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">
                    {event.title}
                  </h3>

                  <div className="space-y-3 mb-5">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaCalendarAlt className="mr-3 text-blue-500 flex-shrink-0" />
                      <span>
                        {new Date(event.start_time).toLocaleDateString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-start text-sm text-gray-600">
                      <FaMapMarkerAlt className="mr-3 text-red-500 flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{event.address}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaUsers className="mr-3 text-green-500 flex-shrink-0" />
                      <span className="font-semibold">
                        {event.current_participants || 0}/{event.max_participants}
                      </span>
                      <span className="ml-1">người tham gia</span>
                    </div>
                  </div>

                  {/* Action Buttons - Manager specific */}
                  <div className="flex space-x-2 pt-4 border-t border-gray-100">
                    <Link
                      href={`/manager/events/${event.id}`}
                      className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors font-semibold text-sm"
                    >
                      <FaEye />
                      <span>Xem chi tiết</span>
                    </Link>
                    <Link
                      href={`/manager/events/${event.id}/edit`}
                      className="flex items-center justify-center space-x-2 py-2.5 px-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-semibold text-sm"
                    >
                      <FaEdit />
                      <span>Sửa</span>
                    </Link>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="flex items-center justify-center py-2.5 px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-semibold"
                      title="Xóa sự kiện"
                    >
                      <FaTrash />
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

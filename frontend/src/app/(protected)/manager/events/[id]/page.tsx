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
  FaStar,
  FaChartBar,
} from "react-icons/fa";
import { authFetch } from "@/utils/auth";
import CompletionModal from "@/components/CompletionModal";

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
}

interface Participant {
  id: number;
  user_id: number;
  event_id: number;
  status: "pending" | "approved" | "rejected" | "cancelled";
  completion_status?: "pending" | "completed" | "failed";
  completed_at?: string;
  completion_note?: string;
  user: {
    id: number;
    username: string;
    email: string;
    image?: string;
  };
  created_at: string;
  joined_at?: string;
}

interface EventReport {
  event: {
    id: number;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    location: string;
    category: string;
    status: string;
  };
  statistics: {
    total_registered: number;
    pending: number;
    approved: number;
    rejected: number;
    completion_pending: number;
    completed: number;
    failed: number;
    event_hours: number;
    total_volunteer_hours: number;
  };
  volunteers: Array<{
    id: number;
    user_id: number;
    username: string;
    email: string;
    image?: string;
    status: string;
    completion_status: string;
    joined_at?: string;
    completed_at?: string;
    completion_note?: string;
    hours: number;
  }>;
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
  const [report, setReport] = useState<EventReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "overview" | "members" | "evaluation" | "report"
  >("overview");
  const [selectedVolunteer, setSelectedVolunteer] =
    useState<Participant | null>(null);

  useEffect(() => {
    fetchEventDetail();
    fetchParticipants();
  }, [id]);

  useEffect(() => {
    if (activeTab === "report") {
      fetchEventReport();
    }
  }, [activeTab]);

  const fetchEventDetail = async () => {
    try {
      setIsLoading(true);
      const response = await authFetch(`/api/events/getEventDetails/${id}`);
      const data = await response.json();
      if (data && data.event) {
        // Transform backend data to frontend format
        const eventData = data.event;
        setEvent({
          id: eventData.id,
          title: eventData.title,
          description: eventData.content || eventData.description || "",
          image: eventData.image,
          start_date: eventData.start_time || eventData.start_date,
          end_date: eventData.end_time || eventData.end_date,
          location: eventData.address || eventData.location,
          max_participants: eventData.max_participants || 100,
          points: eventData.points || 0,
          category: eventData.category || "Tình nguyện",
          status: eventData.status || "pending",
          creator_id: eventData.author_id || eventData.creator_id,
          currentParticipants: eventData.current_participants || 0,
        });
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

      if (data && data.success && Array.isArray(data.users)) {
        const transformedUsers = data.users.map((user: any) => ({
          id: user.id,
          user_id: user.user_id,
          event_id: user.event_id,
          status: user.status,
          completion_status: user.completion_status,
          completed_at: user.completed_at,
          completion_note: user.completion_note,
          user: {
            id: user.user_id,
            username: user.username,
            email: user.email,
            image: user.image,
          },
          created_at: user.created_at,
          joined_at: user.joined_at,
        }));
        setParticipants(transformedUsers);
      }
    } catch (error) {
      console.error("Error fetching participants:", error);
    }
  };

  const fetchEventReport = async () => {
    try {
      const response = await authFetch(`/manager/events/${id}/report`);
      const data = await response.json();
      if (data.success && data.report) {
        setReport(data.report);
      }
    } catch (error) {
      console.error("Error fetching event report:", error);
    }
  };

  const handleApproveUser = async (userId: number) => {
    if (!confirm("Bạn có chắc muốn duyệt user này?")) return;

    try {
      setIsProcessing(true);
      const response = await authFetch(`/manager/acceptUserJoinEvent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, event_id: parseInt(id) }),
      });
      const data = await response.json();

      if (data.success) {
        alert("Đã duyệt user tham gia sự kiện!");
        await fetchParticipants();
        await fetchEventDetail();
      } else {
        alert(data.message || "Có lỗi xảy ra khi duyệt user");
      }
    } catch (error) {
      console.error("Error approving user:", error);
      alert("Có lỗi xảy ra khi duyệt user");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectUser = async (userId: number) => {
    if (!confirm("Bạn có chắc muốn từ chối user này?")) return;

    try {
      setIsProcessing(true);
      const response = await authFetch(`/manager/rejectUserJoinEvent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, event_id: parseInt(id) }),
      });
      const data = await response.json();

      if (data.success) {
        alert("Đã từ chối user tham gia sự kiện!");
        await fetchParticipants();
        await fetchEventDetail();
      } else {
        alert(data.message || "Có lỗi xảy ra khi từ chối user");
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

  /**
   * FIX #3: Sử dụng route DELETE của manager thay vì route chung
   */
  const handleDeleteEvent = async () => {
    if (!confirm("Bạn có chắc muốn xóa sự kiện này?")) return;

    try {
      // FIX #3: Gọi API /manager/events/{id} thay vì /api/events/deleteEventById/{id}
      const response = await authFetch(`/manager/events/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        alert("Đã xóa sự kiện thành công!");
        router.push("/manager/events");
      } else {
        alert(data.message || "Có lỗi xảy ra khi xóa sự kiện");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Có lỗi xảy ra khi xóa sự kiện");
    }
  };

  const handleJoinChat = () => {
    router.push(`/events/${id}/channel`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
          <p className="mt-4 text-gray-600 text-lg">
            Đang tải thông tin sự kiện...
          </p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <FaLeaf className="mx-auto text-6xl text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            Không tìm thấy sự kiện
          </h2>
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
      ? Math.min(
          ((event.currentParticipants || 0) / event.max_participants) * 100,
          100
        )
      : 0;

  const pendingCount = participants.filter(
    (p) => p.status === "pending"
  ).length;
  const approvedCount = participants.filter(
    (p) => p.status === "approved"
  ).length;
  const approvedParticipants = participants.filter(
    (p) => p.status === "approved"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Hero Image Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-purple-200 mb-6">
          <div className="relative w-full aspect-video max-h-[400px]">
            <Image
              src={
                event.image ||
                "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&h=600&fit=crop"
              }
              alt={event.title}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="p-6">
            <div className="flex items-center space-x-2 mb-3">
              <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-semibold flex items-center">
                <FaLeaf className="mr-1" />
                {event.category || "Tình nguyện"}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  event.status === "pending"
                    ? "bg-yellow-100 text-yellow-700"
                    : event.status === "accepted" || event.status === "upcoming"
                    ? "bg-green-100 text-green-700"
                    : event.status === "ongoing"
                    ? "bg-blue-100 text-blue-700"
                    : event.status === "completed"
                    ? "bg-gray-100 text-gray-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {event.status === "pending"
                  ? "Chờ duyệt"
                  : event.status === "accepted" || event.status === "upcoming"
                  ? "Đã duyệt"
                  : event.status === "ongoing"
                  ? "Đang diễn ra"
                  : event.status === "completed"
                  ? "Hoàn thành"
                  : "Bị từ chối"}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              {event.title}
            </h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-lg p-4 mb-6 border border-purple-200">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleEditEvent}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
            >
              <FaEdit />
              <span>Chỉnh sửa</span>
            </button>
            <button
              onClick={handleDeleteEvent}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm"
            >
              <FaTrash />
              <span>Xóa sự kiện</span>
            </button>
            {/* Chỉ hiển thị nút vào kênh chat khi sự kiện KHÔNG ở trạng thái pending (đã được admin duyệt) */}
            {event.status !== "pending" && event.status !== "rejected" ? (
              <button
                onClick={handleJoinChat}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
              >
                <FaComments />
                <span>Vào kênh chat</span>
              </button>
            ) : (
              <span
                className="flex items-center space-x-2 px-4 py-2 bg-gray-400 text-white rounded-lg text-sm cursor-not-allowed"
                title="Kênh chat chỉ mở sau khi sự kiện được duyệt"
              >
                <FaComments />
                <span>Kênh chat (chờ duyệt)</span>
              </span>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 border border-purple-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {[
              { key: "overview", label: "Tổng quan", icon: FaLeaf },
              { key: "members", label: "Thành viên", icon: FaUsers },
              { key: "evaluation", label: "Đánh giá", icon: FaStar },
              { key: "report", label: "Báo cáo", icon: FaChartBar },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex-1 flex items-center justify-center space-x-2 px-4 py-4 font-semibold transition ${
                  activeTab === key
                    ? "bg-purple-600 text-white"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon />
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Giới thiệu sự kiện
                  </h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {event.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
                    <FaCalendarAlt className="text-purple-600 mt-1 text-lg" />
                    <div>
                      <p className="text-sm text-gray-500">Thời gian</p>
                      <p className="font-semibold text-gray-800">
                        {event.start_date
                          ? new Date(event.start_date).toLocaleString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })
                          : "Chưa xác định"}
                      </p>
                      <p className="text-sm text-gray-600">
                        đến{" "}
                        {event.end_date
                          ? new Date(event.end_date).toLocaleString("vi-VN", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: false,
                            })
                          : "Chưa xác định"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
                    <FaMapMarkerAlt className="text-red-600 mt-1 text-lg" />
                    <div>
                      <p className="text-sm text-gray-500">Địa điểm</p>
                      <p className="font-semibold text-gray-800">
                        {event.location || "Chưa xác định"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
                    <FaUsers className="text-blue-600 mt-1 text-lg" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500 mb-2">
                        Số lượng tham gia
                      </p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-gray-800">
                          {event.currentParticipants || 0}/
                          {event.max_participants}
                        </span>
                        <span className="text-sm text-gray-600">
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
                    <FaTrophy className="text-yellow-500 mt-1 text-lg" />
                    <div>
                      <p className="text-sm text-gray-500">Điểm thưởng</p>
                      <p className="font-semibold text-gray-800">
                        {event.points} điểm
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Members Tab */}
            {activeTab === "members" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">
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

                {participants.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Chưa có người đăng ký
                  </p>
                ) : (
                  participants
                    .filter(
                      (p) => p.status !== "rejected" && p.status !== "cancelled"
                    )
                    .map((participant) => (
                      <div
                        key={participant.id}
                        className={`p-4 rounded-xl border-2 ${
                          participant.status === "pending"
                            ? "bg-yellow-50 border-yellow-200"
                            : "bg-green-50 border-green-200"
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
                                {participant.user.username
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-gray-800">
                                {participant.user.username}
                              </p>
                              <p className="text-sm text-gray-600">
                                {participant.user.email}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {participant.status === "approved" &&
                                participant.joined_at
                                  ? `Tham gia: ${new Date(
                                      participant.joined_at
                                    ).toLocaleDateString("vi-VN")}`
                                  : `Đăng ký: ${new Date(
                                      participant.created_at
                                    ).toLocaleDateString("vi-VN")}`}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            {participant.status === "pending" ? (
                              <>
                                <button
                                  onClick={() =>
                                    handleApproveUser(participant.user_id)
                                  }
                                  disabled={isProcessing}
                                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 text-sm"
                                >
                                  <FaUserCheck />
                                  <span>Duyệt</span>
                                </button>
                                <button
                                  onClick={() =>
                                    handleRejectUser(participant.user_id)
                                  }
                                  disabled={isProcessing}
                                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 text-sm"
                                >
                                  <FaUserTimes />
                                  <span>Từ chối</span>
                                </button>
                              </>
                            ) : (
                              <span className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm">
                                <FaCheckCircle />
                                <span>Đã duyệt</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                )}
              </div>
            )}

            {/* Evaluation Tab */}
            {activeTab === "evaluation" && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Đánh giá tình nguyện viên
                </h2>

                {approvedParticipants.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    Chưa có tình nguyện viên được duyệt
                  </p>
                ) : (
                  approvedParticipants.map((participant) => (
                    <div
                      key={participant.id}
                      className={`p-4 rounded-xl border-2 ${
                        participant.completion_status === "completed"
                          ? "bg-green-50 border-green-300"
                          : participant.completion_status === "failed"
                          ? "bg-red-50 border-red-300"
                          : "bg-gray-50 border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1">
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
                              {participant.user.username
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">
                              {participant.user.username}
                            </p>
                            <p className="text-sm text-gray-600">
                              {participant.user.email}
                            </p>
                            {participant.completion_status === "completed" && (
                              <p className="text-xs text-green-600 mt-1">
                                ✅ Hoàn thành -{" "}
                                {participant.completed_at
                                  ? new Date(
                                      participant.completed_at
                                    ).toLocaleDateString("vi-VN")
                                  : ""}
                              </p>
                            )}
                            {participant.completion_status === "failed" && (
                              <p className="text-xs text-red-600 mt-1">
                                ❌ Không đạt -{" "}
                                {participant.completed_at
                                  ? new Date(
                                      participant.completed_at
                                    ).toLocaleDateString("vi-VN")
                                  : ""}
                              </p>
                            )}
                            {participant.completion_note && (
                              <p className="text-xs text-gray-500 mt-1 italic">
                                Ghi chú: {participant.completion_note}
                              </p>
                            )}
                          </div>
                        </div>

                        {participant.completion_status === "pending" && (
                          <button
                            onClick={() => setSelectedVolunteer(participant)}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
                          >
                            Đánh giá
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Report Tab */}
            {activeTab === "report" && report && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Báo cáo chi tiết
                </h2>

                {/* Statistics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Tổng đăng ký</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {report.statistics.total_registered}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Đã duyệt</p>
                    <p className="text-2xl font-bold text-green-600">
                      {report.statistics.approved}
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Hoàn thành</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {report.statistics.completed}
                    </p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-gray-600">Tổng giờ</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {report.statistics.total_volunteer_hours}h
                    </p>
                  </div>
                </div>

                {/* Completion Rate */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-700">
                      Tỉ lệ hoàn thành
                    </p>
                    <p className="font-bold text-gray-800">
                      {report.statistics.approved > 0
                        ? (
                            (report.statistics.completed /
                              report.statistics.approved) *
                            100
                          ).toFixed(1)
                        : 0}
                      %
                    </p>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-4 rounded-full"
                      style={{
                        width: `${
                          report.statistics.approved > 0
                            ? (report.statistics.completed /
                                report.statistics.approved) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Volunteers List */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-3">
                    Danh sách tình nguyện viên
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                            Tên
                          </th>
                          <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">
                            Email
                          </th>
                          <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                            Trạng thái
                          </th>
                          <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                            Hoàn thành
                          </th>
                          <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">
                            Giờ
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {report.volunteers.map((v) => (
                          <tr key={v.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-800">
                              {v.username}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {v.email}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  v.status === "approved"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {v.status === "approved"
                                  ? "Đã duyệt"
                                  : "Chờ duyệt"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  v.completion_status === "completed"
                                    ? "bg-purple-100 text-purple-700"
                                    : v.completion_status === "failed"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-700"
                                }`}
                              >
                                {v.completion_status === "completed"
                                  ? "Hoàn thành"
                                  : v.completion_status === "failed"
                                  ? "Không đạt"
                                  : "Chưa đánh giá"}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center text-sm font-semibold text-gray-800">
                              {v.hours}h
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {selectedVolunteer && (
        <CompletionModal
          volunteer={{
            user_id: selectedVolunteer.user_id,
            username: selectedVolunteer.user.username,
            email: selectedVolunteer.user.email,
            image: selectedVolunteer.user.image,
          }}
          eventId={parseInt(id)}
          onClose={() => setSelectedVolunteer(null)}
          onSuccess={() => {
            fetchParticipants();
            if (activeTab === "report") fetchEventReport();
          }}
        />
      )}
    </div>
  );
}

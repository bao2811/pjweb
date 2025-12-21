"use client";
import { use, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaClock,
  FaHeart,
  FaRegHeart,
  FaShare,
  FaPhone,
  FaEnvelope,
  FaComments,
  FaUserFriends,
  FaLeaf,
  FaTrophy,
  FaHandsHelping,
  FaCheckCircle,
  FaExclamationCircle,
  FaTimes,
} from "react-icons/fa";
import { authFetch } from "@/utils/auth";
import { useAuth } from "@/hooks/useAuth";

interface EventDetail {
  id: number;
  title: string;
  description: string;
  content?: string;
  image: string;
  start_time: string;
  end_time: string;
  address: string;
  location?: string;
  max_participants: number;
  points?: number;
  category: string;
  status: string;
  creator_id?: number;
  author_id?: number;
  current_participants?: number;
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

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user, token } = useAuth();
  const { id } = use(params);
  const router = useRouter();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [registrationStatus, setRegistrationStatus] = useState<
    "none" | "pending" | "approved" | "rejected"
  >("none");
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    fetchEventDetail();
    fetchRegistrationStatus();
  }, [id]);

  const fetchEventDetail = async () => {
    try {
      setIsLoading(true);
      const response = await authFetch(`/api/events/getEventDetails/${id}`);
      const data = await response.json();
      if (data && data.event) {
        // Tính toán status dựa trên thời gian nếu backend chưa cập nhật
        const eventData = data.event;
        const now = new Date();
        const startTime = new Date(eventData.start_time);
        const endTime = new Date(eventData.end_time);

        // Override status nếu cần dựa trên thời gian thực tế
        let calculatedStatus = eventData.status;
        if (eventData.status !== "cancelled") {
          if (now < startTime) {
            calculatedStatus = "upcoming";
          } else if (now >= startTime && now <= endTime) {
            calculatedStatus = "ongoing";
          } else if (now > endTime) {
            calculatedStatus = "completed";
          }
        }
        eventData.status = calculatedStatus;

        setEvent(eventData);
        setIsLiked(
          (data.event && (data.event.is_liked ?? data.is_liked)) || false
        );
        // likes count may be returned as likes_count or likes inside event
        setLikes(
          (data.event &&
            (data.event.likes_count ??
              data.event.likes ??
              data.likes_count ??
              data.likes)) ||
            0
        );
      }
    } catch (error) {
      console.error("Error fetching event details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRegistrationStatus = async () => {
    try {
      const response = await authFetch("/user/my-registrations");
      const data = await response.json();
      // Fix: Đọc đúng format {success: true, registrations: [...]}
      if (data && data.success && Array.isArray(data.registrations)) {
        const registration = data.registrations.find(
          (reg: any) => reg.event_id === parseInt(id)
        );
        if (registration) {
          setRegistrationStatus(registration.status);
        }
      }
    } catch (error) {
      console.error("Error fetching registration status:", error);
    }
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(isLiked ? likes - 1 : likes + 1);
    if (!isLiked) {
      authFetch(`/api/likes/event/like/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } else {
      authFetch(`/api/likes/event/unlike/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    }
  };

  const handleJoinChat = () => {
    router.push(`/events/${id}/channel`);
  };

  const handleRegister = async () => {
    try {
      setIsRegistering(true);
      const response = await authFetch(`/user/joinEvent/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data && (data.registration || data.success)) {
        setRegistrationStatus("pending");
        toast.success(
          "✅ Đã gửi yêu cầu tham gia sự kiện thành công! Vui lòng chờ manager duyệt.",
          {
            duration: 4000,
            position: "top-center",
            style: {
              background: "#10b981",
              color: "#fff",
              fontWeight: "600",
            },
          }
        );
        // Reload event details
        fetchEventDetail();
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error(
        "❌ " + (error.message || "Đăng ký thất bại. Vui lòng thử lại!"),
        {
          duration: 4000,
          position: "top-center",
        }
      );
    } finally {
      setIsRegistering(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!confirm("Bạn có chắc muốn hủy yêu cầu tham gia sự kiện này?")) {
      return;
    }

    try {
      setIsRegistering(true);
      const response = await authFetch(`/user/leaveEvent/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data) {
        setRegistrationStatus("none");
        toast.success("✅ Đã hủy yêu cầu tham gia sự kiện thành công!", {
          duration: 3000,
          position: "top-center",
        });
        // Reload event details
        fetchEventDetail();
      }
    } catch (error: any) {
      console.error("Cancel error:", error);
      toast.error(
        "❌ " + (error.message || "Hủy yêu cầu thất bại. Vui lòng thử lại!"),
        {
          duration: 4000,
          position: "top-center",
        }
      );
    } finally {
      setIsRegistering(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-green-600"></div>
          <p className="mt-4 text-gray-600 text-lg">
            Đang tải thông tin sự kiện...
          </p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <FaLeaf className="mx-auto text-6xl text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            Không tìm thấy sự kiện
          </h2>
          <button
            onClick={() => router.push("/user/events")}
            className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
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
          ((event.current_participants || 0) / event.max_participants) * 100,
          100
        )
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <Toaster />
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
              <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-semibold flex items-center">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <FaLeaf className="text-green-600 mr-3" />
                Giới thiệu sự kiện
              </h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {event.content || event.description}
              </p>
            </div>

            {/* Benefits Card */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl shadow-lg p-8 border border-green-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FaTrophy className="text-yellow-500 mr-3" />
                Lợi ích khi tham gia
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3 bg-white p-4 rounded-xl">
                  <FaHandsHelping className="text-green-600 text-2xl mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Đóng góp cộng đồng
                    </h3>
                    <p className="text-sm text-gray-600">
                      Tạo giá trị tích cực cho xã hội
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 bg-white p-4 rounded-xl">
                  <FaTrophy className="text-yellow-500 text-2xl mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800">Tích điểm</h3>
                    <p className="text-sm text-gray-600">
                      Nhận {event.points || 10} điểm tình nguyện
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 bg-white p-4 rounded-xl">
                  <FaUserFriends className="text-blue-600 text-2xl mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Kết nối bạn bè
                    </h3>
                    <p className="text-sm text-gray-600">
                      Gặp gỡ những người cùng chí hướng
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 bg-white p-4 rounded-xl">
                  <FaLeaf className="text-green-600 text-2xl mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Trải nghiệm ý nghĩa
                    </h3>
                    <p className="text-sm text-gray-600">
                      Kỷ niệm đáng nhớ và bổ ích
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Requirements Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <FaUsers className="text-blue-600 mr-3" />
                Yêu cầu tham gia
              </h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Đăng ký tài khoản và xác thực thông tin</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Có tinh thần trách nhiệm và nhiệt huyết</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Tham gia đầy đủ thời gian của sự kiện</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">✓</span>
                  <span>Tuân thủ các quy định của ban tổ chức</span>
                </li>
                {event.requirements && (
                  <li className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span>{event.requirements}</span>
                  </li>
                )}
              </ul>
            </div>

            {/* Manager Info Card */}
            {event.manager && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-8 border border-purple-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                  <FaUserFriends className="text-purple-600 mr-3" />
                  Quản lý sự kiện
                </h2>
                <div className="flex items-center space-x-4">
                  {event.manager.avatar ? (
                    <Image
                      src={event.manager.avatar}
                      alt={event.manager.name}
                      width={80}
                      height={80}
                      className="rounded-full border-4 border-white shadow-lg"
                      unoptimized
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {event.manager.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">
                      {event.manager.name}
                    </h3>
                    <div className="space-y-1 mt-2">
                      <a
                        href={`mailto:${event.manager.email}`}
                        className="flex items-center text-sm text-gray-600 hover:text-purple-600 transition"
                      >
                        <FaEnvelope className="mr-2" />
                        {event.manager.email}
                      </a>
                      {event.manager.phone && (
                        <a
                          href={`tel:${event.manager.phone}`}
                          className="flex items-center text-sm text-gray-600 hover:text-purple-600 transition"
                        >
                          <FaPhone className="mr-2" />
                          {event.manager.phone}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Event Timeline */}
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-green-100">
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
                      {new Date(event.start_time).toLocaleString("vi-VN", {
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
                      {new Date(event.end_time).toLocaleString("vi-VN", {
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
                {event.created_at && (
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      Sự kiện được tạo vào{" "}
                      {new Date(event.created_at).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Action Cards */}
          <div className="space-y-6">
            {/* Registration Card - Featured */}
            {/* CASE: Sự kiện đã kết thúc hoặc bị hủy */}
            {(event.status === "completed" || event.status === "cancelled") &&
            registrationStatus === "none" ? (
              <div className="bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl shadow-xl p-8 text-white">
                <div className="text-center">
                  <FaCheckCircle className="text-6xl mx-auto mb-4 opacity-90" />
                  <h3 className="text-2xl font-bold mb-2">
                    {event.status === "completed"
                      ? "Sự kiện đã kết thúc"
                      : "Sự kiện đã bị hủy"}
                  </h3>
                  <p className="text-gray-200 mb-4">
                    {event.status === "completed"
                      ? "Sự kiện này đã hoàn thành. Cảm ơn bạn đã quan tâm!"
                      : "Sự kiện này đã bị hủy bởi ban tổ chức."}
                  </p>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                    <p className="text-sm">Hãy khám phá các sự kiện khác!</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl shadow-xl p-8 text-white">
                <div className="text-center mb-6">
                  <FaHandsHelping className="text-6xl mx-auto mb-4 opacity-90" />
                  <h3 className="text-2xl font-bold mb-2">
                    {registrationStatus === "approved"
                      ? "Đã được duyệt"
                      : registrationStatus === "pending"
                      ? "Chờ duyệt"
                      : registrationStatus === "rejected"
                      ? "Bị từ chối"
                      : "Tham gia ngay"}
                  </h3>
                  <p className="text-green-100">
                    {registrationStatus === "approved"
                      ? "Bạn đã được chấp nhận tham gia sự kiện này"
                      : registrationStatus === "pending"
                      ? "Yêu cầu của bạn đang chờ manager duyệt"
                      : registrationStatus === "rejected"
                      ? "Yêu cầu của bạn đã bị từ chối"
                      : "Đăng ký để trở thành tình nguyện viên"}
                  </p>
                </div>

                {registrationStatus === "none" ? (
                  <button
                    onClick={handleRegister}
                    disabled={isRegistering}
                    className="w-full bg-white text-green-700 font-bold py-4 px-6 rounded-xl hover:bg-green-50 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isRegistering ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-700"></div>
                        <span>Đang xử lý...</span>
                      </>
                    ) : (
                      <>
                        <FaHandsHelping className="text-xl" />
                        <span>Đăng ký tham gia</span>
                      </>
                    )}
                  </button>
                ) : registrationStatus === "pending" ? (
                  <div className="space-y-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                      <FaClock className="text-3xl mx-auto mb-2" />
                      <p className="font-semibold">Đang chờ duyệt</p>
                    </div>
                    <button
                      onClick={handleCancelRequest}
                      disabled={isRegistering}
                      className="w-full bg-red-500/90 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                    >
                      {isRegistering ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Đang xử lý...</span>
                        </>
                      ) : (
                        <>
                          <FaTimes className="text-xl" />
                          <span>Hủy yêu cầu tham gia</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : registrationStatus === "approved" ? (
                  <div className="space-y-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                      <FaCheckCircle className="text-3xl mx-auto mb-2" />
                      <p className="font-semibold">Đã được chấp nhận!</p>
                    </div>
                    <button
                      onClick={handleJoinChat}
                      className="w-full bg-white text-blue-700 font-bold py-3 px-6 rounded-xl hover:bg-blue-50 transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                    >
                      <FaComments className="text-xl" />
                      <span>Vào kênh chat</span>
                    </button>
                    {/* Chỉ cho phép hủy khi event chưa diễn ra (upcoming) */}
                    {event.status === "upcoming" && (
                      <button
                        onClick={handleCancelRequest}
                        disabled={isRegistering}
                        className="w-full bg-red-500/90 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-xl transition-all flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
                      >
                        {isRegistering ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Đang xử lý...</span>
                          </>
                        ) : (
                          <>
                            <FaTimes />
                            <span>Rời khỏi sự kiện</span>
                          </>
                        )}
                      </button>
                    )}
                    {/* Hiển thị trạng thái khi event đang diễn ra hoặc đã kết thúc */}
                    {(event.status === "ongoing" ||
                      event.status === "completed") && (
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center text-sm">
                        <p>
                          {event.status === "ongoing"
                            ? "🟢 Sự kiện đang diễn ra"
                            : "✅ Sự kiện đã kết thúc"}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                    <FaExclamationCircle className="text-3xl mx-auto mb-2" />
                    <p className="font-semibold">Yêu cầu bị từ chối</p>
                    <p className="text-sm text-green-100 mt-2">
                      Vui lòng liên hệ manager để biết thêm chi tiết
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Event Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Thông tin sự kiện
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <FaCalendarAlt className="text-green-600 mt-1 text-lg" />
                  <div>
                    <p className="text-sm text-gray-500">Thời gian</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(event.start_time).toLocaleDateString("vi-VN")}
                    </p>
                    <p className="text-sm text-gray-600">
                      đến {new Date(event.end_time).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FaMapMarkerAlt className="text-red-600 mt-1 text-lg" />
                  <div>
                    <p className="text-sm text-gray-500">Địa điểm</p>
                    <p className="font-semibold text-gray-800">
                      {event.address || event.location || "Chưa cập nhật"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <FaUsers className="text-blue-600 mt-1 text-lg" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 mb-2">
                      Số lượng tham gia
                    </p>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-800">
                        {event.current_participants || 0}/
                        {event.max_participants}
                      </span>
                      <span className="text-sm text-gray-600">
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
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

            {/* Action Buttons */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-green-100 space-y-3">
              <button
                onClick={handleLike}
                className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
                  isLiked
                    ? "bg-red-50 text-red-600 border-2 border-red-200"
                    : "bg-gray-50 text-gray-700 border-2 border-gray-200 hover:bg-gray-100"
                }`}
              >
                {isLiked ? (
                  <FaHeart className="text-xl" />
                ) : (
                  <FaRegHeart className="text-xl" />
                )}
                <span>{isLiked ? "Đã yêu thích" : "Yêu thích"}</span>
              </button>

              <button className="w-full bg-blue-50 text-blue-600 py-3 px-4 rounded-xl font-semibold hover:bg-blue-100 transition-all duration-200 flex items-center justify-center space-x-2 border-2 border-blue-200">
                <FaShare className="text-lg" />
                <span>Chia sẻ</span>
              </button>
            </div>

            {/* Contact Card */}
            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl shadow-lg p-6 border border-blue-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Liên hệ ban tổ chức
              </h3>
              <div className="space-y-3">
                <a
                  href="tel:0123456789"
                  className="flex items-center space-x-3 text-gray-700 hover:text-green-600 transition"
                >
                  <FaPhone className="text-green-600" />
                  <span>0123 456 789</span>
                </a>
                <a
                  href="mailto:contact@volunteer.com"
                  className="flex items-center space-x-3 text-gray-700 hover:text-green-600 transition"
                >
                  <FaEnvelope className="text-green-600" />
                  <span>contact@volunteer.com</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

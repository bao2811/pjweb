"use client";
import { authFetch } from "@/utils/auth";
import { useState, useEffect, useRef } from "react";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCamera,
  FaSave,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaUsers,
  FaEdit,
  FaChartLine,
  FaStar,
  FaClipboardList,
  FaUserShield,
  FaPlus,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import CreateEventModal from "@/components/CreateEventModal";

interface ManagerProfile {
  id: number | null;
  name: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  image: string | null;
  joinedDate: string | null;
  role: string;
  eventsCreated: number;
  totalParticipants: number;
  pendingApprovals: number;
  approvedEvents: number;
  averageRating: number;
  bio?: string | null;
}

interface EventStat {
  id: number;
  name: string;
  date: string;
  participants: number;
  status: "pending" | "approved" | "rejected" | "completed" | "upcoming" | "ongoing";
}

export default function ManagerProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<ManagerProfile>({
    id: null,
    name: null,
    username: null,
    email: null,
    phone: null,
    address: null,
    image: null,
    joinedDate: null,
    role: "manager",
    eventsCreated: 0,
    totalParticipants: 0,
    pendingApprovals: 0,
    approvedEvents: 0,
    averageRating: 0,
    bio: null,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ManagerProfile>(profile);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [recentEvents, setRecentEvents] = useState<EventStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch manager profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await authFetch("/api/me");
        if (response.ok) {
          const data = await response.json();
          const managerData = data.user || data;
          
          setProfile({
            id: managerData.id,
            name: managerData.username,
            username: managerData.username,
            email: managerData.email,
            phone: managerData.phone || "",
            address: managerData.address || "",
            image: managerData.image,
            joinedDate: managerData.created_at,
            role: managerData.role,
            eventsCreated: 0,
            totalParticipants: 0,
            pendingApprovals: 0,
            approvedEvents: 0,
            averageRating: 4.5,
            bio: managerData.bio || "",
          });
          
          setFormData({
            id: managerData.id,
            name: managerData.username,
            username: managerData.username,
            email: managerData.email,
            phone: managerData.phone || "",
            address: managerData.address || "",
            image: managerData.image || "https://i.pravatar.cc/150?img=12",
            joinedDate: managerData.created_at,
            role: managerData.role,
            eventsCreated: 0,
            totalParticipants: 0,
            pendingApprovals: 0,
            approvedEvents: 0,
            averageRating: 4.5,
            bio: managerData.bio || "",
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Fetch manager's stats from reports endpoint
  useEffect(() => {
    const fetchManagerStats = async () => {
      try {
        const response = await authFetch("/manager/reports");
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.report) {
            // Backend trả về {overview, events} không phải {overallStats, reports}
            const overview = data.report.overview || data.report.overallStats || {};
            const events = data.report.events || data.report.reports || [];
            
            // Update profile with real stats
            setProfile((prev) => ({
              ...prev,
              eventsCreated: overview.total_events || 0,
              totalParticipants: overview.total_volunteers || 0,
              approvedEvents: overview.total_events || 0,
              pendingApprovals: 0,
            }));

            // Set recent events - check if events is array
            if (Array.isArray(events) && events.length > 0) {
              const recent = events.slice(0, 5).map((event: any) => ({
                id: event.id,
                name: event.title,
                date: event.start_time,
                participants: event.approved || 0,
                status: event.status,
              }));
              setRecentEvents(recent);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching manager stats:", error);
      }
    };

    if (profile.id) {
      fetchManagerStats();
    }
  }, [profile.id]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result as string);
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const response = await authFetch(`/user/updateUserProfile/${formData.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          image: formData.image,

        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile({ ...profile, ...formData });
        setIsEditing(false);
        alert("Cập nhật thông tin thành công!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Có lỗi xảy ra khi cập nhật thông tin!");
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: "bg-yellow-100 text-yellow-800",
      upcoming: "bg-green-100 text-green-800",
      ongoing: "bg-blue-100 text-blue-800",
      rejected: "bg-red-100 text-red-800",
      completed: "bg-purple-100 text-purple-800",
    };
    return badges[status as keyof typeof badges] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden mb-8">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-purple-500 via-blue-500 to-green-500"></div>

          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row items-center md:items-end -mt-20 mb-6">
              {/* Avatar */}
              <div className="relative group mb-4 md:mb-0">
                <div className="w-40 h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                  {/* <Image
                    src={previewAvatar || profile.image || "https://i.pravatar.cc/150?img=12"}
                    alt="Manager Avatar"
                    width={160}
                    height={160}
                    className="w-full h-full object-cover"
                    unoptimized
                  /> */}
                </div>
                {isEditing && (
                  <button
                    onClick={handleAvatarClick}
                    className="absolute bottom-2 right-2 bg-purple-600 text-white p-3 rounded-full shadow-lg hover:bg-purple-700 transition"
                  >
                    <FaCamera />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              {/* Profile Info */}
              <div className="md:ml-8 text-center md:text-left flex-1">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                  {profile.name || "Manager"}
                </h1>
                <p className="text-gray-600 flex items-center justify-center md:justify-start gap-2 mb-2">
                  <FaEnvelope className="text-purple-500" />
                  {profile.email}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <FaCalendarAlt className="text-green-500" />
                    Tham gia: {profile.joinedDate ? new Date(profile.joinedDate).toLocaleDateString("vi-VN") : "N/A"}
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                    Quản lý
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 md:mt-0 flex gap-3">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition font-medium shadow-lg"
                    >
                      <FaEdit />
                      Chỉnh sửa
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition font-medium shadow-lg"
                    >
                      <FaSave />
                      Lưu
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setFormData(profile);
                        setPreviewAvatar(null);
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium"
                    >
                      
                      Hủy
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats */}
          <div className="space-y-6">
            {/* Manager Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FaChartLine className="text-purple-500" />
                Thống kê quản lý
              </h2>
              
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl text-center">
                  <FaClipboardList className="text-3xl text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-700">
                    {profile.eventsCreated}
                  </p>
                  <p className="text-sm text-gray-600">Sự kiện đã tạo</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center">
                  <FaUsers className="text-3xl text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-700">
                    {profile.totalParticipants}
                  </p>
                  <p className="text-sm text-gray-600">Tổng người tham gia</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center">
                  <FaCheckCircle className="text-3xl text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-700">
                    {profile.approvedEvents}
                  </p>
                  <p className="text-sm text-gray-600">Sự kiện được duyệt</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl text-center">
                  <FaClock className="text-3xl text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-700">
                    {profile.pendingApprovals}
                  </p>
                  <p className="text-sm text-gray-600">Chờ phê duyệt</p>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-xl text-center">
                  <FaStar className="text-3xl text-pink-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-pink-700">
                    {profile.averageRating.toFixed(1)}⭐
                  </p>
                  <p className="text-sm text-gray-600">Đánh giá trung bình</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Thao tác nhanh
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition font-medium shadow-md"
                >
                  <FaPlus />
                  Tạo sự kiện mới
                </button>
                <button
                  onClick={() => router.push("/manager/events")}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl transition font-medium"
                >
                  <FaClipboardList />
                  Quản lý sự kiện
                </button>
                <button
                  onClick={() => router.push("/manager/members")}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl transition font-medium"
                >
                  <FaUsers />
                  Quản lý thành viên
                </button>
                <button
                  onClick={() => router.push("/manager/dashboard")}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition font-medium"
                >
                  <FaChartLine />
                  Xem Dashboard
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Details & Recent Events */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Details */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Thông tin cá nhân
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Tên hiển thị
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.username || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-gray-800">
                      <FaUser className="text-gray-400" />
                      {profile.username || "Chưa cập nhật"}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Số điện thoại
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-gray-800">
                      <FaPhone className="text-gray-400" />
                      {profile.phone || "Chưa cập nhật"}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Địa chỉ
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.address || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-gray-800">
                      <FaMapMarkerAlt className="text-gray-400" />
                      {profile.address || "Chưa cập nhật"}
                    </div>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Giới thiệu
                  </label>
                  {isEditing ? (
                    <textarea
                      value={formData.bio || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Viết vài dòng về bản thân..."
                    />
                  ) : (
                    <p className="text-gray-800">
                      {profile.bio || "Chưa có thông tin giới thiệu"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Events */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Sự kiện gần đây
              </h2>

              {recentEvents.length > 0 ? (
                <div className="space-y-4">
                  {recentEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition cursor-pointer"
                      onClick={() => router.push(`/manager/events/${event.id}`)}
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 mb-1">
                          {event.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <FaCalendarAlt />
                            {new Date(event.date).toLocaleDateString("vi-VN")}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaUsers />
                            {event.participants} người
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(
                          event.status
                        )}`}
                      >
                        {event.status === "pending" && "Chờ duyệt"}
                        {event.status === "upcoming" && "Sắp diễn ra"}
                        {event.status === "ongoing" && "Đang diễn ra"}
                        {event.status === "rejected" && "Bị từ chối"}
                        {event.status === "completed" && "Hoàn thành"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FaClipboardList className="text-6xl mx-auto mb-4 text-gray-300" />
                  <p>Chưa có sự kiện nào</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          // Refresh stats after creating
          if (profile.id) {
            const fetchStats = async () => {
              try {
                const response = await authFetch("/manager/reports");
                if (response.ok) {
                  const data = await response.json();
                  if (data.success && data.report) {
                    const { overallStats, reports } = data.report;
                    
                    setProfile((prev) => ({
                      ...prev,
                      eventsCreated: overallStats.total_events,
                      totalParticipants: overallStats.total_volunteers,
                      approvedEvents: overallStats.total_events,
                      pendingApprovals: 0,
                    }));

                    const recent = reports.slice(0, 5).map((event: any) => ({
                      id: event.id,
                      name: event.title,
                      date: event.start_time,
                      participants: event.approved,
                      status: event.status,
                    }));
                    setRecentEvents(recent);
                  }
                }
              } catch (error) {
                console.error("Error fetching stats:", error);
              }
            };
            fetchStats();
          }
        }}
      />
    </div>
  );
}

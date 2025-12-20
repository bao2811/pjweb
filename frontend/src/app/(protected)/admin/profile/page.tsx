"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { authFetch } from "@/utils/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaShieldAlt,
  FaEdit,
  FaSave,
  FaTimes,
  FaUsers,
  FaCalendarCheck,
  FaUserShield,
  FaCheckCircle,
  FaClock,
  FaBan,
  FaChartLine,
  FaHistory,
  FaExclamationTriangle,
  FaCamera,
} from "react-icons/fa";

interface AdminStats {
  totalUsers: number;
  totalManagers: number;
  totalEvents: number;
  pendingEvents: number;
  approvedEvents: number;
  rejectedEvents: number;
  activeUsers: number;
  lockedUsers: number;
  pendingUsers: number;
  recentActivities: Activity[];
}

interface Activity {
  id: number;
  type: string;
  description: string;
  timestamp: string;
  icon: string;
}

interface Toast {
  id: number;
  type: "success" | "error" | "info";
  message: string;
}

export default function AdminProfilePage() {
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalManagers: 0,
    totalEvents: 0,
    pendingEvents: 0,
    approvedEvents: 0,
    rejectedEvents: 0,
    activeUsers: 0,
    lockedUsers: 0,
    pendingUsers: 0,
    recentActivities: [],
  });
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
    image: "",
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    if (!authLoading && currentUser) {
      if (currentUser.role !== "admin") {
        router.push("/unauthorized");
        return;
      }
      fetchAdminStats();
      setEditForm({
        username: currentUser.username || "",
        email: currentUser.email || "",
        phone: currentUser.phone || "",
        address: currentUser.address || "",
        image: currentUser.image || "",
      });
      setImagePreview(currentUser.image || "");
    }
  }, [authLoading, currentUser, router]);

  const fetchAdminStats = async () => {
    try {
      const [usersRes, managersRes, eventsRes] = await Promise.all([
        authFetch("/admin/getAllUsers"),
        authFetch("/admin/getAllManagers"),
        authFetch("/admin/getAllEvents"),
      ]);

      if (usersRes.ok && managersRes.ok && eventsRes.ok) {
        const users = await usersRes.json();
        const managers = await managersRes.json();
        const events = await eventsRes.json();

        const userList = Array.isArray(users) ? users : users.users || [];
        const managerList = Array.isArray(managers)
          ? managers
          : managers.managers || [];
        const eventList = Array.isArray(events) ? events : events.events || [];

        setStats({
          totalUsers: userList.length,
          totalManagers: managerList.length,
          totalEvents: eventList.length,
          pendingEvents: eventList.filter((e: any) => e.status === "pending")
            .length,
          approvedEvents: eventList.filter(
            (e: any) =>
              e.status === "approved" ||
              e.status === "ongoing" ||
              e.status === "upcoming"
          ).length,
          rejectedEvents: eventList.filter((e: any) => e.status === "rejected")
            .length,
          activeUsers: userList.filter((u: any) => u.status === "active")
            .length,
          lockedUsers: userList.filter((u: any) => u.status === "locked")
            .length,
          pendingUsers: userList.filter((u: any) => u.status === "pending")
            .length,
          recentActivities: generateRecentActivities(eventList),
        });
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    }
  };

  const generateRecentActivities = (events: any[]): Activity[] => {
    const activities: Activity[] = [];
    const recentEvents = events
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      .slice(0, 10);

    recentEvents.forEach((event, index) => {
      if (event.status === "pending") {
        activities.push({
          id: index,
          type: "pending",
          description: `Sự kiện "${event.title}" đang chờ phê duyệt`,
          timestamp: event.created_at,
          icon: "⏳",
        });
      } else if (event.status === "approved") {
        activities.push({
          id: index,
          type: "approved",
          description: `Đã phê duyệt sự kiện "${event.title}"`,
          timestamp: event.updated_at || event.created_at,
          icon: "✅",
        });
      }
    });

    return activities.slice(0, 8);
  };

  const showToast = (type: "success" | "error" | "info", message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast("error", "Kích thước ảnh không được vượt quá 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        setEditForm((prev) => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const response = await authFetch(`/user/updateUser`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: editForm.username,
          phone: editForm.phone,
          address: editForm.address,
          image: editForm.image,
        }),
      });

      if (response.ok) {
        showToast("success", "Cập nhật thông tin thành công!");
        setIsEditing(false);
        window.location.reload();
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showToast("error", "Không thể cập nhật thông tin");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-6 py-3 rounded-lg shadow-lg text-white font-medium animate-slide-in ${
              toast.type === "success"
                ? "bg-green-500"
                : toast.type === "error"
                ? "bg-red-500"
                : "bg-blue-500"
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <FaShieldAlt className="text-5xl text-white" />
              <div>
                <h1 className="text-3xl font-bold text-white">Hồ Sơ Admin</h1>
                <p className="text-blue-100 mt-1">
                  Quản lý thông tin cá nhân và theo dõi hoạt động hệ thống
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="text-center">
                {/* Avatar with Upload */}
                <div className="relative inline-block mb-4">
                  <Image
                    src={
                      imagePreview ||
                      currentUser.image ||
                      "https://i.pravatar.cc/150?img=1"
                    }
                    alt={currentUser.username}
                    width={150}
                    height={150}
                    className="rounded-full ring-4 ring-blue-200 shadow-lg mx-auto"
                    unoptimized
                  />
                  {isEditing && (
                    <label
                      htmlFor="avatar-upload"
                      className="absolute bottom-2 right-2 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full cursor-pointer shadow-lg transition duration-200"
                    >
                      <FaCamera />
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-1">
                  {currentUser.username}
                </h2>
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full text-sm font-semibold shadow-md mb-4">
                  <FaShieldAlt className="mr-2" />
                  Administrator
                </div>

                {/* Edit/Save Buttons */}
                <div className="space-y-2 mt-4">
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white rounded-xl transition duration-200 shadow-md font-medium"
                    >
                      <FaEdit />
                      <span>Chỉnh sửa thông tin</span>
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-xl transition duration-200 shadow-md font-medium disabled:opacity-50"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Đang lưu...</span>
                          </>
                        ) : (
                          <>
                            <FaSave />
                            <span>Lưu thay đổi</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setEditForm({
                            username: currentUser.username || "",
                            email: currentUser.email || "",
                            phone: currentUser.phone || "",
                            address: currentUser.address || "",
                            image: currentUser.image || "",
                          });
                          setImagePreview(currentUser.image || "");
                        }}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition duration-200 font-medium"
                      >
                        <FaTimes />
                        <span>Hủy</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="mt-6 space-y-4 border-t pt-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Tên người dùng
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.username}
                      onChange={(e) =>
                        setEditForm({ ...editForm, username: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 text-gray-800">
                      <FaUser className="text-blue-500" />
                      <span>{currentUser.username}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Email
                  </label>
                  <div className="flex items-center space-x-3 text-gray-800">
                    <FaEnvelope className="text-green-500" />
                    <span>{currentUser.email}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Số điện thoại
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-center space-x-3 text-gray-800">
                      <FaPhone className="text-purple-500" />
                      <span>{currentUser.phone || "Chưa cập nhật"}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Địa chỉ
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editForm.address}
                      onChange={(e) =>
                        setEditForm({ ...editForm, address: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <div className="flex items-start space-x-3 text-gray-800">
                      <FaMapMarkerAlt className="text-red-500 mt-1" />
                      <span>{currentUser.address || "Chưa cập nhật"}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-600 mb-2">
                    Vai trò
                  </label>
                  <div className="flex items-center space-x-3 text-gray-800">
                    <FaShieldAlt className="text-orange-500" />
                    <span className="font-semibold">
                      {currentUser.role === "admin"
                        ? "Quản trị viên"
                        : currentUser.role}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats and Activities */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <FaChartLine className="mr-3 text-blue-600" />
                Tổng quan hệ thống
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between mb-2">
                    <FaUsers className="text-2xl text-blue-600" />
                    <span className="text-xs text-gray-600">Users</span>
                  </div>
                  <p className="text-3xl font-bold text-blue-700">
                    {stats.totalUsers}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Người dùng</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-l-4 border-green-500">
                  <div className="flex items-center justify-between mb-2">
                    <FaUserShield className="text-2xl text-green-600" />
                    <span className="text-xs text-gray-600">Managers</span>
                  </div>
                  <p className="text-3xl font-bold text-green-700">
                    {stats.totalManagers}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Quản lý</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-l-4 border-purple-500">
                  <div className="flex items-center justify-between mb-2">
                    <FaCalendarCheck className="text-2xl text-purple-600" />
                    <span className="text-xs text-gray-600">Events</span>
                  </div>
                  <p className="text-3xl font-bold text-purple-700">
                    {stats.totalEvents}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Sự kiện</p>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border-l-4 border-yellow-500">
                  <div className="flex items-center justify-between mb-2">
                    <FaClock className="text-2xl text-yellow-600" />
                    <span className="text-xs text-gray-600">Pending</span>
                  </div>
                  <p className="text-3xl font-bold text-yellow-700">
                    {stats.pendingEvents}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Chờ duyệt</p>
                </div>
              </div>
            </div>

            {/* Event Status */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <FaCalendarCheck className="mr-3 text-purple-600" />
                Trạng thái sự kiện
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <FaCheckCircle className="text-3xl text-green-600" />
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-700">
                        {stats.approvedEvents}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Đã duyệt</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-5 border-l-4 border-yellow-500">
                  <div className="flex items-center justify-between">
                    <FaClock className="text-3xl text-yellow-600" />
                    <div className="text-right">
                      <p className="text-3xl font-bold text-yellow-700">
                        {stats.pendingEvents}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Chờ duyệt</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-5 border-l-4 border-red-500">
                  <div className="flex items-center justify-between">
                    <FaBan className="text-3xl text-red-600" />
                    <div className="text-right">
                      <p className="text-3xl font-bold text-red-700">
                        {stats.rejectedEvents}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Từ chối</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* User Status */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <FaUsers className="mr-3 text-blue-600" />
                Trạng thái người dùng
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <FaCheckCircle className="text-3xl text-green-600" />
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-700">
                        {stats.activeUsers}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Hoạt động</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-5 border-l-4 border-red-500">
                  <div className="flex items-center justify-between">
                    <FaBan className="text-3xl text-red-600" />
                    <div className="text-right">
                      <p className="text-3xl font-bold text-red-700">
                        {stats.lockedUsers}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Bị khóa</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-5 border-l-4 border-yellow-500">
                  <div className="flex items-center justify-between">
                    <FaClock className="text-3xl text-yellow-600" />
                    <div className="text-right">
                      <p className="text-3xl font-bold text-yellow-700">
                        {stats.pendingUsers}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">Chờ duyệt</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <FaHistory className="mr-3 text-orange-600" />
                Hoạt động gần đây
              </h3>
              {stats.recentActivities.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {stats.recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg border border-gray-200 hover:shadow-md transition duration-200"
                    >
                      <div className="text-2xl">{activity.icon}</div>
                      <div className="flex-1">
                        <p className="text-gray-800 font-medium">
                          {activity.description}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(activity.timestamp).toLocaleString("vi-VN")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaExclamationTriangle className="mx-auto text-4xl mb-3 text-gray-400" />
                  <p>Chưa có hoạt động nào</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

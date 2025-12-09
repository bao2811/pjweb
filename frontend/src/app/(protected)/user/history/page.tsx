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
  FaTrophy,
  FaCheckCircle,
  FaClock,
  FaHeart,
  FaLock,
  FaEdit,
  FaBirthdayCake,
  FaVenusMars,
  FaIdCard,
  FaTimes,
} from "react-icons/fa";
import Image from "next/image";
import { useParams } from "next/navigation";

interface User {
  id?: number | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  avatar: string | null;
  joinedDate: string | null;
  points: number | null;
  eventsCompleted: number | null;
  totalHours: number | null;
  eventsJoined: number | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  studentId?: string | null;
  bio?: string | null;
}

interface Activity {
  id: number;
  event: string;
  date: string;
  hours: string;
}

export default function ProfilePage() {
  const params = useParams();
  const userId = params.id as string;
  const [user, setUser] = useState<User>({
    id: null,
    name: null,
    email: null,
    phone: null,
    address: null,
    avatar: null,
    joinedDate: null,
    points: null,
    eventsCompleted: null,
    totalHours: null,
    eventsJoined: null,
    dateOfBirth: null,
    gender: null,
    studentId: null,
    bio: null,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<User>({
    id: null,
    name: null,
    email: null,
    phone: null,
    address: null,
    avatar: null,
    joinedDate: null,
    points: null,
    eventsCompleted: null,
    totalHours: null,
    eventsJoined: null,
    dateOfBirth: null,
    gender: null,
    studentId: null,
    bio: null,
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // Fetch current user để check xem có phải profile của mình không
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await authFetch("/user/me");
        if (response.ok) {
          const data = await response.json();
          const currentUser = data.user || data;
          setCurrentUserId(currentUser.id);
          setIsOwnProfile(currentUser.id.toString() === userId);
        }
      } catch (error) {
        console.error("Fetch current user error:", error);
      }
    };

    fetchCurrentUser();
  }, [userId]);

  // Fetch user data theo userId từ params
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Nếu là profile của mình thì lấy từ localStorage
        if (isOwnProfile) {
          const UserData = localStorage.getItem("user");
          if (UserData) {
            const parsedUser = JSON.parse(UserData);
            setUser(parsedUser);
            setFormData(parsedUser);
          }
        } else {
          // Nếu xem profile người khác thì fetch từ API
          const response = await authFetch(`/user/profile/${userId}`);
          if (response.ok) {
            const data = await response.json();
            const userData = data.user || data;
            setUser(userData);
            setFormData(userData);
          }
        }
      } catch (error) {
        console.error("Fetch user data error:", error);
      }
    };

    if (userId && currentUserId !== null) {
      fetchUserData();
    }
  }, [userId, currentUserId, isOwnProfile]);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await authFetch("/events/getAllEvents");

        if (response.ok) {
          const data = await response.json();
          const events = data.events ?? data;

          const clean = events
            .map((ev: any) => {
              const parts = ev.start_date.split(" ");

              return {
                id: ev.id,
                event: ev.title,
                date: parts[0],
                hours: parts[1] ? parts[1].slice(0, 5) : "--:--",
              };
            })
            .slice(0, 5);

          setRecentActivities(clean);
        }
      } catch (error) {
        console.log(" Fetch events error:", error);
      }
    };

    fetchEvent();
  }, []);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result as string);
        setFormData({ ...formData, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const response = await authFetch("/user/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setFormData(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));

        setIsEditing(false);
        setPreviewAvatar(null);
      }
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Mật khẩu mới không khớp!");
      return;
    }

    try {
      const response = await authFetch("/user/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        setShowPasswordModal(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        alert("Đổi mật khẩu thành công!");
      } else {
        alert("Đổi mật khẩu thất bại!");
      }
    } catch (error) {
      console.error("Password change failed:", error);
      alert("Đổi mật khẩu thất bại!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 mb-2">
            Hồ Sơ Cá Nhân
          </h1>
          <p className="text-gray-600">
            Quản lý thông tin và xem lịch sử hoạt động của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />

              {/* Avatar */}
              <div className="relative w-32 h-32 mx-auto mb-4">
                <img
                  src={previewAvatar || (user.avatar ?? "/default-avatar.png")}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover border-4 border-green-500"
                />
                {isOwnProfile && (
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    className="absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-all shadow-lg"
                  >
                    <FaCamera />
                  </button>
                )}
              </div>

              {/* Save Avatar Button - Chỉ hiển thị nếu là profile của mình */}
              {previewAvatar && isOwnProfile && (
                <div className="mb-4 flex gap-2">
                  <button
                    onClick={async () => {
                      try {
                        const response = await authFetch(
                          "/user/update-profile",
                          {
                            method: "PUT",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({
                              ...user,
                              avatar: previewAvatar,
                            }),
                          }
                        );

                        if (response.ok) {
                          const data = await response.json();
                          setUser(data.user);
                          setFormData(data.user);
                          localStorage.setItem(
                            "user",
                            JSON.stringify(data.user)
                          );
                          setPreviewAvatar(null);
                          alert("Đã cập nhật avatar!");
                        } else {
                          alert("Lưu avatar thất bại!");
                        }
                      } catch (error) {
                        console.error("Update avatar failed:", error);
                        alert("Lưu avatar thất bại!");
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all font-semibold text-sm"
                  >
                    Lưu avatar
                  </button>
                  <button
                    onClick={() => setPreviewAvatar(null)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-all font-semibold text-sm"
                  >
                    Hủy
                  </button>
                </div>
              )}

              {/* User Info */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  {user.name}
                </h2>
                <p className="text-gray-500 flex items-center justify-center gap-2">
                  <FaCalendarAlt className="text-green-500" />
                  Tham gia từ {user.joinedDate}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center">
                  <FaTrophy className="text-3xl text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-700">
                    {user.points}
                  </p>
                  <p className="text-sm text-gray-600">Điểm</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center">
                  <FaCheckCircle className="text-3xl text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-700">
                    {user.eventsCompleted}
                  </p>
                  <p className="text-sm text-gray-600">Hoàn thành</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl text-center">
                  <FaClock className="text-3xl text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-700">
                    {user.totalHours}h
                  </p>
                  <p className="text-sm text-gray-600">Giờ tình nguyện</p>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-xl text-center">
                  <FaHeart className="text-3xl text-pink-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-pink-700">
                    {user.eventsJoined}
                  </p>
                  <p className="text-sm text-gray-600">Sự kiện</p>
                </div>
              </div>

              {/* Edit Button - Chỉ hiển thị nếu là profile của mình */}
              {isOwnProfile && (
                <>
                  {!isEditing ? (
                    <div className="space-y-3">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-xl hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2"
                      >
                        <FaEdit />
                        Chỉnh sửa hồ sơ
                      </button>
                      <button
                        onClick={() => setShowPasswordModal(true)}
                        className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-50 transition-all font-semibold flex items-center justify-center gap-2"
                      >
                        <FaLock />
                        Đổi mật khẩu
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={handleSave}
                        className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-xl hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2"
                      >
                        <FaSave />
                        Lưu
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({ ...user });
                          setPreviewAvatar(null);
                        }}
                        className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition-all font-semibold"
                      >
                        Hủy
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Information Form */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <FaUser className="text-green-500" />
                Thông tin cá nhân
              </h3>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    value={isEditing ? formData.name ?? "" : user.name ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={!isEditing || !isOwnProfile}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-black transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={isEditing ? formData.email ?? "" : user.email ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled={!isEditing || !isOwnProfile}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-black transition-all"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={isEditing ? formData.phone ?? "" : user.phone ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    disabled={!isEditing || !isOwnProfile}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-black transition-all"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Địa chỉ
                  </label>
                  <textarea
                    value={
                      isEditing ? formData.address ?? "" : user.address ?? ""
                    }
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    disabled={!isEditing || !isOwnProfile}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-black transition-all"
                  />
                </div>

                {/* Save/Cancel Buttons - Chỉ hiển thị nếu đang edit và là profile của mình */}
                {isEditing && isOwnProfile && (
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-xl hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2"
                    >
                      <FaSave />
                      Lưu thay đổi
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({ ...user });
                      }}
                      className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition-all font-semibold"
                    >
                      Hủy
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Activity History */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <FaCalendarAlt className="text-green-500" />
                  Hoạt động gần đây
                </h3>
                <button
                  onClick={() => (window.location.href = "/user/history")}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm"
                >
                  <FaTrophy />
                  <span>Xem lịch sử đầy đủ</span>
                </button>
              </div>

              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                          <FaCheckCircle className="text-white text-xl" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {activity.event}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {activity.date} {activity.hours} giờ
                          </p>
                        </div>
                      </div>
                      <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                        Hoàn thành
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FaClock className="mx-auto text-4xl mb-2 text-gray-300" />
                    <p>Chưa có hoạt động nào</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                    <FaLock className="text-white" />
                  </div>
                  Đổi mật khẩu
                </h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mật khẩu hiện tại
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Xác nhận mật khẩu mới
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handlePasswordChange}
                    className="flex-1 bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-xl hover:shadow-lg transition-all font-semibold"
                  >
                    Đổi mật khẩu
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition-all font-semibold"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

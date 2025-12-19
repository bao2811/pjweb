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
  FaEdit,
  FaBirthdayCake,
  FaVenusMars,
  FaIdCard,
  FaUserShield,
} from "react-icons/fa";

interface User {
  id?: number;
  username: string;
  email: string;
  phone: string;
  address: string;
  image: string;
  role: string;
  created_at: string;
  address_card?: string;
  status?: string;
  events_completed?: number;
  total_hours?: number;
  events_joined?: number;
}

export default function ProfilePage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);

  const [user, setUser] = useState<User>({
    id: 0,
    username: "",
    email: "",
    phone: "",
    address: "",
    image: "https://i.pravatar.cc/150",
    role: "user",
    created_at: "",
    address_card: "",
    status: "active",
    events_completed: 0,
    total_hours: 0,
    events_joined: 0,
  });

  const [formData, setFormData] = useState<User>(user);

  // Fetch profile của chính mình từ /user/getuser
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await authFetch("/user/getuser");

        if (response.ok) {
          const userData = await response.json();

          console.log("User data from /user/getuser:", userData);

          const profileData: User = {
            id: userData.id || 0,
            username: userData.username || "",
            email: userData.email || "",
            phone: userData.phone || "",
            address: userData.address || "",
            image: userData.image || "https://i.pravatar.cc/150",
            role: userData.role || "user",
            created_at: userData.created_at || "",
            address_card: userData.address_card || "",
            status: userData.status || "active",
            events_completed: userData.events_completed || 0,
            total_hours: userData.total_hours || 0,
            events_joined: userData.events_joined || 0,
          };

          setUser(profileData);
          setFormData(profileData);
        } else {
          console.error("Failed to fetch profile:", response.status);
        }
      } catch (error) {
        console.error("Fetch profile error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleAvatarClick = () => {
    if (isEditing) fileInputRef.current?.click();
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
      const response = await authFetch(`/user/updateUserProfile/${user.id}`, {
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
          address_card: formData.address_card,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert("Cập nhật hồ sơ thành công!");
        // Fetch lại profile để cập nhật dữ liệu mới nhất
        const profileResponse = await authFetch("/user/getuser");
        if (profileResponse.ok) {
          const userData = await profileResponse.json();
          const profileData: User = {
            id: userData.id || 0,
            username: userData.username || "",
            email: userData.email || "",
            phone: userData.phone || "",
            address: userData.address || "",
            image: userData.image || "https://i.pravatar.cc/150",
            role: userData.role || "user",
            created_at: userData.created_at || "",
            address_card: userData.address_card || "",
            status: userData.status || "active",
            events_completed: userData.events_completed || 0,
            total_hours: userData.total_hours || 0,
            events_joined: userData.events_joined || 0,
          };
          setUser(profileData);
          setFormData(profileData);
        }
        setIsEditing(false);
        setPreviewAvatar(null);
      } else {
        const error = await response.json();
        alert(
          "Cập nhật thất bại: " +
            (error.error || error.message || "Lỗi không xác định")
        );
      }
    } catch (error) {
      console.error("Update profile error:", error);
      alert("Cập nhật thất bại!");
    }
  };

  const handleCancel = () => {
    setFormData(user);
    setPreviewAvatar(null);
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Chưa cập nhật";
    try {
      return new Date(dateString).toLocaleDateString("vi-VN");
    } catch {
      return "Chưa cập nhật";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 mb-2">
            Hồ Sơ Cá Nhân
          </h1>
          <p className="text-gray-600">
            Quản lý thông tin và xem hoạt động của bạn
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-4">
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
                  src={previewAvatar || user.image}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover border-4 border-green-500"
                />
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleAvatarClick}
                    className="absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-all shadow-lg"
                  >
                    <FaCamera />
                  </button>
                )}
              </div>

              {/* User Info */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  {user.username}
                </h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-2">
                  <FaUserShield />
                  {user.role === "user" ? "Người dùng" : user.role}
                </div>
                <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
                  <FaCalendarAlt className="text-green-500" />
                  Tham gia từ {formatDate(user.created_at)}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl text-center">
                  <FaHeart className="text-2xl text-blue-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-blue-700">
                    {user.events_joined || 0}
                  </p>
                  <p className="text-xs text-gray-600">Tham gia</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl text-center">
                  <FaCheckCircle className="text-2xl text-green-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-green-700">
                    {user.events_completed || 0}
                  </p>
                  <p className="text-xs text-gray-600">Hoàn thành</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-xl text-center">
                  <FaClock className="text-2xl text-purple-600 mx-auto mb-1" />
                  <p className="text-xl font-bold text-purple-700">
                    {user.total_hours || 0}h
                  </p>
                  <p className="text-xs text-gray-600">Giờ</p>
                </div>
              </div>

              {/* Edit Button */}
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-xl hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2"
                >
                  <FaEdit />
                  Chỉnh sửa hồ sơ
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={handleSave}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-xl hover:shadow-lg transition-all font-semibold flex items-center justify-center gap-2"
                  >
                    <FaSave />
                    Lưu thay đổi
                  </button>
                  <button
                    onClick={handleCancel}
                    className="w-full bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition-all font-semibold"
                  >
                    Hủy
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Information */}
          <div className="lg:col-span-3 space-y-6">
            {/* Thông tin cơ bản */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <FaUser className="text-green-500" />
                Thông tin cơ bản
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tên người dùng
                  </label>
                  <input
                    type="text"
                    value={isEditing ? formData.username : user.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaEnvelope className="inline mr-2 text-green-500" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={isEditing ? formData.email : user.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 transition-all"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaPhone className="inline mr-2 text-blue-500" />
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={isEditing ? formData.phone : user.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 transition-all"
                  />
                </div>

                {/* Address Card */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaIdCard className="inline mr-2 text-purple-500" />
                    Mã sinh viên / CCCD
                  </label>
                  <input
                    type="text"
                    value={
                      isEditing
                        ? formData.address_card || ""
                        : user.address_card || ""
                    }
                    onChange={(e) =>
                      setFormData({ ...formData, address_card: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 transition-all"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaUserShield className="inline mr-2 text-orange-500" />
                    Vai trò
                  </label>
                  <input
                    type="text"
                    value={user.role}
                    disabled
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-black bg-gray-100 transition-all capitalize"
                  />
                </div>

                {/* Address - Full width */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FaMapMarkerAlt className="inline mr-2 text-red-500" />
                    Địa chỉ
                  </label>
                  <textarea
                    value={isEditing ? formData.address : user.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    disabled={!isEditing}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-black focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Thông tin tài khoản */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <FaUserShield className="text-blue-500" />
                Thông tin tài khoản
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">ID Người dùng</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {user.id}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Vai trò</p>
                  <p className="text-lg font-semibold text-gray-800 capitalize">
                    {user.role}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl md:col-span-2">
                  <p className="text-sm text-gray-600 mb-1">Ngày tham gia</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {formatDate(user.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

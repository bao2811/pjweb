"use client";
import api from "@/utils/api";
import { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCamera, FaSave, FaCalendarAlt, FaTrophy, FaCheckCircle, FaClock, FaHeart } from "react-icons/fa";

export default function ProfilePage() {
  const [user, setUser] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...user });
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
  const fetchEvent = async () => {
    try {
      const response = await api.get('/events/getAllEvents');

      const events = response.data.events ?? response.data; 

      const clean = events.map((ev: any) => {
        const parts = ev.start_date.split(" ");

        return {
          id: ev.id,
          event: ev.title,
          date: parts[0],
          hours: parts[1] ? parts[1].slice(0, 5) : "--:--",
        };
      }).slice(0, 5);

      setRecentActivities(clean);
    } catch (error) {
      console.log("❌ Fetch events error:", error);
    }
  };

  fetchEvent();
  }, []);


  useEffect(() => {
    const UserData = localStorage.getItem('user');
    if (UserData) {
      setUser(JSON.parse(UserData));
      setFormData(JSON.parse(UserData));
    }
  }, [])

  const handleSave = () => {
    setUser(formData);
    setIsEditing(false);
    // TODO: Call API to update profile
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 mb-2">
            Hồ Sơ Cá Nhân
          </h1>
          <p className="text-gray-600">Quản lý thông tin và xem lịch sử hoạt động của bạn</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              {/* Avatar */}
              <div className="relative w-32 h-32 mx-auto mb-4">
                <img
                  src={user.avatar}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover border-4 border-green-500"
                />
                <button className="absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full hover:bg-green-600 transition-all shadow-lg">
                  <FaCamera />
                </button>
              </div>

              {/* User Info */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">{user.name}</h2>
                <p className="text-gray-500 flex items-center justify-center gap-2">
                  <FaCalendarAlt className="text-green-500" />
                  Tham gia từ {user.joinedDate}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl text-center">
                  <FaTrophy className="text-3xl text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-700">{user.points}</p>
                  <p className="text-sm text-gray-600">Điểm</p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl text-center">
                  <FaCheckCircle className="text-3xl text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-700">{user.eventsCompleted}</p>
                  <p className="text-sm text-gray-600">Hoàn thành</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl text-center">
                  <FaClock className="text-3xl text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-700">{user.totalHours}h</p>
                  <p className="text-sm text-gray-600">Giờ tình nguyện</p>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-xl text-center">
                  <FaHeart className="text-3xl text-pink-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-pink-700">{user.eventsJoined}</p>
                  <p className="text-sm text-gray-600">Sự kiện</p>
                </div>
              </div>

              {/* Edit Button */}
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-3 rounded-xl hover:shadow-lg transition-all font-semibold"
                >
                  Chỉnh sửa hồ sơ
                </button>
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
                    value={isEditing ? formData.name : user.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={isEditing ? formData.email : user.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={isEditing ? formData.phone : user.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Địa chỉ
                  </label>
                  <textarea
                    value={isEditing ? formData.address : user.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all resize-none"
                  />
                </div>

                {/* Save/Cancel Buttons */}
                {isEditing && (
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
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <FaCalendarAlt className="text-green-500" />
                Lịch sử hoạt động
              </h3>

              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-100 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <FaCheckCircle className="text-white text-xl" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{activity.event}</h4>
                        <p className="text-sm text-gray-600">
                          {activity.date}  {activity.hours} giờ
                        </p>
                      </div>
                    </div>
                    <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      Hoàn thành
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";
import Image from "next/image";
import {
  FaUsers,
  FaSearch,
  FaFilter,
  FaLock,
  FaUnlock,
  FaEye,
  FaUserShield,
  FaUserTie,
  FaUser,
  FaCalendarAlt,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaTimes,
  FaCheckCircle,
  FaBan,
  FaHistory,
  FaLeaf,
  FaGraduationCap,
  FaHeart,
  FaHandsHelping,
} from "react-icons/fa";

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: "admin" | "manager" | "volunteer";
  status: "active" | "locked";
  joinedDate: string;
  lastActive: string;
  eventsJoined: number;
  eventsCreated: number;
  location: string;
  bio: string;
  events: UserEvent[];
}

interface UserEvent {
  id: number;
  title: string;
  category: "environment" | "education" | "health" | "community";
  date: string;
  status: "completed" | "upcoming" | "ongoing";
  role: string;
}

const mockUsers: User[] = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    email: "nguyenvanan@gmail.com",
    phone: "0901234567",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100",
    role: "admin",
    status: "active",
    joinedDate: "2024-01-15",
    lastActive: "2 giờ trước",
    eventsJoined: 45,
    eventsCreated: 12,
    location: "TP. Hồ Chí Minh",
    bio: "Quản trị viên hệ thống, đam mê hoạt động tình nguyện và phát triển cộng đồng.",
    events: [
      {
        id: 1,
        title: "Dọn rác bãi biển Vũng Tàu",
        category: "environment",
        date: "2025-10-25",
        status: "upcoming",
        role: "Người tổ chức",
      },
      {
        id: 2,
        title: "Trồng cây xanh - Công viên Tao Đàn",
        category: "environment",
        date: "2025-10-22",
        status: "ongoing",
        role: "Tình nguyện viên",
      },
      {
        id: 3,
        title: "Hiến máu nhân đạo",
        category: "health",
        date: "2025-09-15",
        status: "completed",
        role: "Nhóm trưởng",
      },
    ],
  },
  {
    id: 2,
    name: "Trần Thị Bình",
    email: "tranbinhtv@gmail.com",
    phone: "0902345678",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b2e4a0ee?w=100",
    role: "manager",
    status: "active",
    joinedDate: "2024-02-20",
    lastActive: "1 ngày trước",
    eventsJoined: 38,
    eventsCreated: 8,
    location: "Hà Nội",
    bio: "Quản lý sự kiện với kinh nghiệm 3 năm trong lĩnh vực tình nguyện.",
    events: [
      {
        id: 4,
        title: "Dạy học miễn phí cho trẻ em",
        category: "education",
        date: "2025-10-28",
        status: "upcoming",
        role: "Người tổ chức",
      },
      {
        id: 5,
        title: "Phát quà cho người vô gia cư",
        category: "community",
        date: "2025-09-10",
        status: "completed",
        role: "Tình nguyện viên",
      },
    ],
  },
  {
    id: 3,
    name: "Lê Minh Châu",
    email: "leminhchau@gmail.com",
    phone: "0903456789",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
    role: "volunteer",
    status: "active",
    joinedDate: "2024-03-10",
    lastActive: "3 giờ trước",
    eventsJoined: 23,
    eventsCreated: 0,
    location: "Đà Nẵng",
    bio: "Tình nguyện viên nhiệt tình, yêu thích hoạt động bảo vệ môi trường.",
    events: [
      {
        id: 6,
        title: "Dọn rác bãi biển Vũng Tàu",
        category: "environment",
        date: "2025-10-25",
        status: "upcoming",
        role: "Tình nguyện viên",
      },
    ],
  },
  {
    id: 4,
    name: "Phạm Văn Dũng",
    email: "phamvandung@gmail.com",
    phone: "0904567890",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100",
    role: "manager",
    status: "locked",
    joinedDate: "2024-01-25",
    lastActive: "1 tuần trước",
    eventsJoined: 15,
    eventsCreated: 3,
    location: "Cần Thơ",
    bio: "Quản lý sự kiện tại khu vực miền Tây.",
    events: [],
  },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filteredUsers = users.filter((user) => {
    const matchSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = filterRole === "all" || user.role === filterRole;
    const matchStatus = filterStatus === "all" || user.status === filterStatus;
    return matchSearch && matchRole && matchStatus;
  });

  const handleToggleLock = (userId: number) => {
    setUsers(
      users.map((user) =>
        user.id === userId
          ? { ...user, status: user.status === "active" ? "locked" : "active" }
          : user
      )
    );
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: FaUserShield,
        label: "Admin",
      },
      manager: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: FaUserTie,
        label: "Quản lý",
      },
      volunteer: {
        bg: "bg-teal-100",
        text: "text-teal-700",
        icon: FaUser,
        label: "Tình nguyện viên",
      },
    };
    return badges[role as keyof typeof badges];
  };

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    locked: users.filter((u) => u.status === "locked").length,
    admins: users.filter((u) => u.role === "admin").length,
    managers: users.filter((u) => u.role === "manager").length,
    volunteers: users.filter((u) => u.role === "volunteer").length,
  };

  // Category helpers
  const getCategoryLabel = (category: string) => {
    const labels = {
      environment: "Môi trường",
      education: "Giáo dục",
      health: "Sức khỏe",
      community: "Cộng đồng",
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      environment: {
        icon: FaLeaf,
        color: "text-green-600",
        bg: "bg-green-100",
      },
      education: {
        icon: FaGraduationCap,
        color: "text-blue-600",
        bg: "bg-blue-100",
      },
      health: { icon: FaHeart, color: "text-red-600", bg: "bg-red-100" },
      community: {
        icon: FaHandsHelping,
        color: "text-purple-600",
        bg: "bg-purple-100",
      },
    };
    return icons[category as keyof typeof icons] || icons.community;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      upcoming: "Sắp diễn ra",
      ongoing: "Đang diễn ra",
      completed: "Đã hoàn thành",
    };
    return labels[status as keyof typeof labels] || status;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent flex items-center">
                <FaUsers className="mr-3 text-blue-600" />
                Quản lý người dùng
              </h1>
              <p className="text-blue-700 mt-2">
                Quản lý tài khoản và phân quyền người dùng
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Tổng người dùng</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border-l-4 border-blue-500 shadow-sm hover:shadow-md transition duration-200">
            <p className="text-sm text-gray-600">Tổng số</p>
            <p className="text-2xl font-bold text-blue-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border-l-4 border-green-500 shadow-sm hover:shadow-md transition duration-200">
            <p className="text-sm text-gray-600">Đang hoạt động</p>
            <p className="text-2xl font-bold text-green-700">{stats.active}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border-l-4 border-red-500 shadow-sm hover:shadow-md transition duration-200">
            <p className="text-sm text-gray-600">Đã khóa</p>
            <p className="text-2xl font-bold text-red-600">{stats.locked}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border-l-4 border-blue-600 shadow-sm hover:shadow-md transition duration-200">
            <p className="text-sm text-gray-600">Admin</p>
            <p className="text-2xl font-bold text-blue-700">{stats.admins}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border-l-4 border-green-600 shadow-sm hover:shadow-md transition duration-200">
            <p className="text-sm text-gray-600">Quản lý</p>
            <p className="text-2xl font-bold text-green-700">
              {stats.managers}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border-l-4 border-teal-500 shadow-sm hover:shadow-md transition duration-200">
            <p className="text-sm text-gray-600">Tình nguyện</p>
            <p className="text-2xl font-bold text-teal-600">
              {stats.volunteers}
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-400" />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-green-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all">Tất cả vai trò</option>
                <option value="admin">Admin</option>
                <option value="manager">Quản lý</option>
                <option value="volunteer">Tình nguyện viên</option>
              </select>
            </div>
            <div className="relative">
              <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang hoạt động</option>
                <option value="locked">Đã khóa</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-green-50 border-b border-blue-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900">
                    Người dùng
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900">
                    Vai trò
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900">
                    Hoạt động
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-blue-900">
                    Sự kiện
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-blue-900">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {filteredUsers.map((user) => {
                  const roleBadge = getRoleBadge(user.role);
                  const RoleIcon = roleBadge.icon;
                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-blue-50/50 transition duration-150"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <Image
                            src={user.avatar}
                            alt={user.name}
                            width={48}
                            height={48}
                            className="rounded-full ring-2 ring-blue-100"
                            unoptimized
                          />
                          <div>
                            <p className="font-semibold text-gray-900">
                              {user.name}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center">
                              <FaEnvelope className="mr-1 text-blue-400" />
                              {user.email}
                            </p>
                            <p className="text-sm text-gray-500 flex items-center">
                              <FaPhone className="mr-1 text-green-400" />
                              {user.phone}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${roleBadge.bg} ${roleBadge.text}`}
                        >
                          <RoleIcon className="mr-2" />
                          {roleBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.status === "active" ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                            <FaCheckCircle className="mr-2" />
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                            <FaBan className="mr-2" />
                            Đã khóa
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900 font-medium flex items-center">
                            <FaHistory className="mr-1 text-blue-400" />
                            {user.lastActive}
                          </p>
                          <p className="text-gray-500">
                            Tham gia:{" "}
                            {new Date(user.joinedDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-blue-700 font-semibold">
                            {user.eventsJoined} tham gia
                          </p>
                          {user.eventsCreated > 0 && (
                            <p className="text-green-700">
                              {user.eventsCreated} tạo
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(user)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition duration-200"
                            title="Xem chi tiết"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleToggleLock(user.id)}
                            className={`p-2 rounded-lg transition duration-200 ${
                              user.status === "active"
                                ? "bg-red-100 hover:bg-red-200 text-red-700"
                                : "bg-green-100 hover:bg-green-200 text-green-700"
                            }`}
                            title={
                              user.status === "active"
                                ? "Khóa tài khoản"
                                : "Mở khóa tài khoản"
                            }
                          >
                            {user.status === "active" ? (
                              <FaLock />
                            ) : (
                              <FaUnlock />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <FaUsers className="mx-auto text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500">Không tìm thấy người dùng nào</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  Thông tin chi tiết người dùng
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition duration-200"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* User Avatar and Name */}
              <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-200">
                <Image
                  src={selectedUser.avatar}
                  alt={selectedUser.name}
                  width={100}
                  height={100}
                  className="rounded-full ring-4 ring-blue-100"
                  unoptimized
                />
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedUser.name}
                  </h3>
                  <div className="flex items-center space-x-2 mt-2">
                    {(() => {
                      const badge = getRoleBadge(selectedUser.role);
                      const Icon = badge.icon;
                      return (
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}
                        >
                          <Icon className="mr-2" />
                          {badge.label}
                        </span>
                      );
                    })()}
                    {selectedUser.status === "active" ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                        <FaCheckCircle className="mr-2" />
                        Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                        <FaBan className="mr-2" />
                        Đã khóa
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* User Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600 mb-1 flex items-center">
                    <FaEnvelope className="mr-2" />
                    Email
                  </p>
                  <p className="font-semibold text-gray-900">
                    {selectedUser.email}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 mb-1 flex items-center">
                    <FaPhone className="mr-2" />
                    Số điện thoại
                  </p>
                  <p className="font-semibold text-gray-900">
                    {selectedUser.phone}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600 mb-1 flex items-center">
                    <FaMapMarkerAlt className="mr-2" />
                    Địa điểm
                  </p>
                  <p className="font-semibold text-gray-900">
                    {selectedUser.location}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 mb-1 flex items-center">
                    <FaCalendarAlt className="mr-2" />
                    Ngày tham gia
                  </p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedUser.joinedDate).toLocaleDateString(
                      "vi-VN"
                    )}
                  </p>
                </div>
              </div>

              {/* Activity Stats */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 mb-6">
                <h4 className="font-bold text-gray-900 mb-4">
                  Thống kê hoạt động
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-700">
                      {selectedUser.eventsJoined}
                    </p>
                    <p className="text-sm text-gray-600">Sự kiện tham gia</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-700">
                      {selectedUser.eventsCreated}
                    </p>
                    <p className="text-sm text-gray-600">Sự kiện tạo</p>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-bold text-gray-900 mb-2">Giới thiệu</h4>
                <p className="text-gray-700">{selectedUser.bio}</p>
              </div>

              {/* Events List */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                  <FaCalendarAlt className="mr-2 text-blue-600" />
                  Sự kiện đã tham gia ({selectedUser.events.length})
                </h4>
                {selectedUser.events.length > 0 ? (
                  <div className="space-y-3">
                    {selectedUser.events.map((event) => {
                      const categoryConfig = getCategoryIcon(event.category);
                      const CategoryIcon = categoryConfig.icon;
                      return (
                        <div
                          key={event.id}
                          className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border border-blue-100 hover:shadow-md transition duration-200"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="font-semibold text-gray-900 mb-2">
                                {event.title}
                              </h5>
                              <div className="flex items-center space-x-3 text-sm">
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full ${categoryConfig.bg} ${categoryConfig.color}`}
                                >
                                  <CategoryIcon className="mr-1" />
                                  {getCategoryLabel(event.category)}
                                </span>
                                <span className="text-gray-600">
                                  📅{" "}
                                  {new Date(event.date).toLocaleDateString(
                                    "vi-VN"
                                  )}
                                </span>
                                <span className="font-medium text-blue-700">
                                  {event.role}
                                </span>
                              </div>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                event.status === "completed"
                                  ? "bg-gray-100 text-gray-700"
                                  : event.status === "ongoing"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {getStatusLabel(event.status)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <FaCalendarAlt className="mx-auto text-4xl text-gray-300 mb-2" />
                    <p className="text-gray-500">Chưa tham gia sự kiện nào</p>
                  </div>
                )}
              </div>

              {/* Last Active */}
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-blue-600 mb-1 flex items-center">
                  <FaHistory className="mr-2" />
                  Hoạt động gần nhất
                </p>
                <p className="font-semibold text-gray-900">
                  {selectedUser.lastActive}
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition duration-200"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  handleToggleLock(selectedUser.id);
                  setShowDetailModal(false);
                }}
                className={`px-6 py-2 rounded-lg font-medium transition duration-200 flex items-center space-x-2 ${
                  selectedUser.status === "active"
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                {selectedUser.status === "active" ? (
                  <>
                    <FaLock />
                    <span>Khóa tài khoản</span>
                  </>
                ) : (
                  <>
                    <FaUnlock />
                    <span>Mở khóa</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

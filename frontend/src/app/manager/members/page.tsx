"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  FaUsers,
  FaUserPlus,
  FaUserMinus,
  FaUserTimes,
  FaUserCheck,
  FaCrown,
  FaShieldAlt,
  FaUser,
  FaSearch,
  FaFilter,
  FaEdit,
  FaBan,
  FaUndo,
  FaEye,
  FaCalendarAlt,
  FaChartLine,
  FaTimes,
  FaCheck,
  FaExclamationTriangle,
  FaUserCog,
  FaSortAmountDown,
  FaSortAmountUp,
} from "react-icons/fa";

// Types
interface Member {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: "user" | "manager" | "admin";
  status: "active" | "banned" | "suspended";
  joinedAt: string;
  lastLogin: string;
  eventsJoined: number;
  eventsCreated: number;
  totalContributions: number;
  location: string;
  phoneNumber?: string;
  isOnline: boolean;
}

interface Stats {
  totalMembers: number;
  newMembersThisMonth: number;
  activeMembersToday: number;
  bannedMembers: number;
  adminCount: number;
  managerCount: number;
  userCount: number;
}

// Mock current user (admin/manager)
const currentUser = {
  id: 1,
  name: "Admin User",
  role: "admin" as const, // Thay đổi thành "manager" để test quyền manager
};

// Mock members data
const mockMembers: Member[] = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    email: "nguyen.van.an@email.com",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    role: "admin",
    status: "active",
    joinedAt: "2024-01-15",
    lastLogin: "2025-10-09T08:30:00Z",
    eventsJoined: 25,
    eventsCreated: 8,
    totalContributions: 120,
    location: "TP.HCM",
    phoneNumber: "0901234567",
    isOnline: true,
  },
  {
    id: 2,
    name: "Trần Thị Bình",
    email: "tran.thi.binh@email.com",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b2e4a0ee?w=150&h=150&fit=crop&crop=face",
    role: "manager",
    status: "active",
    joinedAt: "2024-03-20",
    lastLogin: "2025-10-09T07:15:00Z",
    eventsJoined: 18,
    eventsCreated: 12,
    totalContributions: 95,
    location: "Hà Nội",
    phoneNumber: "0987654321",
    isOnline: true,
  },
  {
    id: 3,
    name: "Lê Minh Châu",
    email: "le.minh.chau@email.com",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    role: "manager",
    status: "active",
    joinedAt: "2024-05-10",
    lastLogin: "2025-10-08T22:45:00Z",
    eventsJoined: 22,
    eventsCreated: 15,
    totalContributions: 88,
    location: "Đà Nẵng",
    phoneNumber: "0912345678",
    isOnline: false,
  },
  {
    id: 4,
    name: "Phạm Văn Dũng",
    email: "pham.van.dung@email.com",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    role: "user",
    status: "active",
    joinedAt: "2025-09-15",
    lastLogin: "2025-10-09T06:20:00Z",
    eventsJoined: 8,
    eventsCreated: 0,
    totalContributions: 32,
    location: "Cần Thơ",
    phoneNumber: "0934567890",
    isOnline: true,
  },
  {
    id: 5,
    name: "Hoàng Thị Em",
    email: "hoang.thi.em@email.com",
    avatar:
      "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face",
    role: "user",
    status: "banned",
    joinedAt: "2024-08-22",
    lastLogin: "2025-10-05T14:30:00Z",
    eventsJoined: 5,
    eventsCreated: 0,
    totalContributions: 15,
    location: "Hải Phòng",
    phoneNumber: "0945678901",
    isOnline: false,
  },
  {
    id: 6,
    name: "Vũ Quang Hải",
    email: "vu.quang.hai@email.com",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    role: "user",
    status: "active",
    joinedAt: "2025-10-01",
    lastLogin: "2025-10-09T09:10:00Z",
    eventsJoined: 2,
    eventsCreated: 0,
    totalContributions: 8,
    location: "Vũng Tàu",
    isOnline: true,
  },
  {
    id: 7,
    name: "Đỗ Thị Giang",
    email: "do.thi.giang@email.com",
    avatar:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face",
    role: "user",
    status: "suspended",
    joinedAt: "2024-12-10",
    lastLogin: "2025-10-07T16:20:00Z",
    eventsJoined: 12,
    eventsCreated: 1,
    totalContributions: 45,
    location: "Nha Trang",
    phoneNumber: "0956789012",
    isOnline: false,
  },
];

// Mock stats
const mockStats: Stats = {
  totalMembers: 847,
  newMembersThisMonth: 23,
  activeMembersToday: 156,
  bannedMembers: 5,
  adminCount: 3,
  managerCount: 12,
  userCount: 832,
};

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>(mockMembers);
  const [stats, setStats] = useState<Stats>(mockStats);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [memberToAction, setMemberToAction] = useState<Member | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState<
    "name" | "joinedAt" | "lastLogin" | "contributions"
  >("joinedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const roles = ["all", "admin", "manager", "user"];
  const statuses = ["all", "active", "banned", "suspended"];

  // Filter and sort members
  useEffect(() => {
    let filtered = members;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (member) =>
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (selectedRole !== "all") {
      filtered = filtered.filter((member) => member.role === selectedRole);
    }

    // Status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((member) => member.status === selectedStatus);
    }

    // Sort
    filtered.sort((a, b) => {
      let valueA: any, valueB: any;

      switch (sortBy) {
        case "name":
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case "joinedAt":
          valueA = new Date(a.joinedAt);
          valueB = new Date(b.joinedAt);
          break;
        case "lastLogin":
          valueA = new Date(a.lastLogin);
          valueB = new Date(b.lastLogin);
          break;
        case "contributions":
          valueA = a.totalContributions;
          valueB = b.totalContributions;
          break;
        default:
          valueA = a.joinedAt;
          valueB = b.joinedAt;
      }

      if (sortOrder === "asc") {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

    setFilteredMembers(filtered);
  }, [members, searchTerm, selectedRole, selectedStatus, sortBy, sortOrder]);

  // Permission checks
  const canEditMember = (member: Member) => {
    if (currentUser.role === "admin") return true;
    if (currentUser.role === "manager" && member.role === "user") return true;
    return false;
  };

  const canBanMember = (member: Member) => {
    if (currentUser.role === "admin") return true;
    if (currentUser.role === "manager" && member.role === "user") return true;
    return false;
  };

  const canChangeRole = (member: Member) => {
    if (currentUser.role === "admin") return true;
    return false;
  };

  // Handlers
  const handleViewMember = (member: Member) => {
    setSelectedMember(member);
    setShowDetailModal(true);
  };

  const handleEditMember = (member: Member) => {
    setSelectedMember(member);
    setShowEditModal(true);
  };

  const handleBanMember = (member: Member) => {
    setMemberToAction(member);
    setShowBanModal(true);
  };

  const confirmBanAction = (action: "ban" | "unban" | "suspend") => {
    if (memberToAction) {
      setMembers(
        members.map((member) =>
          member.id === memberToAction.id
            ? {
                ...member,
                status:
                  action === "ban"
                    ? "banned"
                    : action === "unban"
                    ? "active"
                    : "suspended",
              }
            : member
        )
      );

      // Update stats
      setStats((prev) => ({
        ...prev,
        bannedMembers:
          action === "ban" ? prev.bannedMembers + 1 : prev.bannedMembers - 1,
      }));

      setShowBanModal(false);
      setMemberToAction(null);
    }
  };

  const handleRoleChange = (
    memberId: number,
    newRole: "user" | "manager" | "admin"
  ) => {
    setMembers(
      members.map((member) =>
        member.id === memberId ? { ...member, role: newRole } : member
      )
    );
  };

  // Get role info
  const getRoleInfo = (role: string) => {
    const roleConfig = {
      admin: {
        icon: FaCrown,
        color: "text-red-600",
        bgColor: "bg-red-100",
        label: "Admin",
      },
      manager: {
        icon: FaShieldAlt,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        label: "Manager",
      },
      user: {
        icon: FaUser,
        color: "text-gray-600",
        bgColor: "bg-gray-100",
        label: "User",
      },
    };
    return roleConfig[role as keyof typeof roleConfig];
  };

  // Get status info
  const getStatusInfo = (status: string) => {
    const statusConfig = {
      active: {
        color: "text-green-600",
        bgColor: "bg-green-100",
        label: "Hoạt động",
      },
      banned: { color: "text-red-600", bgColor: "bg-red-100", label: "Bị cấm" },
      suspended: {
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        label: "Tạm khóa",
      },
    };
    return statusConfig[status as keyof typeof statusConfig];
  };

  // Format time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Vừa xong";
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays} ngày trước`;
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths} tháng trước`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Quản lý thành viên
              </h1>
              <p className="text-gray-600 mt-1">
                Quản lý và theo dõi hoạt động của thành viên
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mt-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Tổng thành viên</p>
                  <p className="text-2xl font-bold">{stats.totalMembers}</p>
                </div>
                <FaUsers className="text-blue-200 text-2xl" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Mới tháng này</p>
                  <p className="text-2xl font-bold">
                    {stats.newMembersThisMonth}
                  </p>
                </div>
                <FaUserPlus className="text-green-200 text-2xl" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Hoạt động hôm nay</p>
                  <p className="text-2xl font-bold">
                    {stats.activeMembersToday}
                  </p>
                </div>
                <FaChartLine className="text-purple-200 text-2xl" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm">Bị cấm</p>
                  <p className="text-2xl font-bold">{stats.bannedMembers}</p>
                </div>
                <FaBan className="text-red-200 text-2xl" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm">Admin</p>
                  <p className="text-2xl font-bold">{stats.adminCount}</p>
                </div>
                <FaCrown className="text-yellow-200 text-2xl" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-indigo-100 text-sm">Manager</p>
                  <p className="text-2xl font-bold">{stats.managerCount}</p>
                </div>
                <FaShieldAlt className="text-indigo-200 text-2xl" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg p-4 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-100 text-sm">User</p>
                  <p className="text-2xl font-bold">{stats.userCount}</p>
                </div>
                <FaUser className="text-gray-200 text-2xl" />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            {/* Search */}
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email, địa điểm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-base placeholder:text-gray-400"
              />
            </div>

            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-base"
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role === "all"
                    ? "Tất cả vai trò"
                    : role === "admin"
                    ? "Admin"
                    : role === "manager"
                    ? "Manager"
                    : "User"}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-base"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === "all"
                    ? "Tất cả trạng thái"
                    : status === "active"
                    ? "Hoạt động"
                    : status === "banned"
                    ? "Bị cấm"
                    : "Tạm khóa"}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="joinedAt">Ngày tham gia</option>
              <option value="lastLogin">Lần cuối online</option>
              <option value="name">Tên</option>
              <option value="contributions">Đóng góp</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition duration-200"
            >
              {sortOrder === "asc" ? <FaSortAmountUp /> : <FaSortAmountDown />}
            </button>
          </div>
        </div>
      </div>

      {/* Members Table */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thành viên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hoạt động
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tham gia
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembers.map((member) => {
                  const roleInfo = getRoleInfo(member.role);
                  const statusInfo = getStatusInfo(member.status);
                  const RoleIcon = roleInfo.icon;

                  return (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="relative">
                            <Image
                              src={member.avatar}
                              alt={member.name}
                              width={40}
                              height={40}
                              className="rounded-full"
                              unoptimized
                            />
                            {member.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {member.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {member.email}
                            </div>
                            <div className="text-xs text-gray-400">
                              {member.location}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleInfo.bgColor} ${roleInfo.color}`}
                        >
                          <RoleIcon className="mr-1" />
                          {roleInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>Sự kiện: {member.eventsJoined}</div>
                        <div className="text-xs text-gray-500">
                          Đóng góp: {member.totalContributions}
                        </div>
                        <div className="text-xs text-gray-400">
                          Online: {formatRelativeTime(member.lastLogin)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(member.joinedAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleViewMember(member)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Xem chi tiết"
                          >
                            <FaEye />
                          </button>

                          {canEditMember(member) && (
                            <button
                              onClick={() => handleEditMember(member)}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Chỉnh sửa"
                            >
                              <FaEdit />
                            </button>
                          )}

                          {canBanMember(member) &&
                            member.status === "active" && (
                              <button
                                onClick={() => handleBanMember(member)}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="Cấm"
                              >
                                <FaBan />
                              </button>
                            )}

                          {canBanMember(member) &&
                            member.status !== "active" && (
                              <button
                                onClick={() => handleBanMember(member)}
                                className="text-green-600 hover:text-green-900 p-1"
                                title="Bỏ cấm"
                              >
                                <FaUndo />
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-12">
              <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Không tìm thấy thành viên
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Hãy thử thay đổi bộ lọc hoặc tìm kiếm khác.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Member Detail Modal */}
      {showDetailModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Chi tiết thành viên
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <FaTimes />
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Image
                      src={selectedMember.avatar}
                      alt={selectedMember.name}
                      width={80}
                      height={80}
                      className="rounded-full"
                      unoptimized
                    />
                    {selectedMember.isOnline && (
                      <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {selectedMember.name}
                    </h3>
                    <p className="text-gray-600">{selectedMember.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      {(() => {
                        const roleInfo = getRoleInfo(selectedMember.role);
                        const statusInfo = getStatusInfo(selectedMember.status);
                        const RoleIcon = roleInfo.icon;
                        return (
                          <>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleInfo.bgColor} ${roleInfo.color}`}
                            >
                              <RoleIcon className="mr-1" />
                              {roleInfo.label}
                            </span>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.color}`}
                            >
                              {statusInfo.label}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Địa điểm
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {selectedMember.location}
                    </p>
                  </div>
                  {selectedMember.phoneNumber && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Số điện thoại
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedMember.phoneNumber}
                      </p>
                    </div>
                  )}
                </div>

                {/* Activity Stats */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    Thống kê hoạt động
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {selectedMember.eventsJoined}
                      </div>
                      <div className="text-sm text-blue-600">
                        Sự kiện tham gia
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {selectedMember.eventsCreated}
                      </div>
                      <div className="text-sm text-green-600">Sự kiện tạo</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {selectedMember.totalContributions}
                      </div>
                      <div className="text-sm text-purple-600">
                        Tổng đóng góp
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    Thời gian
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <FaCalendarAlt className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        Tham gia:{" "}
                        {new Date(selectedMember.joinedAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <FaUser className="text-gray-400 mr-2" />
                      <span className="text-sm text-gray-600">
                        Lần cuối online:{" "}
                        {formatRelativeTime(selectedMember.lastLogin)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Admin Actions */}
                {(canEditMember(selectedMember) ||
                  canBanMember(selectedMember)) && (
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-lg font-medium text-gray-900 mb-3">
                      Hành động
                    </h4>
                    <div className="flex space-x-3">
                      {canChangeRole(selectedMember) && (
                        <select
                          value={selectedMember.role}
                          onChange={(e) =>
                            handleRoleChange(
                              selectedMember.id,
                              e.target.value as any
                            )
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="user">User</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}

                      {canBanMember(selectedMember) && (
                        <button
                          onClick={() => handleBanMember(selectedMember)}
                          className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                            selectedMember.status === "active"
                              ? "bg-red-500 hover:bg-red-600 text-white"
                              : "bg-green-500 hover:bg-green-600 text-white"
                          }`}
                        >
                          {selectedMember.status === "active"
                            ? "Cấm thành viên"
                            : "Bỏ cấm"}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ban/Unban Confirmation Modal */}
      {showBanModal && memberToAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <FaExclamationTriangle className="text-yellow-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                Xác nhận hành động
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Bạn muốn thực hiện hành động gì với thành viên "
              {memberToAction.name}"?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowBanModal(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition duration-200"
              >
                Hủy
              </button>
              {memberToAction.status === "active" && (
                <>
                  <button
                    onClick={() => confirmBanAction("suspend")}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition duration-200"
                  >
                    Tạm khóa
                  </button>
                  <button
                    onClick={() => confirmBanAction("ban")}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition duration-200"
                  >
                    Cấm vĩnh viễn
                  </button>
                </>
              )}
              {memberToAction.status !== "active" && (
                <button
                  onClick={() => confirmBanAction("unban")}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition duration-200"
                >
                  Bỏ cấm
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

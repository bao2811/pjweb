"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { authFetch } from "@/utils/auth";
import { useRouter } from "next/dist/client/components/navigation";
import Image from "next/image";
import {
  FaUsers,
  FaSearch,
  FaFilter,
  FaLock,
  FaUnlock,
  FaEye,
  FaCalendarAlt,
  FaCalendarCheck,
  FaCalendarPlus,
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
  FaDownload,
  FaFileExport,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaTrash,
  FaCheck,
  FaChevronLeft,
  FaChevronRight,
  FaUserPlus,
  FaFileCsv,
  FaFileCode,
  FaCheckSquare,
  FaSquare,
  FaCog,
} from "react-icons/fa";

interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  image: string;
  role: "admin" | "manager" | "volunteer";
  status: "active" | "locked" | "pending";
  address: string;
  created_at: string;
  eventsJoined?: number;
  eventsCreated?: number;
  events?: UserEvent[];
  isNew?: boolean; // Highlight new users
  isActive?: boolean; // Highlight very active users
}

interface UserEvent {
  id: number;
  title: string;
  category: "environment" | "education" | "health" | "community";
  date: string;
  status: "completed" | "upcoming" | "ongoing";
  role: string;
}

type SortField = "username" | "role" | "status" | "eventsJoined" | "created_at";
type SortOrder = "asc" | "desc";

interface Toast {
  id: number;
  type: "success" | "error" | "info";
  message: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function UserManagementPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: authLoading, hasRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [eventsRange, setEventsRange] = useState<[number, number]>([0, 50]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type:
      | "lock"
      | "unlock"
      | "delete"
      | "bulk-lock"
      | "bulk-unlock"
      | "bulk-delete";
    userId?: number;
  } | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [sortField, setSortField] = useState<SortField>("username");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!hasRole("admin")) {
        // Redirect to unauthorized page
        router.push("/unauthorized");
      }
    }
  }, [authLoading, hasRole, router]);

  const jwt_token = localStorage.getItem("jwt_token")
    ? localStorage.getItem("jwt_token")
    : null;

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch(`/admin/getAllUsers`, {
        headers: {
          "Content-Type": "application/json",
          // Add authorization header if needed
          Authorization: `Bearer ${jwt_token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.users || data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      showToast("error", "Không thể tải danh sách người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400); // 400ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Toast notification system
  const showToast = useCallback(
    (type: "success" | "error" | "info", message: string) => {
      const id = Date.now();
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 3000);
    },
    []
  );

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = users.filter((user) => {
      const matchSearch =
        user.username?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        user.email?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        user.phone?.includes(debouncedSearch) ||
        user.address?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        user.events?.some((e) =>
          e.title.toLowerCase().includes(debouncedSearch.toLowerCase())
        );

      const matchRole = filterRole === "all" || user.role === filterRole;
      const matchStatus =
        filterStatus === "all" || user.status === filterStatus;
      const matchEvents =
        (user.eventsJoined || 0) >= eventsRange[0] &&
        (user.eventsJoined || 0) <= eventsRange[1];

      return matchSearch && matchRole && matchStatus && matchEvents;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      // Handle undefined values
      if (sortField === "eventsJoined") {
        aVal = a.eventsJoined || 0;
        bVal = b.eventsJoined || 0;
      }

      if (aVal === undefined) aVal = "";
      if (bVal === undefined) bVal = "";

      if (typeof aVal === "string") {
        return sortOrder === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });

    return filtered;
  }, [
    users,
    debouncedSearch,
    filterRole,
    filterStatus,
    eventsRange,
    sortField,
    sortOrder,
  ]);

  // Pagination
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedUsers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <FaSort className="opacity-50" />;
    return sortOrder === "asc" ? <FaSortUp /> : <FaSortDown />;
  };

  // Handle actions with confirmation
  const handleToggleLock = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    setConfirmAction({
      type: user.status === "active" ? "lock" : "unlock",
      userId,
    });
    setShowConfirmModal(true);
  };

  const executeAction = async () => {
    if (!confirmAction) return;

    setIsLoading(true);

    try {
      if (confirmAction.type === "lock" || confirmAction.type === "unlock") {
        const response = await fetch(
          `${API_URL}/admin/users/${confirmAction.userId}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: confirmAction.type === "lock" ? "locked" : "active",
            }),
          }
        );

        if (!response.ok) throw new Error("Failed to update user status");

        setUsers(
          users.map((user) =>
            user.id === confirmAction.userId
              ? {
                  ...user,
                  status: confirmAction.type === "lock" ? "locked" : "active",
                }
              : user
          )
        );
        showToast(
          "success",
          `Tài khoản đã ${
            confirmAction.type === "lock" ? "khóa" : "mở khóa"
          } thành công!`
        );
      } else if (confirmAction.type === "delete") {
        const response = await fetch(
          `${API_URL}/admin/users/${confirmAction.userId}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response.ok) throw new Error("Failed to delete user");

        setUsers(users.filter((u) => u.id !== confirmAction.userId));
        showToast("success", "Xóa tài khoản thành công!");
      } else if (
        confirmAction.type === "bulk-lock" ||
        confirmAction.type === "bulk-unlock"
      ) {
        const newStatus =
          confirmAction.type === "bulk-lock" ? "locked" : "active";

        // Update all selected users
        await Promise.all(
          selectedUsers.map((userId) =>
            fetch(`${API_URL}/admin/users/${userId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: newStatus }),
            })
          )
        );

        setUsers(
          users.map((user) =>
            selectedUsers.includes(user.id)
              ? { ...user, status: newStatus }
              : user
          )
        );
        showToast(
          "success",
          `Đã ${confirmAction.type === "bulk-lock" ? "khóa" : "mở khóa"} ${
            selectedUsers.length
          } tài khoản!`
        );
        setSelectedUsers([]);
      } else if (confirmAction.type === "bulk-delete") {
        // Delete all selected users
        await Promise.all(
          selectedUsers.map((userId) =>
            fetch(`${API_URL}/admin/users/${userId}`, {
              method: "DELETE",
              headers: { "Content-Type": "application/json" },
            })
          )
        );

        setUsers(users.filter((u) => !selectedUsers.includes(u.id)));
        showToast("success", `Đã xóa ${selectedUsers.length} tài khoản!`);
        setSelectedUsers([]);
      }

      setShowConfirmModal(false);
      setConfirmAction(null);
    } catch (error) {
      console.error("Error executing action:", error);
      showToast("error", "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsLoading(false);
    }
  };

  // Bulk actions
  const handleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map((u) => u.id));
    }
  };

  const handleSelectUser = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  // Export functionality
  const handleExport = (format: "csv" | "json") => {
    setIsLoading(true);

    setTimeout(() => {
      const dataToExport =
        filterStatus === "all" && filterRole === "all"
          ? users
          : filteredAndSortedUsers;

      if (format === "csv") {
        const headers = [
          "ID",
          "Tên",
          "Email",
          "Điện thoại",
          "Vai trò",
          "Trạng thái",
          "Sự kiện tham gia",
          "Ngày tạo",
        ];
        const rows = dataToExport.map((u) => [
          u.id,
          u.username || "",
          u.email || "",
          u.phone || "",
          u.role || "",
          u.status || "",
          u.eventsJoined || 0,
          u.created_at || "",
        ]);

        const csvContent = [headers, ...rows]
          .map((row) => row.join(","))
          .join("\n");

        const blob = new Blob(["\uFEFF" + csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `users_export_${new Date().getTime()}.csv`;
        link.click();
      } else {
        const jsonContent = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonContent], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `users_export_${new Date().getTime()}.json`;
        link.click();
      }

      setIsLoading(false);
      setShowExportModal(false);
      showToast(
        "success",
        `Đã xuất ${
          dataToExport.length
        } người dùng sang ${format.toUpperCase()}!`
      );
    }, 1000);
  };

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "active").length,
    locked: users.filter((u) => u.status === "locked").length,
    pending: users.filter((u) => u.status === "pending").length,
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

  // Highlight search term
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-yellow-200 font-semibold">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Welcome Banner */}
      {/* {currentUser && (
        <div className="bg-gradient-to-r from-blue-600 to-green-600 text-white px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Xin chào, Admin</p>
              <h2 className="text-xl font-bold">{currentUser.username}</h2>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Role</p>
              <p className="font-semibold uppercase">{currentUser.role}</p>
            </div>
          </div>
        </div> */}
      {/* )} */}

      {/* Header */}
      <div className="bg-white border-b border-blue-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent flex items-center">
                <FaUsers className="mr-3 text-blue-600" />
                Quản lý người dùng
              </h1>
              <p className="text-blue-700 mt-2 text-base sm:text-lg">
                Quản lý tài khoản và phân quyền người dùng
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-xl transition duration-200 shadow-md hover:shadow-lg text-base font-medium"
              >
                <FaDownload className="text-lg" />
                <span>Xuất dữ liệu</span>
              </button>
              <div className="text-right bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-blue-100">
                <p className="text-sm text-gray-600">Tổng người dùng</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                  {stats.total}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 mb-8">
          <div className="bg-white rounded-xl p-5 border-l-4 border-blue-500 shadow-md hover:shadow-lg transition duration-200">
            <p className="text-sm sm:text-base text-gray-600 mb-1">Tổng số</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-900">
              {stats.total}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border-l-4 border-green-500 shadow-md hover:shadow-lg transition duration-200">
            <p className="text-sm sm:text-base text-gray-600 mb-1">Hoạt động</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-700">
              {stats.active}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border-l-4 border-red-500 shadow-md hover:shadow-lg transition duration-200">
            <p className="text-sm sm:text-base text-gray-600 mb-1">Đã khóa</p>
            <p className="text-2xl sm:text-3xl font-bold text-red-600">
              {stats.locked}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border-l-4 border-yellow-500 shadow-md hover:shadow-lg transition duration-200">
            <p className="text-sm sm:text-base text-gray-600 mb-1">Chờ duyệt</p>
            <p className="text-2xl sm:text-3xl font-bold text-yellow-600">
              {stats.pending}
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6 mb-6 space-y-5">
          {/* Search Bar */}
          <div className="relative">
            <label className="block text-base font-semibold text-gray-700 mb-3">
              🔍 Tìm kiếm người dùng
            </label>
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Tìm theo tên, email, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-200 focus:border-blue-400 transition duration-200 placeholder:text-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-lg font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Filters Grid */}
          <div>
            {/* Status Filter */}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-3 flex items-center">
                <FaFilter className="mr-2 text-green-500" />
                Trạng thái
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-green-200 focus:border-green-400 transition duration-200 bg-white cursor-pointer"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">✅ Hoạt động</option>
                <option value="locked">🔒 Đã khóa</option>
              </select>
            </div>
          </div>

          {/* Filter Info & Reset */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200">
            <div className="text-base text-gray-700">
              Hiển thị{" "}
              <span className="font-bold text-blue-600">
                {paginatedUsers.length}
              </span>{" "}
              / <span className="font-bold">{users.length}</span> người dùng
            </div>
            {(searchTerm || filterStatus !== "all") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("all");
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition duration-200 text-base"
              >
                <span>🔄</span>
                <span>Đặt lại bộ lọc</span>
              </button>
            )}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-md border border-blue-100 overflow-hidden">
          {/* Table Actions Bar */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 px-6 py-4 border-b border-blue-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-bold text-gray-800">
                Danh sách người dùng
              </h3>
              <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium">
                {paginatedUsers.length} người
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <label className="text-base text-gray-700 font-medium">
                Hiển thị:
              </label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer bg-white"
              >
                <option value={10}>10 dòng</option>
                <option value={20}>20 dòng</option>
                <option value={50}>50 dòng</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-100 to-green-100 sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-left text-base font-bold text-blue-900">
                    Người dùng
                  </th>
                  <th className="px-6 py-4 text-left text-base font-bold text-blue-900">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 text-left text-base font-bold text-blue-900">
                    Hoạt động
                  </th>
                  <th className="px-6 py-4 text-left text-base font-bold text-blue-900">
                    Sự kiện
                  </th>
                  <th className="px-6 py-4 text-center text-base font-bold text-blue-900">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedUsers.map((user) => {
                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition duration-200"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-4">
                          <Image
                            src={
                              user.image || "https://i.pravatar.cc/150?img=1"
                            }
                            alt={user.username}
                            width={56}
                            height={56}
                            className="rounded-full ring-2 ring-blue-200 shadow-sm"
                            unoptimized
                          />
                          <div>
                            <p className="font-bold text-gray-900 text-base">
                              {user.username}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center mt-1">
                              <FaEnvelope className="mr-1.5 text-blue-500" />
                              {user.email}
                            </p>
                            <p className="text-sm text-gray-600 flex items-center mt-0.5">
                              <FaPhone className="mr-1.5 text-green-500" />
                              {user.phone || "Chưa cập nhật"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.status === "active" ? (
                          <span className="inline-flex items-center px-4 py-2 rounded-xl text-base font-semibold bg-green-100 text-green-700 shadow-sm">
                            <FaCheckCircle className="mr-2 text-lg" />
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-4 py-2 rounded-xl text-base font-semibold bg-red-100 text-red-700 shadow-sm">
                            <FaBan className="mr-2 text-lg" />
                            Đã khóa
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900 font-semibold flex items-center">
                            <FaHistory className="mr-2 text-blue-500" />
                            {user.role}
                          </p>
                          <p className="text-gray-600 mt-1">
                            Tham gia:{" "}
                            {new Date(user.created_at).toLocaleDateString(
                              "vi-VN"
                            )}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm space-y-1">
                          <p className="text-blue-700 font-semibold flex items-center">
                            <FaCalendarCheck className="mr-1.5" />
                            {user.eventsJoined || 0} tham gia
                          </p>
                          {(user.eventsCreated || 0) > 0 && (
                            <p className="text-green-700 font-semibold flex items-center">
                              <FaCalendarPlus className="mr-1.5" />
                              {user.eventsCreated} tạo
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleViewDetails(user)}
                            className="p-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition duration-200 hover:scale-105"
                            title="Xem chi tiết"
                          >
                            <FaEye className="text-lg" />
                          </button>
                          <button
                            onClick={() => handleToggleLock(user.id)}
                            className={`p-2.5 rounded-lg transition duration-200 hover:scale-105 ${
                              user.status === "active"
                                ? "bg-red-100 hover:bg-red-200 text-red-700"
                                : "bg-green-100 hover:bg-green-200 text-green-700"
                            }`}
                            title={
                              user.status === "active"
                                ? "Khóa tài khoản"
                                : "Mở khóa"
                            }
                          >
                            {user.status === "active" ? (
                              <FaLock className="text-lg" />
                            ) : (
                              <FaUnlock className="text-lg" />
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
          {paginatedUsers.length === 0 && (
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
                  src={selectedUser.image || "https://i.pravatar.cc/150?img=1"}
                  alt={selectedUser.username}
                  width={100}
                  height={100}
                  className="rounded-full ring-4 ring-blue-100"
                  unoptimized
                />
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">
                    {selectedUser.username}
                  </h3>
                  <div className="flex items-center space-x-2 mt-2">
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
                    {selectedUser.phone || "Chưa cập nhật"}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600 mb-1 flex items-center">
                    <FaMapMarkerAlt className="mr-2" />
                    Địa chỉ
                  </p>
                  <p className="font-semibold text-gray-900">
                    {selectedUser.address || "Chưa cập nhật"}
                  </p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600 mb-1 flex items-center">
                    <FaCalendarAlt className="mr-2" />
                    Ngày tạo
                  </p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedUser.created_at).toLocaleDateString(
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

              {/* Events List */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                  <FaCalendarAlt className="mr-2 text-blue-600" />
                  Sự kiện đã tham gia ({selectedUser.events?.length || 0})
                </h4>
                {selectedUser.events && selectedUser.events.length > 0 ? (
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
                  Vai trò
                </p>
                <p className="font-semibold text-gray-900">
                  {selectedUser.role}
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

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">
                  Xuất danh sách người dùng
                </h2>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition duration-200"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="space-y-5">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <p className="text-base text-blue-900 mb-2">
                    <span className="font-bold">
                      {filteredAndSortedUsers.length}
                    </span>{" "}
                    người dùng sẽ được xuất
                  </p>
                  <p className="text-sm text-blue-700">
                    {filterRole !== "all" && `Vai trò: ${filterRole} • `}
                    {filterStatus !== "all" && `Trạng thái: ${filterStatus}`}
                  </p>
                </div>

                <div>
                  <p className="text-base font-semibold text-gray-700 mb-3">
                    Chọn định dạng file:
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleExport("csv")}
                      disabled={isLoading}
                      className="flex flex-col items-center justify-center p-6 border-2 border-green-300 hover:border-green-500 hover:bg-green-50 rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaFileCsv className="text-5xl text-green-600 mb-3" />
                      <span className="text-base font-semibold text-gray-900">
                        Xuất CSV
                      </span>
                      <span className="text-sm text-gray-600 mt-1">
                        Excel, Google Sheets
                      </span>
                    </button>
                    <button
                      onClick={() => handleExport("json")}
                      disabled={isLoading}
                      className="flex flex-col items-center justify-center p-6 border-2 border-blue-300 hover:border-blue-500 hover:bg-blue-50 rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaFileCode className="text-5xl text-blue-600 mb-3" />
                      <span className="text-base font-semibold text-gray-900">
                        Xuất JSON
                      </span>
                      <span className="text-sm text-gray-600 mt-1">
                        Developer, API
                      </span>
                    </button>
                  </div>
                </div>

                {isLoading && (
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 border-3 border-yellow-600 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-base text-yellow-900 font-medium">
                        Đang tạo file xuất...
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 flex justify-end">
              <button
                onClick={() => setShowExportModal(false)}
                disabled={isLoading}
                className="px-6 py-3 text-base bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition duration-200 disabled:opacity-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && confirmAction && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            {/* Modal Header */}
            <div
              className={`p-6 rounded-t-2xl ${
                confirmAction.type === "delete" ||
                confirmAction.type === "bulk-delete"
                  ? "bg-gradient-to-r from-red-500 to-orange-500"
                  : confirmAction.type === "lock" ||
                    confirmAction.type === "bulk-lock"
                  ? "bg-gradient-to-r from-red-500 to-pink-500"
                  : "bg-gradient-to-r from-green-500 to-teal-500"
              } text-white`}
            >
              <h2 className="text-2xl font-bold">Xác nhận thao tác</h2>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div
                  className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    confirmAction.type === "delete" ||
                    confirmAction.type === "bulk-delete"
                      ? "bg-red-100"
                      : confirmAction.type === "lock" ||
                        confirmAction.type === "bulk-lock"
                      ? "bg-red-100"
                      : "bg-green-100"
                  }`}
                >
                  {confirmAction.type === "delete" ||
                  confirmAction.type === "bulk-delete" ? (
                    <FaTrash className="text-2xl text-red-600" />
                  ) : confirmAction.type === "lock" ||
                    confirmAction.type === "bulk-lock" ? (
                    <FaLock className="text-2xl text-red-600" />
                  ) : (
                    <FaUnlock className="text-2xl text-green-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    {confirmAction.type === "lock"
                      ? "Khóa tài khoản người dùng?"
                      : confirmAction.type === "unlock"
                      ? "Mở khóa tài khoản?"
                      : confirmAction.type === "delete"
                      ? "Xóa tài khoản người dùng?"
                      : confirmAction.type === "bulk-lock"
                      ? `Khóa ${selectedUsers.length} tài khoản?`
                      : confirmAction.type === "bulk-unlock"
                      ? `Mở khóa ${selectedUsers.length} tài khoản?`
                      : `Xóa ${selectedUsers.length} tài khoản?`}
                  </p>
                  <p className="text-base text-gray-600">
                    {confirmAction.type === "lock"
                      ? "Người dùng sẽ không thể đăng nhập vào hệ thống."
                      : confirmAction.type === "unlock"
                      ? "Người dùng sẽ có thể đăng nhập trở lại."
                      : confirmAction.type === "delete"
                      ? "Thao tác này không thể hoàn tác. Tất cả dữ liệu liên quan sẽ bị xóa."
                      : confirmAction.type === "bulk-lock"
                      ? "Các người dùng được chọn sẽ không thể đăng nhập."
                      : confirmAction.type === "bulk-unlock"
                      ? "Các người dùng được chọn sẽ có thể đăng nhập trở lại."
                      : "Thao tác này không thể hoàn tác. Tất cả dữ liệu sẽ bị xóa."}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 p-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setConfirmAction(null);
                }}
                disabled={isLoading}
                className="px-6 py-3 text-base bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition duration-200 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={executeAction}
                disabled={isLoading}
                className={`px-6 py-3 text-base rounded-lg font-medium transition duration-200 flex items-center space-x-2 disabled:opacity-50 ${
                  confirmAction.type === "delete" ||
                  confirmAction.type === "bulk-delete"
                    ? "bg-red-500 hover:bg-red-600"
                    : confirmAction.type === "lock" ||
                      confirmAction.type === "bulk-lock"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-green-500 hover:bg-green-600"
                } text-white`}
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang xử lý...</span>
                  </>
                ) : (
                  <>
                    <FaCheck />
                    <span>Xác nhận</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center space-x-3 px-6 py-4 rounded-xl shadow-2xl border-2 transform transition-all duration-300 ${
              toast.type === "success"
                ? "bg-green-500 border-green-600 text-white"
                : toast.type === "error"
                ? "bg-red-500 border-red-600 text-white"
                : "bg-blue-500 border-blue-600 text-white"
            } animate-slide-in-right`}
          >
            <div className="flex-shrink-0">
              {toast.type === "success" ? (
                <FaCheckCircle className="text-2xl" />
              ) : toast.type === "error" ? (
                <FaBan className="text-2xl" />
              ) : (
                <FaHistory className="text-2xl" />
              )}
            </div>
            <p className="font-semibold text-base">{toast.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

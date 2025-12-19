"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { authFetch } from "@/utils/auth";
import { useRouter } from "next/dist/client/components/navigation";
import Image from "next/image";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
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
  FaBell,
  FaPaperPlane,
  FaInfoCircle,
} from "react-icons/fa";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

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

export default function UserManagementPage() {
  const router = useRouter();
  const { user: currentUser, isLoading: authLoading, hasRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
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
  const [notificationForm, setNotificationForm] = useState({
    title: "",
    message: "",
    type: "announcement",
    url: "",
  });
  const [notificationMode, setNotificationMode] = useState<"webpush" | "inapp">(
    "webpush"
  );
  const [isSendingNotification, setIsSendingNotification] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!authLoading) {
      if (!hasRole("admin")) {
        // Redirect to unauthorized page
        router.push("/unauthorized");
      }
    }
  }, [authLoading, hasRole, router]);

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch(`/admin/getAllUsers`);

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

      const matchStatus =
        filterStatus === "all" || user.status === filterStatus;

      return matchSearch && matchStatus;
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
  }, [users, debouncedSearch, filterStatus, sortField, sortOrder]);

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
      // Single user operations (by ID)
      if (confirmAction.userId) {
        await executeSingleUserAction(confirmAction.type, confirmAction.userId);
      }
      // Bulk operations (by array of IDs)
      else {
        await executeBulkAction(confirmAction.type, selectedUsers);
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

  // Execute single user action (ban/unban/delete by ID)
  const executeSingleUserAction = async (
    type: string,
    userId: number
  ): Promise<void> => {
    if (type === "lock" || type === "unlock") {
      const endpoint =
        type === "lock"
          ? `/admin/banUser/${userId}`
          : `/admin/unbanUser/${userId}`;

      const response = await authFetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to update user status");

      setUsers(
        users.map((user) =>
          user.id === userId
            ? {
                ...user,
                status: type === "lock" ? "locked" : "active",
              }
            : user
        )
      );
      showToast(
        "success",
        `Tài khoản đã ${type === "lock" ? "khóa" : "mở khóa"} thành công!`
      );
    } else if (type === "delete") {
      const response = await authFetch(`/admin/deleteUser/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete user");

      setUsers(users.filter((user) => user.id !== userId));
      showToast("success", "Tài khoản đã xóa thành công!");
    }
  };

  // Execute bulk action (ban/unban/delete by array of IDs)
  const executeBulkAction = async (
    type: string,
    userIds: number[]
  ): Promise<void> => {
    if (type === "bulk-lock" || type === "bulk-unlock") {
      const endpoint =
        type === "bulk-lock"
          ? "/admin/bulkLockUsers"
          : "/admin/bulkUnlockUsers";

      const response = await authFetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_ids: userIds }),
      });

      if (!response.ok) throw new Error("Failed to bulk update users");

      const data = await response.json();
      const newStatus = type === "bulk-lock" ? "locked" : "active";

      setUsers(
        users.map((user) =>
          userIds.includes(user.id) ? { ...user, status: newStatus } : user
        )
      );
      showToast(
        "success",
        `Đã ${type === "bulk-lock" ? "khóa" : "mở khóa"} ${
          data.affected || userIds.length
        } tài khoản!`
      );
      setSelectedUsers([]);
    } else if (type === "bulk-delete") {
      const promises = userIds.map((userId) =>
        authFetch(`/admin/deleteUser/${userId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );

      await Promise.all(promises);

      setUsers(users.filter((user) => !userIds.includes(user.id)));
      showToast("success", `Đã xóa ${userIds.length} tài khoản!`);
      setSelectedUsers([]);
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
        filterStatus === "all" ? users : filteredAndSortedUsers;

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

  // Send notification to all users
  const handleSendNotification = async () => {
    if (!notificationForm.title.trim() || !notificationForm.message.trim()) {
      showToast("error", "Vui lòng nhập đầy đủ tiêu đề và nội dung thông báo");
      return;
    }

    setIsSendingNotification(true);

    try {
      // Chọn endpoint dựa vào notificationMode
      const endpoint =
        notificationMode === "webpush"
          ? "/api/notifications/send-test"
          : "/api/notifications/send-to-all";

      const response = await authFetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: notificationForm.title,
          message: notificationForm.message,
          type: notificationForm.type,
          url: notificationForm.url || "/notifications",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send notification");
      }

      const data = await response.json();

      if (notificationMode === "webpush") {
        showToast(
          "success",
          `✅ Đã gửi Web Push đến ${data.stats?.total_users || 0} users (${
            data.stats?.total_devices || 0
          } devices)!`
        );
      } else {
        showToast(
          "success",
          `✅ Đã gửi thông báo đến ${
            data.stats?.total || stats.total
          } người dùng!`
        );
      }

      // Reset form and close modal
      setNotificationForm({
        title: "",
        message: "",
        type: "announcement",
        url: "",
      });
      setShowNotificationModal(false);
    } catch (error) {
      console.error("Error sending notification:", error);
      showToast("error", "❌ Không thể gửi thông báo. Vui lòng thử lại!");
    } finally {
      setIsSendingNotification(false);
    }
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

  // Debug: Log user statuses
  useEffect(() => {
    if (users.length > 0) {
      const statusCount = users.reduce((acc, user) => {
        acc[user.status] = (acc[user.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      console.log("👥 User Status Distribution:", statusCount);
      console.log("🔒 Locked Users:", stats.locked);
    }
  }, [users, stats.locked]);

  // Chart data - Calculate from actual users data
  const chartData = useMemo(() => {
    // Get last 12 months
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        label: `T${date.getMonth() + 1}`,
        year: date.getFullYear(),
        month: date.getMonth(),
      });
    }

    // Count new users registered per month
    const newUsersByMonth = months.map((m) => {
      return users.filter((user) => {
        const createdDate = new Date(user.created_at);
        return (
          createdDate.getFullYear() === m.year &&
          createdDate.getMonth() === m.month
        );
      }).length;
    });

    // Count users who joined events per month (based on event date)
    const usersJoinedEventsByMonth = months.map((m) => {
      // Count unique users who have events in this month
      const usersWithEventsInMonth = new Set<number>();
      users.forEach((user) => {
        const hasEventInMonth = user.events?.some((event) => {
          const eventDate = new Date(event.date);
          return (
            eventDate.getFullYear() === m.year &&
            eventDate.getMonth() === m.month
          );
        });
        if (hasEventInMonth) {
          usersWithEventsInMonth.add(user.id);
        }
      });
      return usersWithEventsInMonth.size;
    });

    // Count users banned per month (cumulative count of locked users up to that month)
    // Since we don't have banned_at timestamp, we show cumulative banned users
    const usersBannedByMonth = months.map((m, index) => {
      // Count all locked users created up to this month
      return users.filter((user) => {
        if (user.status !== "locked") return false;
        const createdDate = new Date(user.created_at);
        const monthDate = new Date(m.year, m.month + 1, 0); // Last day of the month
        return createdDate <= monthDate;
      }).length;
    });

    const chartResult = {
      labels: months.map((m) => m.label),
      newUsers: newUsersByMonth,
      usersJoinedEvents: usersJoinedEventsByMonth,
      usersBanned: usersBannedByMonth,
    };

    // Debug: Log chart data
    console.log("📊 Chart Data:", {
      lockedUsersCount: users.filter((u) => u.status === "locked").length,
      usersBanned: chartResult.usersBanned,
      totalUsers: users.length,
    });

    return chartResult;
  }, [users]);

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
      <div className="bg-white border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent flex items-center">
                <FaUsers className="mr-2 text-blue-600" />
                Quản lý người dùng
              </h1>
              <p className="text-blue-700 mt-1 text-sm sm:text-base">
                Quản lý tài khoản và phân quyền người dùng
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowNotificationModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition duration-200 shadow-md hover:shadow-lg text-sm font-medium"
              >
                <FaBell />
                <span className="hidden sm:inline">Gửi thông báo</span>
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-xl transition duration-200 shadow-md hover:shadow-lg text-sm font-medium"
              >
                <FaDownload />
                <span className="hidden sm:inline">Xuất dữ liệu</span>
              </button>
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
            <p className="text-sm sm:text-base text-gray-600 mb-1 flex items-center">
              <FaLock className="mr-1.5 text-red-500" />
              Đã khóa (Bị ban)
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-red-600">
              {stats.locked}
            </p>
            {stats.locked > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {((stats.locked / stats.total) * 100).toFixed(1)}% tổng số
              </p>
            )}
          </div>
          <div className="bg-white rounded-xl p-5 border-l-4 border-yellow-500 shadow-md hover:shadow-lg transition duration-200">
            <p className="text-sm sm:text-base text-gray-600 mb-1">Chờ duyệt</p>
            <p className="text-2xl sm:text-3xl font-bold text-yellow-600">
              {stats.pending}
            </p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* User Registration Trend */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-blue-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <FaUsers className="mr-2 text-blue-600" />
              Xu hướng đăng ký người dùng
            </h3>
            <Line
              data={{
                labels: chartData.labels,
                datasets: [
                  {
                    label: "Người dùng mới",
                    data: chartData.newUsers,
                    borderColor: "rgb(59, 130, 246)",
                    backgroundColor: "rgba(59, 130, 246, 0.1)",
                    tension: 0.4,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top" as const,
                  },
                  title: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>

          {/* User Distribution by Status */}
          <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <FaCheckCircle className="mr-2 text-green-600" />
              Phân bố trạng thái
            </h3>
            <Doughnut
              data={{
                labels: ["Hoạt động", "Đã khóa", "Chờ duyệt"],
                datasets: [
                  {
                    data: [stats.active, stats.locked, stats.pending],
                    backgroundColor: [
                      "rgba(34, 197, 94, 0.8)",
                      "rgba(239, 68, 68, 0.8)",
                      "rgba(251, 191, 36, 0.8)",
                    ],
                    borderColor: [
                      "rgb(34, 197, 94)",
                      "rgb(239, 68, 68)",
                      "rgb(251, 191, 36)",
                    ],
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "bottom" as const,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* User Statistics Chart */}
        <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <FaUsers className="mr-2 text-blue-600" />
            Thống kê người dùng theo tháng
          </h3>
          <Bar
            data={{
              labels: chartData.labels,
              datasets: [
                {
                  label: "Người dùng mới",
                  data: chartData.newUsers,
                  backgroundColor: "rgba(59, 130, 246, 0.8)",
                  borderColor: "rgb(59, 130, 246)",
                  borderWidth: 1,
                },
                {
                  label: "Tham gia sự kiện",
                  data: chartData.usersJoinedEvents,
                  backgroundColor: "rgba(147, 51, 234, 0.8)",
                  borderColor: "rgb(147, 51, 234)",
                  borderWidth: 1,
                },
                {
                  label: "Người dùng bị ban",
                  data: chartData.usersBanned,
                  backgroundColor: "rgba(239, 68, 68, 0.8)",
                  borderColor: "rgb(239, 68, 68)",
                  borderWidth: 1,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: "top" as const,
                },
                tooltip: {
                  callbacks: {
                    label: function (context) {
                      let label = context.dataset.label || "";
                      if (label) {
                        label += ": ";
                      }
                      if (context.parsed.y !== null) {
                        label += context.parsed.y + " người";
                      }
                      return label;
                    },
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                  },
                },
              },
            }}
          />
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
                className="w-full pl-12 pr-12 py-3.5 text-base text-gray-900 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-200 focus:border-blue-400 transition duration-200 placeholder:text-gray-400"
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
              <label className=" text-base font-semibold text-gray-700 mb-3 flex items-center">
                <FaFilter className="mr-2 text-green-500" />
                Trạng thái
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 text-base text-gray-900 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-green-200 focus:border-green-400 transition duration-200 bg-white cursor-pointer"
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
              {selectedUsers.length > 0 && (
                <span className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-medium animate-pulse">
                  Đã chọn: {selectedUsers.length}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {/* Bulk Actions */}
              {selectedUsers.length > 0 && (
                <div className="flex items-center space-x-2 mr-4 border-r border-gray-300 pr-4">
                  <span className="text-sm font-medium text-gray-700">
                    Thao tác hàng loạt:
                  </span>
                  <button
                    onClick={() => {
                      setConfirmAction({ type: "bulk-lock" });
                      setShowConfirmModal(true);
                    }}
                    className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition duration-200 flex items-center space-x-1"
                  >
                    <FaLock className="text-xs" />
                    <span>Khóa ({selectedUsers.length})</span>
                  </button>
                  <button
                    onClick={() => {
                      setConfirmAction({ type: "bulk-unlock" });
                      setShowConfirmModal(true);
                    }}
                    className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition duration-200 flex items-center space-x-1"
                  >
                    <FaUnlock className="text-xs" />
                    <span>Mở khóa ({selectedUsers.length})</span>
                  </button>
                  <button
                    onClick={() => {
                      setConfirmAction({ type: "bulk-delete" });
                      setShowConfirmModal(true);
                    }}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition duration-200 flex items-center space-x-1"
                  >
                    <FaTrash className="text-xs" />
                    <span>Xóa ({selectedUsers.length})</span>
                  </button>
                </div>
              )}
              <label className="text-base text-gray-700 font-medium">
                Hiển thị:
              </label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer bg-white"
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
                  <th className="px-6 py-4 text-center text-base font-bold text-blue-900">
                    <input
                      type="checkbox"
                      checked={
                        selectedUsers.length === paginatedUsers.length &&
                        paginatedUsers.length > 0
                      }
                      onChange={handleSelectAll}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    />
                  </th>
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
                      className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition duration-200 ${
                        selectedUsers.includes(user.id)
                          ? "bg-blue-50 border-l-4 border-blue-500"
                          : ""
                      }`}
                    >
                      <td className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => handleSelectUser(user.id)}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
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
                  {filterStatus !== "all" && (
                    <p className="text-sm text-blue-700">
                      Trạng thái: {filterStatus}
                    </p>
                  )}
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

      {/* Send Notification Modal - Redesigned */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl transform transition-all my-8 max-h-[95vh] flex flex-col">
            {/* Modal Header - Fixed */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 text-white p-6 rounded-t-3xl flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl shadow-lg">
                    <FaBell className="text-3xl animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">
                      Gửi Thông Báo
                    </h3>
                    <p className="text-purple-100 text-sm mt-1 flex items-center space-x-2">
                      <span>📊 {stats.total} người dùng</span>
                      <span>•</span>
                      <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-semibold">
                        {notificationMode === "webpush"
                          ? "🔔 Web Push"
                          : "📱 In-App"}
                      </span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowNotificationModal(false);
                    setNotificationForm({
                      title: "",
                      message: "",
                      type: "announcement",
                      url: "",
                    });
                  }}
                  disabled={isSendingNotification}
                  className="text-white hover:bg-white/20 p-2.5 rounded-xl transition duration-200 disabled:opacity-50 hover:rotate-90 transform"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              {/* Mode Tabs */}
              <div className="mt-6 flex space-x-2 bg-white/10 backdrop-blur-sm p-1.5 rounded-xl">
                <button
                  onClick={() => setNotificationMode("webpush")}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center space-x-2 ${
                    notificationMode === "webpush"
                      ? "bg-white text-purple-600 shadow-lg"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <FaBell
                    className={
                      notificationMode === "webpush" ? "animate-bounce" : ""
                    }
                  />
                  <span>Web Push API</span>
                  <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                    Đã đăng ký
                  </span>
                </button>
                <button
                  onClick={() => setNotificationMode("inapp")}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-300 flex items-center justify-center space-x-2 ${
                    notificationMode === "inapp"
                      ? "bg-white text-purple-600 shadow-lg"
                      : "text-white hover:bg-white/10"
                  }`}
                >
                  <FaInfoCircle
                    className={
                      notificationMode === "inapp" ? "animate-bounce" : ""
                    }
                  />
                  <span>In-App (Tất cả Users)</span>
                </button>
              </div>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Info Banner */}
              <div
                className={`border-l-4 p-4 rounded-xl shadow-sm ${
                  notificationMode === "webpush"
                    ? "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-500"
                    : "bg-gradient-to-r from-green-50 to-emerald-50 border-green-500"
                }`}
              >
                <div className="flex items-start space-x-3">
                  {notificationMode === "webpush" ? (
                    <FaBell className="text-blue-600 text-2xl flex-shrink-0 mt-0.5 animate-pulse" />
                  ) : (
                    <FaInfoCircle className="text-green-600 text-2xl flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p
                      className={`font-bold mb-2 flex items-center space-x-2 ${
                        notificationMode === "webpush"
                          ? "text-blue-900"
                          : "text-green-900"
                      }`}
                    >
                      <span>
                        {notificationMode === "webpush"
                          ? "🔔 Web Push Notification"
                          : "📱 In-App Notification"}
                      </span>
                    </p>
                    {notificationMode === "webpush" ? (
                      <ul className="text-blue-800 text-sm space-y-1.5">
                        <li className="flex items-start">
                          <span className="mr-2">✅</span>
                          <span>
                            Gửi đến <strong>users đã đăng ký Web Push</strong>{" "}
                            (browser notification)
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">🌐</span>
                          <span>
                            Hiển thị ngay cả khi user{" "}
                            <strong>không online</strong> trên website
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">📲</span>
                          <span>
                            Thông báo xuất hiện trên{" "}
                            <strong>desktop/mobile browser</strong>
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">⚡</span>
                          <span>
                            Endpoint:{" "}
                            <code className="bg-blue-200 px-1.5 py-0.5 rounded text-xs">
                              /api/notifications/send-test
                            </code>
                          </span>
                        </li>
                      </ul>
                    ) : (
                      <ul className="text-green-800 text-sm space-y-1.5">
                        <li className="flex items-start">
                          <span className="mr-2">✅</span>
                          <span>
                            Gửi đến <strong>TẤT CẢ {stats.total} users</strong>{" "}
                            trong hệ thống
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">💾</span>
                          <span>
                            Lưu vào database, user xem trong{" "}
                            <strong>trang notifications</strong>
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">🔔</span>
                          <span>
                            Users có Web Push cũng nhận{" "}
                            <strong>push notification</strong>
                          </span>
                        </li>
                        <li className="flex items-start">
                          <span className="mr-2">⚡</span>
                          <span>
                            Endpoint:{" "}
                            <code className="bg-green-200 px-1.5 py-0.5 rounded text-xs">
                              /api/notifications/send-to-all
                            </code>
                          </span>
                        </li>
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Notification Type */}
              <div>
                <label className="text-base font-bold text-gray-800 mb-3 flex items-center space-x-2">
                  <span>📋</span>
                  <span>Loại thông báo</span>
                </label>
                <select
                  value={notificationForm.type}
                  onChange={(e) =>
                    setNotificationForm({
                      ...notificationForm,
                      type: e.target.value,
                    })
                  }
                  disabled={isSendingNotification}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition duration-200 text-base text-gray-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:border-gray-300"
                >
                  <option value="announcement">📢 Thông báo chung</option>
                  <option value="event_update">📅 Cập nhật sự kiện</option>
                  <option value="system">⚙️ Thông báo hệ thống</option>
                  <option value="important">⚠️ Thông báo quan trọng</option>
                  <option value="reminder">🔔 Nhắc nhở</option>
                </select>
              </div>

              {/* Title Input */}
              <div>
                <label className=" text-base font-bold text-gray-800 mb-3 flex items-center space-x-2">
                  <span>✏️</span>
                  <span>Tiêu đề thông báo</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={notificationForm.title}
                  onChange={(e) =>
                    setNotificationForm({
                      ...notificationForm,
                      title: e.target.value,
                    })
                  }
                  disabled={isSendingNotification}
                  placeholder="Ví dụ: 🎉 Thông báo bảo trì hệ thống"
                  maxLength={100}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition duration-200 text-base text-gray-900 placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed font-medium bg-white hover:border-gray-300"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500 flex items-center space-x-1">
                    <span>💡</span>
                    <span>Tiêu đề ngắn gọn, thu hút sự chú ý</span>
                  </p>
                  <p
                    className={`text-sm font-semibold ${
                      notificationForm.title.length > 80
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {notificationForm.title.length}/100
                  </p>
                </div>
              </div>

              {/* URL Input (Web Push only) */}
              {notificationMode === "webpush" && (
                <div>
                  <label className=" text-base font-bold text-gray-800 mb-3 flex items-center space-x-2">
                    <span>🔗</span>
                    <span>URL đích (khi click notification)</span>
                  </label>
                  <input
                    type="text"
                    value={notificationForm.url}
                    onChange={(e) =>
                      setNotificationForm({
                        ...notificationForm,
                        url: e.target.value,
                      })
                    }
                    disabled={isSendingNotification}
                    placeholder="/notifications, /events/123, https://..."
                    className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition duration-200 text-base text-gray-900 placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed font-mono bg-white hover:border-gray-300"
                  />
                  <p className="text-sm text-gray-500 mt-2 flex items-center space-x-1">
                    <span>ℹ️</span>
                    <span>
                      Để trống sẽ mặc định là{" "}
                      <code className="bg-gray-100 px-1.5 py-0.5 rounded">
                        /notifications
                      </code>
                    </span>
                  </p>
                </div>
              )}

              {/* Message Textarea */}
              <div>
                <label className=" text-base font-bold text-gray-800 mb-3 flex items-center space-x-2">
                  <span>�</span>
                  <span>Nội dung thông báo</span>
                  <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={notificationForm.message}
                  onChange={(e) =>
                    setNotificationForm({
                      ...notificationForm,
                      message: e.target.value,
                    })
                  }
                  disabled={isSendingNotification}
                  placeholder="Nhập nội dung chi tiết, rõ ràng và súc tích..."
                  rows={6}
                  maxLength={500}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-purple-500 transition duration-200 text-base text-gray-900 placeholder:text-gray-400 resize-none disabled:opacity-50 disabled:cursor-not-allowed leading-relaxed bg-white hover:border-gray-300"
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-gray-500 flex items-center space-x-1">
                    <span>📝</span>
                    <span>Nội dung rõ ràng, chính xác</span>
                  </p>
                  <p
                    className={`text-sm font-semibold ${
                      notificationForm.message.length > 400
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {notificationForm.message.length}/500
                  </p>
                </div>
              </div>

              {/* Live Preview */}
              {(notificationForm.title || notificationForm.message) && (
                <div className="bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 rounded-2xl p-6 border-2 border-purple-200 shadow-inner">
                  <p className="text-sm font-bold text-purple-700 mb-4 flex items-center space-x-2">
                    <FaEye className="text-lg" />
                    <span>👁️ Xem trước thông báo</span>
                  </p>
                  <div className="bg-white rounded-xl p-5 shadow-lg border border-gray-200">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 rounded-lg">
                        <FaBell className="text-white text-lg" />
                      </div>
                      <div className="flex-1 min-w-0">
                        {notificationForm.title && (
                          <h4 className="font-bold text-gray-900 mb-1.5 text-base leading-tight">
                            {notificationForm.title}
                          </h4>
                        )}
                        {notificationForm.message && (
                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                            {notificationForm.message}
                          </p>
                        )}
                        {notificationMode === "webpush" &&
                          notificationForm.url && (
                            <p className="text-xs text-blue-600 mt-2 font-mono">
                              🔗 {notificationForm.url}
                            </p>
                          )}
                        <p className="text-xs text-gray-400 mt-2">
                          ⏰ {new Date().toLocaleTimeString("vi-VN")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer - Fixed */}
            <div className="border-t-2 border-gray-100 p-6 flex justify-end space-x-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-b-3xl flex-shrink-0">
              <button
                onClick={() => {
                  setShowNotificationModal(false);
                  setNotificationForm({
                    title: "",
                    message: "",
                    type: "announcement",
                    url: "",
                  });
                }}
                disabled={isSendingNotification}
                className="px-6 py-3.5 text-base bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-gray-200 hover:border-gray-300 shadow-sm"
              >
                ❌ Hủy bỏ
              </button>
              <button
                onClick={handleSendNotification}
                disabled={
                  isSendingNotification ||
                  !notificationForm.title.trim() ||
                  !notificationForm.message.trim()
                }
                className="px-8 py-3.5 text-base bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 hover:from-purple-700 hover:via-pink-600 hover:to-rose-600 text-white rounded-xl font-bold transition duration-200 flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                {isSendingNotification ? (
                  <>
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <>
                    <FaPaperPlane className="text-lg" />
                    <span>
                      {notificationMode === "webpush"
                        ? "🔔 Gửi Web Push"
                        : `📱 Gửi đến ${stats.total} users`}
                    </span>
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

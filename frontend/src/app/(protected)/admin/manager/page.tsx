"use client";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { authFetch } from "@/utils/auth";
import Image from "next/image";
import { useRouter } from "next/dist/client/components/navigation";

import {
  FaUsers,
  FaSearch,
  FaFilter,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaDownload,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaTimes,
  FaCheckCircle,
  FaBan,
  FaCalendarAlt,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaUserShield,
  FaChartLine,
  FaCalendarCheck,
  FaSave,
  FaCheckSquare,
  FaSquare,
  FaFileCsv,
  FaFileCode,
  FaClock,
  FaHistory,
} from "react-icons/fa";

// Types
interface Manager {
  id: number;
  username: string;
  email: string;
  phone: string;
  image: string;
  status: string;
  address: string;
  role: string;
  created_at: string;
  eventsCreated?: number;
  eventsManaged?: number;
  totalInteractions?: number;
}

interface Toast {
  id: number;
  type: "success" | "error" | "info";
  message: string;
}

type SortField =
  | "username"
  | "eventsCreated"
  | "totalInteractions"
  | "eventsManaged";
type SortOrder = "asc" | "desc";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ManagerManagement() {
  const { user: currentUser, isLoading: authLoading, hasRole } = useAuth();
  const router = useRouter();

  // Role check: only allow admin
  useEffect(() => {
    if (!authLoading) {
      if (!hasRole("admin")) {
        // Redirect to unauthorized page
        router.push("/unauthorized");
      }
    }
  }, [authLoading, hasRole, router]);

  // State
  const [managers, setManagers] = useState<Manager[]>([]);

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [eventsRange, setEventsRange] = useState([0, 100]);
  const [sortField, setSortField] = useState<SortField>("username");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedManagers, setSelectedManagers] = useState<number[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [editingManager, setEditingManager] = useState<Manager | null>(null);
  const [newManager, setNewManager] = useState<any>({
    username: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    address_card: "",
    image: "",
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [headerCompact, setHeaderCompact] = useState(false);

  const token = localStorage.getItem("jwt_token");
  // Fetch managers from API
  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    setIsLoading(true);
    try {
      const response = await authFetch(`/admin/getAllManagers`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch managers");
      }

      const data = await response.json();
      setManagers(data.users || data || []);
    } catch (error) {
      console.error("Error fetching managers:", error);
      showToast("error", "Không thể tải danh sách manager");
    } finally {
      setIsLoading(false);
    }
  };
  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Check mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Shrink/hide header on scroll: when user scrolls down make header compact so
  // it can be covered by a higher-z navbar. This is a simple, conservative
  // behavior that reduces title size and padding.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      setHeaderCompact(y > 80);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Toast notifications
  const showToast = (type: "success" | "error" | "info", message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Filter and sort
  const filteredAndSortedManagers = useMemo(() => {
    let filtered = managers.filter((manager) => {
      const matchesSearch =
        manager.username
          ?.toLowerCase()
          .includes(debouncedSearch.toLowerCase()) ||
        manager.email?.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || manager.status === filterStatus;
      const matchesEvents =
        (manager.eventsCreated || 0) >= eventsRange[0] &&
        (manager.eventsCreated || 0) <= eventsRange[1];
      return matchesSearch && matchesStatus && matchesEvents;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      // Handle undefined values
      if (aValue === undefined) aValue = 0;
      if (bValue === undefined) bValue = 0;

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [
    managers,
    debouncedSearch,
    filterStatus,
    eventsRange,
    sortField,
    sortOrder,
  ]);

  // Pagination
  const paginatedManagers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredAndSortedManagers.slice(start, end);
  }, [filteredAndSortedManagers, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedManagers.length / itemsPerPage);

  // Stats
  const stats = {
    total: managers.length,
    active: managers.filter((m) => m.status === "active").length,
    locked: managers.filter((m) => m.status === "locked").length,
    pending: managers.filter((m) => m.status === "pending").length,
    totalEvents: managers.reduce((sum, m) => sum + (m.eventsCreated || 0), 0),
    totalInteractions: managers.reduce(
      (sum, m) => sum + (m.totalInteractions || 0),
      0
    ),
  };

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleSelectAll = () => {
    if (selectedManagers.length === paginatedManagers.length) {
      setSelectedManagers([]);
    } else {
      setSelectedManagers(paginatedManagers.map((m) => m.id));
    }
  };

  const handleSelectManager = (id: number) => {
    setSelectedManagers((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    );
  };

  const handleViewDetails = (manager: Manager) => {
    setSelectedManager(manager);
    setShowDetailModal(true);
  };

  const handleEdit = (manager: Manager) => {
    setEditingManager({ ...manager });
    setShowEditModal(true);
  };

  const handleDelete = (id: number) => {
    setSelectedManager(managers.find((m) => m.id === id) || null);
    setShowDeleteConfirm(true);
  };

  const handleBulkDelete = () => {
    if (selectedManagers.length === 0) {
      showToast("error", "Vui lòng chọn ít nhất một manager");
      return;
    }
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      if (selectedManager) {
        // Delete single manager
        const response = await authFetch(
          `/admin/deleteUser/${selectedManager.id}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) throw new Error("Failed to delete manager");

        setManagers(managers.filter((m) => m.id !== selectedManager.id));
        showToast("success", `Đã xóa manager ${selectedManager.username}`);
      } else {
        // Bulk delete
        const deletePromises = selectedManagers.map((id) =>
          authFetch(`/admin/deleteUser/${id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })
        );

        await Promise.all(deletePromises);
        setManagers(managers.filter((m) => !selectedManagers.includes(m.id)));
        showToast("success", `Đã xóa ${selectedManagers.length} manager`);
        setSelectedManagers([]);
      }
    } catch (error) {
      console.error("Error deleting manager:", error);
      showToast("error", "Không thể xóa manager");
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setSelectedManager(null);
    }
  };

  const handleCreateManager = async () => {
    if (!newManager.username || !newManager.email || !newManager.password) {
      showToast("error", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    setIsLoading(true);
    try {
      // Use authFetch so it attaches tokens/handles refresh
      const response = await authFetch(`/admin/createManager`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: newManager.username,
          email: newManager.email,
          password: newManager.password,
          phone: newManager.phone || null,
          address: newManager.address || null,
          address_card: newManager.address_card || null,
          image: newManager.image || null,
        }),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        throw new Error("Failed to create manager: " + errText);
      }

      const data = await response.json();
      const createdManager = data.user || data;

      setManagers([...managers, createdManager]);
      setShowCreateModal(false);
      setNewManager({ username: "", email: "", phone: "", address: "" });
      showToast(
        "success",
        `Đã tạo manager ${createdManager.username} thành công!`
      );
    } catch (error) {
      console.error("Error creating manager:", error);
      showToast("error", "Không thể tạo manager");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingManager) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/admin/users/${editingManager.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editingManager),
        }
      );

      if (!response.ok) throw new Error("Failed to update manager");

      const data = await response.json();
      const updatedManager = data.user || data;

      setManagers(
        managers.map((m) => (m.id === updatedManager.id ? updatedManager : m))
      );
      setShowEditModal(false);
      setEditingManager(null);
      showToast("success", "Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Error updating manager:", error);
      showToast("error", "Không thể cập nhật thông tin");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = (format: "csv" | "json") => {
    setIsLoading(true);
    setTimeout(() => {
      const dataToExport = filteredAndSortedManagers.map((m) => ({
        Tên: m.username || "",
        Email: m.email || "",
        "Số điện thoại": m.phone || "",
        "Trạng thái": m.status || "",
        "Sự kiện tạo": m.eventsCreated || 0,
        "Sự kiện quản lý": m.eventsManaged || 0,
        "Tương tác": m.totalInteractions || 0,
        "Ngày tạo": m.created_at || "",
        "Địa chỉ": m.address || "",
      }));

      if (format === "csv") {
        const csv = [
          Object.keys(dataToExport[0]).join(","),
          ...dataToExport.map((row) => Object.values(row).join(",")),
        ].join("\n");
        const blob = new Blob(["\uFEFF" + csv], {
          type: "text/csv;charset=utf-8;",
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `managers_${new Date().toISOString()}.csv`;
        link.click();
      } else {
        const json = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `managers_${new Date().toISOString()}.json`;
        link.click();
      }

      setIsLoading(false);
      setShowExportModal(false);
      showToast(
        "success",
        `Đã xuất ${dataToExport.length} manager sang ${format.toUpperCase()}!`
      );
    }, 1000);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <FaSort className="text-gray-400" />;
    return sortOrder === "asc" ? (
      <FaSortUp className="text-blue-600" />
    ) : (
      <FaSortDown className="text-blue-600" />
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
        </div>
      )} */}

      {/* Header */}
      <div className="bg-white border-b border-blue-100 shadow-sm transition-all duration-300 z-20">
        <div
          className={`max-w-7xl mx-auto px-6 ${
            headerCompact ? "py-1" : "py-4"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1
                className={`font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent flex items-center ${
                  headerCompact ? "text-lg sm:text-xl" : "text-2xl sm:text-3xl"
                }`}
              >
                <FaUserShield className="mr-3 text-blue-600" />
                Quản lý Manager
              </h1>
              <p
                className={`text-blue-700 mt-2 ${
                  headerCompact ? "text-xs" : "text-sm sm:text-base"
                }`}
              >
                Quản lý tài khoản manager
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
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition duration-200 shadow-md hover:shadow-lg text-base font-medium"
              >
                <FaPlus className="text-lg" />
                <span>Thêm Manager</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5 mb-8">
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
          <div className="bg-white rounded-xl p-5 border-l-4 border-purple-500 shadow-md hover:shadow-lg transition duration-200">
            <p className="text-sm sm:text-base text-gray-600 mb-1">Sự kiện</p>
            <p className="text-2xl sm:text-3xl font-bold text-purple-700">
              {stats.totalEvents}
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 border-l-4 border-pink-500 shadow-md hover:shadow-lg transition duration-200">
            <p className="text-sm sm:text-base text-gray-600 mb-1">Tương tác</p>
            <p className="text-2xl sm:text-3xl font-bold text-pink-700">
              {stats.totalInteractions}
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6 mb-6 space-y-5">
          {/* Search Bar */}
          <div className="relative">
            <label className="block text-base font-semibold text-gray-700 mb-3">
              🔍 Tìm kiếm manager
            </label>
            <div className="relative">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Tìm theo tên, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 text-base text-black border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-200 focus:border-blue-400 transition duration-200 placeholder:text-gray-400"
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Status Filter */}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-3 flex items-center">
                <FaFilter className="mr-2 text-green-500" />
                Trạng thái
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 text-base text-black border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-3 focus:ring-green-200 focus:border-green-400 transition duration-200 bg-white cursor-pointer"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">✅ Hoạt động</option>
                <option value="locked">🔒 Đã khóa</option>
                <option value="pending">⏳ Chờ duyệt</option>
              </select>
            </div>

            {/* Events Range */}
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-3 flex items-center">
                <FaFilter className="mr-2 text-blue-500" />
                Số sự kiện: {eventsRange[0]} - {eventsRange[1]}
              </label>
              <div className="flex items-center space-x-3 pt-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={eventsRange[0]}
                  onChange={(e) =>
                    setEventsRange([parseInt(e.target.value), eventsRange[1]])
                  }
                  className="flex-1 h-2.5 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg appearance-none cursor-pointer"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={eventsRange[1]}
                  onChange={(e) =>
                    setEventsRange([eventsRange[0], parseInt(e.target.value)])
                  }
                  className="flex-1 h-2.5 bg-gradient-to-r from-purple-200 to-blue-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Filter Info & Actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-gray-200">
            <div className="text-base text-gray-700">
              Hiển thị{" "}
              <span className="font-bold text-blue-600">
                {paginatedManagers.length}
              </span>{" "}
              / <span className="font-bold">{managers.length}</span> manager
            </div>
            <div className="flex items-center space-x-3">
              {selectedManagers.length > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition duration-200 text-base font-medium"
                >
                  <FaTrash />
                  <span>Xóa ({selectedManagers.length})</span>
                </button>
              )}
              {(searchTerm ||
                filterStatus !== "all" ||
                eventsRange[0] > 0 ||
                eventsRange[1] < 100) && (
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("all");
                    setEventsRange([0, 100]);
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition duration-200 text-base"
                >
                  <span>🔄</span>
                  <span>Đặt lại</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md border border-blue-100 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-blue-50 to-green-50 px-6 py-4 border-b border-blue-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-bold text-gray-800">
                Danh sách Manager
              </h3>
              <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium">
                {paginatedManagers.length} người
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
                className="px-4 py-2 border-2 border-gray-200 rounded-lg text-base text-black focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer bg-white"
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
                  <th className="px-6 py-4 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedManagers.length === paginatedManagers.length &&
                        paginatedManagers.length > 0
                      }
                      onChange={handleSelectAll}
                      className="w-5 h-5 cursor-pointer"
                    />
                  </th>
                  <th
                    className="px-6 py-4 text-left text-base font-bold text-blue-900 cursor-pointer hover:bg-blue-200 transition"
                    onClick={() => handleSort("username")}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Manager</span>
                      {getSortIcon("username")}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-base font-bold text-blue-900">
                    Trạng thái
                  </th>
                  <th
                    className="px-6 py-4 text-left text-base font-bold text-blue-900 cursor-pointer hover:bg-blue-200 transition"
                    onClick={() => handleSort("eventsCreated")}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Sự kiện</span>
                      {getSortIcon("eventsCreated")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-left text-base font-bold text-blue-900 cursor-pointer hover:bg-blue-200 transition"
                    onClick={() => handleSort("totalInteractions")}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Tương tác</span>
                      {getSortIcon("totalInteractions")}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center text-base font-bold text-blue-900">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedManagers.map((manager) => (
                  <tr
                    key={manager.id}
                    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition duration-200"
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedManagers.includes(manager.id)}
                        onChange={() => handleSelectManager(manager.id)}
                        className="w-5 h-5 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <Image
                          src={
                            manager.image || "https://i.pravatar.cc/150?img=1"
                          }
                          alt={manager.username}
                          width={56}
                          height={56}
                          className="rounded-full ring-2 ring-blue-200 shadow-sm"
                          unoptimized
                        />
                        <div>
                          <p className="font-bold text-gray-900 text-base">
                            {manager.username}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <FaEnvelope className="mr-1.5 text-blue-500" />
                            {manager.email}
                          </p>
                          <p className="text-sm text-gray-600 flex items-center mt-0.5">
                            <FaPhone className="mr-1.5 text-green-500" />
                            {manager.phone || "Chưa cập nhật"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {manager.status === "active" ? (
                        <span className="inline-flex items-center px-4 py-2 rounded-xl text-base font-semibold bg-green-100 text-green-700 shadow-sm">
                          <FaCheckCircle className="mr-2 text-lg" />
                          Hoạt động
                        </span>
                      ) : manager.status === "locked" ? (
                        <span className="inline-flex items-center px-4 py-2 rounded-xl text-base font-semibold bg-red-100 text-red-700 shadow-sm">
                          <FaBan className="mr-2 text-lg" />
                          Đã khóa
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-4 py-2 rounded-xl text-base font-semibold bg-yellow-100 text-yellow-700 shadow-sm">
                          <FaClock className="mr-2 text-lg" />
                          Chờ duyệt
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm space-y-1">
                        <p className="text-blue-700 font-semibold flex items-center">
                          <FaCalendarCheck className="mr-1.5" />
                          {manager.eventsCreated} tạo
                        </p>
                        <p className="text-green-700 font-semibold flex items-center">
                          <FaCalendarAlt className="mr-1.5" />
                          {manager.eventsManaged} quản lý
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-pink-700">
                          {manager.totalInteractions}
                        </p>
                        <p className="text-xs text-gray-500">lượt</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(manager)}
                          className="p-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition duration-200 hover:scale-105"
                          title="Xem chi tiết"
                        >
                          <FaEye className="text-lg" />
                        </button>
                        <button
                          onClick={() => handleEdit(manager)}
                          className="p-2.5 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition duration-200 hover:scale-105"
                          title="Chỉnh sửa"
                        >
                          <FaEdit className="text-lg" />
                        </button>
                        <button
                          onClick={() => handleDelete(manager.id)}
                          className="p-2.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition duration-200 hover:scale-105"
                          title="Xóa"
                        >
                          <FaTrash className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Trang {currentPage} / {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg transition duration-200 ${
                        currentPage === page
                          ? "bg-blue-500 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notifications */}
      <div className="fixed top-20 right-4 z-50 space-y-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-6 py-4 rounded-xl shadow-lg border-2 text-base font-medium flex items-center space-x-3 animate-slide-in ${
              toast.type === "success"
                ? "bg-green-50 border-green-500 text-green-800"
                : toast.type === "error"
                ? "bg-red-50 border-red-500 text-red-800"
                : "bg-blue-50 border-blue-500 text-blue-800"
            }`}
          >
            {toast.type === "success" ? (
              <FaCheckCircle className="text-2xl" />
            ) : toast.type === "error" ? (
              <FaBan className="text-2xl" />
            ) : (
              <FaHistory className="text-2xl" />
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-green-600 text-white p-6 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-2xl font-bold flex items-center">
                <FaUserShield className="mr-3 text-3xl" />
                Chi tiết Manager
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-white hover:bg-white hover:text-blue-600 p-2 rounded-lg transition duration-200 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Manager Info */}
              <div className="flex items-start space-x-6 pb-6 border-b border-gray-200">
                <Image
                  src={
                    selectedManager.image || "https://i.pravatar.cc/150?img=1"
                  }
                  alt={selectedManager.username}
                  width={120}
                  height={120}
                  className="rounded-full ring-4 ring-blue-200 shadow-lg"
                  unoptimized
                />
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedManager.username}
                  </h3>
                  <div className="space-y-2 text-base">
                    <p className="flex items-center text-gray-700">
                      <FaEnvelope className="mr-3 text-blue-500 text-lg" />
                      {selectedManager.email}
                    </p>
                    <p className="flex items-center text-gray-700">
                      <FaPhone className="mr-3 text-green-500 text-lg" />
                      {selectedManager.phone || "Chưa cập nhật"}
                    </p>
                    <p className="flex items-center text-gray-700">
                      <FaMapMarkerAlt className="mr-3 text-red-500 text-lg" />
                      {selectedManager.address || "Chưa cập nhật"}
                    </p>
                    <p className="flex items-center text-gray-700">
                      <FaCalendarAlt className="mr-3 text-purple-500 text-lg" />
                      Tạo:{" "}
                      {new Date(selectedManager.created_at).toLocaleDateString(
                        "vi-VN"
                      )}
                    </p>
                    <p className="flex items-center text-gray-700">
                      <FaClock className="mr-3 text-orange-500 text-lg" />
                      Vai trò: {selectedManager.role}
                    </p>
                  </div>
                  <div className="mt-4">
                    {selectedManager.status === "active" ? (
                      <span className="inline-flex items-center px-5 py-2 rounded-xl text-base font-semibold bg-green-100 text-green-700 shadow-sm">
                        <FaCheckCircle className="mr-2 text-xl" />
                        Hoạt động
                      </span>
                    ) : selectedManager.status === "locked" ? (
                      <span className="inline-flex items-center px-5 py-2 rounded-xl text-base font-semibold bg-red-100 text-red-700 shadow-sm">
                        <FaBan className="mr-2 text-xl" />
                        Đã khóa
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-5 py-2 rounded-xl text-base font-semibold bg-yellow-100 text-yellow-700 shadow-sm">
                        <FaClock className="mr-2 text-xl" />
                        Chờ duyệt
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-l-4 border-blue-500 shadow-md">
                  <p className="text-sm text-gray-600 mb-1">Sự kiện tạo</p>
                  <p className="text-3xl font-bold text-blue-700">
                    {selectedManager.eventsCreated}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border-l-4 border-green-500 shadow-md">
                  <p className="text-sm text-gray-600 mb-1">Sự kiện quản lý</p>
                  <p className="text-3xl font-bold text-green-700">
                    {selectedManager.eventsManaged}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl p-5 border-l-4 border-pink-500 shadow-md">
                  <p className="text-sm text-gray-600 mb-1">Tổng tương tác</p>
                  <p className="text-3xl font-bold text-pink-700">
                    {selectedManager.totalInteractions}
                  </p>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-2xl border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleEdit(selectedManager);
                }}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-xl transition duration-200 text-base font-medium shadow-md hover:shadow-lg"
              >
                ✏️ Chỉnh sửa
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition duration-200 text-base font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-slate-700 text-white p-5 flex items-center justify-between rounded-t-2xl z-20">
              <div>
                <h2 className="text-xl font-semibold flex items-center">
                  <FaPlus className="mr-3 text-2xl" />
                  Tạo tài khoản Manager
                </h2>
                <p className="text-sm opacity-80 mt-1">
                  Vui lòng cung cấp thông tin chính xác để duyệt và quản lý tài
                  khoản.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-white hover:bg-white hover:text-slate-800 p-2 rounded-lg transition duration-200 text-xl font-bold"
                aria-label="Close create manager modal"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Tên đăng nhập <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newManager.username}
                    onChange={(e) =>
                      setNewManager({ ...newManager, username: e.target.value })
                    }
                    placeholder="admin123"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 text-sm bg-slate-50 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newManager.email}
                    onChange={(e) =>
                      setNewManager({ ...newManager, email: e.target.value })
                    }
                    placeholder="email@example.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-200 text-sm bg-slate-50 text-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={(newManager as any).phone || ""}
                    onChange={(e) =>
                      setNewManager({ ...newManager, phone: e.target.value })
                    }
                    placeholder="0901234567"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-base text-black"
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2">
                    CCCD / CMND
                  </label>
                  <input
                    type="text"
                    value={(newManager as any).address_card || ""}
                    onChange={(e) =>
                      setNewManager({
                        ...newManager,
                        address_card: e.target.value,
                      })
                    }
                    placeholder="123456789012"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-base text-black"
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2">
                    Link Avatar
                  </label>
                  <input
                    type="url"
                    value={(newManager as any).image || ""}
                    onChange={(e) =>
                      setNewManager({ ...newManager, image: e.target.value })
                    }
                    placeholder="https://.../avatar.jpg"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-base text-black"
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={(newManager as any).password || ""}
                    onChange={(e) =>
                      setNewManager({ ...newManager, password: e.target.value })
                    }
                    placeholder="Mật khẩu (ít nhất 6 ký tự)"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-base text-black"
                  />
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-2xl border-t border-gray-200">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition duration-200 text-base font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateManager}
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-xl transition duration-200 text-base font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Đang xử lý..." : "Tạo Manager"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editingManager && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-600 to-teal-600 text-white p-6 flex items-center justify-between rounded-t-2xl z-10">
              <h2 className="text-2xl font-bold flex items-center">
                <FaEdit className="mr-3 text-3xl" />
                Chỉnh sửa Manager
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-white hover:bg-white hover:text-green-600 p-2 rounded-lg transition duration-200 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2">
                    Tên đăng nhập
                  </label>
                  <input
                    type="text"
                    value={editingManager.username}
                    onChange={(e) =>
                      setEditingManager({
                        ...editingManager,
                        username: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-base text-black"
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingManager.email}
                    onChange={(e) =>
                      setEditingManager({
                        ...editingManager,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-base text-black"
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={editingManager.phone}
                    onChange={(e) =>
                      setEditingManager({
                        ...editingManager,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-base text-black"
                  />
                </div>

                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-2">
                    Địa chỉ
                  </label>
                  <input
                    type="text"
                    value={editingManager.address}
                    onChange={(e) =>
                      setEditingManager({
                        ...editingManager,
                        address: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-base text-black"
                  />
                </div>
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Trạng thái
                </label>
                <select
                  value={editingManager.status}
                  onChange={(e) =>
                    setEditingManager({
                      ...editingManager,
                      status: e.target.value as "active" | "locked" | "pending",
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-400 text-base text-black cursor-pointer bg-white"
                >
                  <option value="active">✅ Hoạt động</option>
                  <option value="locked">🔒 Đã khóa</option>
                  <option value="pending">⏳ Chờ duyệt</option>
                </select>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-2xl border-t border-gray-200">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition duration-200 text-base font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white rounded-xl transition duration-200 text-base font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Đang lưu..." : "💾 Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold flex items-center">
                <FaDownload className="mr-3 text-3xl" />
                Xuất dữ liệu
              </h2>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-white hover:bg-white hover:text-green-600 p-2 rounded-lg transition duration-200 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              <p className="text-base text-gray-700">
                Xuất{" "}
                <span className="font-bold text-green-600">
                  {filteredAndSortedManagers.length}
                </span>{" "}
                manager sang định dạng:
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => handleExport("csv")}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl transition duration-200 border-2 border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center space-x-3">
                    <FaFileCsv className="text-3xl text-blue-600" />
                    <div className="text-left">
                      <p className="font-bold text-gray-900 text-base">
                        CSV File
                      </p>
                      <p className="text-sm text-gray-600">
                        Excel, Google Sheets
                      </p>
                    </div>
                  </div>
                  <span className="text-2xl">→</span>
                </button>

                <button
                  onClick={() => handleExport("json")}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl transition duration-200 border-2 border-purple-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center space-x-3">
                    <FaFileCode className="text-3xl text-purple-600" />
                    <div className="text-left">
                      <p className="font-bold text-gray-900 text-base">
                        JSON File
                      </p>
                      <p className="text-sm text-gray-600">Developers, APIs</p>
                    </div>
                  </div>
                  <span className="text-2xl">→</span>
                </button>
              </div>

              {isLoading && (
                <div className="flex items-center justify-center space-x-2 text-blue-600">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <span className="text-base font-medium">
                    Đang xuất dữ liệu...
                  </span>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end rounded-b-2xl border-t border-gray-200">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition duration-200 text-base font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold flex items-center">
                <FaTrash className="mr-3 text-3xl" />
                Xác nhận xóa
              </h2>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-white hover:bg-white hover:text-red-600 p-2 rounded-lg transition duration-200 text-2xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <p className="text-base text-gray-700 mb-4">
                {selectedManager
                  ? `Bạn có chắc chắn muốn xóa manager "${selectedManager.username}"?`
                  : `Bạn có chắc chắn muốn xóa ${selectedManagers.length} manager đã chọn?`}
              </p>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                <p className="text-sm text-red-700 font-medium">
                  ⚠️ Hành động này không thể hoàn tác!
                </p>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3 rounded-b-2xl border-t border-gray-200">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl transition duration-200 text-base font-medium"
              >
                Hủy
              </button>
              <button
                onClick={confirmDelete}
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-xl transition duration-200 text-base font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Đang xóa..." : "🗑️ Xóa ngay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

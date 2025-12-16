"use client";
import { authFetch } from "@/utils/auth";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  FaCalendarAlt,
  FaTrophy,
  FaCheckCircle,
  FaClock,
  FaMapMarkerAlt,
  FaUsers,
  FaSearch,
  FaFilter,
  FaStar,
  FaMedal,
  FaAward,
  FaHeart,
  FaTimes,
} from "react-icons/fa";
import Image from "next/image";

interface EventHistory {
  id: number;
  title: string;
  description: string;
  image: string;
  location: string;
  completedAt: string;
  hours: number;
  participants: number;
  status: string;
  organizer: {
    name: string;
    avatar: string;
  };
}

export default function HistoryPage() {
  const [history, setHistory] = useState<EventHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterHours, setFilterHours] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "oldest" | "hours">("recent");
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showHoursDropdown, setShowHoursDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await authFetch("/user/getEventHistory");
        if (response.ok) {
          const data = await response.json();
          setHistory(data.history || []);
        }
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const filteredHistory = history
    .filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase());

      const eventYear = new Date(event.completedAt).getFullYear().toString();
      const matchesYear = filterYear === "all" || eventYear === filterYear;

      const matchesHours =
        filterHours === "all" ||
        (filterHours === "short" && event.hours < 4) ||
        (filterHours === "medium" && event.hours >= 4 && event.hours < 8) ||
        (filterHours === "long" && event.hours >= 8);

      return matchesSearch && matchesYear && matchesHours;
    })
    .sort((a, b) => {
      if (sortBy === "recent") {
        return (
          new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
        );
      } else if (sortBy === "oldest") {
        return (
          new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
        );
      } else {
        return b.hours - a.hours;
      }
    });

  const totalHours = history.reduce((sum, event) => sum + event.hours, 0);
  const totalEvents = history.length;
  const years = Array.from(
    new Set(
      history.map((e) => new Date(e.completedAt).getFullYear().toString())
    )
  )
    .sort()
    .reverse();

  // Get achievement level based on hours
  const getAchievementLevel = () => {
    if (totalHours >= 100)
      return {
        title: "Huyền thoại",
        icon: FaMedal,
        color: "from-yellow-500 to-orange-500",
      };
    if (totalHours >= 50)
      return {
        title: "Chuyên gia",
        icon: FaTrophy,
        color: "from-purple-500 to-pink-500",
      };
    if (totalHours >= 20)
      return {
        title: "Nhiệt tâm",
        icon: FaAward,
        color: "from-blue-500 to-cyan-500",
      };
    return {
      title: "Tân binh",
      icon: FaStar,
      color: "from-green-500 to-emerald-500",
    };
  };

  const achievement = getAchievementLevel();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header with Achievement Badge */}
        <div className="mb-8 bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 mb-3">
                🏆 Lịch Sử Tham Gia
              </h1>
              <p className="text-gray-600 text-lg">
                Hành trình tình nguyện của bạn - Mỗi bước chân đều là dấu ấn ý
                nghĩa
              </p>
            </div>

            {/* Achievement Badge */}
            <div className="flex items-center gap-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-yellow-200">
              <div
                className={`w-20 h-20 bg-gradient-to-br ${achievement.color} rounded-2xl flex items-center justify-center shadow-lg`}
              >
                <achievement.icon className="text-4xl text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">
                  Cấp độ của bạn
                </p>
                <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-orange-600">
                  {achievement.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {totalHours < 20
                    ? `Còn ${20 - totalHours}h nữa để lên hạng`
                    : totalHours < 50
                    ? `Còn ${50 - totalHours}h nữa để lên hạng`
                    : totalHours < 100
                    ? `Còn ${100 - totalHours}h nữa để lên hạng`
                    : "Bạn đã đạt cấp độ cao nhất!"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview - Enhanced */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Sự kiện hoàn thành
                </p>
                <p className="text-4xl font-bold text-green-600">
                  {totalEvents}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  +{totalEvents} sự kiện
                </p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FaCheckCircle className="text-3xl text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Giờ tình nguyện
                </p>
                <p className="text-4xl font-bold text-blue-600">
                  {totalHours}h
                </p>
                <p className="text-xs text-gray-500 mt-2">Thời gian đóng góp</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FaClock className="text-3xl text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Điểm tích lũy
                </p>
                <p className="text-4xl font-bold text-purple-600">
                  {Math.round(totalHours * 10)}
                </p>
                <p className="text-xs text-gray-500 mt-2">Mỗi giờ = 10 điểm</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FaTrophy className="text-3xl text-white" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-pink-500 hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">
                  Tác động xã hội
                </p>
                <p className="text-4xl font-bold text-pink-600">
                  {history.reduce((sum, e) => sum + e.participants, 0)}
                </p>
                <p className="text-xs text-gray-500 mt-2">Người được hỗ trợ</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <FaHeart className="text-3xl text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter Section - Enhanced */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border-2 border-gray-100 p-6 mb-8">
          {/* Search Bar - Full Width */}
          <div className="relative mb-5">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Tìm kiếm sự kiện theo tên hoặc địa điểm..."
              className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all placeholder:text-gray-400 shadow-sm hover:shadow-md"
            />
          </div>

          {/* Filters Row - Custom Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter by Year */}
            <div className="relative">
              <button
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setDropdownPosition({
                    top: rect.bottom + 8,
                    left: rect.left,
                  });
                  setShowYearDropdown(!showYearDropdown);
                  setShowHoursDropdown(false);
                  setShowSortDropdown(false);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-blue-200 rounded-full text-sm font-semibold text-gray-800 hover:border-blue-400 hover:bg-blue-50 transition-all shadow-md hover:shadow-lg"
              >
                {filterYear === "all"
                  ? "📅 Tất cả năm"
                  : `📅 Năm ${filterYear}`}
                <svg
                  className={`w-4 h-4 transition-transform ${
                    showYearDropdown ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>

            {/* Filter by Hours */}
            <div className="relative">
              <button
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setDropdownPosition({
                    top: rect.bottom + 8,
                    left: rect.left,
                  });
                  setShowHoursDropdown(!showHoursDropdown);
                  setShowYearDropdown(false);
                  setShowSortDropdown(false);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-purple-200 rounded-full text-sm font-semibold text-gray-800 hover:border-purple-400 hover:bg-purple-50 transition-all shadow-md hover:shadow-lg"
              >
                {filterHours === "all"
                  ? "⏱️ Tất cả thời lượng"
                  : filterHours === "short"
                  ? "⏱️ < 4 giờ"
                  : filterHours === "medium"
                  ? "⏱️ 4-8 giờ"
                  : "⏱️ ≥ 8 giờ"}
                <svg
                  className={`w-4 h-4 transition-transform ${
                    showHoursDropdown ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setDropdownPosition({
                    top: rect.bottom + 8,
                    left: rect.left,
                  });
                  setShowSortDropdown(!showSortDropdown);
                  setShowYearDropdown(false);
                  setShowHoursDropdown(false);
                }}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border-2 border-green-200 rounded-full text-sm font-semibold text-gray-800 hover:border-green-400 hover:bg-green-50 transition-all shadow-md hover:shadow-lg"
              >
                {sortBy === "recent"
                  ? "🔄 Mới nhất trước"
                  : sortBy === "oldest"
                  ? "🔄 Cũ nhất trước"
                  : "🔄 Nhiều giờ nhất"}
                <svg
                  className={`w-4 h-4 transition-transform ${
                    showSortDropdown ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            </div>

            {/* Clear Filters Button */}
            {(searchQuery || filterYear !== "all" || filterHours !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterYear("all");
                  setFilterHours("all");
                }}
                className="px-5 py-2.5 bg-gradient-to-r from-red-50 to-red-100 text-red-600 hover:from-red-100 hover:to-red-200 rounded-full text-sm font-semibold transition-all flex items-center gap-2 shadow-md hover:shadow-lg border-2 border-red-200"
              >
                <FaTimes />
                Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Active Filters Display */}
          {(searchQuery || filterYear !== "all" || filterHours !== "all") && (
            <div className="mt-4 pt-4 border-t-2 border-gray-100 flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-600 flex items-center gap-1">
                <FaFilter className="text-xs" />
                Đang lọc:
              </span>
              {searchQuery && (
                <span className="px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm border border-green-200">
                  🔍 "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-1 hover:text-green-900 w-4 h-4 bg-green-200 rounded-full flex items-center justify-center hover:bg-green-300 transition-all text-xs"
                  >
                    ✕
                  </button>
                </span>
              )}
              {filterYear !== "all" && (
                <span className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm border border-blue-200">
                  📅 {filterYear}
                  <button
                    onClick={() => setFilterYear("all")}
                    className="ml-1 hover:text-blue-900 w-4 h-4 bg-blue-200 rounded-full flex items-center justify-center hover:bg-blue-300 transition-all text-xs"
                  >
                    ✕
                  </button>
                </span>
              )}
              {filterHours !== "all" && (
                <span className="px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm border border-purple-200">
                  ⏱️{" "}
                  {filterHours === "short"
                    ? "< 4h"
                    : filterHours === "medium"
                    ? "4-8h"
                    : "≥ 8h"}
                  <button
                    onClick={() => setFilterHours("all")}
                    className="ml-1 hover:text-purple-900 w-4 h-4 bg-purple-200 rounded-full flex items-center justify-center hover:bg-purple-300 transition-all text-xs"
                  >
                    ✕
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Event History List */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mb-4"></div>
            <p className="text-gray-600 text-lg font-medium">
              Đang tải lịch sử của bạn...
            </p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-xl p-16 text-center">
            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <FaCalendarAlt className="text-6xl text-gray-400" />
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-3">
              {searchQuery || filterYear !== "all" || filterHours !== "all"
                ? "Không tìm thấy kết quả"
                : "Chưa có lịch sử"}
            </h3>
            <p className="text-gray-600 text-lg mb-6">
              {searchQuery || filterYear !== "all" || filterHours !== "all"
                ? "Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc"
                : "Bạn chưa hoàn thành sự kiện nào. Hãy tham gia các sự kiện để tạo lịch sử ý nghĩa!"}
            </p>
            {(searchQuery || filterYear !== "all" || filterHours !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterYear("all");
                  setFilterHours("all");
                }}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600">
                Hiển thị{" "}
                <span className="font-bold text-green-600">
                  {filteredHistory.length}
                </span>{" "}
                sự kiện
              </p>
              <p className="text-sm text-gray-500">
                Sắp xếp theo:{" "}
                <span className="font-semibold">
                  {sortBy === "recent"
                    ? "Mới nhất"
                    : sortBy === "oldest"
                    ? "Cũ nhất"
                    : "Nhiều giờ nhất"}
                </span>
              </p>
            </div>

            <div className="space-y-6">
              {filteredHistory.map((event, index) => (
                <div
                  key={event.id}
                  className="bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  style={{
                    animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                  }}
                >
                  <div className="md:flex">
                    {/* Event Image */}
                    <div className="md:w-2/5 relative h-80 md:h-auto">
                      <Image
                        src={
                          event.image || "https://via.placeholder.com/600x400"
                        }
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                      {/* Status Badge */}
                      <div className="absolute top-6 right-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg">
                        <FaCheckCircle className="text-xl" />
                        Đã hoàn thành
                      </div>

                      {/* Achievement Badge if hours > 8 */}
                      {event.hours >= 8 && (
                        <div className="absolute bottom-6 left-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg">
                          <FaTrophy />
                          Xuất sắc
                        </div>
                      )}
                    </div>

                    {/* Event Details */}
                    <div className="md:w-3/5 p-8">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-3xl font-bold text-gray-800 leading-tight">
                          {event.title}
                        </h3>
                        <span className="ml-4 px-4 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-semibold whitespace-nowrap">
                          +{Math.round(event.hours * 10)} điểm
                        </span>
                      </div>

                      <p className="text-gray-600 mb-6 line-clamp-3 text-lg leading-relaxed">
                        {event.description}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-3 text-gray-700 bg-blue-50 p-3 rounded-xl">
                          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                            <FaCalendarAlt className="text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">
                              Hoàn thành
                            </p>
                            <p className="font-semibold">
                              {new Date(event.completedAt).toLocaleDateString(
                                "vi-VN",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                }
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-gray-700 bg-red-50 p-3 rounded-xl">
                          <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                            <FaMapMarkerAlt className="text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">
                              Địa điểm
                            </p>
                            <p className="font-semibold line-clamp-1">
                              {event.location}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-gray-700 bg-purple-50 p-3 rounded-xl">
                          <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                            <FaClock className="text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">
                              Thời lượng
                            </p>
                            <p className="font-semibold">{event.hours} giờ</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 text-gray-700 bg-green-50 p-3 rounded-xl">
                          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                            <FaUsers className="text-white" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 font-medium">
                              Người tham gia
                            </p>
                            <p className="font-semibold">
                              {event.participants} người
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Organizer */}
                      <div className="flex items-center gap-4 pt-6 border-t-2 border-gray-100">
                        <Image
                          src={
                            event.organizer.avatar ||
                            "https://i.pravatar.cc/150"
                          }
                          alt={event.organizer.name}
                          width={50}
                          height={50}
                          className="rounded-full border-2 border-green-400"
                        />
                        <div>
                          <p className="text-sm text-gray-500 font-medium">
                            Người tổ chức
                          </p>
                          <p className="font-bold text-gray-800 text-lg">
                            {event.organizer.name}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load more button (if needed) */}
            {filteredHistory.length >= 10 && (
              <div className="text-center mt-8">
                <button className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-xl transform hover:-translate-y-1 transition-all">
                  Xem thêm sự kiện
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Custom Dropdown Portals */}
      {showYearDropdown &&
        typeof window !== "undefined" &&
        createPortal(
          <>
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999999,
                backgroundColor: "transparent",
              }}
              onClick={() => setShowYearDropdown(false)}
            />
            <div
              style={{
                position: "absolute",
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                zIndex: 1000000,
              }}
            >
              <div className="w-56 bg-white rounded-2xl shadow-2xl border-2 border-blue-100 overflow-hidden">
                <button
                  onClick={() => {
                    setFilterYear("all");
                    setShowYearDropdown(false);
                  }}
                  className={`w-full text-left px-5 py-3.5 text-sm font-semibold transition-all ${
                    filterYear === "all"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                      : "text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  📅 Tất cả năm
                </button>
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => {
                      setFilterYear(year);
                      setShowYearDropdown(false);
                    }}
                    className={`w-full text-left px-5 py-3.5 text-sm font-semibold transition-all ${
                      filterYear === year
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                        : "text-gray-700 hover:bg-blue-50"
                    }`}
                  >
                    📅 Năm {year}
                  </button>
                ))}
              </div>
            </div>
          </>,
          document.body
        )}

      {showHoursDropdown &&
        typeof window !== "undefined" &&
        createPortal(
          <>
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999999,
                backgroundColor: "transparent",
              }}
              onClick={() => setShowHoursDropdown(false)}
            />
            <div
              style={{
                position: "absolute",
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                zIndex: 1000000,
              }}
            >
              <div className="w-64 bg-white rounded-2xl shadow-2xl border-2 border-purple-100 overflow-hidden">
                <button
                  onClick={() => {
                    setFilterHours("all");
                    setShowHoursDropdown(false);
                  }}
                  className={`w-full text-left px-5 py-3.5 text-sm font-semibold transition-all ${
                    filterHours === "all"
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                      : "text-gray-700 hover:bg-purple-50"
                  }`}
                >
                  ⏱️ Tất cả thời lượng
                </button>
                <button
                  onClick={() => {
                    setFilterHours("short");
                    setShowHoursDropdown(false);
                  }}
                  className={`w-full text-left px-5 py-3.5 text-sm font-semibold transition-all ${
                    filterHours === "short"
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                      : "text-gray-700 hover:bg-purple-50"
                  }`}
                >
                  <div>⏱️ &lt; 4 giờ</div>
                  <div className="text-xs opacity-75 mt-1">
                    Sự kiện ngắn hạn
                  </div>
                </button>
                <button
                  onClick={() => {
                    setFilterHours("medium");
                    setShowHoursDropdown(false);
                  }}
                  className={`w-full text-left px-5 py-3.5 text-sm font-semibold transition-all ${
                    filterHours === "medium"
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                      : "text-gray-700 hover:bg-purple-50"
                  }`}
                >
                  <div>⏱️ 4-8 giờ</div>
                  <div className="text-xs opacity-75 mt-1">
                    Sự kiện trung bình
                  </div>
                </button>
                <button
                  onClick={() => {
                    setFilterHours("long");
                    setShowHoursDropdown(false);
                  }}
                  className={`w-full text-left px-5 py-3.5 text-sm font-semibold transition-all ${
                    filterHours === "long"
                      ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                      : "text-gray-700 hover:bg-purple-50"
                  }`}
                >
                  <div>⏱️ ≥ 8 giờ</div>
                  <div className="text-xs opacity-75 mt-1">Sự kiện dài hạn</div>
                </button>
              </div>
            </div>
          </>,
          document.body
        )}

      {showSortDropdown &&
        typeof window !== "undefined" &&
        createPortal(
          <>
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999999,
                backgroundColor: "transparent",
              }}
              onClick={() => setShowSortDropdown(false)}
            />
            <div
              style={{
                position: "absolute",
                top: dropdownPosition.top,
                left: dropdownPosition.left,
                zIndex: 1000000,
              }}
            >
              <div className="w-64 bg-white rounded-2xl shadow-2xl border-2 border-green-100 overflow-hidden">
                <button
                  onClick={() => {
                    setSortBy("recent");
                    setShowSortDropdown(false);
                  }}
                  className={`w-full text-left px-5 py-3.5 text-sm font-semibold transition-all ${
                    sortBy === "recent"
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                      : "text-gray-700 hover:bg-green-50"
                  }`}
                >
                  <div>🔄 Mới nhất trước</div>
                  <div className="text-xs opacity-75 mt-1">
                    Sắp xếp theo thời gian giảm dần
                  </div>
                </button>
                <button
                  onClick={() => {
                    setSortBy("oldest");
                    setShowSortDropdown(false);
                  }}
                  className={`w-full text-left px-5 py-3.5 text-sm font-semibold transition-all ${
                    sortBy === "oldest"
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                      : "text-gray-700 hover:bg-green-50"
                  }`}
                >
                  <div>🔄 Cũ nhất trước</div>
                  <div className="text-xs opacity-75 mt-1">
                    Sắp xếp theo thời gian tăng dần
                  </div>
                </button>
                <button
                  onClick={() => {
                    setSortBy("hours");
                    setShowSortDropdown(false);
                  }}
                  className={`w-full text-left px-5 py-3.5 text-sm font-semibold transition-all ${
                    sortBy === "hours"
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                      : "text-gray-700 hover:bg-green-50"
                  }`}
                >
                  <div>🔄 Nhiều giờ nhất</div>
                  <div className="text-xs opacity-75 mt-1">
                    Sắp xếp theo thời lượng giảm dần
                  </div>
                </button>
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
}

/* Add animation keyframes in global CSS or add style tag */

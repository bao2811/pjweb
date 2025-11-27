"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle,
  FaChartLine,
  FaSearch,
  FaFilter,
  FaUsers,
  FaTrophy,
  FaStar,
  FaAward,
  FaHeart,
} from "react-icons/fa";
import api from "@/utils/api";

interface HistoryEvent {
  id: number;
  title: string;
  description: string;
  image: string;
  completedAt: string;
  location: string;
  hours: number;
  participants: number;
  organizer: {
    name: string;
    avatar: string;
  };
}

export default function HistoryPage() {
  const router = useRouter();
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<HistoryEvent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Fetch current user
  useEffect(() => {
    const fetchCurrentUser = async () => {
      // Try localStorage first
      const userData = localStorage.getItem('user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user.id) {
            setCurrentUserId(user.id);
            return;
          }
        } catch (e) {
          console.error('Error parsing user data from localStorage:', e);
        }
      }

      // Fallback to API
      try {
        const response = await api.get('/me');
        if (response.data && response.data.id) {
          setCurrentUserId(response.data.id);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  // Fetch event history
  useEffect(() => {
    const fetchHistory = async () => {
      if (!currentUserId) {
        console.log('⚠️ currentUserId is null, waiting...');
        return;
      }

      try {
        setIsLoading(true);
        console.log('🔍 Fetching history for user:', currentUserId);
        const response = await api.get('/user/eventHistory', {
          params: { user_id: currentUserId }
        });

        console.log('📜 Event history response:', response.data);

        if (response.data.success && response.data.history) {
          setEvents(response.data.history);
          setFilteredEvents(response.data.history);
        }
      } catch (error) {
        console.error('Error fetching event history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [currentUserId]);

  // Calculate stats
  const stats = {
    totalEvents: events.length,
    totalHours: events.reduce((sum, e) => sum + e.hours, 0),
  };

  // Get unique years
  const years = ["all", ...new Set(events.map(e => new Date(e.completedAt).getFullYear().toString()))];

  // Filter events
  useEffect(() => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(e => 
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedYear !== "all") {
      filtered = filtered.filter(e => 
        new Date(e.completedAt).getFullYear().toString() === selectedYear
      );
    }

    setFilteredEvents(filtered);
  }, [searchTerm, selectedYear, events]);

  // Group events by year and month
  const groupedEvents = filteredEvents.reduce((acc, event) => {
    const date = new Date(event.completedAt);
    const year = date.getFullYear();
    const month = date.toLocaleDateString('vi-VN', { month: 'long' });
    
    if (!acc[year]) acc[year] = {};
    if (!acc[year][month]) acc[year][month] = [];
    
    acc[year][month].push(event);
    return acc;
  }, {} as Record<number, Record<string, HistoryEvent[]>>);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-blue-50/30">      
      {/* Enhanced Header */}
      <div className="relative bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 text-white py-10 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <div className="bg-yellow-400/20 p-2 rounded-xl">
                  <FaTrophy className="text-yellow-300 text-2xl" />
                </div>
                Lịch Sử Hoạt Động
              </h1>
              <p className="text-green-50 text-sm">
                Hành trình tình nguyện đầy ý nghĩa ✨
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Beautiful Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-white to-green-50/50 rounded-2xl shadow-lg shadow-green-100/50 p-5 border border-green-100/50 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-200">
                <FaCheckCircle className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1 font-medium">Sự kiện đã tham gia</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{stats.totalEvents}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-white to-blue-50/50 rounded-2xl shadow-lg shadow-blue-100/50 p-5 border border-blue-100/50 hover:shadow-xl hover:scale-105 transition-all duration-300">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <FaClock className="text-2xl text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1 font-medium">Tổng thời gian</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{stats.totalHours}h</p>
              </div>
            </div>
          </div>
        </div>

        {/* Beautiful Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-5 mb-6 border border-gray-200 hover:border-gray-300 transition-colors">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative group">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm group-focus-within:text-green-600 transition-colors" />
              <input
                type="text"
                placeholder="Tìm kiếm sự kiện..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all bg-white shadow-sm font-medium"
              />
            </div>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="px-5 py-3 text-sm text-gray-900 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-semibold bg-white shadow-sm cursor-pointer hover:border-green-400 hover:bg-green-50"
            >
              <option value="all" className="font-semibold text-gray-900">📅 Tất cả năm</option>
              {years.filter(y => y !== "all").map(year => (
                <option key={year} value={year} className="font-semibold text-gray-900">{year}</option>
              ))}
            </select>
          </div>

          {(searchTerm || selectedYear !== "all") && (
            <div className="mt-4 flex items-center justify-between bg-gradient-to-r from-green-50 via-emerald-50 to-green-50 px-4 py-3 rounded-xl border border-green-200 shadow-sm">
              <p className="text-gray-900 font-semibold text-sm">
                Tìm thấy <span className="font-bold text-green-700 text-base">{filteredEvents.length}</span> sự kiện
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedYear("all");
                }}
                className="text-gray-900 hover:text-green-700 font-bold text-sm flex items-center gap-1.5 hover:scale-105 transition-all px-3 py-1.5 bg-white rounded-lg shadow-sm hover:shadow-md"
              >
                ✕ Xóa bộ lọc
              </button>
            </div>
          )}
        </div>

        {/* Timeline */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="text-7xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">
              Chưa có sự kiện nào
            </h3>
            <p className="text-sm text-gray-500">
              Hãy tham gia hoạt động tình nguyện để tạo nên hành trình ý nghĩa
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Gradient Timeline Line */}
            <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gradient-to-b from-green-400 via-emerald-400 to-blue-400 hidden md:block shadow-sm"></div>

            {Object.keys(groupedEvents).sort((a, b) => Number(b) - Number(a)).map((year) => (
              <div key={year} className="mb-12">
                {/* Year Badge with glow */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-blue-600 text-white px-8 py-3 rounded-full shadow-lg shadow-green-300/50 hover:shadow-xl hover:scale-105 transition-all duration-300">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <FaCalendarAlt className="text-base" />
                      {year}
                    </h2>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-green-200 via-emerald-200 to-transparent"></div>
                </div>

                {/* Months */}
                {Object.keys(groupedEvents[Number(year)]).map((month) => (
                  <div key={month} className="mb-8">
                    <h3 className="text-sm font-bold text-green-700 mb-5 ml-16 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-sm shadow-green-300"></div>
                      {month}
                    </h3>

                    <div className="space-y-5">
                      {groupedEvents[Number(year)][month].map((event) => (
                        <div key={event.id} className="relative group">
                          {/* Animated Timeline Dot */}
                          <div className="absolute left-7 top-5 w-3.5 h-3.5 bg-white border-2 border-green-500 rounded-full hidden md:block z-10 transform -translate-x-1/2 group-hover:scale-125 group-hover:border-green-600 transition-all shadow-sm"></div>

                          {/* Beautiful Event Card */}
                          <div className="md:ml-16 bg-white rounded-2xl shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-green-200/30 transition-all duration-300 overflow-hidden border border-gray-100 hover:border-green-300 group-hover:scale-[1.02]">
                            <div className="md:flex">
                              {/* Image with overlay gradient */}
                              <div className="md:w-52 h-36 md:h-auto relative overflow-hidden flex-shrink-0">
                                <Image
                                  src={event.image}
                                  alt={event.title}
                                  fill
                                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                                  unoptimized
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              </div>

                              {/* Content */}
                              <div className="flex-1 p-5">
                                <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-600 transition line-clamp-1">
                                  {event.title}
                                </h4>
                                <p className="text-gray-600 text-xs line-clamp-2 mb-4 leading-relaxed">
                                  {event.description}
                                </p>

                                {/* Stats with icons */}
                                <div className="flex flex-wrap gap-4 mb-4">
                                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-green-50 px-3 py-1.5 rounded-lg">
                                    <FaCalendarAlt className="text-green-500" />
                                    <span className="font-medium">{new Date(event.completedAt).toLocaleDateString('vi-VN')}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                                    <FaClock className="text-blue-500" />
                                    <span className="font-bold text-blue-700">{event.hours}h</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-600 bg-purple-50 px-3 py-1.5 rounded-lg">
                                    <FaUsers className="text-purple-500" />
                                    <span className="font-medium">{event.participants} người</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 bg-gray-50 px-3 py-2 rounded-lg">
                                  <FaMapMarkerAlt className="text-red-500 flex-shrink-0" />
                                  <span className="truncate font-medium">{event.location}</span>
                                </div>

                                {/* Action Buttons with gradients */}
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => router.push(`/events/${event.id}`)}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 rounded-xl transition-all font-semibold shadow-md shadow-green-200 hover:shadow-lg hover:scale-105"
                                  >
                                    <FaCheckCircle />
                                    <span>Xem chi tiết</span>
                                  </button>
                                  <button
                                    onClick={() => alert('Chức năng chia sẻ đang phát triển!')}
                                    className="px-4 py-2.5 text-xs bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 rounded-xl transition-all font-semibold shadow-md shadow-pink-200 hover:shadow-lg hover:scale-105"
                                  >
                                    <FaHeart />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

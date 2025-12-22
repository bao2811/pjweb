"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaTrophy,
  FaUsers,
  FaClock,
  FaCalendarAlt,
  FaChartLine,
  FaFileDownload,
  FaEye,
} from "react-icons/fa";
import { authFetch } from "@/utils/auth";

interface OverviewStats {
  total_events: number;
  total_volunteers: number;
  total_completed: number;
  total_hours: number;
}

interface EventReport {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  status: string;
  category: string;
  total_registered: number;
  approved: number;
  completed: number;
  event_hours: number;
  total_hours: number;
  completion_rate: number;
}

export default function ManagerReportsPage() {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [events, setEvents] = useState<EventReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setIsLoading(true);
      const response = await authFetch("/manager/reports");
      const data = await response.json();

      if (data.success && data.report) {
        setOverview(data.report.overview);
        setEvents(data.report.events);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> =
      {
        pending: {
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          label: "Chờ duyệt",
        },
        accepted: {
          bg: "bg-green-100",
          text: "text-green-700",
          label: "Đã duyệt",
        },
        rejected: {
          bg: "bg-red-100",
          text: "text-red-700",
          label: "Đã từ chối",
        },
        completed: {
          bg: "bg-blue-100",
          text: "text-blue-700",
          label: "Hoàn thành",
        },
      };
    const badge = badges[status] || {
      bg: "bg-gray-100",
      text: "text-gray-700",
      label: status,
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}
      >
        {badge.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
          <p className="mt-4 text-gray-600 text-lg">Đang tải báo cáo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Báo cáo tổng quan
          </h1>
        </div>

        {/* Overview Stats */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tổng sự kiện</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {overview.total_events}
                  </p>
                </div>
                <div className="bg-purple-100 p-4 rounded-full">
                  <FaCalendarAlt className="text-purple-600 text-2xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tổng thành viên</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {overview.total_volunteers}
                  </p>
                </div>
                <div className="bg-blue-100 p-4 rounded-full">
                  <FaUsers className="text-blue-600 text-2xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Đã hoàn thành</p>
                  <p className="text-3xl font-bold text-gray-800">
                    {overview.total_completed}
                  </p>
                </div>
                <div className="bg-green-100 p-4 rounded-full">
                  <FaTrophy className="text-green-600 text-2xl" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">
                    Tổng giờ hoàn thành
                  </p>
                  <p className="text-3xl font-bold text-gray-800">
                    {overview.total_hours.toFixed(1)}h
                  </p>
                </div>
                <div className="bg-orange-100 p-4 rounded-full">
                  <FaClock className="text-orange-600 text-2xl" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Events Table */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {events.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Chưa có sự kiện nào
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-purple-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Tên sự kiện
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                      Thời gian
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Đã duyệt
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Hoàn thành
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Tỉ lệ
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Giờ
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-gray-800">
                          {event.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {event.category}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-700">
                          {new Date(event.start_time).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          đến{" "}
                          {new Date(event.end_time).toLocaleDateString("vi-VN")}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {getStatusBadge(event.status)}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-semibold text-blue-600">
                          {event.approved}
                        </span>
                        <span className="text-gray-500 text-sm">
                          /{event.total_registered}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-semibold text-green-600">
                          {event.completed}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-semibold text-gray-800">
                            {event.completion_rate}%
                          </span>
                          <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${event.completion_rate}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-semibold text-orange-600">
                          {event.total_hours}h
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Link
                          href={`/manager/events/${event.id}`}
                          className="inline-flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
                        >
                          <FaEye />
                          <span>Xem chi tiết</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

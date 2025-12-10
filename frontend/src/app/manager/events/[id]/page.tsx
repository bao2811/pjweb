"use client";
import { use, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaDownload,
  FaFileExport,
  FaUserCheck,
  FaUserTimes,
  FaComments,
  FaClipboardList,
  FaChartBar,
} from "react-icons/fa";
import api from "@/utils/api";

interface EventDetail {
  id: number;
  title: string;
  description: string;
  image: string;
  start_date: string;
  end_date: string;
  location: string;
  max_participants: number;
  current_participants: number;
  category: string;
  status: string;
}

interface Volunteer {
  id: number;
  name: string;
  email: string;
  avatar: string;
  phone?: string;
  status: "pending" | "approved" | "rejected";
  registered_at: string;
}

export default function ManagerEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"registrations" | "reports" | "chat">("registrations");

  useEffect(() => {
    fetchEventDetail();
    fetchVolunteers();
  }, [id]);

  const fetchEventDetail = async () => {
    try {
      const response = await api.get(`/events/getEventDetails/${id}`);
      if (response.data && response.data.event) {
        setEvent(response.data.event);
      }
    } catch (error) {
      console.error("Error fetching event:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVolunteers = async () => {
    try {
      const response = await api.get(`/manager/getListUserByEvent/${id}`);
      if (response.data) {
        setVolunteers(response.data);
      }
    } catch (error) {
      console.error("Error fetching volunteers:", error);
    }
  };

  const handleApproveVolunteer = async (volunteerId: number) => {
    try {
      await api.get(`/manager/acceptUserJoinEvent/${volunteerId}`);
      fetchVolunteers(); // Refresh list
    } catch (error) {
      console.error("Error approving volunteer:", error);
    }
  };

  const handleRejectVolunteer = async (volunteerId: number) => {
    try {
      await api.get(`/manager/rejectUserJoinEvent/${volunteerId}`);
      fetchVolunteers(); // Refresh list
    } catch (error) {
      console.error("Error rejecting volunteer:", error);
    }
  };

  const exportReport = (format: "csv" | "json") => {
    const data = volunteers.filter((v) => v.status === "approved");
    
    if (format === "csv") {
      const csv = [
        ["Tên", "Email", "Số điện thoại", "Ngày đăng ký"],
        ...data.map((v) => [
          v.name,
          v.email,
          v.phone || "N/A",
          new Date(v.registered_at).toLocaleDateString("vi-VN"),
        ]),
      ]
        .map((row) => row.join(","))
        .join("\n");
      
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${event?.title}_volunteers.csv`;
      a.click();
    } else {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${event?.title}_volunteers.json`;
      a.click();
    }
  };

  const pendingCount = volunteers.filter((v) => v.status === "pending").length;
  const approvedCount = volunteers.filter((v) => v.status === "approved").length;
  const rejectedCount = volunteers.filter((v) => v.status === "rejected").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy sự kiện</h2>
          <button
            onClick={() => router.back()}
            className="text-purple-600 hover:underline"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header with Event Info */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaArrowLeft className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-2 text-gray-600">
              <FaCalendarAlt className="text-purple-500" />
              <span className="text-sm">
                {new Date(event.start_date).toLocaleDateString("vi-VN")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FaMapMarkerAlt className="text-purple-500" />
              <span className="text-sm line-clamp-1">{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FaUsers className="text-purple-500" />
              <span className="text-sm">
                {event.current_participants}/{event.max_participants} người
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FaClock className="text-purple-500" />
              <span className="text-sm capitalize">{event.status}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("registrations")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === "registrations"
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <FaClipboardList />
              <span>Đăng ký ({pendingCount})</span>
            </button>
            <button
              onClick={() => setActiveTab("reports")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                activeTab === "reports"
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <FaChartBar />
              <span>Báo cáo</span>
            </button>
            <button
              onClick={() => router.push(`/events/${id}/channel`)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all whitespace-nowrap"
            >
              <FaComments />
              <span>Kênh chat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* REGISTRATIONS TAB */}
        {activeTab === "registrations" && (
          <div>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Chờ duyệt</p>
                    <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <FaHourglassHalf className="text-yellow-600 text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Đã duyệt</p>
                    <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <FaCheckCircle className="text-green-600 text-xl" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Từ chối</p>
                    <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <FaTimesCircle className="text-red-600 text-xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Volunteers List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-900">Danh sách đăng ký</h2>
              </div>

              {volunteers.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaUsers className="text-gray-400 text-3xl" />
                  </div>
                  <p className="text-gray-600">Chưa có tình nguyện viên nào đăng ký</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                          Tình nguyện viên
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">
                          Email
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden lg:table-cell">
                          Ngày đăng ký
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                          Trạng thái
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {volunteers.map((volunteer) => (
                        <tr key={volunteer.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                {volunteer.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{volunteer.name}</p>
                                <p className="text-sm text-gray-500 md:hidden">{volunteer.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-sm hidden md:table-cell">
                            {volunteer.email}
                          </td>
                          <td className="px-4 py-3 text-gray-600 text-sm hidden lg:table-cell">
                            {new Date(volunteer.registered_at).toLocaleDateString("vi-VN")}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {volunteer.status === "pending" && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                                <FaHourglassHalf />
                                Chờ duyệt
                              </span>
                            )}
                            {volunteer.status === "approved" && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                <FaCheckCircle />
                                Đã duyệt
                              </span>
                            )}
                            {volunteer.status === "rejected" && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                <FaTimesCircle />
                                Từ chối
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-2">
                              {volunteer.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => handleApproveVolunteer(volunteer.id)}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Duyệt"
                                  >
                                    <FaUserCheck />
                                  </button>
                                  <button
                                    onClick={() => handleRejectVolunteer(volunteer.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Từ chối"
                                  >
                                    <FaUserTimes />
                                  </button>
                                </>
                              )}
                              {volunteer.status === "approved" && (
                                <span className="text-green-600 text-sm">✓ Đã xác nhận</span>
                              )}
                              {volunteer.status === "rejected" && (
                                <span className="text-red-600 text-sm">✗ Đã từ chối</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === "reports" && (
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Báo cáo sự kiện</h2>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                  <p className="text-blue-600 text-sm font-medium mb-1">Tổng đăng ký</p>
                  <p className="text-3xl font-bold text-blue-900">{volunteers.length}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                  <p className="text-green-600 text-sm font-medium mb-1">Đã duyệt</p>
                  <p className="text-3xl font-bold text-green-900">{approvedCount}</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4">
                  <p className="text-yellow-600 text-sm font-medium mb-1">Chờ duyệt</p>
                  <p className="text-3xl font-bold text-yellow-900">{pendingCount}</p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4">
                  <p className="text-red-600 text-sm font-medium mb-1">Từ chối</p>
                  <p className="text-3xl font-bold text-red-900">{rejectedCount}</p>
                </div>
              </div>

              {/* Export Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Xuất báo cáo</h3>
                <p className="text-gray-600 mb-4">
                  Tải danh sách tình nguyện viên đã được duyệt về máy
                </p>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => exportReport("csv")}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    <FaDownload />
                    <span>Xuất CSV</span>
                  </button>
                  <button
                    onClick={() => exportReport("json")}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-lg transition-all"
                  >
                    <FaFileExport />
                    <span>Xuất JSON</span>
                  </button>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Lưu ý:</strong> File báo cáo chỉ bao gồm các tình nguyện viên đã được duyệt tham gia sự kiện.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
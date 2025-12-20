"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FaBell,
  FaCheckCircle,
  FaTimesCircle,
  FaUserPlus,
  FaClock,
  FaTrash,
  FaEye,
  FaCalendarAlt,
  FaExclamationCircle,
} from "react-icons/fa";
import { authFetch } from "@/utils/auth";
import { useReverbNotification } from "@/hooks/useReverbNotification";
import { useAuth } from "@/hooks/useAuth";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  sender_id: number;
  receiver_id: number;
  is_read: boolean;
  sender_username?: string;
  sender_email?: string;
  sender_image?: string;
  sender_role?: string;
  data: {
    event_id?: number;
    event_title?: string;
    url?: string;
    user_id?: number;
  };
  created_at: string;
  // client-side flag to mark a notification as processed (approved/rejected handled)
  processed?: boolean;
}

export default function ManagerNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<
    Notification[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    // 1️⃣ Lắng nghe postMessage từ Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type === "notification-data") {
          const newNotif = event.data.data;
          setNotifications((prev) => [newNotif, ...prev]);
        }
      });
    }
  }, []);

  useEffect(() => {
    filterNotifications();
  }, [notifications, filter, typeFilter]);

  const { user, token } = useAuth();

  useReverbNotification({
    userId: user?.id ?? null,
    authToken: token ?? null,
    onNewNotification: (data) => {
      try {
        // payload may be { notification: {...} } or the notification itself
        const payload: any = data?.notification ?? data;

        // build a Notification-like object with safe defaults
        const newNoti: Notification = {
          id: payload.id,
          title: payload.title ?? payload.data?.title ?? "Thông báo mới",
          message: payload.message ?? payload.body ?? "",
          type: payload.type ?? payload.data?.type ?? "webpush",
          sender_id: payload.sender_id ?? payload.data?.sender_id ?? 0,
          receiver_id: payload.receiver_id ?? user?.id ?? 0,
          is_read: !!payload.is_read,
          sender_username:
            payload.sender_username ?? payload.sender?.username ?? undefined,
          sender_email: payload.sender_email ?? undefined,
          sender_image: payload.sender_image ?? undefined,
          sender_role: payload.sender_role ?? undefined,
          data: payload.data ?? {},
          created_at: payload.created_at ?? new Date().toISOString(),
        };

        setNotifications((prev) => {
          // avoid duplicate
          if (prev.some((n) => n.id === newNoti.id)) return prev;
          return [newNoti, ...prev];
        });

        // show browser notification if permitted
        if (
          typeof window !== "undefined" &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          try {
            new Notification(newNoti.title, {
              body: newNoti.message || "",
              tag: `notification-${newNoti.id}`,
              data: { url: newNoti.data?.url ?? "/notifications" },
            });
          } catch (err) {
            console.warn("Failed to show browser notification", err);
          }
        }
      } catch (err) {
        console.error("Error handling realtime notification:", err, data);
      }
    },
    onNotificationRead: (notificationId) => {
      // Đánh dấu notification đã đọc trong state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    },
  });

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const response = await authFetch("/user/notifications");
      const data = await response.json();

      console.log("🔔 Notifications response:", data);

      if (data && data.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterNotifications = () => {
    let filtered = [...notifications];

    // Filter by read status
    if (filter === "unread") {
      filtered = filtered.filter((n) => !n.is_read);
    } else if (filter === "read") {
      filtered = filtered.filter((n) => n.is_read);
    }

    // Filter by type
    if (typeFilter !== "all") {
      filtered = filtered.filter((n) => n.type === typeFilter);
    }

    setFilteredNotifications(filtered);
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const response = await authFetch(
        `/user/notifications/${notificationId}/read`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        setNotifications(
          notifications.map((n) =>
            n.id === notificationId ? { ...n, is_read: true } : n
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // delete notification without user confirmation (used after approve/reject)
  const deleteNotificationSilent = async (notificationId: number) => {
    try {
      const response = await authFetch(
        `/user/notifications/${notificationId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      } else {
        console.warn("Failed to delete notification", await response.text());
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const response = await authFetch("/user/notifications/mark-all-read", {
        method: "POST",
      });

      if (response.ok) {
        setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const handleDelete = async (notificationId: number) => {
    if (!confirm("Bạn có chắc muốn xóa thông báo này?")) return;

    try {
      const response = await authFetch(
        `/user/notifications/${notificationId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setNotifications(notifications.filter((n) => n.id !== notificationId));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type - ưu tiên event_id nếu có
    if (notification.data?.event_id) {
      router.push(`/manager/events/${notification.data.event_id}`);
    } else if (
      notification.data?.url &&
      notification.data.url !== "/notifications"
    ) {
      // Chỉ navigate nếu url không phải là "/notifications" mặc định
      router.push(notification.data.url);
    }
    // Nếu không có event_id và url là mặc định, không navigate - chỉ đánh dấu đã đọc
  };

  const handleApproveUser = async (notification: Notification) => {
    if (!notification.data?.user_id || !notification.data?.event_id) return;

    try {
      setProcessingId(notification.id);
      const response = await authFetch(`/manager/acceptUserJoinEvent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: notification.data.user_id,
          event_id: notification.data.event_id,
        }),
      });
      const data = await response.json();

      if (data.success) {
        alert("Đã duyệt user tham gia sự kiện!");
        // mark locally as read + processed so UI shows "đã được xử lý"
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id
              ? { ...n, is_read: true, processed: true }
              : n
          )
        );
        // optionally inform backend that the notification was read
        handleMarkAsRead(notification.id);
        // remove the notification from server so it's no longer shown
        deleteNotificationSilent(notification.id);
      } else {
        alert(data.message || "Có lỗi xảy ra khi duyệt user");
      }
    } catch (error) {
      console.error("Error approving user:", error);
      alert("Có lỗi xảy ra khi duyệt user");
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectUser = async (notification: Notification) => {
    if (!notification.data?.user_id || !notification.data?.event_id) return;
    if (!confirm("Bạn có chắc muốn từ chối user này?")) return;

    try {
      setProcessingId(notification.id);
      const response = await authFetch(`/manager/rejectUserJoinEvent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: notification.data.user_id,
          event_id: notification.data.event_id,
        }),
      });
      const data = await response.json();

      if (data.success) {
        alert("Đã từ chối user tham gia sự kiện!");
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id
              ? { ...n, is_read: true, processed: true }
              : n
          )
        );
        handleMarkAsRead(notification.id);
        // delete notification after rejection
        deleteNotificationSilent(notification.id);
      } else {
        alert(data.message || "Có lỗi xảy ra khi từ chối user");
      }
    } catch (error) {
      console.error("Error rejecting user:", error);
      alert("Có lỗi xảy ra khi từ chối user");
    } finally {
      setProcessingId(null);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "event_join_request":
        return <FaUserPlus className="text-blue-500 text-xl" />;
      case "event_accepted":
        return <FaCheckCircle className="text-green-500 text-xl" />;
      case "event_rejected":
        return <FaTimesCircle className="text-red-500 text-xl" />;
      case "event_approved":
        return <FaCheckCircle className="text-green-500 text-xl" />;
      case "event_update":
        return <FaCalendarAlt className="text-purple-500 text-xl" />;
      default:
        return <FaBell className="text-gray-500 text-xl" />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    switch (type) {
      case "event_join_request":
        return "Yêu cầu tham gia";
      case "event_accepted":
        return "Đã duyệt";
      case "event_rejected":
        return "Từ chối";
      case "event_approved":
        return "Sự kiện được duyệt";
      case "event_update":
        return "Cập nhật sự kiện";
      default:
        return "Thông báo";
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const notificationTypes = Array.from(
    new Set(notifications.map((n) => n.type))
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
          <p className="mt-4 text-gray-600 text-lg">Đang tải thông báo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <FaBell className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Thông báo</h1>
                <p className="text-gray-600">
                  {unreadCount > 0
                    ? `Bạn có ${unreadCount} thông báo chưa đọc`
                    : "Tất cả thông báo đã được đọc"}
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                <FaCheckCircle />
                <span>Đánh dấu tất cả đã đọc</span>
              </button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Trạng thái:</span>
              <div className="flex space-x-2">
                {["all", "unread", "read"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      filter === f
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {f === "all"
                      ? "Tất cả"
                      : f === "unread"
                      ? "Chưa đọc"
                      : "Đã đọc"}
                  </button>
                ))}
              </div>
            </div>

            {notificationTypes.length > 1 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Loại:</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả loại</option>
                  {notificationTypes.map((type) => (
                    <option key={type} value={type}>
                      {getNotificationTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <FaBell className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Không có thông báo
              </h3>
              <p className="text-gray-500">
                {filter === "unread"
                  ? "Bạn đã đọc tất cả thông báo"
                  : "Chưa có thông báo nào"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              // Xác định style theo loại thông báo
              const isFromUser = notification.sender_role === "user";
              const isFromAdmin = notification.sender_role === "admin";
              const isJoinRequest = notification.type === "event_join_request";

              let borderColor = "border-gray-200";
              let bgGradient = "bg-white";

              if (!notification.is_read) {
                if (isJoinRequest) {
                  borderColor = "border-blue-500";
                  bgGradient = "bg-gradient-to-r from-blue-50 to-white";
                } else if (isFromAdmin) {
                  borderColor = "border-purple-500";
                  bgGradient = "bg-gradient-to-r from-purple-50 to-white";
                } else {
                  borderColor = "border-green-500";
                  bgGradient = "bg-gradient-to-r from-green-50 to-white";
                }
              }

              return (
                <div
                  key={notification.id}
                  className={`rounded-xl shadow-md hover:shadow-xl transition-all duration-200 p-6 border-l-4 ${borderColor} ${bgGradient}`}
                >
                  {/* Header với sender info */}
                  <div className="flex items-start space-x-4 mb-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {notification.sender_image ? (
                        <img
                          src={notification.sender_image}
                          alt={notification.sender_username}
                          className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                        />
                      ) : (
                        <div
                          className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md ${
                            isFromAdmin
                              ? "bg-gradient-to-br from-purple-500 to-pink-500"
                              : isFromUser
                              ? "bg-gradient-to-br from-blue-500 to-cyan-500"
                              : "bg-gradient-to-br from-green-500 to-teal-500"
                          }`}
                        >
                          {notification.sender_username
                            ?.charAt(0)
                            .toUpperCase() || "?"}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          {/* Sender name & role */}
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-semibold text-gray-800">
                              {notification.sender_username || "Unknown"}
                            </span>
                            <span
                              className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                isFromAdmin
                                  ? "bg-purple-100 text-purple-700"
                                  : isFromUser
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {isFromAdmin
                                ? "Admin"
                                : isFromUser
                                ? "User"
                                : "Manager"}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {notification.title}
                          </h3>

                          {/* Type badge */}
                          <span
                            className={`inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium rounded-full ${
                              isJoinRequest
                                ? "bg-blue-100 text-blue-700"
                                : notification.type === "event_approved"
                                ? "bg-green-100 text-green-700"
                                : notification.type === "event_rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {getNotificationIcon(notification.type)}
                            <span className="ml-1">
                              {getNotificationTypeLabel(notification.type)}
                            </span>
                          </span>
                        </div>

                        {!notification.is_read && (
                          <div className="flex-shrink-0 flex flex-col items-center">
                            <span className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></span>
                            <span className="text-xs text-blue-600 font-medium mt-1">
                              Mới
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Message */}
                      <p className="text-gray-700 mb-3 leading-relaxed">
                        {notification.message}
                      </p>

                      {/* Event info */}
                      {notification.data?.event_title && (
                        <div className="flex items-center space-x-2 text-sm bg-white p-3 rounded-lg border border-gray-200 mb-3 shadow-sm">
                          <FaCalendarAlt className="text-green-600" />
                          <span className="font-semibold text-gray-800">
                            {notification.data.event_title}
                          </span>
                        </div>
                      )}

                      {/* Action buttons cho join request */}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <FaClock />
                          <span>
                            {new Date(notification.created_at).toLocaleString(
                              "vi-VN",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationClick(notification);
                            }}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Xem chi tiết"
                          >
                            <FaEye />
                          </button>
                          {!notification.is_read && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleMarkAsRead(notification.id);
                              }}
                              className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                              title="Đánh dấu đã đọc"
                            >
                              <FaCheckCircle />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(notification.id);
                            }}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa thông báo"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Stats */}
        {notifications.length > 0 && (
          <div className="mt-6 bg-white rounded-2xl shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {notifications.length}
                </div>
                <div className="text-gray-600">Tổng thông báo</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">
                  {notifications.filter((n) => n.is_read).length}
                </div>
                <div className="text-gray-600">Đã đọc</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600">
                  {unreadCount}
                </div>
                <div className="text-gray-600">Chưa đọc</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

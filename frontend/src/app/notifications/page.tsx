"use client";

import { useState, useEffect } from "react";
import { authFetch } from "@/utils/auth";
import { useRouter } from "next/navigation";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  data: {
    url?: string;
    event_id?: number;
    [key: string]: any;
  };
  created_at: string;
  sender_id?: number;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");

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

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await authFetch("/user/notifications");

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const response = await authFetch(
        `/user/notifications/${notificationId}/read`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, is_read: true } : notif
          )
        );
      }
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await authFetch("/user/notifications/mark-all-read", {
        method: "POST",
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((notif) => ({ ...notif, is_read: true }))
        );
      }
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Navigate to URL if exists
    if (notification.data?.url) {
      router.push(notification.data.url);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "event_created":
      case "event_updated":
        return "📅";
      case "event_accepted":
        return "✅";
      case "event_rejected":
        return "❌";
      case "comment":
        return "💬";
      case "like":
        return "❤️";
      case "system":
        return "🔔";
      default:
        return "📢";
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Vừa xong";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} ngày trước`;

    return date.toLocaleDateString("vi-VN");
  };

  const filteredNotifications = notifications.filter((notif) =>
    filter === "all" ? true : !notif.is_read
  );

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                🔔 Thông báo
                {unreadCount > 0 && (
                  <span className="text-sm bg-red-500 text-white px-3 py-1 rounded-full">
                    {unreadCount} mới
                  </span>
                )}
              </h1>
              <p className="text-gray-600 mt-1">
                Cập nhật mới nhất về hoạt động của bạn
              </p>
            </div>

            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ← Quay lại
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex bg-white rounded-lg shadow-sm p-1 border border-gray-200">
              <button
                onClick={() => setFilter("all")}
                className={`px-4 py-2 rounded-md transition-all ${
                  filter === "all"
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Tất cả ({notifications.length})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-4 py-2 rounded-md transition-all ${
                  filter === "unread"
                    ? "bg-blue-500 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                Chưa đọc ({unreadCount})
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
              >
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Đang tải thông báo...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {filter === "unread"
                ? "Không có thông báo chưa đọc"
                : "Chưa có thông báo nào"}
            </h3>
            <p className="text-gray-600">
              {filter === "unread"
                ? "Bạn đã xem hết tất cả thông báo rồi!"
                : "Thông báo của bạn sẽ xuất hiện ở đây"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification, index) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`
                  group bg-white rounded-xl shadow-sm border transition-all duration-200 
                  hover:shadow-md hover:scale-[1.01] cursor-pointer
                  ${
                    notification.is_read
                      ? "border-gray-200"
                      : "border-blue-200 bg-blue-50/50"
                  }
                `}
                style={{
                  animation: `slideIn 0.3s ease-out ${index * 0.05}s both`,
                }}
              >
                <div className="p-5">
                  <div className="flex gap-4">
                    {/* Icon */}
                    <div
                      className={`
                      flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl
                      ${notification.is_read ? "bg-gray-100" : "bg-blue-100"}
                    `}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 mb-1">
                        <h3
                          className={`
                          font-semibold text-gray-800 group-hover:text-blue-600 transition-colors
                          ${!notification.is_read && "text-blue-900"}
                        `}
                        >
                          {notification.title}
                        </h3>

                        {!notification.is_read && (
                          <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></span>
                        )}
                      </div>

                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          🕐 {getTimeAgo(notification.created_at)}
                        </span>

                        {notification.data?.url && (
                          <span className="text-blue-500 group-hover:text-blue-600 font-medium">
                            → Xem chi tiết
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

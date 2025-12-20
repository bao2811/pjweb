﻿"use client";
import { useState, useEffect } from "react";
import {
  FaBell,
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
  FaHeart,
  FaComment,
  FaUserPlus,
  FaCalendarCheck,
  FaTimes,
  FaCheck,
  FaEye,
  FaTrash,
  FaCheckDouble,
} from "react-icons/fa";
import { authFetch } from "@/utils/auth";
import { useRouter } from "next/navigation";

// Notification types
type NotificationType =
  | "success"
  | "info"
  | "warning"
  | "like"
  | "comment"
  | "join"
  | "approved"
  | "event_approved"
  | "event_rejected"
  | "event_reminder"
  | "event_cancelled"
  | "achievement"
  | "new_event"
  | "system"
  | "message";

interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  link?: string;
  data?: {
    event_id?: number;
    url?: string;
    icon?: string;
  };
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const token = localStorage.getItem("jwt_token");

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
        if (data && Array.isArray(data)) {
          setNotifications(data);
        } else if (data.notifications && Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        }
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;
  const filteredNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.is_read)
      : notifications;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return "Vừa xong";
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;

    return date.toLocaleDateString("vi-VN");
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "event_approved":
      case "approved":
        return <FaCheckCircle className="text-2xl text-green-500" />;
      case "event_rejected":
        return <FaExclamationCircle className="text-2xl text-red-500" />;
      case "event_reminder":
        return <FaCalendarCheck className="text-2xl text-blue-500" />;
      case "event_cancelled":
        return <FaTimes className="text-2xl text-orange-500" />;
      case "achievement":
        return <FaCheckCircle className="text-2xl text-yellow-500" />;
      case "new_event":
        return <FaCalendarCheck className="text-2xl text-purple-500" />;
      case "system":
        return <FaInfoCircle className="text-2xl text-gray-500" />;
      case "message":
        return <FaComment className="text-2xl text-indigo-500" />;
      case "like":
        return <FaHeart className="text-2xl text-pink-500" />;
      case "comment":
        return <FaComment className="text-2xl text-purple-500" />;
      case "join":
        return <FaUserPlus className="text-2xl text-indigo-500" />;
      default:
        return <FaBell className="text-2xl text-gray-500" />;
    }
  };

  const getBackgroundClass = (type: NotificationType) => {
    switch (type) {
      case "event_approved":
      case "approved":
        return "from-green-50 to-green-100 border-green-200";
      case "event_rejected":
        return "from-red-50 to-red-100 border-red-200";
      case "event_reminder":
        return "from-blue-50 to-blue-100 border-blue-200";
      case "event_cancelled":
        return "from-orange-50 to-orange-100 border-orange-200";
      case "achievement":
        return "from-yellow-50 to-yellow-100 border-yellow-200";
      case "new_event":
        return "from-purple-50 to-purple-100 border-purple-200";
      case "system":
        return "from-gray-50 to-gray-100 border-gray-200";
      case "message":
        return "from-indigo-50 to-indigo-100 border-indigo-200";
      case "like":
        return "from-pink-50 to-pink-100 border-pink-200";
      case "comment":
        return "from-purple-50 to-purple-100 border-purple-200";
      case "join":
        return "from-indigo-50 to-indigo-100 border-indigo-200";
      default:
        return "from-gray-50 to-gray-100 border-gray-200";
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

  const deleteNotification = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa thông báo này?")) return;

    try {
      const response = await authFetch(`/user/notifications/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setNotifications(notifications.filter((n) => n.id !== id));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.is_read) {
      markAsRead(notification.id);
    }

    // Ưu tiên event_id trước, sau đó mới đến url
    let targetUrl: string | null = null;

    if (notification.data?.event_id) {
      targetUrl = `/events/${notification.data.event_id}`;
    } else if (
      notification.data?.url &&
      notification.data.url !== "/notifications"
    ) {
      // Chỉ navigate nếu url không phải là "/notifications" mặc định
      targetUrl = notification.data.url;
    } else if (notification.link) {
      targetUrl = notification.link;
    }

    // Navigate to link if exists and not default
    if (targetUrl) {
      router.push(targetUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 mb-2">
                Thông Báo
              </h1>
              <p className="text-gray-600 flex items-center gap-2">
                {unreadCount > 0 ? (
                  <>
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    {unreadCount} thông báo chưa đọc
                  </>
                ) : (
                  <>
                    <FaCheckCircle className="text-green-500" />
                    Bạn đã đọc hết tất cả thông báo
                  </>
                )}
              </p>
            </div>
            <div className="relative">
              <FaBell className="text-5xl text-green-500" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>

          {/* Filter & Actions */}
          <div className="flex flex-wrap gap-3 items-center bg-white rounded-xl p-4 shadow-md">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={
                  "px-6 py-2.5 rounded-lg font-semibold transition-all text-sm " +
                  (filter === "all"
                    ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg transform scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200")
                }
              >
                Tất cả{" "}
                <span className="ml-1 opacity-75">
                  ({notifications.length})
                </span>
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={
                  "px-6 py-2.5 rounded-lg font-semibold transition-all text-sm relative " +
                  (filter === "unread"
                    ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg transform scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200")
                }
              >
                Chưa đọc{" "}
                <span className="ml-1 opacity-75">({unreadCount})</span>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="ml-auto px-5 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all font-semibold flex items-center gap-2 shadow-md hover:shadow-lg text-sm"
              >
                <FaCheckDouble />
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {loading ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                <p className="text-gray-600 font-medium">
                  Đang tải thông báo...
                </p>
              </div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
              <FaBell className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">
                Không có thông báo
              </h3>
              <p className="text-gray-500">
                {filter === "unread"
                  ? "Bạn đã đọc hết tất cả thông báo"
                  : "Chưa có thông báo nào"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={
                  "relative bg-gradient-to-r rounded-xl shadow-md border transition-all hover:shadow-xl group cursor-pointer " +
                  getBackgroundClass(notification.type) +
                  (!notification.is_read ? " border-l-4" : " opacity-70")
                }
                onClick={() => handleNotificationClick(notification)}
              >
                {/* Unread indicator */}
                {!notification.is_read && (
                  <div className="absolute top-4 left-4 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-lg"></div>
                )}

                <div className="flex gap-4 p-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      {getIcon(notification.type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-1">
                      <h3
                        className={
                          "font-bold text-gray-800 text-sm " +
                          (!notification.is_read ? "text-gray-900" : "")
                        }
                      >
                        {notification.title}
                      </h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatTime(notification.created_at)}
                      </span>
                    </div>

                    <p className="text-gray-700 text-sm mb-3 leading-relaxed">
                      {notification.message}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.is_read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification.id);
                          }}
                          className="px-3 py-1.5 bg-white text-green-600 rounded-lg hover:bg-green-50 transition-all text-xs font-semibold flex items-center gap-1 shadow-sm"
                        >
                          <FaCheck className="text-xs" />
                          Đánh dấu đã đọc
                        </button>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification.id);
                        }}
                        className="px-3 py-1.5 bg-white text-red-600 rounded-lg hover:bg-red-50 transition-all text-xs font-semibold flex items-center gap-1 shadow-sm"
                      >
                        <FaTrash className="text-xs" />
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

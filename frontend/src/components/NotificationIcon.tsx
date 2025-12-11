"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useReverbNotification } from "@/hooks/useReverbNotification";
import { authFetch } from "@/utils/auth";

export default function NotificationIcon() {
  const router = useRouter();
  const { user, token } = useAuth(); // Lấy token từ AuthContext thay vì localStorage
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);

  // Fetch notifications từ server
  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
      const response = await authFetch("/user/notifications");
      if (response.ok) {
        const data = await response.json();
        const notifications = data.notifications || [];

        // Update unread count
        const unread = notifications.filter((n: any) => !n.is_read).length;
        setUnreadCount(unread);

        // Update recent notifications (top 5)
        setRecentNotifications(notifications.slice(0, 5));

        console.log("📊 Fetched notifications:", {
          total: notifications.length,
          unread,
          recent: notifications.slice(0, 5).length,
        });
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  }, [user]);

  // Fetch initial data
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Callback khi có thông báo mới qua WebSocket - dùng useCallback để tránh stale closure
  const handleNewNotification = useCallback((notification: any) => {
    console.log("=== 📬 NOTIFICATION ICON: handleNewNotification CALLED ===");
    console.log("📬 Received notification:", notification);
    console.log("📬 Current unreadCount:", unreadCount);

    // Tăng unread count
    setUnreadCount((prev) => {
      const newCount = prev + 1;
      console.log("📈 Unread count updated:", prev, "→", newCount);
      return newCount;
    });

    // Thêm vào đầu danh sách recent (giữ tối đa 5)
    setRecentNotifications((prev) => {
      const updated = [notification, ...prev].slice(0, 5);
      console.log("🔄 Recent notifications updated:", updated.length);
      return updated;
    });

    // Show browser notification nếu có permission
    if ("Notification" in window && Notification.permission === "granted") {
      console.log("🔔 Showing browser notification...");
      new Notification(notification.title, {
        body: notification.message,
        icon: "/favicon.ico",
      });
    }

    console.log(
      "=== 📬 NOTIFICATION ICON: handleNewNotification COMPLETED ==="
    );
  }, []);

  // Debug: Log userId và token
  useEffect(() => {
    console.log("🔍 [NotificationIcon] Debug:", {
      userId: user?.id || null,
      hasToken: !!token,
      tokenLength: token?.length || 0,
      user: user ? { id: user.id, username: user.username } : null,
    });
  }, [user, token]);

  // Callback khi notification được đánh dấu đã đọc
  const handleNotificationRead = useCallback((notificationId: number) => {
    console.log("✅ Notification marked as read:", notificationId);

    setUnreadCount((prev) => Math.max(0, prev - 1));

    setRecentNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
  }, []);

  // Kết nối Reverb WebSocket - TỰ ĐỘNG kết nối khi login!
  console.log("🔧 [NotificationIcon] Calling useReverbNotification with:", {
    userId: user?.id || null,
    hasToken: !!token,
  });

  useReverbNotification({
    userId: user?.id || null,
    authToken: token,
    onNewNotification: handleNewNotification,
    onNotificationRead: handleNotificationRead,
  });

  const handleViewAll = () => {
    setShowDropdown(false);
    router.push("/notifications");
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Vừa xong";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
    return `${Math.floor(seconds / 86400)} ngày trước`;
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

  return (
    <div className="relative">
      {/* Notification Bell Icon */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-white hover:bg-blue-500 rounded-full transition-colors"
        aria-label="Notifications"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Badge - Unread Count */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full min-w-[20px] animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Thông báo
              {unreadCount > 0 && (
                <span className="ml-2 text-sm text-blue-600">
                  ({unreadCount} mới)
                </span>
              )}
            </h3>
            <button
              onClick={() => setShowDropdown(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Notification List */}
          <div className="max-h-96 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-4xl mb-2">📭</div>
                <p>Không có thông báo nào</p>
              </div>
            ) : (
              recentNotifications.map((notif, index) => (
                <div
                  key={notif.id || index}
                  onClick={() => {
                    setShowDropdown(false);
                    router.push("/notifications");
                  }}
                  className={`
                    p-4 border-b border-gray-100 cursor-pointer transition-colors
                    hover:bg-gray-50
                    ${!notif.is_read ? "bg-blue-50" : ""}
                  `}
                >
                  <div className="flex gap-3">
                    <div className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm font-medium text-gray-800 mb-1 ${
                          !notif.is_read ? "font-semibold" : ""
                        }`}
                      >
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-400">
                        {getTimeAgo(notif.created_at)}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={handleViewAll}
              className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium py-2 hover:bg-blue-50 rounded transition-colors"
            >
              Xem tất cả thông báo →
            </button>
          </div>
        </div>
      )}

      {/* Click outside to close */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}

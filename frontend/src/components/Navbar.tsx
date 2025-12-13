"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  FaBell,
  FaBellSlash,
  FaUser,
  FaSignOutAlt,
  FaCog,
  FaCalendarAlt,
  FaTrophy,
  FaHome,
} from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { authFetch } from "@/utils/auth";
import { useReverbNotification } from "@/hooks/useReverbNotification";

export default function Navbar() {
  const { user: currentUser, token, logout, isLoading } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Web Push Notification States
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoadingState, setIsLoadingState] = useState(true);
  const [subscriptionEndpoint, setSubscriptionEndpoint] = useState<
    string | null
  >(null);

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Initialize push notification state
  useEffect(() => {
    initializePushState();
  }, []);

  // Fetch notifications định kỳ (polling) + real-time
  useEffect(() => {
    if (currentUser) {
      // Fetch ngay lập tức
      fetchNotifications();

      // Refresh mỗi 30 giây
      // const interval = setInterval(() => {
      //   console.log("🔄 [Navbar] Auto-refreshing notifications...");
      //   fetchNotifications();
      // }, 30000);

      // return () => clearInterval(interval);
    }
  }, [currentUser]);

  // Callback khi có thông báo mới qua Reverb WebSocket
  const handleNewNotification = (notification: any) => {
    console.log("=== 📬 [Navbar] handleNewNotification CALLED ===");
    console.log(
      "📬 [Navbar] Raw notification data:",
      JSON.stringify(notification, null, 2)
    );

    // Show browser notification if permission granted
    if ("Notification" in window && Notification.permission === "granted") {
      console.log("🔔 [Navbar] Showing browser notification");
      new Notification(notification.title || "Thông báo mới", {
        body: notification.message || "",
        icon: "/favicon.ico",
        tag: `notification-${notification.id}`,
      });
    } else {
      console.log(
        "⚠️ [Navbar] Browser notification permission:",
        Notification?.permission || "not supported"
      );
    }

    // Delay một chút để backend kịp lưu vào database, sau đó refresh danh sách
    console.log("🔄 [Navbar] Will refresh notification list in 500ms...");
    setTimeout(() => {
      console.log("🔄 [Navbar] Now fetching notifications from server...");
      fetchNotifications();
    }, 500);
  };

  // Callback khi notification được đánh dấu đã đọc
  const handleNotificationRead = (notificationId: number) => {
    console.log("✅ [Navbar] Notification marked as read:", notificationId);

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
  };

  // Debug: Log user info và callback
  useEffect(() => {
    console.log("🔍 [Navbar] Debug Info:", {
      userId: currentUser?.id || null,
      hasToken: !!token,
      tokenLength: token?.length || 0,
      hasNewNotificationCallback: !!handleNewNotification,
      hasReadNotificationCallback: !!handleNotificationRead,
    });
  }, [currentUser, token]);

  // Kết nối Reverb WebSocket cho real-time notifications
  console.log("🔧 [Navbar] Calling useReverbNotification with:", {
    userId: currentUser?.id || null,
    hasToken: !!token,
  });

  useReverbNotification({
    userId: currentUser?.id || null,
    authToken: token,
    onNewNotification: handleNewNotification,
    onNotificationRead: handleNotificationRead,
  });

  const initializePushState = async () => {
    setIsLoadingState(true);
    try {
      console.log("[Web Push] Initializing push state...");

      // Check browser permission
      const hasPermission =
        "Notification" in window && Notification.permission === "granted";

      console.log("[Web Push] Browser permission:", Notification.permission);

      // Check service worker subscription
      let subscription = null;
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          subscription = await registration.pushManager.getSubscription();
          console.log(
            "[Web Push] Local subscription found:",
            subscription ? "Yes" : "No"
          );
        }
      }

      // Sync with backend
      if (subscription) {
        console.log("[Web Push] Verifying subscription with backend...");
        const isValid = await verifySubscriptionWithBackend(
          subscription.endpoint
        );

        if (isValid) {
          console.log(
            "[Web Push] ✅ Subscription verified - Setting state to ENABLED"
          );
          setIsPushEnabled(true);
          setSubscriptionEndpoint(subscription.endpoint);
        } else {
          console.log(
            "[Web Push] ❌ Subscription NOT found in backend - Unsubscribing local"
          );
          await subscription.unsubscribe();
          setIsPushEnabled(false);
          setSubscriptionEndpoint(null);
        }
      } else {
        console.log("[Web Push] No local subscription found");
        setIsPushEnabled(false);
        setSubscriptionEndpoint(null);
      }
    } catch (error) {
      console.error("[Web Push] Error initializing state:", error);
      setIsPushEnabled(false);
      setSubscriptionEndpoint(null);
    } finally {
      setIsLoadingState(false);
    }
  };

  const verifySubscriptionWithBackend = async (
    endpoint: string
  ): Promise<boolean> => {
    try {
      const response = await authFetch("/user/push/subscriptions");
      if (response.ok) {
        const result = await response.json();
        const subscriptions = result.data || [];

        const exists = subscriptions.some(
          (sub: any) => sub.endpoint === endpoint
        );

        console.log("[Web Push] Backend verification:", {
          endpoint: endpoint.substring(0, 50) + "...",
          totalSubscriptions: subscriptions.length,
          exists: exists,
        });

        return exists;
      }
      return false;
    } catch (error) {
      console.error("[Web Push] Error verifying subscription:", error);
      return false;
    }
  };

  const showNotification = (
    type: "success" | "error" | "warning" | "info",
    title: string,
    message: string
  ) => {
    const icon =
      type === "success"
        ? "✅"
        : type === "error"
        ? "❌"
        : type === "warning"
        ? "⚠️"
        : "ℹ️";
    alert(`${icon} ${title}\n\n${message}`);
  };

  const handleRegisterPush = async () => {
    if (!("Notification" in window)) {
      showNotification(
        "error",
        "Trình duyệt không hỗ trợ",
        "Trình duyệt của bạn không hỗ trợ thông báo push"
      );
      return;
    }

    if (!("serviceWorker" in navigator)) {
      showNotification(
        "error",
        "Không hỗ trợ Service Worker",
        "Trình duyệt của bạn không hỗ trợ Service Worker"
      );
      return;
    }

    setIsRegistering(true);

    try {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        showNotification(
          "warning",
          "Quyền bị từ chối",
          "Bạn cần cho phép thông báo để nhận cập nhật"
        );
        setIsRegistering(false);
        return;
      }

      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        registration = await navigator.serviceWorker.register("/sw.js");
        console.log("[Web Push] Service Worker registered");
      }
      await navigator.serviceWorker.ready;

      let subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const isValid = await verifySubscriptionWithBackend(
          subscription.endpoint
        );
        if (isValid) {
          setIsPushEnabled(true);
          setSubscriptionEndpoint(subscription.endpoint);
          showNotification(
            "success",
            "Đã bật thông báo",
            "Bạn đã đăng ký nhận thông báo trước đó"
          );
          setIsRegistering(false);
          return;
        } else {
          await subscription.unsubscribe();
          subscription = null;
        }
      }

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        throw new Error("VAPID public key not configured");
      }

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      console.log("[Web Push] New push subscription created");

      const subscriptionJson = subscription.toJSON();

      console.log("[Web Push] Sending to backend:", {
        endpoint: subscriptionJson.endpoint?.substring(0, 50) + "...",
        device: getBrowserInfo(),
      });

      const response = await authFetch("/user/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          endpoint: subscriptionJson.endpoint,
          keys: {
            p256dh: subscriptionJson.keys?.p256dh,
            auth: subscriptionJson.keys?.auth,
          },
          device_name: getBrowserInfo(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể lưu đăng ký");
      }

      const result = await response.json();
      console.log("[Web Push] Backend response:", result);

      if (result.success) {
        setIsPushEnabled(true);
        setSubscriptionEndpoint(subscriptionJson.endpoint || null);
        showNotification(
          "success",
          "Đăng ký thành công!",
          "Bạn sẽ nhận được thông báo về các sự kiện mới"
        );
      } else {
        throw new Error(result.message || "Đăng ký thất bại");
      }
    } catch (error) {
      console.error("[Web Push] Registration error:", error);
      showNotification(
        "error",
        "Đăng ký thất bại",
        error instanceof Error ? error.message : "Có lỗi xảy ra"
      );
    } finally {
      setIsRegistering(false);
    }
  };

  const handleUnsubscribePush = async () => {
    if (!subscriptionEndpoint) {
      showNotification(
        "warning",
        "Không tìm thấy đăng ký",
        "Không tìm thấy thông tin đăng ký thông báo"
      );
      return;
    }

    const confirmed = confirm(
      "Bạn có chắc muốn tắt thông báo?\n\nBạn sẽ không nhận được thông báo về các sự kiện mới và cập nhật quan trọng."
    );

    if (!confirmed) {
      return;
    }

    setIsRegistering(true);

    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
            const unsubscribed = await subscription.unsubscribe();
            if (unsubscribed) {
              console.log("[Web Push] Unsubscribed from push manager");
            }
          }
        }
      }

      const response = await authFetch("/user/push/unsubscribe", {
        method: "POST",
        body: JSON.stringify({
          endpoint: subscriptionEndpoint,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể hủy đăng ký");
      }

      const result = await response.json();
      console.log("[Web Push] Unsubscribe response:", result);

      if (result.success) {
        setIsPushEnabled(false);
        setSubscriptionEndpoint(null);
        showNotification(
          "success",
          "Đã tắt thông báo",
          "Bạn sẽ không nhận được thông báo push nữa"
        );
      } else {
        throw new Error(result.message || "Hủy đăng ký thất bại");
      }
    } catch (error) {
      console.error("[Web Push] Unsubscribe error:", error);
      showNotification(
        "error",
        "Không thể tắt thông báo",
        error instanceof Error ? error.message : "Có lỗi xảy ra"
      );

      setIsPushEnabled(false);
      setSubscriptionEndpoint(null);
    } finally {
      setIsRegistering(false);
    }
  };

  const getBrowserInfo = (): string => {
    const ua = navigator.userAgent;
    let browserName = "Unknown Browser";
    let osName = "Unknown OS";

    if (ua.indexOf("Chrome") > -1) browserName = "Chrome";
    else if (ua.indexOf("Safari") > -1) browserName = "Safari";
    else if (ua.indexOf("Firefox") > -1) browserName = "Firefox";
    else if (ua.indexOf("Edge") > -1) browserName = "Edge";

    if (ua.indexOf("Win") > -1) osName = "Windows";
    else if (ua.indexOf("Mac") > -1) osName = "MacOS";
    else if (ua.indexOf("Linux") > -1) osName = "Linux";
    else if (ua.indexOf("Android") > -1) osName = "Android";
    else if (ua.indexOf("iOS") > -1) osName = "iOS";

    return `${browserName} on ${osName}`;
  };

  function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  const fetchNotifications = async () => {
    if (!currentUser) return;

    try {
      setLoadingNotifications(true);
      const response = await authFetch("/user/notifications");

      if (!response.ok) {
        console.error("Failed to fetch notifications:", response.status);
        return;
      }

      const data = await response.json();

      // Handle both data.notifications (object response) and direct array
      const notificationsList = data.notifications || data;

      if (Array.isArray(notificationsList)) {
        // Lấy 5 thông báo mới nhất
        const recentNotifications = notificationsList.slice(0, 5);
        setNotifications(recentNotifications);

        const unreadTotal = notificationsList.filter(
          (n: any) => !n.is_read
        ).length;

        console.log("📊 [Navbar] Fetched notifications:", {
          total: notificationsList.length,
          showing: recentNotifications.length,
          unread: unreadTotal,
          recentUnread: recentNotifications.filter((n: any) => !n.is_read)
            .length,
        });
      }
    } catch (error) {
      console.error("❌ [Navbar] Error fetching notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

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

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "event_created":
      case "event_updated":
        return "📅";
      case "event_accepted":
      case "event_approved":
        return "✅";
      case "event_rejected":
        return "❌";
      case "comment":
        return "💬";
      case "like":
        return "❤️";
      case "system":
        return "🔔";
      case "join_event":
        return "👥";
      case "message":
        return "✉️";
      default:
        return "📢";
    }
  };

  // Get base path theo role
  const getBasePath = (role: string) => {
    switch (role) {
      case "admin":
        return "/admin";
      case "manager":
        return "/manager";
      case "user":
      default:
        return "/user";
    }
  };

  const basePath = currentUser ? getBasePath(currentUser.role) : "/user";

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout(); // Dùng logout từ AuthContext
  };

  const markAsRead = async (id: number) => {
    try {
      await authFetch(`/user/notifications/${id}/read`, {
        method: "POST",
      });
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-2 sm:px-3 lg:px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center">
            <Link
              href={`${basePath}/dashboard`}
              className="flex items-center space-x-3 group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200 shadow-md">
                <span className="text-white text-2xl">🌱</span>
              </div>
              <div>
                <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  VolunteerHub
                </div>
                <div className="text-[10px] text-gray-500 font-medium -mt-1">
                  Lan tỏa yêu thương, kiến tạo tương lai
                </div>
              </div>
            </Link>
          </div>

          {/* Main Navigation - Centered */}
          <div className="hidden lg:flex items-center justify-center gap-2 sm:gap-4 bg-gray-200 rounded-full px-3 sm:px-6 py-2 absolute left-1/2 transform -translate-x-1/2">
            <Link
              href={`${basePath}/dashboard`}
              className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-green-600 transition-colors duration-200 font-medium"
            >
              Bảng tin
            </Link>

            {/* User role: Sự kiện đã tham gia */}
            {currentUser?.role === "user" && (
              <>
                <Link
                  href={`/events`}
                  className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-green-600 transition-colors duration-200 font-medium"
                >
                  Sự kiện
                </Link>
                <Link
                  href="/user/eventsattended"
                  className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-green-600 transition-colors duration-200 font-medium"
                >
                  Sự kiện đã tham gia
                </Link>
                <Link
                  href="/user/history"
                  className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-green-600 transition-colors duration-200 font-medium"
                >
                  Lịch sử
                </Link>
              </>
            )}

            {/* Manager role: Quản lý sự kiện */}
            {currentUser?.role === "manager" && (
              <>
                <Link
                  href="/manager/events"
                  className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-purple-600 transition-colors duration-200 font-medium"
                >
                  Quản lý sự kiện
                </Link>
                <Link
                  href="/manager/reports"
                  className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-purple-600 transition-colors duration-200 font-medium"
                >
                  Báo cáo
                </Link>
              </>
            )}

            {/* Admin role: All management features */}
            {currentUser?.role === "admin" && (
              <>
                <Link
                  href="/admin/manager"
                  className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200 font-medium"
                  // className={`text-xs sm:text-sm lg:text-base whitespace-nowrap px-2 sm:px-3 py-1 rounded-lg transition-colors hover:bg-blue-100 ${
                  //   pathname === "/admin/manager"
                  //     ? "bg-blue-500 text-white font-semibold"
                  //     : "text-gray-700"
                  // }`}
                >
                  Quản lý điều phối viên
                </Link>
                <Link
                  href="/admin/users"
                  // className={`text-xs sm:text-sm lg:text-base whitespace-nowrap px-2 sm:px-3 py-1 rounded-lg transition-colors hover:bg-blue-100 ${
                  //   pathname === "/admin/users"
                  //     ? "bg-blue-500 text-white font-semibold"
                  //     : "text-gray-700"
                  // }`}
                  className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-blue-600 transition-colors duration-200 font-medium"
                >
                  Người dùng
                </Link>
              </>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
            ) : currentUser ? (
              <>
                {/* <div ref={notificationRef} className="relative color-gray-600">
                  <NotificationIcon />
                </div> */}
                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  >
                    <FaBell className="text-xl" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                      <div className="bg-gradient-to-r from-green-500 to-blue-500 px-4 py-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-white font-semibold">
                            Thông báo
                          </h3>
                          {unreadCount > 0 && (
                            <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded-full">
                              {unreadCount} mới
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {loadingNotifications ? (
                          <div className="p-4 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            Không có thông báo mới
                          </div>
                        ) : (
                          notifications.map((noti) => (
                            <div
                              key={noti.id}
                              onClick={() => markAsRead(noti.id)}
                              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                                !noti.is_read
                                  ? "bg-blue-50 border-l-4 border-l-blue-500"
                                  : ""
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                {/* Icon */}
                                <div className="flex-shrink-0 text-2xl">
                                  {getNotificationIcon(noti.type || "system")}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between">
                                    <p
                                      className={`text-sm ${
                                        !noti.is_read
                                          ? "font-semibold text-gray-900"
                                          : "text-gray-700"
                                      }`}
                                    >
                                      {noti.title}
                                    </p>
                                    {!noti.is_read && (
                                      <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1.5"></span>
                                    )}
                                  </div>
                                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                    {noti.message}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1.5 flex items-center">
                                    <svg
                                      className="w-3 h-3 mr-1"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    {formatTime(noti.created_at)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <Link
                        href={`${basePath}/notifications`}
                        className="block p-3 text-center text-green-600 hover:bg-gray-50 font-medium text-sm"
                      >
                        Xem tất cả thông báo
                      </Link>
                    </div>
                  )}
                </div>
                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 hover:bg-gray-100 rounded-full pl-1 pr-4 py-1 transition-colors duration-200"
                  >
                    <div className="relative">
                      {currentUser.image &&
                      currentUser.image.startsWith("http") ? (
                        <Image
                          src={currentUser.image}
                          alt={currentUser.username}
                          width={40}
                          height={40}
                          className="rounded-full border-2 border-green-400"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {currentUser?.username?.charAt(0).toUpperCase() ||
                              "U"}
                          </span>
                        </div>
                      )}
                      {/* Online indicator */}
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-semibold text-gray-800">
                        {currentUser?.username || "User"}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">
                        {currentUser?.role || "user"}
                      </p>
                    </div>
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                      {/* User Info Header */}
                      <div className="bg-gradient-to-r from-green-500 to-blue-500 px-4 py-4">
                        <p className="text-white font-semibold">
                          {currentUser?.username || "User"}
                        </p>
                        <p className="text-white/80 text-sm">
                          {currentUser?.email || ""}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="bg-white/20 text-white text-xs font-medium px-2 py-1 rounded-full capitalize">
                            {currentUser?.role || "user"}
                          </span>
                        </div>
                      </div>

                      {/* Push Notification Toggle */}
                      <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50">
                        {isLoadingState ? (
                          // Loading skeleton
                          <div className="animate-pulse space-y-2">
                            <div className="h-10 bg-gray-200 rounded-lg"></div>
                            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                          </div>
                        ) : isPushEnabled ? (
                          // Đã bật thông báo
                          <div className="space-y-2">
                            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-green-100 text-green-700">
                              <div className="flex items-center space-x-2">
                                <FaBell className="h-5 w-5 animate-pulse" />
                                <span className="text-sm font-medium">
                                  Đã bật thông báo
                                </span>
                              </div>
                              <span className="text-xs font-bold">✓</span>
                            </div>
                            <button
                              onClick={handleUnsubscribePush}
                              disabled={isRegistering}
                              className="flex items-center justify-center w-full px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isRegistering ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent mr-2"></div>
                                  <span className="text-sm font-medium">
                                    Đang xử lý...
                                  </span>
                                </>
                              ) : (
                                <>
                                  <FaBellSlash className="h-4 w-4 mr-2" />
                                  <span className="text-sm font-medium">
                                    Tắt thông báo
                                  </span>
                                </>
                              )}
                            </button>
                            <p className="text-xs text-gray-500 px-3">
                              Bạn đang nhận thông báo về sự kiện mới và cập nhật
                              quan trọng
                            </p>
                          </div>
                        ) : (
                          // Chưa bật thông báo
                          <div className="space-y-2">
                            <button
                              onClick={handleRegisterPush}
                              disabled={isRegistering}
                              className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <div className="flex items-center space-x-2">
                                {isRegistering ? (
                                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-purple-700 border-t-transparent"></div>
                                ) : (
                                  <FaBellSlash className="h-5 w-5" />
                                )}
                                <span className="text-sm font-medium">
                                  {isRegistering
                                    ? "Đang đăng ký..."
                                    : "Bật thông báo"}
                                </span>
                              </div>
                              {!isRegistering && (
                                <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full font-medium">
                                  Mới
                                </span>
                              )}
                            </button>
                            <p className="text-xs text-gray-500 px-3">
                              Nhận thông báo về sự kiện mới và cập nhật quan
                              trọng
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Menu Items - Dynamic theo role */}
                      <div className="py-2">
                        <Link
                          href={`${basePath}/profile`}
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <FaUser className="text-gray-500" />
                          <span className="text-gray-700 font-medium">
                            Trang cá nhân
                          </span>
                        </Link>

                        {/* User specific links */}
                        {currentUser?.role === "user" && (
                          <>
                            <Link
                              href="/user/eventsattended"
                              className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                            >
                              <FaCalendarAlt className="text-gray-500" />
                              <span className="text-gray-700 font-medium">
                                Sự kiện của tôi
                              </span>
                            </Link>
                            <Link
                              href="/user/history"
                              className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                            >
                              <FaTrophy className="text-gray-500" />
                              <span className="text-gray-700 font-medium">
                                Lịch sử tham gia
                              </span>
                            </Link>
                          </>
                        )}

                        {/* Manager specific links */}
                        {currentUser?.role === "manager" && (
                          <Link
                            href="/manager/my-events"
                            className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                          >
                            <FaCalendarAlt className="text-gray-500" />
                            <span className="text-gray-700 font-medium">
                              Sự kiện tôi quản lý
                            </span>
                          </Link>
                        )}

                        {/* Admin specific links */}
                        {currentUser?.role === "admin" && (
                          <Link
                            href="/admin/system-settings"
                            className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                          >
                            <FaCog className="text-gray-500" />
                            <span className="text-gray-700 font-medium">
                              Cài đặt hệ thống
                            </span>
                          </Link>
                        )}

                        <Link
                          href={`${basePath}/settings`}
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <FaCog className="text-gray-500" />
                          <span className="text-gray-700 font-medium">
                            Cài đặt
                          </span>
                        </Link>
                        <hr className="my-2" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-600"
                        >
                          <FaSignOutAlt />
                          <span className="font-medium">Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : isLoading ? null : (
              /* Login/Register buttons when not logged in */
              <div className="flex items-center space-x-3">
                \n{" "}
                <Link
                  href="/home/login"
                  className="px-4 py-2 text-gray-700 hover:text-green-600 font-medium transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/home/register"
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

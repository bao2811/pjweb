"use client";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { authFetch } from "@/utils/auth";
import React, { useState, useEffect, useRef } from "react";

import { IoIosNotifications } from "react-icons/io";
import {
  FaUserCircle,
  FaChevronDown,
  FaBell,
  FaBellSlash,
} from "react-icons/fa";
import { RiSettings4Fill, RiLogoutBoxLine } from "react-icons/ri";
import { MdDashboard, MdEvent } from "react-icons/md";

export default function NavbarUser() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoadingState, setIsLoadingState] = useState(true);
  const [subscriptionEndpoint, setSubscriptionEndpoint] = useState<
    string | null
  >(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check và sync push notification state khi component mount
  useEffect(() => {
    initializePushState();
  }, []);

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

      // Sync với backend
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
          // Backend không có subscription này, unsubscribe local
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

  // Verify subscription với backend
  const verifySubscriptionWithBackend = async (
    endpoint: string
  ): Promise<boolean> => {
    try {
      const response = await authFetch("/user/push/subscriptions");
      if (response.ok) {
        const result = await response.json();
        const subscriptions = result.data || [];

        // Kiểm tra subscription có tồn tại trong backend không
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

  // Show notification (có thể thay bằng toast library)
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

  // Register for web push notifications
  const handleRegisterPush = async () => {
    // Validate browser support
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
      // Step 1: Request notification permission
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

      // Step 2: Register service worker
      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        registration = await navigator.serviceWorker.register("/sw.js");
        console.log("[Web Push] Service Worker registered");
      }
      await navigator.serviceWorker.ready;

      // Step 3: Check existing subscription
      let subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Đã có subscription, kiểm tra với backend
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
          // Backend không có, unsubscribe và tạo mới
          await subscription.unsubscribe();
          subscription = null;
        }
      }

      // Step 4: Create new subscription
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        throw new Error("VAPID public key not configured");
      }

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      console.log("[Web Push] New push subscription created");

      // Step 5: Send to backend
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

  // Unsubscribe from push notifications
  const handleUnsubscribePush = async () => {
    if (!subscriptionEndpoint) {
      showNotification(
        "warning",
        "Không tìm thấy đăng ký",
        "Không tìm thấy thông tin đăng ký thông báo"
      );
      return;
    }

    // Confirm before unsubscribe
    const confirmed = confirm(
      "Bạn có chắc muốn tắt thông báo?\n\nBạn sẽ không nhận được thông báo về các sự kiện mới và cập nhật quan trọng."
    );

    if (!confirmed) {
      return;
    }

    setIsRegistering(true);

    try {
      // Step 1: Unsubscribe from service worker
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

      // Step 2: Remove from backend
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

      // Nếu lỗi, vẫn reset state local (vì có thể backend đã xóa)
      setIsPushEnabled(false);
      setSubscriptionEndpoint(null);
    } finally {
      setIsRegistering(false);
    }
  };

  // Get browser info for device_name
  const getBrowserInfo = (): string => {
    const ua = navigator.userAgent;
    let browserName = "Unknown Browser";
    let osName = "Unknown OS";

    // Detect browser
    if (ua.indexOf("Chrome") > -1) browserName = "Chrome";
    else if (ua.indexOf("Safari") > -1) browserName = "Safari";
    else if (ua.indexOf("Firefox") > -1) browserName = "Firefox";
    else if (ua.indexOf("Edge") > -1) browserName = "Edge";

    // Detect OS
    if (ua.indexOf("Win") > -1) osName = "Windows";
    else if (ua.indexOf("Mac") > -1) osName = "MacOS";
    else if (ua.indexOf("Linux") > -1) osName = "Linux";
    else if (ua.indexOf("Android") > -1) osName = "Android";
    else if (ua.indexOf("iOS") > -1) osName = "iOS";

    return `${browserName} on ${osName}`;
  };

  // Helper function to convert VAPID key
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

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/home/login");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="sticky top-0 text-black w-full z-10 bg-blue-400 shadow-md flex">
      <div className="ml-10 flex items-center p-2 bg-blue-400 w-1/5">
        <Image
          src="data:image/jpeg;base64,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"
          alt="Logo"
          className="h-12 border-2 border-white rounded-full"
          width={48}
          height={48}
          unoptimized
        />
        <h1 className="text-white text-xl font-bold leading-tigh text-center">
          Nhiệt huyết tình nguyện viên
        </h1>
      </div>
      <div className="ml-10 mb-4 mt-4 text-xl flex items-center justify-between space-x-4 bg-gray-200 border-5 border-red-300 rounded-full w-1/2">
        <Link
          href="/user/dashboard"
          className={pathname === "/user/dashboard" ? "underline" : ""}
        >
          Dashboard
        </Link>
        <Link
          href="/user/events"
          className={pathname === "/user/events" ? "underline" : ""}
        >
          Events
        </Link>
        <Link
          href="/user/eventsattended"
          className={pathname === "/user/eventsattended" ? "underline" : ""}
        >
          Events Attended
        </Link>
      </div>

      <div className="relative ml-auto mr-10 flex items-center space-x-6">
        {/* Notifications Icon */}
        <Link href="/notifications" className="relative">
          <IoIosNotifications className="text-white h-8 w-8 hover:text-gray-200 transition-colors cursor-pointer" />
          <span className="absolute -top-1 -right-1 text-white bg-red-500 rounded-full px-1.5 py-0.5 text-xs font-bold">
            3
          </span>
        </Link>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="flex items-center space-x-2 hover:bg-blue-500 px-3 py-2 rounded-lg transition-colors"
          >
            {user?.image ? (
              <Image
                src={user.image}
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full border-2 border-white object-cover"
              />
            ) : (
              <FaUserCircle className="text-white h-10 w-10" />
            )}
            <span className="text-white font-medium hidden md:block">
              {user?.username || "User"}
            </span>
            <FaChevronDown
              className={`text-white transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100">
              {/* User Info Card */}
              <div className="px-4 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-green-50">
                <div className="flex items-center space-x-3">
                  {user?.image ? (
                    <Image
                      src={user.image}
                      alt="Profile"
                      width={56}
                      height={56}
                      className="rounded-full border-3 border-white shadow-md object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center shadow-md">
                      <FaUserCircle className="text-white h-8 w-8" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-bold text-gray-900 truncate">
                      {user?.username || "User"}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {user?.email || "user@example.com"}
                    </p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                      {user?.role || "Volunteer"}
                    </span>
                  </div>
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
                  // Đã bật thông báo - Hiển thị trạng thái và nút tắt
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
                      Bạn đang nhận thông báo về sự kiện mới và cập nhật quan
                      trọng
                    </p>
                  </div>
                ) : (
                  // Chưa bật thông báo - Hiển thị nút đăng ký
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
                          {isRegistering ? "Đang đăng ký..." : "Bật thông báo"}
                        </span>
                      </div>
                      {!isRegistering && (
                        <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full font-medium">
                          Mới
                        </span>
                      )}
                    </button>
                    <p className="text-xs text-gray-500 px-3">
                      Nhận thông báo về sự kiện mới và cập nhật quan trọng
                    </p>
                  </div>
                )}
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <Link
                  href="/user/profile"
                  className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FaUserCircle className="mr-3 h-5 w-5 text-blue-500" />
                  <span className="font-medium">Hồ sơ của tôi</span>
                </Link>

                <Link
                  href="/user/dashboard"
                  className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <MdDashboard className="mr-3 h-5 w-5 text-green-500" />
                  <span className="font-medium">Dashboard</span>
                </Link>

                <Link
                  href="/user/events"
                  className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <MdEvent className="mr-3 h-5 w-5 text-purple-500" />
                  <span className="font-medium">Sự kiện</span>
                </Link>

                <Link
                  href="/user/settings"
                  className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-green-50 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <RiSettings4Fill className="mr-3 h-5 w-5 text-gray-500" />
                  <span className="font-medium">Cài đặt</span>
                </Link>
              </div>

              {/* Logout */}
              <div className="border-t border-gray-100 py-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                >
                  <RiLogoutBoxLine className="mr-3 h-5 w-5" />
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

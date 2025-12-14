"use client";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { authFetch } from "@/utils/auth";
import { IoIosNotifications } from "react-icons/io";
import {
  FaUserCircle,
  FaChevronDown,
  FaBell,
  FaTimes,
  FaBars,
} from "react-icons/fa";
import { RiSettings4Fill, RiLogoutBoxLine } from "react-icons/ri";
import { MdDashboard, MdEdit } from "react-icons/md";
import { useReverbNotification } from "@/hooks/useReverbNotification";

export default function NavbarAdmin() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState({
    count: 0,
    listNoti: [],
  });
  const [isSubscribedToPush, setIsSubscribedToPush] = useState(false);
  const [isRegisteringPush, setIsRegisteringPush] = useState(false);
  const [subscriptionEndpoint, setSubscriptionEndpoint] = useState<
    string | null
  >(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form state for editing profile
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
    image: "",
  });

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        image: user.image || "",
      });
    }
  }, [user]);

  // Fetch notification count
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await authFetch("/user/notifications/unread-count");
        if (response.ok) {
          const data = await response.json();
          setNotificationCount({
            count: data.count || 0,
            listNoti: data.notifications || [],
          });
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
  }, [user]);

  // Initialize push notification state
  useEffect(() => {
    initializePushState();
  }, []);

  const initializePushState = async () => {
    try {
      console.log("[Web Push Admin] Initializing push state...");

      // Check service worker subscription
      let subscription = null;
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          subscription = await registration.pushManager.getSubscription();
          console.log(
            "[Web Push Admin] Local subscription found:",
            subscription ? "Yes" : "No"
          );
        }
      }

      // Sync với backend
      if (subscription) {
        console.log("[Web Push Admin] Verifying subscription with backend...");
        const isValid = await verifySubscriptionWithBackend(
          subscription.endpoint
        );

        if (isValid) {
          console.log("[Web Push Admin] ✅ Subscription verified");
          setIsSubscribedToPush(true);
          setSubscriptionEndpoint(subscription.endpoint);
        } else {
          console.log(
            "[Web Push Admin] ❌ Subscription NOT found in backend - Unsubscribing"
          );
          await subscription.unsubscribe();
          setIsSubscribedToPush(false);
          setSubscriptionEndpoint(null);
        }
      } else {
        setIsSubscribedToPush(false);
        setSubscriptionEndpoint(null);
      }
    } catch (error) {
      console.error("[Web Push Admin] Error initializing state:", error);
      setIsSubscribedToPush(false);
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
        return subscriptions.some((sub: any) => sub.endpoint === endpoint);
      }
      return false;
    } catch (error) {
      console.error("[Web Push Admin] Error verifying subscription:", error);
      return false;
    }
  };

  // Helper function to convert VAPID key
  const urlBase64ToUint8Array = (base64String: string) => {
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
  };

  const getBrowserInfo = () => {
    const ua = navigator.userAgent;
    if (ua.includes("Chrome")) return "Chrome Desktop";
    if (ua.includes("Firefox")) return "Firefox Desktop";
    if (ua.includes("Safari")) return "Safari Desktop";
    return "Desktop Browser";
  };

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
    logout();
    router.push("/login");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProfile = async () => {
    try {
      const response = await authFetch("/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await response.json();
      alert("Profile updated successfully!");
      setIsEditProfileOpen(false);
      // Optionally refresh user data
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  const handleSubscribeToPush = async () => {
    // Nếu đã subscribe, thực hiện unsubscribe
    if (isSubscribedToPush) {
      return handleUnsubscribePush();
    }

    // Validate browser support
    if (!("Notification" in window)) {
      alert("Trình duyệt không hỗ trợ thông báo push");
      return;
    }

    if (!("serviceWorker" in navigator)) {
      alert("Trình duyệt không hỗ trợ Service Worker");
      return;
    }

    setIsRegisteringPush(true);

    try {
      // Step 1: Request notification permission
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        alert("Bạn cần cho phép thông báo để nhận cập nhật");
        setIsRegisteringPush(false);
        return;
      }

      // Step 2: Register service worker
      let registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        registration = await navigator.serviceWorker.register("/sw.js");
        console.log("[Web Push Admin] Service Worker registered");
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
          setIsSubscribedToPush(true);
          setSubscriptionEndpoint(subscription.endpoint);
          alert("Bạn đã đăng ký nhận thông báo trước đó");
          setIsRegisteringPush(false);
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

      console.log("[Web Push Admin] New push subscription created");

      // Step 5: Send to backend
      const subscriptionJson = subscription.toJSON();

      console.log("[Web Push Admin] Sending to backend");

      const response = await authFetch("/user/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      console.log("[Web Push Admin] Backend response:", result);

      if (result.success) {
        setIsSubscribedToPush(true);
        setSubscriptionEndpoint(subscriptionJson.endpoint || null);
        alert(
          "Đăng ký thành công! Bạn sẽ nhận được thông báo về các sự kiện mới"
        );
      } else {
        throw new Error(result.message || "Đăng ký thất bại");
      }
    } catch (error) {
      console.error("[Web Push Admin] Registration error:", error);
      alert(
        error instanceof Error
          ? `Đăng ký thất bại: ${error.message}`
          : "Có lỗi xảy ra"
      );
    } finally {
      setIsRegisteringPush(false);
    }
  };

  const handleUnsubscribePush = async () => {
    if (!subscriptionEndpoint) {
      alert("Không tìm thấy thông tin đăng ký thông báo");
      return;
    }

    const confirmed = confirm(
      "Bạn có chắc muốn tắt thông báo?\n\nBạn sẽ không nhận được thông báo về các sự kiện mới."
    );

    if (!confirmed) {
      return;
    }

    setIsRegisteringPush(true);

    try {
      // Unsubscribe from service worker
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          console.log("[Web Push Admin] Local subscription removed");
        }
      }

      // Remove from backend
      const response = await authFetch("/user/push/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ endpoint: subscriptionEndpoint }),
      });

      if (!response.ok) {
        throw new Error("Failed to unsubscribe from backend");
      }

      setIsSubscribedToPush(false);
      setSubscriptionEndpoint(null);
      alert("Đã tắt thông báo thành công");
    } catch (error) {
      console.error("[Web Push Admin] Unsubscribe error:", error);
      alert("Có lỗi khi tắt thông báo");
    } finally {
      setIsRegisteringPush(false);
    }
  };

  return (
    <nav className="sticky top-0 w-full z-50 bg-blue-400 shadow-lg">
      <div className="container mx-auto px-3 sm:px-6 py-2">
        <div className="flex items-center justify-between gap-3">
          {/* Mobile Menu Button - visible only on small screens */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-white p-2 hover:bg-blue-500 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <FaTimes className="h-6 w-6" />
            ) : (
              <FaBars className="h-6 w-6" />
            )}
          </button>

          {/* Logo Section - Responsive sizing */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 lg:flex-initial justify-center lg:justify-start">
            <Image
              src="data:image/jpeg;base64,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"
              alt="Logo"
              className="h-10 w-10 sm:h-12 sm:w-12 border-2 border-white rounded-full flex-shrink-0"
              width={48}
              height={48}
              unoptimized
            />
            <h1 className="text-white text-sm sm:text-lg lg:text-xl font-bold text-center lg:text-left line-clamp-2 sm:line-clamp-1">
              Volunteer Hub
            </h1>
          </div>

          {/* Navigation Links - hidden on small screens, visible on lg+ */}
          <div className="hidden lg:flex items-center justify-center gap-2 sm:gap-4 bg-gray-200 rounded-full px-3 sm:px-6 py-2 w-auto overflow-x-auto scrollbar-hide">
            <Link
              href="/admin/dashboard"
              className={`text-xs sm:text-sm lg:text-base whitespace-nowrap px-2 sm:px-3 py-1 rounded-lg transition-colors hover:bg-blue-100 ${
                pathname === "/admin/dashboard"
                  ? "bg-blue-500 text-white font-semibold"
                  : "text-gray-700"
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/manager"
              className={`text-xs sm:text-sm lg:text-base whitespace-nowrap px-2 sm:px-3 py-1 rounded-lg transition-colors hover:bg-blue-100 ${
                pathname === "/admin/manager"
                  ? "bg-blue-500 text-white font-semibold"
                  : "text-gray-700"
              }`}
            >
              Manager
            </Link>
            <Link
              href="/admin/users"
              className={`text-xs sm:text-sm lg:text-base whitespace-nowrap px-2 sm:px-3 py-1 rounded-lg transition-colors hover:bg-blue-100 ${
                pathname === "/admin/users"
                  ? "bg-blue-500 text-white font-semibold"
                  : "text-gray-700"
              }`}
            >
              Users
            </Link>
            <Link
              href="/admin/events"
              className={`text-xs sm:text-sm lg:text-base whitespace-nowrap px-2 sm:px-3 py-1 rounded-lg transition-colors hover:bg-blue-100 ${
                pathname === "/admin/events"
                  ? "bg-blue-500 text-white font-semibold"
                  : "text-gray-700"
              }`}
            >
              Events
            </Link>
          </div>

          {/* Right Section - Notifications & Profile */}
          <div className="flex items-center space-x-3 sm:space-x-6">
            {/* Notifications Icon */}
            <Link href="/notifications" className="relative">
              <IoIosNotifications className="text-white h-6 w-6 sm:h-8 sm:w-8 hover:text-gray-200 transition-colors cursor-pointer" />
              {notificationCount.count > 0 && (
                <span className="absolute -top-1 -right-1 text-white bg-red-500 rounded-full px-1.5 py-0.5 text-xs font-bold min-w-[20px] text-center">
                  {notificationCount.count}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={toggleDropdown}
                className="flex items-center space-x-2 hover:bg-blue-500 px-2 sm:px-3 py-2 rounded-lg transition-colors"
              >
                {user?.image ? (
                  <Image
                    src={user.image || "https://i.pravatar.cc/150?img=3"}
                    alt={user.username || "User"}
                    width={36}
                    height={36}
                    unoptimized
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white object-cover"
                  />
                ) : (
                  <Image
                    src={"https://i.pravatar.cc/150?img=3"}
                    alt={user?.username || "User"}
                    width={36}
                    height={36}
                    unoptimized
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-white object-cover"
                  />
                )}
                <span className="text-white font-medium text-sm sm:text-base hidden md:block">
                  {user?.username || "Admin"}
                </span>
                <FaChevronDown
                  className={`text-white transition-transform text-sm sm:text-base ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu - Fixed positioning for mobile */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100 max-h-[80vh] overflow-y-auto">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.username || "Admin User"}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || "admin@example.com"}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsEditProfileOpen(true);
                        setIsDropdownOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                    >
                      <MdEdit className="mr-3 h-5 w-5 text-gray-400" />
                      Chỉnh sửa hồ sơ
                    </button>

                    <Link
                      href="/admin/dashboard"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <MdDashboard className="mr-3 h-5 w-5 text-gray-400" />
                      Dashboard
                    </Link>

                    <Link
                      href="/admin/settings"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <RiSettings4Fill className="mr-3 h-5 w-5 text-gray-400" />
                      Cài đặt
                    </Link>

                    <button
                      onClick={() => {
                        handleSubscribeToPush();
                        setIsDropdownOpen(false);
                      }}
                      disabled={isRegisteringPush}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors disabled:opacity-50"
                    >
                      <FaBell className="mr-3 h-5 w-5 text-gray-400" />
                      {isRegisteringPush
                        ? "Đang xử lý..."
                        : isSubscribedToPush
                        ? "Tắt thông báo Push"
                        : "Bật thông báo Push"}
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-200 py-1">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <RiLogoutBoxLine className="mr-3 h-5 w-5" />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Edit Profile Modal */}
          {isEditProfileOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Chỉnh sửa hồ sơ
                  </h2>
                  <button
                    onClick={() => setIsEditProfileOpen(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên người dùng
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={profileData.username}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={profileData.phone}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={profileData.address}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      URL Ảnh đại diện
                    </label>
                    <input
                      type="url"
                      name="image"
                      value={profileData.image}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={handleSaveProfile}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Lưu thay đổi
                  </button>
                  <button
                    onClick={() => setIsEditProfileOpen(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Menu Drawer */}
          {isMobileMenuOpen && (
            <>
              {/* Overlay */}
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />

              {/* Menu Panel */}
              <div className="fixed top-0 left-0 h-full w-64 bg-blue-400 z-50 lg:hidden shadow-xl transform transition-transform duration-300">
                <div className="flex flex-col h-full">
                  {/* Header với Close Button */}
                  <div className="flex items-center justify-between p-4 border-b border-blue-500">
                    <h2 className="text-white font-bold text-lg">Menu</h2>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-white p-2 hover:bg-blue-500 rounded-lg"
                    >
                      <FaTimes className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Navigation Links */}
                  <nav className="flex-1 py-4">
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-6 py-3 text-white hover:bg-blue-500 transition-colors ${
                        pathname === "/admin/dashboard"
                          ? "bg-blue-600 font-semibold"
                          : ""
                      }`}
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/admin/manager"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-6 py-3 text-white hover:bg-blue-500 transition-colors ${
                        pathname === "/admin/manager"
                          ? "bg-blue-600 font-semibold"
                          : ""
                      }`}
                    >
                      Manager
                    </Link>
                    <Link
                      href="/admin/users"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-6 py-3 text-white hover:bg-blue-500 transition-colors ${
                        pathname === "/admin/users"
                          ? "bg-blue-600 font-semibold"
                          : ""
                      }`}
                    >
                      Users
                    </Link>
                    <Link
                      href="/admin/events"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`block px-6 py-3 text-white hover:bg-blue-500 transition-colors ${
                        pathname === "/admin/events"
                          ? "bg-blue-600 font-semibold"
                          : ""
                      }`}
                    >
                      Events
                    </Link>
                  </nav>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

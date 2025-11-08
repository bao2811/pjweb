"use client";

import React, { useState } from "react";
import { useUser } from "../context/User";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import Image from "next/image";
import { FaUserCircle, FaBell, FaBellSlash } from "react-icons/fa";
import { MdEmail, MdPhone, MdLocationOn } from "react-icons/md";

interface ProfileSettingsProps {
  showPushSettings?: boolean; // Có hiển thị phần push notification không
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  showPushSettings = true,
}) => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<"profile" | "notifications">(
    "profile"
  );

  const { isSupported, isSubscribed, error, loading, subscribe, unsubscribe } =
    usePushNotifications({
      apiBaseUrl:
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
      vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
    });

  const handleToggleNotifications = async () => {
    if (isSubscribed) {
      const success = await unsubscribe();
      if (success) {
        alert("Đã tắt thông báo push thành công!");
      }
    } else {
      const success = await subscribe();
      if (success) {
        alert("Đã bật thông báo push thành công!");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Cài đặt tài khoản
      </h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("profile")}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === "profile"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Thông tin cá nhân
        </button>
        {showPushSettings && (
          <button
            onClick={() => setActiveTab("notifications")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "notifications"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Thông báo Push
          </button>
        )}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start space-x-6 mb-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {user?.image ? (
                <Image
                  src={user.image}
                  alt="Profile"
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-blue-200 object-cover"
                />
              ) : (
                <FaUserCircle className="text-gray-400 w-32 h-32" />
              )}
              <button className="mt-3 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
                Đổi ảnh
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {user?.username || "Chưa có tên"}
              </h2>

              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-700">
                  <MdEmail className="text-blue-500 w-5 h-5" />
                  <span>{user?.email || "Chưa có email"}</span>
                </div>

                {(user as any)?.phone && (
                  <div className="flex items-center space-x-3 text-gray-700">
                    <MdPhone className="text-blue-500 w-5 h-5" />
                    <span>{(user as any).phone}</span>
                  </div>
                )}

                {(user as any)?.address && (
                  <div className="flex items-center space-x-3 text-gray-700">
                    <MdLocationOn className="text-blue-500 w-5 h-5" />
                    <span>{(user as any).address}</span>
                  </div>
                )}
              </div>

              <button className="mt-6 px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                Chỉnh sửa thông tin
              </button>
            </div>
          </div>

          {/* Additional Info */}
          <div className="border-t pt-6 mt-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Thông tin bổ sung
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Vai trò
                </label>
                <p className="text-gray-800">
                  {(user as any)?.role || "Người dùng"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Trạng thái
                </label>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {(user as any)?.status || "Đang hoạt động"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && showPushSettings && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Cài đặt thông báo Push
          </h2>

          {!isSupported ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                ⚠️ Trình duyệt của bạn không hỗ trợ thông báo push
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                {/* Main Toggle */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start space-x-4">
                    {isSubscribed ? (
                      <FaBell className="text-green-500 w-6 h-6 mt-1" />
                    ) : (
                      <FaBellSlash className="text-gray-400 w-6 h-6 mt-1" />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-800">
                        Nhận thông báo sự kiện
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Nhận thông báo khi manager chấp nhận yêu cầu tham gia sự
                        kiện, thông báo về sự kiện mới, và các cập nhật quan
                        trọng khác
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleToggleNotifications}
                    disabled={loading}
                    className={`
                      px-6 py-2 rounded-lg font-medium transition-all flex-shrink-0
                      ${
                        isSubscribed
                          ? "bg-red-500 hover:bg-red-600 text-white"
                          : "bg-green-500 hover:bg-green-600 text-white"
                      }
                      ${loading ? "opacity-50 cursor-not-allowed" : ""}
                    `}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Đang xử lý...
                      </span>
                    ) : isSubscribed ? (
                      "Tắt thông báo"
                    ) : (
                      "Bật thông báo"
                    )}
                  </button>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800 text-sm">❌ {error}</p>
                  </div>
                )}

                {/* Success Display */}
                {isSubscribed && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 text-sm flex items-center gap-2">
                      <FaBell className="w-4 h-4" />
                      Thông báo push đang được bật trên thiết bị này
                    </p>
                  </div>
                )}

                {/* Info Section */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-sm mb-3 text-gray-800">
                    💡 Lưu ý quan trọng:
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>
                        Bạn cần cấp quyền thông báo trong trình duyệt khi được
                        yêu cầu
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>
                        Thông báo sẽ hiển thị ngay cả khi bạn đóng trình duyệt
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>
                        Bạn có thể tắt/bật thông báo bất cứ lúc nào trong phần
                        cài đặt này
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 mt-0.5">•</span>
                      <span>
                        Mỗi thiết bị/trình duyệt cần đăng ký riêng để nhận thông
                        báo
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Types of Notifications */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold text-sm mb-3 text-gray-800">
                    📬 Các loại thông báo bạn sẽ nhận:
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">
                        Yêu cầu tham gia sự kiện được chấp nhận
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">
                        Sự kiện bạn tham gia có cập nhật mới
                      </span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-gray-700">
                        Nhắc nhở về sự kiện sắp diễn ra
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileSettings;

// Example Component for Push Notification Settings
// File: src/components/PushNotificationSettings.tsx

"use client";

import React from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";

const PushNotificationSettings: React.FC = () => {
  const { isSupported, isSubscribed, error, loading, subscribe, unsubscribe } =
    usePushNotifications({
      apiBaseUrl:
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
      vapidPublicKey:
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
        "BGfcgEChdEI-iDX_RwDlob6AVdLxnGIxsd6iERT9PxFm-P8RGwQFDbQnt7-z0mN0wZfVF6m3w5JYuihH_2pG5qQ",
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

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800">
          ⚠️ Trình duyệt của bạn không hỗ trợ thông báo push
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Cài đặt thông báo Push</h2>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">Nhận thông báo sự kiện</h3>
            <p className="text-sm text-gray-600">
              Nhận thông báo khi manager chấp nhận yêu cầu tham gia sự kiện
            </p>
          </div>

          <button
            onClick={handleToggleNotifications}
            disabled={loading}
            className={`
                            px-4 py-2 rounded-lg font-medium transition-colors
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
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
              "🔕 Tắt thông báo"
            ) : (
              "🔔 Bật thông báo"
            )}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">❌ {error}</p>
          </div>
        )}

        {isSubscribed && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-800 text-sm">
              ✅ Thông báo push đang được bật trên thiết bị này
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="font-semibold text-sm mb-2">💡 Lưu ý:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Bạn cần cấp quyền thông báo trong trình duyệt</li>
          <li>• Thông báo sẽ hiển thị ngay cả khi đóng trình duyệt</li>
          <li>• Bạn có thể tắt/bật thông báo bất cứ lúc nào</li>
        </ul>
      </div>
    </div>
  );
};

export default PushNotificationSettings;

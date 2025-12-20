"use client";

import { useEffect, useRef } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Declare Pusher globally for Laravel Echo
declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: any;
  }
}

interface UseReverbNotificationOptions {
  userId: number | null;
  authToken: string | null;
  onNewNotification?: (notification: any) => void;
  onNotificationRead?: (notificationId: number) => void;
}

/**
 * Hook để kết nối Reverb WebSocket cho real-time notifications
 *
 * Tự động kết nối khi user đăng nhập (có userId và authToken)
 * Không cần đăng ký riêng - auto connect on login!
 */
export function useReverbNotification({
  userId,
  authToken,
  onNewNotification,
  onNotificationRead,
}: UseReverbNotificationOptions) {
  // Sử dụng ref để lưu callbacks, tránh stale closure
  const onNewNotificationRef = useRef(onNewNotification);
  const onNotificationReadRef = useRef(onNotificationRead);

  // Update refs khi callbacks thay đổi
  useEffect(() => {
    onNewNotificationRef.current = onNewNotification;
  }, [onNewNotification]);

  useEffect(() => {
    onNotificationReadRef.current = onNotificationRead;
  }, [onNotificationRead]);

  useEffect(() => {
    // Nếu không có userId hoặc authToken, không kết nối
    if (!userId || !authToken) {
      console.log("⚠️ [Reverb] No userId or authToken, skipping connection");
      return;
    }

    console.log("🚀 [Reverb] Initializing Echo for user:", userId);

    // Set Pusher globally for Laravel Echo
    window.Pusher = Pusher;

    // Initialize Laravel Echo with Reverb
    const echo = new Echo({
      broadcaster: "reverb",
      key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
      wsHost: process.env.NEXT_PUBLIC_REVERB_HOST || "localhost",
      wsPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || "8080"),
      wssPort: parseInt(process.env.NEXT_PUBLIC_REVERB_PORT || "8080"),
      forceTLS: process.env.NEXT_PUBLIC_REVERB_SCHEME === "https",
      enabledTransports: ["ws", "wss"],
      authEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: "application/json",
        },
      },
    });

    window.Echo = echo;

    // Subscribe to private notification channel
    const channelName = `notifications.${userId}`;
    console.log("📡 [Reverb] Subscribing to channel:", channelName);

    const channel = echo.private(channelName);

    // Listen for connection events
    channel.subscribed(() => {
      console.log("🟢 [Reverb] Successfully subscribed to", channelName);
    });

    channel.error((error: any) => {
      console.error("❌ [Reverb] Subscription error:", error);
      console.error("❌ [Reverb] Error type:", typeof error);
      console.error(
        "❌ [Reverb] Error keys:",
        error ? Object.keys(error) : "null"
      );
      console.error("❌ [Reverb] Full error:", JSON.stringify(error, null, 2));
    });

    // Listen for new notification event
    channel.listen(".notification.new", (data: any) => {
      console.log("🔔 [Reverb] New notification received:", data);
      console.log(
        "🔔 [Reverb] Callback exists?",
        !!onNewNotificationRef.current
      );
      console.log("🔔 [Reverb] Full data:", JSON.stringify(data, null, 2));

      // Gọi callback từ ref (luôn là version mới nhất)
      if (onNewNotificationRef.current) {
        console.log("🔔 [Reverb] Calling onNewNotification callback...");
        onNewNotificationRef.current(data);
        console.log("🔔 [Reverb] Callback executed successfully!");
      } else {
        console.warn(
          "⚠️ [Reverb] No callback registered for new notification!"
        );
      }
    });

    // Listen for notification read event
    channel.listen(
      ".notification.read",
      (data: { notification_id: number }) => {
        console.log(
          "✅ [Reverb] Notification marked as read:",
          data.notification_id
        );

        // Gọi callback từ ref (luôn là version mới nhất)
        if (onNotificationReadRef.current) {
          onNotificationReadRef.current(data.notification_id);
        }
      }
    );

    return () => {
      console.log("🔌 [Reverb] Cleaning up, leaving channel:", channelName);
      echo.leave(channelName);
      echo.disconnect();
    };
  }, [userId, authToken]); // CHỈ phụ thuộc vào userId và authToken
}

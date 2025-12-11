"use client";

import { useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  data: any;
  is_read: boolean;
  created_at: string;
  sender_id?: number;
}

interface UseNotificationSocketOptions {
  userId: number | null;
  authToken: string | null;
  onNewNotification?: (notification: Notification) => void;
  onNotificationRead?: (notificationId: number) => void;
}

/**
 * Hook để kết nối WebSocket cho real-time notifications
 *
 * @example
 * const { unreadCount, isConnected } = useNotificationSocket({
 *   userId: user.id,
 *   authToken: token,
 *   onNewNotification: (notif) => {
 *     console.log('New notification:', notif);
 *     showToast(notif.title, notif.message);
 *   }
 * });
 */
export function useNotificationSocket({
  userId,
  authToken,
  onNewNotification,
  onNotificationRead,
}: UseNotificationSocketOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const pusherRef = useRef<Pusher | null>(null);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    // Nếu không có userId hoặc authToken, không kết nối
    if (!userId || !authToken) {
      return;
    }

    // Khởi tạo Pusher client
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY || "", {
      cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER || "ap1",
      forceTLS: true,
      authEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/broadcasting/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${authToken}`,
          Accept: "application/json",
        },
      },
    });

    pusherRef.current = pusher;

    // Subscribe to private notification channel
    const channelName = `private-notifications.${userId}`;
    const channel = pusher.subscribe(channelName);

    channelRef.current = channel;

    // Handle connection state
    pusher.connection.bind("connected", () => {
      console.log("🟢 Notification WebSocket connected");
      setIsConnected(true);
    });

    pusher.connection.bind("disconnected", () => {
      console.log("🔴 Notification WebSocket disconnected");
      setIsConnected(false);
    });

    pusher.connection.bind("error", (err: any) => {
      console.error("❌ Notification WebSocket error:", err);
    });

    // Listen for new notifications
    channel.bind("notification.new", (data: Notification) => {
      console.log("🔔 New notification received:", data);

      // Tăng unread count
      setUnreadCount((prev) => prev + 1);

      // Callback
      if (onNewNotification) {
        onNewNotification(data);
      }

      // Show browser notification if permission granted
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(data.title, {
          body: data.message,
          icon: "/icons/notification-icon.png",
          badge: "/icons/badge-icon.png",
          tag: `notification-${data.id}`,
        });
      }
    });

    // Listen for notification read events
    channel.bind("notification.read", (data: { notification_id: number }) => {
      console.log("✅ Notification marked as read:", data.notification_id);

      // Giảm unread count
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Callback
      if (onNotificationRead) {
        onNotificationRead(data.notification_id);
      }
    });

    // Cleanup
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(channelName);
      pusher.disconnect();
      setIsConnected(false);
    };
  }, [userId, authToken, onNewNotification, onNotificationRead]);

  return {
    isConnected,
    unreadCount,
    setUnreadCount, // Allow manual update
  };
}
